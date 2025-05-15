import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminTaskMessages } from "@/components/admin-task-messages";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Loader2, X, Calendar, Clock, Users, MessageSquare } from "lucide-react";
import axios from "axios";
import Cookies from "js-cookie";
import { api } from "@/context/StateProvider";
import { useToast } from "@/hooks/use-toast";
import { getSocket } from "@/services/admin-socket.service";

export function AdminTaskDetailModal({ isOpen, onClose, jobId, taskId }) {
  const [task, setTask] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const { toast } = useToast();

  // Fetch task details
  const fetchTaskDetails = async () => {
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
  };

  // Load task details when modal opens
  useEffect(() => {
    if (isOpen && jobId && taskId) {
      fetchTaskDetails();
    }
  }, [isOpen, jobId, taskId]);

  // Listen for new-task-message events
  useEffect(() => {
    const socket = getSocket();
    if (socket && isOpen && taskId) {
      const handleNewTaskMessage = (data) => {
        if (data.taskId === taskId) {
          console.log("New task message received in modal:", data);
          setTask((prevTask) => {
            const newMessage = {
              id: data.message.id || data.message._id,
              sender: data.message.sender,
              senderId: data.message.senderId || data.message.staffId,
              senderName: data.message.senderName || (data.message.sender === 'staff' ? prevTask.resources?.employees[0]?.fullName : 'Administrator'),
              text: data.message.text || data.message.responseText,
              createdAt: data.message.createdAt,
            };
            return {
              ...prevTask,
              [data.message.sender === 'admin' ? 'messages' : 'responses']: [
                ...(data.message.sender === 'admin' ? prevTask.messages || [] : prevTask.responses || []),
                data.message.sender === 'admin'
                  ? newMessage
                  : {
                      _id: newMessage.id,
                      staffId: newMessage.senderId,
                      responseType: 'text',
                      responseText: newMessage.text,
                      createdAt: newMessage.createdAt,
                    },
              ],
            };
          });
          if (data.message.sender === 'staff') {
            toast({
              title: "New Response",
              description: "You have received a new response from staff",
              variant: "info",
              className:
                "bg-[#3B82F6] border-[#1E40AF] text-[#FFFFFF] border shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-2px_rgba(0,0,0,0.05)] rounded-md p-4",
            });
          }
        }
      };

      socket.on("new-task-message", handleNewTaskMessage);
      return () => socket.off("new-task-message", handleNewTaskMessage);
    }
  }, [isOpen, taskId]);

  // Handle new message
  const handleNewMessage = (newMessage) => {
    setTask((prevTask) => ({
      ...prevTask,
      messages: [
        ...(prevTask.messages || []),
        {
          id: newMessage.id,
          sender: newMessage.sender,
          senderId: newMessage.senderId,
          senderName: newMessage.senderName || 'Administrator',
          text: newMessage.text,
          createdAt: newMessage.createdAt,
        },
      ],
    }));
  };

  // Combine messages and responses for chat
  const combinedMessages = task
    ? [
        ...(task.messages || []).map((msg) => ({
          id: msg._id,
          sender: msg.sender,
          senderName: msg.senderName || 'Administrator',
          text: msg.text,
          createdAt: new Date(msg.createdAt),
        })),
        ...(task.responses || []).map((res) => ({
          id: res._id,
          sender: 'staff',
          senderName: res.staffName || task.resources?.employees[0]?.fullName || 'Staff',
          text: res.responseText,
          createdAt: new Date(res.createdAt),
        })),
      ].sort((a, b) => a.createdAt - b.createdAt)
    : [];

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-3xl">
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
                <div className="h-[400px]">
                  <AdminTaskMessages
                    jobId={jobId}
                    taskId={taskId}
                    messages={combinedMessages}
                    onNewMessage={handleNewMessage}
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