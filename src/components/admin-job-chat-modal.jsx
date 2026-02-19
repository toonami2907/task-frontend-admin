import { useCallback, useEffect, useState } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import Cookies from "js-cookie";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { getSocket } from "@/services/admin-socket.service";
import { formatDistanceToNow } from "date-fns";
import AdminEnhancedMessageBubble from "@/components/admin-enhanced-message-bubble";
import AdminFileAttachment from "@/components/admin-file-attachment";
import { Paperclip, Send } from "lucide-react";

const apiUrl = import.meta.env.VITE_API_URL;

export function AdminJobChatModal({ isOpen, onClose, jobId, jobTitle }) {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showFileAttachment, setShowFileAttachment] = useState(false);
  const { toast } = useToast();

  const formatTimeAgo = useCallback((date) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  }, []);

  const loadMessages = useCallback(async () => {
    if (!jobId) return;
    try {
      setIsLoading(true);
      const response = await axios.get(`${apiUrl}/api/v1/jobs/${jobId}/messages`, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${Cookies.get("admin_access_token")}`,
        },
      });
      const normalized = (response.data.messages || []).map((msg) => ({
        id: msg._id || msg.id,
        sender: msg.sender,
        senderId: msg.senderId,
        senderName: msg.senderName || (msg.sender === "admin" ? "Administrator" : "Staff"),
        type: msg.type || "team",
        messageType: msg.messageType || "text",
        text: msg.text,
        fileUrl: msg.fileUrl,
        fileName: msg.fileName,
        fileSize: msg.fileSize,
        mimeType: msg.mimeType,
        createdAt: msg.createdAt,
      }));
      setMessages(normalized);
    } catch (error) {
      console.error("Error loading job chat:", error);
      toast({
        title: "Error",
        description: "Failed to load job chat",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [jobId, toast]);

  useEffect(() => {
    if (isOpen) {
      loadMessages();
    }
  }, [isOpen, loadMessages]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket || !isOpen || !jobId) return;

    const handleNewJobMessage = (data) => {
      if (data.jobId !== jobId) return;
      const message = data.message;
      setMessages((prev) => [
        ...prev,
        {
          id: message.id,
          sender: message.sender,
          senderId: message.senderId,
          senderName: message.senderName || (message.sender === "admin" ? "Administrator" : "Staff"),
          type: message.type || "team",
          messageType: message.messageType || "text",
          text: message.text,
          fileUrl: message.fileUrl,
          fileName: message.fileName,
          fileSize: message.fileSize,
          mimeType: message.mimeType,
          createdAt: message.createdAt,
        },
      ]);
    };

    socket.on("new-job-message", handleNewJobMessage);
    return () => {
      socket.off("new-job-message", handleNewJobMessage);
    };
  }, [isOpen, jobId]);

  const handleSend = async () => {
    if (!newMessage.trim() || !jobId) return;
    try {
      setIsSending(true);
      await axios.post(
        `${apiUrl}/api/v1/jobs/${jobId}/messages`,
        { text: newMessage.trim() },
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${Cookies.get("admin_access_token")}`,
          },
        }
      );
      setNewMessage("");
    } catch (error) {
      console.error("Error sending job message:", error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleFileSelect = async (file) => {
    if (!jobId || !file) return;
    const formData = new FormData();
    formData.append("file", file);

    try {
      await axios.post(`${apiUrl}/api/v1/jobs/${jobId}/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${Cookies.get("admin_access_token")}`,
        },
      });
    } catch (error) {
      console.error("Error uploading file:", error);
      toast({
        title: "Error",
        description: "Failed to upload file",
        variant: "destructive",
      });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-3xl">
      <div className="p-6 bg-white dark:bg-gray-900">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Job Chat</h2>
            <p className="text-sm text-gray-500">{jobTitle}</p>
          </div>
          <Button variant="ghost" onClick={onClose}>Close</Button>
        </div>

        <div className="h-[420px] overflow-y-auto bg-gray-50 dark:bg-gray-800 rounded-md p-4">
          {isLoading ? (
            <div className="text-sm text-gray-500">Loading messages...</div>
          ) : messages.length === 0 ? (
            <div className="text-sm text-gray-500">No messages yet.</div>
          ) : (
            messages.map((msg) => (
              <AdminEnhancedMessageBubble
                key={msg.id}
                message={msg}
                isAdmin={msg.sender === "admin"}
                showAvatar={true}
                formatTimeAgo={formatTimeAgo}
                canDelete={false}
              />
            ))
          )}
        </div>

        <div className="mt-4 flex items-end gap-2">
          <div className="flex-1 relative">
            <Textarea
              rows={2}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="bg-gray-50 dark:bg-gray-800"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFileAttachment(!showFileAttachment)}
            className="h-10"
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          <Button onClick={handleSend} disabled={isSending || !newMessage.trim()}>
            <Send className="h-4 w-4 mr-2" />
            {isSending ? "Sending..." : "Send"}
          </Button>
        </div>

        <AdminFileAttachment
          isOpen={showFileAttachment}
          onFileSelect={handleFileSelect}
          onClose={() => setShowFileAttachment(false)}
        />
      </div>
    </Modal>
  );
}

AdminJobChatModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  jobId: PropTypes.string,
  jobTitle: PropTypes.string,
};
