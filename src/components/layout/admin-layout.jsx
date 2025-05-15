/* eslint-disable no-unused-vars */
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useEffect, useState, useRef } from "react";
import {
  Link,
  Navigate,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useGlobalContext } from "@/context/StateProvider";
import { checkAdminAuth } from "@/hooks/admin_auth_checker";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";
import clsx from "clsx";
import { Bell, Loader2 } from "lucide-react";
import Breadcrumb from "../nav-breadcrumb";
import {
  connectAdminSocket,
  disconnectAdminSocket,
  fetchAdminNotifications,
} from "@/services/admin-socket.service";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";

function AdminLayout() {
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Set to true for demo
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState([]);
  const [isLoadingNotifications, setIsLoadingNotifications] =
    useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("companies");
  const { companiesCount } = useGlobalContext();
  const scrollContainerRef = useRef(null);
  const [adminId, setAdminId] = useState(null);

  // Authentication and socket setup
  useEffect(() => {
    const verifyAuth = async () => {
      const _userstatus = await checkAdminAuth();
      setIsAuthenticated(_userstatus);
      if (!_userstatus) {
        navigate("/login");
      } else {
        const storedAdminId = localStorage.getItem("adminId");
        if (storedAdminId) {
          setAdminId(storedAdminId);
          const socket = connectAdminSocket();
          window.adminSocket = socket;
          fetchUnreadNotifications();
        }
      }
    };
    verifyAuth();

    return () => {
      disconnectAdminSocket();
      window.adminSocket = null;
    };
  }, [navigate]);

  // Fetch unread notifications
  const fetchUnreadNotifications = async () => {
    try {
      setIsLoadingNotifications(true);
      const data = await fetchAdminNotifications(1, 100, true);
      setUnreadNotifications(data.notifications);
      setUnreadCount(data.notifications.length);
    } catch (error) {
      console.error("Failed to fetch unread notifications:", error);
    } finally {
      setIsLoadingNotifications(false);
    }
  };

  // Socket listener for new notifications
  useEffect(() => {
    if (
      window.adminSocket &&
      typeof window.adminSocket.addEventListener === "function"
    ) {
      const handleNewNotification = (event) => {
        const notification = JSON.parse(event.data);
        setUnreadNotifications((prev) => [
          notification,
          ...prev.slice(0, 4),
        ]);
        setUnreadCount((prev) => prev + 1);
      };

      window.adminSocket.addEventListener(
        "message",
        handleNewNotification
      );

      const interval = setInterval(fetchUnreadNotifications, 60000); // Refresh every minute

      return () => {
        window.adminSocket.removeEventListener(
          "message",
          handleNewNotification
        );
        clearInterval(interval);
      };
    }
  }, []);

  const tabs = [
    {
      name: "Overview",
      value: "/admin",
      count: null,
      activeColor: "border-black",
      path: "",
    },
    {
      name: "Companies",
      value: "companies",
      count: companiesCount,
      activeColor: "border-black",
      path: "companies",
    },
    {
      name: "Supports",
      value: "supports",
      count: null,
      activeColor: "border-blue-500",
      badgeVariant: "blue",
      path: "supports",
    },
    {
      name: "Settings",
      value: "settings",
      count: null,
      activeColor: "border-gray-500",
      path: "settings",
    },
    {
      name: "Log",
      value: "log",
      count: null,
      activeColor: "border-gray-500",
      path: "log",
    },
  ];

  // Scroll to active tab
  useEffect(() => {
    if (scrollContainerRef.current) {
      const activeTabElement =
        scrollContainerRef.current.querySelector(
          `[data-value="${activeTab}"]`
        );
      if (activeTabElement) {
        const container = scrollContainerRef.current;
        const scrollLeft =
          activeTabElement.offsetLeft -
          container.clientWidth / 2 +
          activeTabElement.clientWidth / 2;
        container.scrollTo({ left: scrollLeft, behavior: "smooth" });
      }
    }
  }, [activeTab]);

  return (
    <div className="flex flex-col min-h-screen bg-neutral-100 dark:bg-[#131313]">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to="/admin"
            className="text-xl font-bold text-gray-900 dark:text-gray-100"
          >
            Admin Dashboard
          </Link>
          <div className="hidden sm:block">
            <Breadcrumb />
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                className="relative text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full h-9 w-9 flex items-center justify-center"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#EF4444] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">
                    Notifications
                  </h3>
                  {unreadNotifications.length > 0 && (
                    <Link
                      to="/admin/notifications"
                      className="text-xs text-[#3B82F6] hover:underline"
                      onClick={() => setUnreadNotifications([])}
                    >
                      Mark all as read
                    </Link>
                  )}
                </div>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {isLoadingNotifications ? (
                  <div className="flex justify-center items-center p-4">
                    <Loader2 className="h-5 w-5 animate-spin text-gray-400 dark:text-gray-500" />
                  </div>
                ) : unreadNotifications.length === 0 ? (
                  <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                    No new notifications
                  </div>
                ) : (
                  <div>
                    {unreadNotifications.map((notification) => (
                      <Link
                        key={notification.id}
                        to={
                          notification.data?.url ||
                          "/admin/notifications"
                        }
                        className="block p-3 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-200 dark:border-gray-700 last:border-b-0"
                      >
                        <div className="flex justify-between items-start">
                          <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100">
                            {notification.title}
                          </h4>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDistanceToNow(
                              new Date(notification.createdAt),
                              {
                                addSuffix: true,
                              }
                            )}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                      </Link>
                    ))}
                    <div className="p-2 text-center">
                      <Link
                        to="/admin/notifications"
                        className="text-xs text-[#3B82F6] hover:underline"
                      >
                        View all notifications
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>
          <button onClick={()=>navigate('/admin/profile')} className="h-9 w-9 cursor-default rounded-full bg-gray-300 dark:bg-gray-600 overflow-hidden">
            <img
              src="/avatar.avif"
              alt="User profile"
              className="h-full w-full object-cover"
            />
          </button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="px-6 relative">
          <div
            ref={scrollContainerRef}
            className="flex overflow-x-auto scrollbar-hide"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              WebkitOverflowScrolling: "touch",
            }}
          >
            {tabs.map((tab) => (
              <Link
                key={tab.name}
                to={`/admin/${tab.path}`}
                data-value={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={clsx(
                  "relative whitespace-nowrap py-3 px-3 mr-3 flex-shrink-0 text-sm md:text-md font-semibold transition-colors duration-200",
                  activeTab === tab.value
                    ? `text-[#3B82F6] border-b-[3px] border-[#3B82F6]`
                    : "text-gray-700 dark:text-gray-300 hover:text-[#3B82F6] dark:hover:text-[#3B82F6]"
                )}
              >
                {tab.name}
                {tab.count !== null && (
                  <span
                    className={clsx(
                      "ml-2 inline-flex items-center justify-center w-5 h-5 rounded-sm text-xs font-semibold",
                      activeTab === tab.value
                        ? tab.value === "employees"
                          ? "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300"
                          : tab.value === "teams"
                          ? "bg-pink-100 text-pink-600 dark:bg-pink-900 dark:text-pink-300"
                          : "bg-red-100 text-[#EF4444] dark:bg-red-900 dark:text-red-300"
                        : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
                    )}
                  >
                    {tab.count}
                  </span>
                )}
              </Link>
            ))}
          </div>
          <div className="hidden sm:block absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent dark:from-gray-800 pointer-events-none"></div>
          <div className="hidden sm:block absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent dark:from-gray-800 pointer-events-none"></div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-grow bg-neutral-100 dark:bg-[#131313] px-8 py-6">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;
