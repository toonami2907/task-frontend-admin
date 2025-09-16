import { io } from "socket.io-client";
import { toast } from "@/hooks/use-toast";
import axios from "axios";
import Cookies from "js-cookie";

let adminSocket = null;
const apiUrl = import.meta.env.VITE_API_URL;

const notificationsSupported = "Notification" in window;

const requestNotificationPermission = async () => {
  if (!notificationsSupported) {
    console.log("This browser does not support notifications");
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }

  return false;
};

const showPushNotification = (title, options) => {
  if (!notificationsSupported) {
    console.log("Notifications not supported");
    return;
  }

  if (Notification.permission === "granted") {
    try {
      const notification = new Notification(title, options);
      notification.onclick = (event) => {
        event.preventDefault();
        window.focus();
        if (options.data?.url) {
          window.location.href = options.data.url;
        }
        notification.close();
      };
      return notification;
    } catch (error) {
      console.error("Error showing push notification:", error);
    }
  } else {
    console.log("Notification permission not granted:", Notification.permission);
  }
};

export const connectAdminSocket = async () => {
  const adminId = localStorage.getItem("adminId");
  if (!adminId) {
    console.error("No admin ID found");
    toast({
      title: "Error",
      description: "Admin ID not found. Please log in again.",
      variant: "destructive",
      className:
        "bg-[#EF4444] border-[#991B1B] text-[#FFFFFF] border shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-2px_rgba(0,0,0,0.05)] rounded-md p-4",
    });
    return null;
  }

  const permissionGranted = await requestNotificationPermission();
  if (!permissionGranted) {
    toast({
      title: "Notifications Blocked",
      description: "Please enable notifications in your browser settings.",
      variant: "destructive",
      className:
        "bg-[#EF4444] border-[#991B1B] text-[#FFFFFF] border shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-2px_rgba(0,0,0,0.05)] rounded-md p-4",
    });
  }

  if (!adminSocket) {
    adminSocket = io(`${apiUrl}`, {
      withCredentials: true,
      transports: ["websocket", "polling"],
    });

    adminSocket.on("connect", () => {
      console.log("Admin socket connected:", adminSocket.id);
      adminSocket.emit("join", "admin");
      console.log("Admin joined admin room");
    });

    adminSocket.on("connect_error", (error) => {
      console.error("Admin socket connection error:", error);
      toast({
        title: "Connection Error",
        description: "Failed to connect to notification server.",
        variant: "destructive",
        className:
          "bg-[#EF4444] border-[#991B1B] text-[#FFFFFF] border shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-2px_rgba(0,0,0,0.05)] rounded-md p-4",
      });
    });

    adminSocket.on("disconnect", () => {
      console.log("Admin socket disconnected");
    });
  }

  return adminSocket;
};

export const disconnectAdminSocket = () => {
  if (adminSocket) {
    adminSocket.disconnect();
    adminSocket = null;
    console.log("Admin socket disconnected and reference cleared");
  }
};

export const getSocket = () => adminSocket;

export const onAdminNotification = (callback) => {
  if (!adminSocket) {
    console.error("Admin socket not connected");
    return () => {};
  }

  const handleNotification = (data) => {
    console.log("Admin notification received:", JSON.stringify(data, null, 2));
    callback({ ...data, type: data.type || "default" });
    toast({
      title: data.title || "Notification",
      description: data.message || "No message provided",
      variant: data.type || "default",
      className:
        data.type === "success"
          ? "bg-[#10B981] border-[#065F46] text-[#FFFFFF] border shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-2px_rgba(0,0,0,0.05)] rounded-md p-4"
          : data.type === "error"
          ? "bg-[#EF4444] border-[#991B1B] text-[#FFFFFF] border shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-2px_rgba(0,0,0,0.05)] rounded-md p-4"
          : "bg-[#3B82F6] border-[#1E40AF] text-[#FFFFFF] border shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-2px_rgba(0,0,0,0.05)] rounded-md p-4",
    });

    if (document.visibilityState !== "visible") {
      showPushNotification(data.title || "Notification", {
        body: data.message,
        icon: "/logo.png",
        badge: "/badge.png",
        data: {
          ...data.data,
          notificationId: data.id,
        },
        tag: data.id,
        requireInteraction: true,
      });
    }
  };

  const handleNewTaskMessage = (data) => {
    console.log("Admin new task message:", JSON.stringify(data, null, 2));
    callback({
      id: `message-${data.message.id}`,
      title: "New Task Message",
      message: data.message.text || `New ${data.message.messageType} message`,
      type: "message",
      data: {
        jobId: data.jobId,
        taskId: data.taskId,
        url: `/admin/tasks/${data.taskId}`,
        message: data.message,
      },
      timestamp: data.message.createdAt,
    });
    toast({
      title: "New Task Message",
      description: data.message.text || `New ${data.message.messageType} message`,
      variant: "default",
      className:
        "bg-[#3B82F6] border-[#1E40AF] text-[#FFFFFF] border shadow-[0_10px_15px_-3px_rgba(0,0,0,0.1),0_4px_6px_-2px_rgba(0,0,0,0.05)] rounded-md p-4",
    });

    if (document.visibilityState !== "visible") {
      showPushNotification("New Task Message", {
        body: data.message.text || `New ${data.message.messageType} message`,
        icon: "/logo.png",
        badge: "/badge.png",
        data: {
          jobId: data.jobId,
          taskId: data.taskId,
          url: `/admin/tasks/${data.taskId}`,
        },
        tag: `message-${data.message.id}`,
        requireInteraction: true,
      });
    }
  };

  const handleMessageDeleted = (data) => {
    console.log("Admin message deleted:", JSON.stringify(data, null, 2));
    callback({
      id: `deleted-${data.messageId}`,
      title: "Message Deleted",
      message: "A message was deleted",
      type: "message-deleted",
      data: {
        jobId: data.jobId,
        taskId: data.taskId,
        messageId: data.messageId,
      },
    });
  };

  const handleUserTyping = (data) => {
    console.log("Admin user typing:", JSON.stringify(data, null, 2));
    callback({
      id: `typing-${data.senderId}`,
      title: "User Typing",
      message: `${data.senderType} is typing...`,
      type: "typing",
      data: {
        jobId: data.jobId,
        taskId: data.taskId,
        senderId: data.senderId,
        senderType: data.senderType,
        isTyping: data.isTyping,
      },
    });
  };

  adminSocket.on("notification", handleNotification);
  adminSocket.on("new-task-message", handleNewTaskMessage);
  adminSocket.on("message-deleted", handleMessageDeleted);
  adminSocket.on("user-typing", handleUserTyping);

  return () => {
    adminSocket.off("notification", handleNotification);
    adminSocket.off("new-task-message", handleNewTaskMessage);
    adminSocket.off("message-deleted", handleMessageDeleted);
    adminSocket.off("user-typing", handleUserTyping);
  };
};

export const fetchAdminNotifications = async (page = 1, limit = 20, unreadOnly = false) => {
  try {
    const token = Cookies.get("admin_access_token");
    if (!token) {
      throw new Error("No access token found");
    }

    const response = await axios.get(`${apiUrl}/api/v1/notifications/`, {
      params: { page, limit, unreadOnly },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data.data;
  } catch (error) {
    console.error("Error fetching admin notifications:", error);
    throw error;
  }
};

export const markNotificationAsRead = async (notificationId) => {
  try {
    const token = Cookies.get("admin_access_token");
    if (!token) {
      throw new Error("No access token found");
    }

    const response = await axios.patch(
      `${apiUrl}/api/v1/notifications/${notificationId}/read/admin`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
};

export const markAllNotificationsAsRead = async () => {
  try {
    const token = Cookies.get("admin_access_token");
    if (!token) {
      throw new Error("No access token found");
    }

    const response = await axios.patch(
      `${apiUrl}/api/v1/notifications/read-all/admin`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    throw error;
  }
};

export const deleteNotification = async (notificationId) => {
  try {
    const token = Cookies.get("admin_access_token");
    if (!token) {
      throw new Error("No access token found");
    }

    const response = await axios.delete(
      `${apiUrl}/api/v1/notifications/${notificationId}/admin`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error deleting notification:", error);
    throw error;
  }
};

export const deleteAllReadNotifications = async () => {
  try {
    const token = Cookies.get("admin_access_token");
    if (!token) {
      throw new Error("No access token found");
    }

    const response = await axios.delete(
      `${apiUrl}/api/v1/notifications/read/admin`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error deleting read notifications:", error);
    throw error;
  }
};

export const testPushNotification = () => {
  showPushNotification("Test Notification", {
    body: "This is a test push notification",
    icon: "/logo.png",
    badge: "/badge.png",
    data: { url: window.location.href },
    tag: "test-" + Date.now(),
    requireInteraction: true,
  });
};

// Helper functions for admin chat features
export const emitAdminTypingStart = (jobId, taskId) => {
  const socket = getSocket();
  if (socket) {
    socket.emit('typing-start', {
      jobId,
      taskId,
      senderId: 'admin',
      senderType: 'admin'
    });
  }
};

export const emitAdminTypingStop = (jobId, taskId) => {
  const socket = getSocket();
  if (socket) {
    socket.emit('typing-stop', {
      jobId,
      taskId,
      senderId: 'admin',
      senderType: 'admin'
    });
  }
};

export const emitAdminTaskMessage = (jobId, taskId, text, messageType = 'text', fileUrl = null, fileName = null, fileSize = null, mimeType = null) => {
  const socket = getSocket();
  if (socket) {
    socket.emit('task-message', {
      jobId,
      taskId,
      text,
      senderType: 'admin',
      senderId: 'admin',
      messageType,
      fileUrl,
      fileName,
      fileSize,
      mimeType
    });
  }
};

export const deleteAdminMessage = async (jobId, taskId, messageId) => {
  try {
    const token = Cookies.get("admin_access_token");
    if (!token) {
      throw new Error("No access token found");
    }

    const response = await axios.delete(
      `${apiUrl}/api/v1/jobs/${jobId}/tasks/${taskId}/messages/${messageId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error deleting message:", error);
    throw error;
  }
};