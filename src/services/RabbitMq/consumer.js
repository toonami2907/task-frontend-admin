import { Client } from "@stomp/stompjs";
import toast from "react-hot-toast";

class NotificationConsumer {
  constructor() {
    this.url = `wss://${import.meta.env.VITE_CLOUDAMQP_HOST}/ws`;
    this.username = import.meta.env.VITE_CLOUDAMQP_USERNAME;
    this.password = import.meta.env.VITE_CLOUDAMQP_PASSWORD;
    this.client = null;
  }

  connect(userId) {
    this.client = new Client({
      brokerURL: this.url,
      connectHeaders: {
        login: this.username,
        passcode: this.password,
      },
      debug: (msg) => console.log("STOMP Debug:", msg),
      onConnect: () => {
        console.log("✅ Connected to RabbitMQ STOMP");
        this.subscribe(userId);
      },
      onStompError: (frame) => {
        console.error("🔴 STOMP error:", frame);
      },
      onWebSocketError: (error) => {
        console.error("🔴 WebSocket error:", error);
      },
    });

    this.client.activate();
  }

  subscribe(userId) {
    if (!this.client) return;

    this.client.subscribe("/queue/notifications", (message) => {
      const notification = JSON.parse(message.body);
      if (notification.userId === userId) {
        this.handleNotification(notification);
      }
    });
  }

  handleNotification(notification) {
    switch (notification.type) {
      case "RULE_EXECUTED":
        toast.success(notification.message);
        break;
      case "RULE_ERROR":
        toast.error(notification.message);
        break;
      case "RULE_COMPLETE":
        toast.info(notification.message);
        break;
      case "RULE_INFO":
        toast.info(notification.message);
        break;
    }
  }

  disconnect() {
    if (this.client) {
      this.client.deactivate();
      console.log("👋 Disconnected from RabbitMQ STOMP");
    }
  }
}

export const notificationConsumer = new NotificationConsumer();
