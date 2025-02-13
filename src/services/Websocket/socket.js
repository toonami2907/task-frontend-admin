import toast from 'react-hot-toast';
import io from 'socket.io-client';

const BACKEND_URL = import.meta.env.VITE_API_URL;

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect(userId) {
    console.log('🚀 Starting socket connection for userId:', userId);

    this.socket = io(BACKEND_URL, {
      withCredentials: true,
      transports: ['websocket'],
      auth: { userId }
    });

    // Connection status logs
    this.socket.on('connect', () => {
      console.log('✅ Socket Connected! ID:', this.socket.id);
      this.socket.emit('authenticate', userId);
    });

    // Confirmation of room join
    this.socket.on('joined', (room) => {
      console.log(`✅ Successfully joined room: ${room}`);
    });

    // Listen for rule notifications
    this.socket.on('ruleNotification', (notification) => {
      console.log('📨 Received notification:', notification);
      this.handleNotification(notification);
    });

    // Debug all events
    this.socket.onAny((eventName, ...args) => {
      console.log(`🔔 Event received: ${eventName}`, args);
    });

    // Handle disconnection
    this.socket.on('disconnect', () => {
      console.log('❌ Socket Disconnected');
    });
  }

  handleNotification(notification) {
    switch (notification.type) {
      case 'RULE_EXECUTED':
        toast.success(notification.message);
        break;
      case 'RULE_ERROR':
        toast.error(notification.message);
        break;
      case 'RULE_COMPLETE':
        toast.info(notification.message);
        break;
      case 'RULE_INFO':
        toast.info(notification.message);
        break;
      default:
        console.warn('⚠️ Unknown notification type:', notification);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}

export const socketService = new SocketService();
