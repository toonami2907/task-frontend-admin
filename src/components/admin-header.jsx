import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { fetchAdminNotifications } from "@/services/admin-socket.service";
import { Bell } from "lucide-react";

export function AdminHeader() {
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Fetch unread notifications count
  const fetchUnreadCount = async () => {
    try {
      const data = await fetchAdminNotifications(1, 100, true);
      setUnreadCount(data.notifications.length);
    } catch (error) {
      console.error("Failed to fetch unread notifications:", error);
    }
  };
  
  useEffect(() => {
    fetchUnreadCount();
    
    // Set up interval to refresh count
    const interval = setInterval(fetchUnreadCount, 60000); // Every minute
    
    // Set up socket listener for new notifications
    const handleNewNotification = () => {
      setUnreadCount(prev => prev + 1);
    };
    
    // Add event listener if socket is available
    if (window.adminSocket) {
      window.adminSocket.on('notification', handleNewNotification);
    }
    
    return () => {
      clearInterval(interval);
      // Clean up event listener
      if (window.adminSocket) {
        window.adminSocket.off('notification', handleNewNotification);
      }
    };
  }, []);
  
  return (
    <header className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center">
        <Link to="/dashboard" className="text-xl font-bold">
          Admin Dashboard
        </Link>
      </div>
      
      <div className="flex items-center space-x-4">
        <Link to="/notifications">
          <Button variant="ghost" className="relative">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </Button>
        </Link>
        
        {/* Other header items */}
      </div>
    </header>
  );
}