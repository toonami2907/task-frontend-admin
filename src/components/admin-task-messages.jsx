import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import Cookies from "js-cookie";
import { api } from "@/context/StateProvider";
import { formatDistanceToNow } from "date-fns";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { getSocket } from "@/services/admin-socket.service";

export function AdminTaskMessages({ jobId, taskId, messages, onNewMessage }) {
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const { toast } = useToast();
  const adminId = localStorage.getItem('adminId');


  // Send a new message
  const sendMessage = async () => {
    if (!newMessage.trim() || !jobId || !taskId) return;
    
    try {
      setIsSending(true);
      const socket = getSocket();
      const tempMessage = {
        id: `temp-${Date.now()}`,
        sender: 'Administrator',
        senderName: 'Admin',
        text: newMessage,
        createdAt: new Date().toISOString(),
        status: 'sent',
      };
      setNewMessage((prev) => [...prev, tempMessage])
 
      socket.emit('task-message', {
        jobId: jobId,
        taskId: taskId,
        text: newMessage,
        senderType: 'admin',
        senderId: adminId,
      });
      // const newMsg = response.data.data;
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
        className:
          "bg-[#EF4444] border-[#991B1B] text-[#FFFFFF] border shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-2px_rgba(0,0,0,0.05)] rounded-md p-4",
      });
    } finally {
      setIsSending(false);
    }
  };
  // console.log('messages', messages)

  return (
    <Card className="h-fit shadow-none flex flex-col hide-scrollbar">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Task Communication</CardTitle>
      </CardHeader>
      <CardContent className="h-fit flex flex-col">
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-4  bg-gray-50 dark:bg-gray-800 rounded-md"
        >
          {messages.length === 0 ? (
            <div className="flex justify-center items-center h-full text-gray-500 dark:text-gray-400">
              No messages yet
            </div>
          ) : (
            messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`mb-3 p-3 rounded-lg  max-w-[70%] ${
                  msg.sender === "admin"
                    ? "ml-auto bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                    : "mr-auto bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                }`}
              >
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                 {msg.sender} {" "} {msg.senderId || msg.staffId  ? `(${msg.senderId || msg.staffId})` : ""}
                </p>
                <p className="text-sm">{msg.text}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                </p>
              </motion.div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="pt-4 border-t mt-4">
          <Textarea
            placeholder="Type your message here..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="resize-none mb-2 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-200 focus:ring-[#3B82F6] focus:border-[#3B82F6] rounded-lg"
            rows={3}
            disabled={!jobId || !taskId || isSending}
          />
          <Button
            onClick={sendMessage}
            disabled={isSending || !newMessage.trim() || !jobId || !taskId}
            className="w-full bg-[#3B82F6] hover:bg-[#2563EB] text-white transition-colors focus:ring-2 focus:ring-[#3B82F6]"
          >
            {isSending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              "Send Message"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}