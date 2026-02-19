import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  fetchAdminNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead 
} from "@/services/admin-socket.service";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { Bell, CheckCircle, Loader2, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function AdminNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  const loadNotifications = async (pageNum = 1, append = false) => {
    try {
      setIsLoading(true);
      const storedCompany = localStorage.getItem("selectedCompany");
      const companyId = storedCompany ? JSON.parse(storedCompany).id : null;
      const data = await fetchAdminNotifications(pageNum, 20, false, companyId);
      
      if (append) {
        setNotifications(prev => [...prev, ...data.notifications]);
      } else {
        setNotifications(data.notifications);
      }
      
      setHasMore(data.pagination.page < data.pagination.pages);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      toast({
        title: "Error",
        description: "Failed to load notifications",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
    
    // Set up socket listener for new notifications
    const handleNewNotification = (data) => {
      const storedCompany = localStorage.getItem("selectedCompany");
      const companyId = storedCompany ? JSON.parse(storedCompany).id : null;
      const notificationCompanyId = data?.data?.companyId;
      if (companyId && notificationCompanyId && notificationCompanyId !== companyId) {
        return;
      }
      setNotifications(prev => [data, ...prev]);
    };
    
    // Add event listener if socket is available
    if (window.adminSocket) {
      window.adminSocket.on('notification', handleNewNotification);
    }
    
    return () => {
      // Clean up event listener
      if (window.adminSocket) {
        window.adminSocket.off('notification', handleNewNotification);
      }
    };
  }, []);

  const handleLoadMore = () => {
    if (hasMore && !isLoading) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadNotifications(nextPage, true);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await markNotificationAsRead(id);
      setNotifications(prev =>
        prev.map(notification => 
          notification.id === id ? { ...notification, read: true } : notification
        )
      );
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
      toast({
        title: "Error",
        description: "Failed to update notification",
        variant: "destructive",
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      );
      toast({
        title: "Success",
        description: "All notifications marked as read",
        variant: "success",
      });
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
      toast({
        title: "Error",
        description: "Failed to update notifications",
        variant: "destructive",
      });
    }
  };

  const handleNotificationClick = (notification) => {
    // Mark as read
    if (!notification.read) {
      handleMarkAsRead(notification.id);
    }
    
    // Navigate to relevant page if URL is provided
    if (notification.data && notification.data.url) {
      navigate(notification.data.url);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'message':
        return <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
          <Bell className="h-4 w-4" />
        </div>;
      case 'success':
        return <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
          <CheckCircle className="h-4 w-4" />
        </div>;
      case 'error':
        return <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center text-red-600">
          <Trash2 className="h-4 w-4" />
        </div>;
      default:
        return <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
          <Bell className="h-4 w-4" />
        </div>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Notifications</h2>
        {notifications.some(n => !n.read) && (
          <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
            <CheckCircle className="mr-2 h-4 w-4" />
            Mark all as read
          </Button>
        )}
      </div>

      {isLoading && notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading notifications...</p>
        </div>
      ) : notifications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Bell className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No notifications yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <Card 
              key={notification.id} 
              className={`cursor-pointer hover:bg-muted/20 transition-colors ${notification.read ? "opacity-70" : "border-l-4 border-primary"}`}
              onClick={() => handleNotificationClick(notification)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {getNotificationIcon(notification.type)}
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{notification.title}</h3>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {hasMore && (
            <div className="flex justify-center pt-2">
              <Button 
                variant="outline" 
                onClick={handleLoadMore}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Load More"
                )}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
