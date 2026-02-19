import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import AddNewJobForm from "@/components/job-dialog";
import { api, useGlobalContext } from "@/context/StateProvider";
import { Modal, ModalTrigger } from "@/components/ui/modal";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import Cookies from "js-cookie";
import { format } from "date-fns";
import { MoreHorizontal, Trash2, Bell, X, MessageSquare, Paperclip, Upload, Download, FileText } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { connectAdminSocket, disconnectAdminSocket, onAdminNotification } from "@/services/admin-socket.service";
import { AdminTaskDetailModal } from "@/components/admin-task-detail-modal";
import { cn } from "@/lib/utils";

// Function to format remaining time as a digital clock
const formatRemainingTime = (deadlineDate, currentDate) => {
  if (!deadlineDate) return "No deadline";

  const timeDiff = deadlineDate - currentDate;
  if (timeDiff < 0) return "Overdue";

  const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

  return `${days.toString().padStart(2, '0')}d : ${hours.toString().padStart(2, '0')}h : ${minutes.toString().padStart(2, '0')}m : ${seconds.toString().padStart(2, '0')}s`;
};

// Function to format reminder information
const formatReminderInfo = (task) => {
  if (!task.reminder) return "No reminders";
    const { frequency, channels } = task.reminder;
  let frequencyText = "";
  
  switch (frequency) {
    case 'once':
      frequencyText = "Once";
      break;
    case 'daily':
      frequencyText = "Daily";
      break;
    case 'weekdays':
      frequencyText = "Weekdays";
      break;
    case 'weekly':
      frequencyText = "Weekly";
      break;
    case 'custom':
      const days = [];
      if (task.reminder.daysOfWeek?.monday) days.push("Mon");
      if (task.reminder.daysOfWeek?.tuesday) days.push("Tue");
      if (task.reminder.daysOfWeek?.wednesday) days.push("Wed");
      if (task.reminder.daysOfWeek?.thursday) days.push("Thu");
      if (task.reminder.daysOfWeek?.friday) days.push("Fri");
      if (task.reminder.daysOfWeek?.saturday) days.push("Sat");
      if (task.reminder.daysOfWeek?.sunday) days.push("Sun");
      frequencyText = days.join(", ");
      break;
  }
  
  const channelsText = [];
  if (channels?.email) channelsText.push("Email");
  if (channels?.pwaNotification) channelsText.push("Push");
  
  return `${frequencyText} at ${task.reminder.startTime} via ${channelsText.join(", ")}`;
};

const formatFileSize = (size = 0) => {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

const Job = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { loading, setJobsCount } = useGlobalContext();
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [jobToDelete, setJobToDelete] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showTasksModal, setShowTasksModal] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [messages, setMessages] = useState([]); // New state for task messages
  const { toast } = useToast();
  const [showTaskDetailModal, setShowTaskDetailModal] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [resourceLabel, setResourceLabel] = useState("");
  const [resourceFile, setResourceFile] = useState(null);
  const [isUploadingResource, setIsUploadingResource] = useState(false);
  const [deletingResourceId, setDeletingResourceId] = useState(null);
  const fileInputRef = useRef(null);

  // Function to handle opening the task detail modal
  const handleOpenTaskDetail = (jobId, taskId, e) => {
    e.stopPropagation();
    setSelectedJobId(jobId);
    setSelectedTaskId(taskId);
    setShowTaskDetailModal(true);
  };

  const openJobPanel = (job) => {
    setSelectedJob(job);
    setShowTasksModal(true);
    setResourceLabel("");
    setResourceFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Load selected company and fetch jobs
  useEffect(() => {
    const storedCompany = localStorage.getItem("selectedCompany");
    if (storedCompany) {
      const company = JSON.parse(storedCompany);
      setSelectedCompany(company);
      fetchJobs(company.id);
    } else {
      toast({
        title: "Error",
        description: "No company selected",
        variant: "destructive",
        className:
          "bg-[#EF4444] border-[#991B1B] text-[#FFFFFF] border shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-2px_rgba(0,0,0,0.05)] rounded-md p-4",
      });
    }
  }, []);

  // Socket setup for notifications and messages
  useEffect(() => {
    const adminId = localStorage.getItem("adminId");
    if (adminId) {
      connectAdminSocket();
      
      const cleanup = onAdminNotification((data) => {
        console.log("Admin notification/message received:", data);
        if (data.type === "message") {
          // Store task-specific messages
          setMessages((prev) => [
            {
              id: data.id,
              jobId: data.data.jobId,
              taskId: data.data.taskId,
              message: data.message,
              timestamp: data.timestamp,
            },
            ...prev.slice(0, 9), // Keep last 10 messages
          ]);
          // Update jobs with latest message
          setJobs((prevJobs) =>
            prevJobs.map((job) =>
              job.id === data.data.jobId
                ? { ...job, latestMessage: data.message }
                : job
            )
          );
        } else {
          // Store other notifications (e.g., reminders)
          setNotifications((prev) => [
            { ...data, receivedAt: new Date() },
            ...prev.slice(0, 4),
          ]);
        }
      });
  
      return () => {
        cleanup();
        disconnectAdminSocket();
      };
    }
  }, []);

  // Fetch jobs
  const fetchJobs = async (companyId) => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${api}/api/v1/companies/${companyId}/jobs`, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${Cookies.get("admin_access_token")}`,
        },
      });
      const jobsWithMessages = response.data.jobs.map((job) => ({
        ...job,
        latestMessage: messages.find((m) => m.jobId === job.id)?.message || "",
      }));
      setJobs(jobsWithMessages);
      setJobsCount(response.data.count);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      toast({
        title: "Error",
        description: "Failed to fetch jobs",
        variant: "destructive",
        className:
          "bg-[#EF4444] border-[#991B1B] text-[#FFFFFF] border shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-2px_rgba(0,0,0,0.05)] rounded-md p-4",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle job submission
  const handleJobSubmit = async (jobData) => {
    try {
      setIsLoading(true);
      if (!selectedCompany) {
        toast({
          title: "Error",
          description: "No company selected",
          variant: "destructive",
          className:
            "bg-[#EF4444] border-[#991B1B] text-[#FFFFFF] border shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-2px_rgba(0,0,0,0.1)] rounded-md p-4",
        });
        return;
      }

      const formattedData = {
        jobTitle: jobData.jobTitle,
        jobDescription: jobData.jobDescription,
        jobDeadline: jobData.jobDeadline,
        tasks: jobData.tasks.map((task) => ({
          title: task.title,
          description: task.description || "",
          deadline: task.deadline,
          resources: {
            teams: task.resources.teams,
            employees: task.resources.employees,
          },
          reminder: task.reminder,
        })),
        companyId: selectedCompany.id,
      };

      const response = await axios.post(`${api}/api/v1/jobs`, formattedData, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${Cookies.get("admin_access_token")}`,
        },
      });

      fetchJobs(selectedCompany.id);
      toast({
        title: "Success",
        description: "Job created successfully",
        variant: "success",
        className:
          "bg-[#10B981] border-[#065F46] text-[#FFFFFF] border shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-2px_rgba(0,0,0,0.05)] rounded-md p-4",
      });
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error creating job:", error);
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to create job",
        variant: "destructive",
        className:
          "bg-[#EF4444] border-[#991B1B] text-[#FFFFFF] border shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-2px_rgba(0,0,0,0.05)] rounded-md p-4",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle job deletion
  const handleDeleteJob = async () => {
    if (!jobToDelete) return;

    try {
      setIsDeleting(true);
      await axios.delete(`${api}/api/v1/jobs/${jobToDelete.id}`, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${Cookies.get("admin_access_token")}`,
        },
      });

      setJobs((prevJobs) => prevJobs.filter((job) => job.id !== jobToDelete.id));
      setJobsCount((prev) => Math.max(0, (prev || 0) - 1));
      setShowDeleteDialog(false);
      setJobToDelete(null);
      toast({
        title: "Success",
        description: "Job deleted successfully",
        variant: "success",
      });
    } catch (error) {
      console.error("Error deleting job:", error);
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to delete job",
        variant: "destructive",
        className:
          "bg-[#EF4444] border-[#991B1B] text-[#FFFFFF] border shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-2px_rgba(0,0,0,0.05)] rounded-md p-4",
      });
      setShowDeleteDialog(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleResourceUpload = async (event) => {
    event.preventDefault();

    if (!selectedJob?.id || !resourceFile) {
      toast({
        title: "Missing file",
        description: "Select a file to upload",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUploadingResource(true);
      const formData = new FormData();
      formData.append("file", resourceFile);
      if (resourceLabel.trim()) {
        formData.append("label", resourceLabel.trim());
      }

      const response = await axios.post(
        `${api}/api/v1/jobs/${selectedJob.id}/resources`,
        formData,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${Cookies.get("admin_access_token")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const uploadedResource = response.data.resource;
      setJobs((prevJobs) =>
        prevJobs.map((job) => {
          if (job.id !== selectedJob.id) return job;
          const nextResources = [uploadedResource, ...(job.resources || [])];
          return {
            ...job,
            resources: nextResources,
            resourcesCount: nextResources.length,
          };
        })
      );

      setSelectedJob((prev) => {
        if (!prev) return prev;
        const nextResources = [uploadedResource, ...(prev.resources || [])];
        return {
          ...prev,
          resources: nextResources,
          resourcesCount: nextResources.length,
        };
      });

      setResourceLabel("");
      setResourceFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      toast({
        title: "Success",
        description: "Resource uploaded",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to upload resource",
        variant: "destructive",
      });
    } finally {
      setIsUploadingResource(false);
    }
  };

  const handleDeleteResource = async (resourceId, event) => {
    event.stopPropagation();
    if (!selectedJob?.id || !resourceId) return;

    try {
      setDeletingResourceId(resourceId);
      await axios.delete(`${api}/api/v1/jobs/${selectedJob.id}/resources/${resourceId}`, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${Cookies.get("admin_access_token")}`,
        },
      });

      setJobs((prevJobs) =>
        prevJobs.map((job) => {
          if (job.id !== selectedJob.id) return job;
          const nextResources = (job.resources || []).filter(
            (resource) => String(resource.id || resource._id) !== String(resourceId)
          );
          return {
            ...job,
            resources: nextResources,
            resourcesCount: nextResources.length,
          };
        })
      );

      setSelectedJob((prev) => {
        if (!prev) return prev;
        const nextResources = (prev.resources || []).filter(
          (resource) => String(resource.id || resource._id) !== String(resourceId)
        );
        return {
          ...prev,
          resources: nextResources,
          resourcesCount: nextResources.length,
        };
      });

      toast({
        title: "Success",
        description: "Resource removed",
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to delete resource",
        variant: "destructive",
      });
    } finally {
      setDeletingResourceId(null);
    }
  };

  // Filter jobs based on search term
  const filteredJobs = jobs.filter((job) =>
    `${job.jobTitle || ""} ${job.jobDescription || ""}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );
  const selectedJobResources = selectedJob?.resources || [];

  return (
 <main className="mx-auto max-w-[1400px] overflow-y-auto p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:gap-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row w-full justify-between items-start sm:items-center gap-4 sm:gap-0">
          <h1 className="text-xl sm:text-2xl font-semibold text-slate-900">
            Jobs
          </h1>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-56 lg:w-72 h-10 border-slate-300 rounded-md text-sm"
            />
            <ModalTrigger onClick={() => setIsModalOpen(true)}>
              <Button className="h-10 bg-blue-700 text-white hover:bg-blue-600 rounded-md px-4 text-sm w-full sm:w-auto">
                Create Job
              </Button>
            </ModalTrigger>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} className="max-w-4xl hide-scrollbar">
              <AddNewJobForm onCancel={() => setIsModalOpen(false)} onSubmit={handleJobSubmit} />
            </Modal>
          </div>
        </div>

        {/* Table Section */}
        {(isLoading || loading) ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#3B82F6]"></div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto rounded-xl border border-slate-200 bg-white">
            {/* Table for larger screens */}
            <table className="hidden sm:table w-full border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 text-xs uppercase tracking-wide font-semibold">
                  <th className="p-2 sm:p-3 text-left">Job</th>
                  <th className="p-2 sm:p-3 text-left">Status</th>
                  <th className="p-2 sm:p-3 text-left">Deadline</th>
                  <th className="p-2 sm:p-3 text-left">Remaining Time</th>
                  <th className="p-2 sm:p-3 text-left">Task Completed</th>
                  <th className="p-2 sm:p-3 text-left">Resources</th>
                  <th className="p-2 sm:p-3 text-left">Messages</th>
                  <th className="p-2 sm:p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredJobs.length === 0 ? (
                  <tr>
                    <td
                      colSpan="8"
                      className="p-6 text-center text-slate-500 bg-white border-b text-sm"
                    >
                      No jobs found.
                    </td>
                  </tr>
                ) : (
                  filteredJobs.map((job) => {
                    const deadlineDate = job.jobDeadline ? new Date(job.jobDeadline) : null;
                    const remainingTime = formatRemainingTime(deadlineDate, currentTime);

                    return (
                      <tr
                        key={job.id}
                        className="bg-white hover:bg-slate-50 border-b border-slate-100 last:border-b-0 transition-colors cursor-pointer"
                        onClick={() => openJobPanel(job)}
                      >
                        <td className="p-2 sm:p-3 text-slate-900 font-semibold text-sm">
                          {job.jobTitle}
                        </td>
                        <td className="p-2 sm:p-3">
                          <span
                            className={cn(
                              'px-2 py-1 rounded-full text-xs font-medium',
                              job.status === "in progress" || job.status === "in-progress"
                                ? "bg-blue-100 text-blue-700"
                                : job.status === "completed"
                                ? "bg-green-100 text-green-700"
                                : job.status === "blocked"
                                ? "bg-red-100 text-red-700"
                                : job.status === "pending"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-slate-100 text-slate-700"
                            )}
                          >
                            {job.status}
                          </span>
                        </td>
                        <td className="p-2 sm:p-3 text-slate-900 font-semibold text-sm">
                          {job.jobDeadline ? format(new Date(job.jobDeadline), "EEE, MMM dd, yyyy") : "No deadline"}
                        </td>
                        <td className="p-2 sm:p-3 text-slate-900 font-semibold text-sm">
                          {remainingTime}
                        </td>
                        <td className="p-2 sm:p-3 text-slate-900 font-medium text-sm">
                          {job.tasksCompleted || 0}/{job.tasksCount || 0}
                        </td>
                        <td className="p-2 sm:p-3 text-slate-700 text-sm">
                          <span className="inline-flex items-center gap-1">
                            <Paperclip className="h-4 w-4 text-slate-500" />
                            {job.resourcesCount ?? job.resources?.length ?? 0}
                          </span>
                        </td>
                        <td className="p-2 sm:p-3 text-slate-600 text-sm">
                          {job.latestMessage || "No messages"}
                        </td>
                        <td className="p-2 sm:p-3 text-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0" onClick={(e) => e.stopPropagation()}>
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openJobPanel(job);
                                }}
                              >
                                Open Job Panel
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600 cursor-pointer flex items-center"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setJobToDelete(job);
                                  setShowDeleteDialog(true);
                                }}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Job
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>

            {/* Card layout for mobile screens */}
            <div className="sm:hidden flex flex-col gap-4">
              {filteredJobs.length === 0 ? (
                <div className="p-4 text-center text-slate-500 bg-white rounded-lg border border-slate-200">
                  No jobs found.
                </div>
              ) : (
                filteredJobs.map((job) => {
                  const deadlineDate = job.jobDeadline ? new Date(job.jobDeadline) : null;
                  const remainingTime = formatRemainingTime(deadlineDate, currentTime);

                  return (
                    <div
                      key={job.id}
                      className="bg-white rounded-lg p-4 border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors"
                      onClick={() => openJobPanel(job)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-sm font-semibold text-slate-900 line-clamp-1">
                          {job.jobTitle}
                        </h3>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              className="text-red-600 cursor-pointer flex items-center"
                              onClick={(e) => {
                                e.stopPropagation();
                                setJobToDelete(job);
                                setShowDeleteDialog(true);
                              }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Job
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Status:</span>
                          <span
                            className={cn(
                              'px-2 py-1 rounded-full text-xs font-medium',
                              job.status === "in progress" || job.status === "in-progress"
                                ? "bg-blue-100 text-blue-700"
                                : job.status === "completed"
                                ? "bg-green-100 text-green-700"
                                : job.status === "blocked"
                                ? "bg-red-100 text-red-700"
                                : job.status === "pending"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-slate-100 text-slate-700"
                            )}
                          >
                            {job.status}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Deadline:</span>
                          <span className="text-slate-900 font-semibold">
                            {job.jobDeadline ? format(new Date(job.jobDeadline), "EEE, MMM dd, yyyy") : "No deadline"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Remaining Time:</span>
                          <span className="text-slate-900 font-semibold">
                            {remainingTime}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Tasks Completed:</span>
                          <span className="text-slate-900">
                            {job.tasksCompleted || 0}/{job.tasksCount || 0}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Resources:</span>
                          <span className="inline-flex items-center gap-1 text-slate-700">
                            <Paperclip className="h-4 w-4 text-slate-500" />
                            {job.resourcesCount ?? job.resources?.length ?? 0}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Messages:</span>
                          <span className="text-slate-600">
                            {job.latestMessage || "No messages"}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={showDeleteDialog}
        onOpenChange={(open) => {
          setShowDeleteDialog(open);
          if (!open) setJobToDelete(null);
        }}
      >
        <AlertDialogContent className="bg-white w-[90%] sm:w-full max-w-md rounded-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-900 text-lg sm:text-xl">
              Are you sure you want to delete this job?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600 text-sm sm:text-base">
              This action cannot be undone. This will permanently delete the job
              "{jobToDelete?.jobTitle}" and all associated tasks.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting} className="text-sm sm:text-base">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDeleteJob();
              }}
              disabled={isDeleting}
              className="bg-[#EF4444] hover:bg-[#991B1B] text-white text-sm sm:text-base"
            >
              {isDeleting ? "Deleting..." : "Delete Job"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Task Details Modal */}
      <Modal isOpen={showTasksModal} onClose={() => setShowTasksModal(false)} className="w-[95%] sm:max-w-5xl">
        <div className="p-4 sm:p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg sm:text-xl font-semibold text-slate-900">
              {selectedJob?.jobTitle} - Tasks
            </h2>
            <Button variant="ghost" size="icon" onClick={() => setShowTasksModal(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <section className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="mb-3 flex items-center gap-2">
              <Paperclip className="h-4 w-4 text-slate-600" />
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700">Job Resources</h3>
            </div>
            <form className="grid gap-2 md:grid-cols-[1fr_1fr_auto]" onSubmit={handleResourceUpload}>
              <Input
                value={resourceLabel}
                onChange={(event) => setResourceLabel(event.target.value)}
                placeholder="Label (optional)"
                className="h-10 border-slate-300 bg-white"
              />
              <input
                ref={fileInputRef}
                type="file"
                onChange={(event) => setResourceFile(event.target.files?.[0] || null)}
                className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm"
                accept=".jpg,.jpeg,.png,.gif,.webp,.svg,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip,.rar,.7z,.fig,.sketch,.psd,.ai"
              />
              <Button
                type="submit"
                disabled={isUploadingResource || !resourceFile}
                className="h-10 bg-blue-700 px-4 text-white hover:bg-blue-600"
              >
                <Upload className="mr-2 h-4 w-4" />
                {isUploadingResource ? "Uploading..." : "Upload"}
              </Button>
            </form>

            <div className="mt-4 rounded-md border border-slate-200 bg-white">
              {selectedJobResources.length === 0 ? (
                <p className="px-4 py-5 text-sm text-slate-500">No resources attached yet.</p>
              ) : (
                <div className="divide-y divide-slate-100">
                  {selectedJobResources.map((resource) => {
                    const resourceId = resource.id || resource._id;
                    return (
                      <div key={resourceId} className="flex items-start justify-between gap-3 px-4 py-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
                            <FileText className="h-4 w-4 text-slate-500" />
                            <span className="truncate">{resource.label || resource.fileName}</span>
                          </div>
                          <p className="mt-1 text-xs text-slate-500">
                            {resource.fileName} • {formatFileSize(resource.fileSize)}
                            {resource.uploadedAt ? ` • ${format(new Date(resource.uploadedAt), "MMM dd, yyyy HH:mm")}` : ""}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 border-slate-300 px-2.5"
                            onClick={(event) => {
                              event.stopPropagation();
                              window.open(resource.fileUrl, "_blank", "noopener,noreferrer");
                            }}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 px-2.5 text-red-600 hover:bg-red-50 hover:text-red-700"
                            onClick={(event) => handleDeleteResource(resourceId, event)}
                            disabled={deletingResourceId === resourceId}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          {selectedJob?.tasks?.length > 0 ? (
            <div className="space-y-4">
              {selectedJob.tasks.map((task, index) => (
                <div key={index} className="border border-slate-200 rounded-md p-4 bg-white">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-slate-900 text-sm sm:text-base">{task.title}</h3>
                    <span
                      className={cn(
                        'px-2 py-1 rounded-full text-xs font-medium',
                        task.isCompleted
                          ? "bg-green-100 text-green-700"
                          : "bg-amber-100 text-amber-700"
                      )}
                    >
                      {task.isCompleted ? "Completed" : "Pending"}
                    </span>
                  </div>

                  {task.description && (
                    <p className="text-slate-600 mt-2 text-sm">{task.description}</p>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mt-3">
                    <div>
                      <p className="text-sm text-slate-500">Deadline</p>
                      <p className="font-medium text-slate-900 text-sm">
                        {task.deadline
                          ? format(new Date(task.deadline), "MMM dd, yyyy HH:mm")
                          : "No deadline"}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-slate-500">Assigned to</p>
                      <p className="font-medium text-slate-900 text-sm">
                        {task.resources?.teams?.length > 0 || task.resources?.employees?.length > 0
                          ? `${task.resources.teams.length} teams, ${task.resources.employees.length} employees`
                          : "No assignments"}
                      </p>
                    </div>
                  </div>

                  {task.reminder && (
                    <div className="mt-3 flex items-start">
                      <Bell className="h-4 w-4 text-slate-500 mt-0.5 mr-2" />
                      <div>
                        <p className="text-sm text-slate-500">Reminder</p>
                        <p className="font-medium text-slate-900 text-sm">
                          {formatReminderInfo(task)}
                        </p>
                      </div>
                    </div>
                  )}

                  {(notifications.find((n) => n.data?.taskId === task._id) || messages.find((m) => m.taskId === task._id)) && (
                    <div className="mt-3">
                      <p className="text-sm text-slate-500">Latest Notification/Message</p>
                      <p className="text-sm text-slate-600">
                        {messages.find((m) => m.taskId === task._id)?.message ||
                         notifications.find((n) => n.data?.taskId === task._id)?.message ||
                         "No message"}
                      </p>
                    </div>
                  )}
                  
                  <div className="mt-3 flex justify-end">
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="flex items-center gap-1 text-blue-700 border-blue-200 hover:bg-blue-50 text-xs sm:text-sm"
                      onClick={(e) => handleOpenTaskDetail(selectedJob.id, task._id, e)}
                    >
                      <MessageSquare className="h-4 w-4" />
                      View Details & Messages
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-slate-500 py-4 text-sm sm:text-base">
              No tasks found for this job.
            </p>
          )}
        </div>
      </Modal>

      {/* Task Detail Modal */}
      <AdminTaskDetailModal
        isOpen={showTaskDetailModal}
        onClose={() => setShowTaskDetailModal(false)}
        jobId={selectedJobId}
        taskId={selectedTaskId}
      />
    </main>
  );
};

export default Job;
