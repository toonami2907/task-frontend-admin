import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { Loader2, Smile, Mic, Paperclip, Send } from "lucide-react";
import { 
  connectAdminSocket, 
  onAdminNotification,
  emitAdminTypingStart,
  emitAdminTypingStop,
  emitAdminTaskMessage,
  deleteAdminMessage
} from "@/services/admin-socket.service";
import AdminEnhancedMessageBubble from "./admin-enhanced-message-bubble";
import AdminEmojiPicker from "./admin-emoji-picker";
import AdminVoiceRecorder from "./admin-voice-recorder";
import AdminFileAttachment from "./admin-file-attachment";
import AdminTypingIndicator from "./admin-typing-indicator";
import axios from "axios";
import Cookies from "js-cookie";
import PropTypes from "prop-types";

const apiUrl = import.meta.env.VITE_API_URL;

export function AdminTaskMessages({ jobId, taskId, messages, onNewMessage, fetchMessages }) {
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [isVoiceRecorderOpen, setIsVoiceRecorderOpen] = useState(false);
  const [isFileAttachmentOpen, setIsFileAttachmentOpen] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const { toast } = useToast();

  // Format time ago function
  const formatTimeAgo = useCallback((date) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  }, []);

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Socket connection and event handling
  useEffect(() => {
    const initializeSocket = async () => {
      try {
        const socket = await connectAdminSocket();
        if (socket) {
          setIsConnected(true);
          
          // Listen for typing indicators only (messages are handled by the modal)
          const unsubscribe = onAdminNotification((notification) => {
            if (notification.type === 'typing' && notification.data.taskId === taskId) {
              // Handle typing indicators
              const { senderId, senderType, isTyping: userIsTyping } = notification.data;
              setTypingUsers(prev => {
                if (userIsTyping) {
                  return [...prev.filter(u => u.id !== senderId), { id: senderId, name: senderType }];
                } else {
                  return prev.filter(u => u.id !== senderId);
                }
              });
            }
          });

          return unsubscribe;
        }
      } catch (error) {
        console.error('Error initializing socket:', error);
        toast({
          title: "Connection Error",
          description: "Failed to connect to chat server",
          variant: "destructive",
        });
      }
    };

    if (jobId && taskId) {
      initializeSocket();
    }

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [jobId, taskId, onNewMessage, toast]);

  // Handle typing indicators
  const handleTypingStart = () => {
    if (!isTyping && jobId && taskId) {
      setIsTyping(true);
      emitAdminTypingStart(jobId, taskId);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      handleTypingStop();
    }, 3000);
  };

  const handleTypingStop = () => {
    if (isTyping && jobId && taskId) {
      setIsTyping(false);
      emitAdminTypingStop(jobId, taskId);
    }
  };

  // Send text message
  const sendMessage = async () => {
    if (!newMessage.trim() || !jobId || !taskId || isSending) return;
    
    try {
      setIsSending(true);
      handleTypingStop();
      
      emitAdminTaskMessage(jobId, taskId, newMessage.trim());
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  // Handle emoji selection
  const handleEmojiSelect = (emoji) => {
    setNewMessage(prev => prev + emoji);
    setIsEmojiPickerOpen(false);
  };

  // Handle voice recording
  const handleSendVoice = async (audioBlob) => {
    if (!jobId || !taskId) return;

    try {
      setIsSending(true);
      
      const formData = new FormData();
      formData.append('file', audioBlob, 'voice-message.webm');
      formData.append('messageType', 'voice');

      const token = Cookies.get("admin_access_token");
      const response = await axios.post(
        `${apiUrl}/api/v1/jobs/${jobId}/tasks/${taskId}/upload-chat-file`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        // Message will be handled by socket event in the modal
        console.log("Voice message sent successfully");
      }
    } catch (error) {
      console.error("Error sending voice message:", error);
      toast({
        title: "Error",
        description: "Failed to send voice message",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  // Handle file upload
  const handleFileSelect = async (file) => {
    if (!jobId || !taskId) return;

    try {
      setIsSending(true);
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('messageType', file.type.startsWith('image/') ? 'image' : 'file');

      const token = Cookies.get("admin_access_token");
      const response = await axios.post(
        `${apiUrl}/api/v1/jobs/${jobId}/tasks/${taskId}/upload-chat-file`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        // Message will be handled by socket event in the modal
        console.log("File uploaded successfully");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      toast({
        title: "Error",
        description: "Failed to upload file",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  // Handle message deletion
  const handleDeleteMessage = async (messageId) => {
    if (!jobId || !taskId) return;

    try {
      await deleteAdminMessage(jobId, taskId, messageId);
      fetchMessages()
    } catch (error) {
      console.error("Error deleting message:", error);
      throw error;
    }
  };

  // Handle key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    } else {
      handleTypingStart();
    }
  };

  return (
    <Card className="h-fit shadow-none flex flex-col hide-scrollbar">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          Task Communication
          {!isConnected && (
            <div className="w-2 h-2 bg-red-500 rounded-full" title="Disconnected" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="h-fit flex flex-col">
        <div
          // ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-800 rounded-md min-h-[300px] max-h-[500px]"
        >
          {messages.length === 0 ? (
            <div className="flex justify-center items-center h-full text-gray-500 dark:text-gray-400">
              No messages yet. Start the conversation!
            </div>
          ) : (
            messages.map((msg, idx) => (
              <AdminEnhancedMessageBubble
                key={idx}
                message={msg}
                isAdmin={msg.sender === 'admin'}
                showAvatar={true}
                formatTimeAgo={formatTimeAgo}
                onDeleteMessage={handleDeleteMessage}
                canDelete={msg.sender === 'admin'}
              />
            ))
          )}
          
          <AdminTypingIndicator 
            isVisible={typingUsers.length > 0} 
            typingUsers={typingUsers} 
          />
          
          {/* <div ref={messagesEndRef} /> */}
        </div>

        <div className="pt-4 border-t mt-4 space-y-3">
          <div className="relative">
            <Textarea
              placeholder="Type your message here..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              onBlur={handleTypingStop}
              className="resize-none pr-20 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-200 focus:ring-[#3B82F6] focus:border-[#3B82F6] rounded-lg"
              rows={3}
              disabled={!jobId || !taskId || isSending}
            />
            
            <div className="absolute bottom-2 right-2 flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)}
                className="h-8 w-8 p-0 hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                <Smile className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsVoiceRecorderOpen(!isVoiceRecorderOpen)}
                className="h-8 w-8 p-0 hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                <Mic className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsFileAttachmentOpen(!isFileAttachmentOpen)}
                className="h-8 w-8 p-0 hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                <Paperclip className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={sendMessage}
              disabled={isSending || !jobId || !taskId || !newMessage.trim()}
              className="bg-[#3B82F6] hover:bg-[#2563EB] text-white transition-colors focus:ring-2 focus:ring-[#3B82F6]"
            >
              {isSending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Emoji Picker */}
        <AdminEmojiPicker
          isOpen={isEmojiPickerOpen}
          onEmojiSelect={handleEmojiSelect}
          onClose={() => setIsEmojiPickerOpen(false)}
        />

        {/* Voice Recorder */}
        <AdminVoiceRecorder
          isOpen={isVoiceRecorderOpen}
          onSendVoice={handleSendVoice}
          onClose={() => setIsVoiceRecorderOpen(false)}
        />

        {/* File Attachment */}
        <AdminFileAttachment
          isOpen={isFileAttachmentOpen}
          onFileSelect={handleFileSelect}
          onClose={() => setIsFileAttachmentOpen(false)}
        />
      </CardContent>
    </Card>
  );
}

AdminTaskMessages.propTypes = {
  jobId: PropTypes.string.isRequired,
  taskId: PropTypes.string.isRequired,
  messages: PropTypes.array.isRequired,
  onNewMessage: PropTypes.func,
};