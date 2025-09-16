import { useState, useEffect, useCallback } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminTaskMessages } from "@/components/admin-task-messages";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Loader2, X, Calendar, Clock, Users } from "lucide-react";
import axios from "axios";
import Cookies from "js-cookie";
import { api } from "@/context/StateProvider";
import { useToast } from "@/hooks/use-toast";
import { getSocket } from "@/services/admin-socket.service";
import PropTypes from "prop-types";

export function AdminTaskDetailModal({ isOpen, onClose, jobId, taskId }) {
  const [task, setTask] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
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
      setTask(response.data.task);
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
            senderName: msg.senderName || (msg.sender === 'admin' ? 'Administrator' : 'Staff'),
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
              senderName: data.message.senderName || (data.message.sender === 'staff' ? prevTask.resources?.employees[0]?.fullName : 'Administrator'),
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
            senderName: newMessage.senderName || 'Administrator',
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
          senderName: msg.senderName || 'Administrator',
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
          senderName: res.staffName || task.resources?.employees[0]?.fullName || 'Staff',
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
            <div className="mb-4">
              <Badge
                className={`${
                  task.isCompleted
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                    : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                }`}
              >
                {task.isCompleted ? "Completed" : "Pending"}
              </Badge>
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