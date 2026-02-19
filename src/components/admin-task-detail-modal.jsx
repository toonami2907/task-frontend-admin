import { useState, useEffect, useCallback } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminTaskMessages } from "@/components/admin-task-messages";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Loader2, X, Calendar, Clock, Users, CheckCircle, XCircle } from "lucide-react";
import axios from "axios";
import Cookies from "js-cookie";
import { api } from "@/context/StateProvider";
import { useToast } from "@/hooks/use-toast";
import { getSocket } from "@/services/admin-socket.service";
import PropTypes from "prop-types";
import { Textarea } from "@/components/ui/textarea";

const normalizeId = (value) => String(value ?? "");
const normalizeName = (value) => String(value ?? "").trim();

const PLACEHOLDER_STAFF_NAMES = new Set([
  "staff",
  "staffs",
  "staff member",
  "staff members",
  "employee",
  "employees",
  "unknown",
  "unknown user",
  "unknown staff",
]);

const isPlaceholderStaffName = (value) => {
  const normalized = normalizeName(value).toLowerCase().replace(/\s+/g, " ");
  return !normalized || PLACEHOLDER_STAFF_NAMES.has(normalized);
};

const getEmployeeNameFromResources = (resources, senderId) => {
  if (!senderId) return "";
  const senderIdValue = normalizeId(senderId);
  const employees = resources?.employees || [];

  const employee = employees.find((emp) => {
    const employeeId = normalizeId(emp?._id || emp?.id);
    const staffId = normalizeId(emp?.staff || emp?.staffId);
    return employeeId === senderIdValue || staffId === senderIdValue;
  });

  return employee?.fullName || employee?.name || "";
};

const findKnownSenderName = (senderId, fallbackCollections = []) => {
  if (!senderId) return "";
  const senderIdValue = normalizeId(senderId);

  for (const collection of fallbackCollections) {
    const matched = (collection || []).find((item) => {
      const itemSenderId = normalizeId(item?.senderId || item?.staffId);
      return itemSenderId && itemSenderId === senderIdValue;
    });

    const matchedName = matched?.senderName || matched?.staffName;
    if (matchedName && !isPlaceholderStaffName(matchedName)) {
      return matchedName;
    }
  }

  return "";
};

const resolveTaskSenderName = (messageLike, resources, fallbackCollections = []) => {
  if (!messageLike) return "Staff";

  const senderType = messageLike.sender || messageLike.senderType;
  if (senderType === "admin") {
    return "Administrator";
  }

  const explicitName = normalizeName(messageLike.senderName || messageLike.staffName);
  if (explicitName && !isPlaceholderStaffName(explicitName)) {
    return explicitName;
  }

  const knownName = findKnownSenderName(
    messageLike.senderId || messageLike.staffId,
    fallbackCollections
  );
  if (knownName) {
    return knownName;
  }

  const employeeName = getEmployeeNameFromResources(
    resources,
    messageLike.senderId || messageLike.staffId
  );
  return employeeName || "Staff";
};

export function AdminTaskDetailModal({ isOpen, onClose, jobId, taskId }) {
  const [task, setTask] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const [rejectionReason, setRejectionReason] = useState("");
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const { toast } = useToast();

  // Fetch task details
  const fetchTaskDetails = useCallback(async () => {
    if (!jobId || !taskId) return;
    
    try {
      setIsLoading(true);
      const response = await axios.get(`${api}/api/v1/jobs/${jobId}/tasks/${taskId}`, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${Cookies.get('admin_access_token')}`,
        },
      });
      const incomingTask = response.data.task;
      setTask((prevTask) => {
        const normalizedIncomingMessages = (incomingTask.messages || []).map((msg) => ({
          ...msg,
          _id: msg._id || msg.id,
          id: msg.id || msg._id,
          senderName: resolveTaskSenderName(
            msg,
            incomingTask.resources,
            [prevTask?.messages, prevTask?.responses]
          ),
        }));

        const currentMessages = prevTask?.messages || [];
        const hasCurrentMessageNames = currentMessages.some((msg) => msg?.senderName);

        return {
          ...incomingTask,
          messages: hasCurrentMessageNames ? currentMessages : normalizedIncomingMessages,
        };
      });
    } catch (error) {
      console.error("Error fetching task details:", error);
      toast({
        title: "Error",
        description: "Failed to load task details",
        variant: "destructive",
        className:
          "bg-[#EF4444] border-[#991B1B] text-[#FFFFFF] border shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-2px_rgba(0,0,0,0.05)] rounded-md p-4",
      });
    } finally {
      setIsLoading(false);
    }
  }, [jobId, taskId, toast]);

  // Fetch task messages with enhanced data
  const fetchTaskMessages = useCallback(async () => {
    if (!jobId || !taskId) return;
    
    try {
      const response = await axios.get(`${api}/api/v1/jobs/${jobId}/tasks/${taskId}/messages`, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${Cookies.get('admin_access_token')}`,
        },
      });
      
      if (response.data.success && response.data.messages) {
        setTask((prevTask) => ({
          ...prevTask,
          messages: response.data.messages.map(msg => ({
            _id: msg.id,
            id: msg.id,
            sender: msg.sender,
            senderId: msg.senderId,
            senderName: resolveTaskSenderName(
              msg,
              prevTask?.resources,
              [prevTask?.messages, prevTask?.responses]
            ),
            type: msg.type || 'individual',
            messageType: msg.messageType || 'text',
            text: msg.text,
            fileUrl: msg.fileUrl,
            fileName: msg.fileName,
            fileSize: msg.fileSize,
            mimeType: msg.mimeType,
            createdAt: msg.createdAt,
          }))
        }));
      }
    } catch (error) {
      console.error("Error fetching task messages:", error);
    }
  }, [jobId, taskId]);

  // Load task details when modal opens
  useEffect(() => {
    if (isOpen && jobId && taskId) {
      fetchTaskDetails();
      fetchTaskMessages();
    }
  }, [isOpen, jobId, taskId, fetchTaskDetails, fetchTaskMessages]);

  // Listen for new-task-message events
  useEffect(() => {
    const socket = getSocket();
    if (socket && isOpen && taskId) {
      const handleNewTaskMessage = (data) => {
        if (data.taskId === taskId) {
          console.log("New task message received in modal:", data);
          setTask((prevTask) => {
            if (!prevTask) return prevTask;
            
            const newMessage = {
              id: data.message.id || data.message._id,
              sender: data.message.sender,
              senderId: data.message.senderId || data.message.staffId,
              senderName: resolveTaskSenderName(
                data.message,
                prevTask.resources,
                [prevTask?.messages, prevTask?.responses]
              ),
              type: data.message.type || 'individual',
              messageType: data.message.messageType || 'text',
              text: data.message.text || data.message.responseText,
              fileUrl: data.message.fileUrl,
              fileName: data.message.fileName,
              fileSize: data.message.fileSize,
              mimeType: data.message.mimeType,
              createdAt: data.message.createdAt,
            };
            
            // Check if message already exists to prevent duplicates
            const existingMessages = prevTask.messages || [];
            const messageExists = existingMessages.some(msg => {
              const existingId = msg.id || msg._id;
              const newId = newMessage.id;
              const isDuplicate = existingId === newId || 
                (msg.text === newMessage.text && 
                 msg.sender === newMessage.sender && 
                 Math.abs(new Date(msg.createdAt) - new Date(newMessage.createdAt)) < 1000); // Within 1 second
              return isDuplicate;
            });
            
            if (messageExists) {
              console.log("Message already exists, skipping duplicate:", newMessage.id);
              return prevTask;
            }
            
            console.log("Adding new message to state:", newMessage.id, "Total messages:", existingMessages.length + 1);
            return {
              ...prevTask,
              messages: [
                ...existingMessages,
                newMessage
              ],
            };
          });
          if (data.message.sender === 'staff') {
            toast({
              title: "New Response",
              description: `You have received a new ${data.message.messageType || 'text'} response from staff`,
              variant: "info",
              className:
                "bg-[#3B82F6] border-[#1E40AF] text-[#FFFFFF] border shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-2px_rgba(0,0,0,0.05)] rounded-md p-4",
            });
          }
        }
      };

      const handleMessageDeleted = (data) => {
        if (data.taskId === taskId) {
          console.log("Message deleted in modal:", data);
          setTask((prevTask) => {
            if (!prevTask) return prevTask;
            return {
              ...prevTask,
              messages: (prevTask.messages || []).filter(msg => 
                (msg.id || msg._id) !== data.messageId
              ),
              responses: (prevTask.responses || []).filter(res => 
                (res._id || res.id) !== data.messageId
              ),
            };
          });
        }
      };

      socket.on("new-task-message", handleNewTaskMessage);
      socket.on("message-deleted", handleMessageDeleted);
      return () => {
        socket.off("new-task-message", handleNewTaskMessage);
        socket.off("message-deleted", handleMessageDeleted);
      };
    }
  }, [isOpen, taskId, toast]);

  // Handle new message
  const handleNewMessage = (newMessage) => {
    setTask((prevTask) => {
      if (!prevTask) return prevTask;
      
      const existingMessages = prevTask.messages || [];
      const messageExists = existingMessages.some(msg => {
        const existingId = msg.id || msg._id;
        const newId = newMessage.id;
        const isDuplicate = existingId === newId || 
          (msg.text === newMessage.text && 
           msg.sender === newMessage.sender && 
           Math.abs(new Date(msg.createdAt) - new Date(newMessage.createdAt)) < 1000); // Within 1 second
        return isDuplicate;
      });
      
      if (messageExists) {
        console.log("Message already exists in handleNewMessage, skipping duplicate:", newMessage.id);
        return prevTask;
      }
      
      console.log("Adding new message via handleNewMessage:", newMessage.id, "Total messages:", existingMessages.length + 1);
      return {
        ...prevTask,
        messages: [
          ...existingMessages,
          {
            id: newMessage.id,
            sender: newMessage.sender,
            senderId: newMessage.senderId,
            senderName: resolveTaskSenderName(
              newMessage,
              prevTask.resources,
              [prevTask?.messages, prevTask?.responses]
            ),
            type: newMessage.type || 'individual',
            messageType: newMessage.messageType || 'text',
            text: newMessage.text,
            fileUrl: newMessage.fileUrl,
            fileName: newMessage.fileName,
            fileSize: newMessage.fileSize,
            mimeType: newMessage.mimeType,
            createdAt: newMessage.createdAt,
          },
        ],
      };
    });
  };

  // Combine messages and responses for chat
  const combinedMessages = task
    ? [
        ...(task.messages || []).map((msg) => ({
          id: msg._id || msg.id,
          sender: msg.sender,
          senderId: msg.senderId || msg.staffId,
          senderName: resolveTaskSenderName(
            msg,
            task.resources,
            [task.messages, task.responses]
          ),
          type: msg.type || 'individual',
          messageType: msg.messageType || 'text',
          text: msg.text,
          fileUrl: msg.fileUrl,
          fileName: msg.fileName,
          fileSize: msg.fileSize,
          mimeType: msg.mimeType,
          createdAt: new Date(msg.createdAt),
        })),
        ...(task.responses || []).map((res) => ({
          id: res._id || res.id,
          sender: 'staff',
          senderId: res.staffId || res.senderId,
          senderName: resolveTaskSenderName(
            {
              ...res,
              sender: 'staff',
              senderId: res.staffId || res.senderId,
            },
            task.resources,
            [task.messages, task.responses]
          ),
          type: res.type || 'individual',
          messageType: res.responseType || 'text',
          text: res.responseText,
          fileUrl: res.fileUrl,
          fileName: res.fileName,
          fileSize: res.fileSize,
          mimeType: res.mimeType,
          createdAt: new Date(res.createdAt),
        })),
      ].sort((a, b) => a.createdAt - b.createdAt)
    : [];

  const statusInfo = (status) => {
    switch (status) {
      case "completed":
        return { label: "Completed", className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" };
      case "pending-approval":
        return { label: "Pending Approval", className: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300" };
      case "in-progress":
        return { label: "In Progress", className: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300" };
      case "acknowledged":
        return { label: "Acknowledged", className: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300" };
      default:
        return { label: "Pending", className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300" };
    }
  };

  const handleApprove = async () => {
    if (!taskId) return;
    try {
      setIsApproving(true);
      const response = await axios.patch(
        `${api}/api/v1/jobs/tasks/${taskId}/approve`,
        {},
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${Cookies.get('admin_access_token')}`,
          },
        }
      );
      setTask(response.data.task);
      toast({
        title: "Approved",
        description: "Task marked as completed.",
        variant: "success",
        className:
          "bg-[#10B981] border-[#065F46] text-[#FFFFFF] border shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-2px_rgba(0,0,0,0.05)] rounded-md p-4",
      });
    } catch (error) {
      console.error("Error approving task:", error);
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to approve task",
        variant: "destructive",
        className:
          "bg-[#EF4444] border-[#991B1B] text-[#FFFFFF] border shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-2px_rgba(0,0,0,0.05)] rounded-md p-4",
      });
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    if (!taskId) return;
    if (!rejectionReason.trim()) {
      toast({
        title: "Reason required",
        description: "Please provide a reason for rejection.",
        variant: "destructive",
      });
      return;
    }
    try {
      setIsRejecting(true);
      const response = await axios.patch(
        `${api}/api/v1/jobs/tasks/${taskId}/reject`,
        { reason: rejectionReason.trim() },
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${Cookies.get('admin_access_token')}`,
          },
        }
      );
      setTask(response.data.task);
      setRejectionReason("");
      toast({
        title: "Rejected",
        description: "Task completion was rejected.",
        variant: "success",
        className:
          "bg-[#10B981] border-[#065F46] text-[#FFFFFF] border shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-2px_rgba(0,0,0,0.05)] rounded-md p-4",
      });
    } catch (error) {
      console.error("Error rejecting task:", error);
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to reject task",
        variant: "destructive",
        className:
          "bg-[#EF4444] border-[#991B1B] text-[#FFFFFF] border shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-2px_rgba(0,0,0,0.05)] rounded-md p-4",
      });
    } finally {
      setIsRejecting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-4xl hide-scrollbar">
      <div className="p-6 bg-white dark:bg-gray-900">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {isLoading ? "Loading Task..." : task?.title || "Task Details"}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-[#3B82F6] mr-2" />
            <span className="text-gray-600 dark:text-gray-300">Loading task details...</span>
          </div>
        ) : task ? (
          <>
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <Badge className={statusInfo(task.status).className}>
                {statusInfo(task.status).label}
              </Badge>
              {task.status === "pending-approval" && (
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={handleApprove}
                    disabled={isApproving}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    {isApproving ? "Approving..." : "Approve"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleReject}
                    disabled={isRejecting}
                    className="border-red-300 text-red-600 hover:bg-red-50"
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    {isRejecting ? "Rejecting..." : "Reject"}
                  </Button>
                </div>
              )}
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4 bg-gray-100 dark:bg-gray-800">
                <TabsTrigger
                  value="details"
                  className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900"
                >
                  Details
                </TabsTrigger>
                <TabsTrigger
                  value="messages"
                  className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900"
                >
                  Messages
                  {combinedMessages.length > 0 && (
                    <span className="ml-2 bg-[#3B82F6] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                      {combinedMessages.length}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4">
                {task.status === "pending-approval" && (
                  <div className="p-3 rounded-md border border-orange-200 bg-orange-50 dark:bg-orange-900/20">
                    <p className="text-sm text-orange-700 dark:text-orange-200">
                      This task is awaiting approval. Approve to complete it or reject with a reason.
                    </p>
                    <div className="mt-3">
                      <label className="text-xs font-medium text-gray-600 dark:text-gray-300">
                        Rejection reason (required to reject)
                      </label>
                      <Textarea
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Explain why this completion is rejected..."
                        className="mt-2 bg-white dark:bg-gray-800"
                        rows={3}
                      />
                    </div>
                  </div>
                )}
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Description
                  </h3>
                  <p className="text-gray-900 dark:text-gray-100">
                    {task.description || "No description provided."}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      Deadline
                    </h3>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {task.deadline
                        ? format(new Date(task.deadline), "MMM dd, yyyy HH:mm")
                        : "No deadline"}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      Created
                    </h3>
                    <p className="text-gray-900 dark:text-gray-100">
                      {format(new Date(task.createdAt), "MMM dd, yyyy HH:mm")}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    Assigned to
                  </h3>
                  <div className="space-y-2">
                    {task.resources?.teams?.length > 0 && (
                      <div>
                        <h4 className="text-xs font-medium text-gray-600 dark:text-gray-300">
                          Teams:
                        </h4>
                        <ul className="list-disc list-inside">
                          {task.resources.teams.map((team) => (
                            <li
                              key={team.id || team._id}
                              className="text-gray-900 dark:text-gray-100"
                            >
                              {team.name}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {task.resources?.employees?.length > 0 && (
                      <div>
                        <h4 className="text-xs font-medium text-gray-600 dark:text-gray-300">
                          Employees:
                        </h4>
                        <ul className="list-disc list-inside">
                          {task.resources.employees.map((emp) => (
                            <li
                              key={emp.id || emp._id}
                              className="text-gray-900 dark:text-gray-100"
                            >
                              {emp.fullName || emp.name || "Unknown"}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {(!task.resources?.teams?.length &&
                      !task.resources?.employees?.length) && (
                      <p className="text-gray-900 dark:text-gray-100">No assignments</p>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="messages">
                <div className="h-[500px]">
                  <AdminTaskMessages
                    jobId={jobId}
                    taskId={taskId}
                    messages={combinedMessages}
                    onNewMessage={handleNewMessage}
                    fetchMessages={fetchTaskMessages}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Task not found or could not be loaded
          </div>
        )}
      </div>
    </Modal>
  );
}

AdminTaskDetailModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  jobId: PropTypes.string.isRequired,
  taskId: PropTypes.string.isRequired,
};
