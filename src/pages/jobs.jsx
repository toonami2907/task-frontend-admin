import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import AddNewJobForm from "@/components/job-dialog";
import { api, useGlobalContext } from "@/context/StateProvider";
import { Modal, ModalTrigger } from "@/components/ui/modal";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import Cookies from "js-cookie";
import { format } from "date-fns";
import { MoreHorizontal, Trash2, Bell, X, MessageSquare } from "lucide-react";
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
  
  return `${frequencyText} at ${task.reminder.time} via ${channelsText.join(", ")}`;
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

  // Function to handle opening the task detail modal
  const handleOpenTaskDetail = (jobId, taskId, e) => {
    e.stopPropagation();
    setSelectedJobId(jobId);
    setSelectedTaskId(taskId);
    setShowTaskDetailModal(true);
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

      setShowDeleteDialog(false);
      setTimeout(() => {
        setJobs((prevJobs) => prevJobs.filter((job) => job.id !== jobToDelete.id));
        setJobsCount((prev) => prev - 1);
        setJobToDelete(null);
        toast({
          title: "Success",
          description: "Job deleted successfully",
          variant: "success",
          className:
            "bg-[#10B981] border-[#065F46] text-[#FFFFFF] border shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-2px_rgba(0,0,0,0.05)] rounded-md p-4",
        });
        window.location.reload()
        if (selectedCompany) {
          fetchJobs(selectedCompany.id);
        }
      }, 100);
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

  // Filter jobs based on search term
  const filteredJobs = jobs.filter((job) =>
    job.jobTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className="max-w-screen-xl mx-auto bg-neutral-100 dark:bg-[#131313] p-6">
      <div className="flex flex-col gap-6">
        {/* Header Section */}
        <div className="flex w-full justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Jobs Summary</h1>
          <div className="flex gap-3">
            <Input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64 h-10 text-gray-700 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-500 border-gray-300 dark:border-gray-600 rounded-md focus:ring-[#3B82F6] focus:border-[#3B82F6] shadow-sm"
            />
            <ModalTrigger onClick={() => setIsModalOpen(true)}>
              <Button className="bg-[#3B82F6] text-white hover:bg-[#1E40AF] rounded-md px-4 py-2">
                Add New Job
              </Button>
            </ModalTrigger>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} className="max-w-2xl">
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
          <div className="overflow-x-auto">
            <table className="w-full border-collapse rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800 border text-gray-700 dark:text-gray-300 text-sm font-semibold">
                  <th className="p-3 text-left">Job</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-left">Deadline</th>
                  <th className="p-3 text-left">Remaining Time</th>
                  <th className="p-3 text-left">Task Completed</th>
                  <th className="p-3 text-left">Messages</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredJobs.length === 0 ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="p-4 text-center text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900 border-b"
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
                        className="bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 border-b last:border-b-0 transition-colors cursor-pointer"
                        onClick={() => {
                          setSelectedJob(job);
                          setShowTasksModal(true);
                        }}
                      >
                        <td className="p-3 text-gray-900 dark:text-gray-100 font-semibold">{job.jobTitle}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              job.status === "in progress"
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                                : job.status === "completed"
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                : job.status === "blocked"
                                ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                                : job.status === "pending"
                                ? "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300"
                                : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400"
                            }`}
                          >
                            {job.status}
                          </span>
                        </td>
                        <td className="p-3 text-gray-900 dark:text-gray-100 font-semibold">
                          {job.jobDeadline ? format(new Date(job.jobDeadline), "EEE, MMM dd, yyyy") : "No deadline"}
                        </td>
                        <td className="p-3 text-gray-950 dark:text-gray-100 font-bold text-sm">
                          {remainingTime}
                        </td>
                        <td className="p-3 text-gray-900 dark:text-gray-100 font-medium">
                          {job.tasksCompleted || 0}/{job.tasksCount || 0}
                        </td>
                        <td className="p-3 text-gray-600 dark:text-gray-300 text-sm">
                          {job.latestMessage || "No messages"}
                        </td>
                        <td className="p-3 text-center">
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
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Section */}
        <div className="flex justify-end gap-2 mt-4">
          <Button
            variant="outline"
            className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md px-4 py-2"
          >
            Previous
          </Button>
          <Button
            variant="outline"
            className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md px-4 py-2"
          >
            Next
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={showDeleteDialog}
        onOpenChange={(open) => {
          setShowDeleteDialog(open);
          if (!open) setJobToDelete(null);
        }}
      >
        <AlertDialogContent className="bg-white dark:bg-gray-900">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-900 dark:text-gray-100">
              Are you sure you want to delete this job?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 dark:text-gray-400">
              This action cannot be undone. This will permanently delete the job
              "{jobToDelete?.jobTitle}" and all associated tasks.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDeleteJob();
              }}
              disabled={isDeleting}
              className="bg-[#EF4444] hover:bg-[#991B1B] text-white"
            >
              {isDeleting ? "Deleting..." : "Delete Job"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Task Details Modal */}
      <Modal isOpen={showTasksModal} onClose={() => setShowTasksModal(false)} className="max-w-3xl">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {selectedJob?.jobTitle} - Tasks
            </h2>
            <Button variant="ghost" size="icon" onClick={() => setShowTasksModal(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          {selectedJob?.tasks?.length > 0 ? (
            <div className="space-y-4">
              {selectedJob.tasks.map((task, index) => (
                <div key={index} className="border rounded-md p-4 bg-white dark:bg-gray-900">
                  <div className="flex justify-between">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">{task.title}</h3>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        task.isCompleted
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                          : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                      }`}
                    >
                      {task.isCompleted ? "Completed" : "Pending"}
                    </span>
                  </div>

                  {task.description && (
                    <p className="text-gray-600 dark:text-gray-300 mt-2">{task.description}</p>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Deadline</p>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {task.deadline
                          ? format(new Date(task.deadline), "MMM dd, yyyy HH:mm")
                          : "No deadline"}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Assigned to</p>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {task.resources?.teams?.length > 0 || task.resources?.employees?.length > 0
                          ? `${task.resources.teams.length} teams, ${task.resources.employees.length} employees`
                          : "No assignments"}
                      </p>
                    </div>
                  </div>

                  {task.reminder && (
                    <div className="mt-3 flex items-start">
                      <Bell className="h-4 w-4 text-gray-500 dark:text-gray-400 mt-0.5 mr-2" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Reminder</p>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {formatReminderInfo(task)}
                        </p>
                      </div>
                    </div>
                  )}

                  {(notifications.find((n) => n.data?.taskId === task._id) || messages.find((m) => m.taskId === task._id)) && (
                    <div className="mt-3">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Latest Notification/Message</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
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
                      className="flex items-center gap-1 text-blue-600 border-blue-200 hover:bg-blue-50"
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
            <p className="text-center text-gray-500 dark:text-gray-400 py-4">No tasks found for this job.</p>
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