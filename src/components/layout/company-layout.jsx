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
import { checkAdminAuth } from "@/hooks/admin_auth_checker";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";
import clsx from "clsx";
import { Bell } from "lucide-react";
import Breadcrumb from "../nav-breadcrumb";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import Cookie from "js-cookie";
import { api, useGlobalContext } from "@/context/StateProvider";
import {
  connectAdminSocket,
  disconnectAdminSocket,
  fetchAdminNotifications,
} from "@/services/admin-socket.service";

function CompanyLayout() {
  const [isAuthenticated, setIsAuthenticated] = useState(true); // Set to true for demo, use actual auth in production
  const [isValidCompany, setIsValidCompany] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState([]);
  const [isLoadingNotifications, setIsLoadingNotifications] =
    useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { employeesCount, teamsCount, jobsCount } =
    useGlobalContext();
  const [activeTab, setActiveTab] = useState("overview");
  const [adminId, setAdminId] = useState(null);
  // Extract the current path to determine active tab
  const path = location.pathname.split("/");
  const scrollContainerRef = useRef(null);
  // Validate company on mount
  useEffect(() => {
    const validateCompany = async () => {
      try {
        setIsLoading(true);

        // Get selected company from localStorage
        const storedCompany = localStorage.getItem("selectedCompany");

        if (!storedCompany) {
          toast.error("No company selected");
          navigate("/companies");
          return;
        }

        const { id } = JSON.parse(storedCompany);

        if (!id) {
          toast.error("Invalid company selection");
          navigate("/companies");
          return;
        }
        const storedAdminId = localStorage.getItem("adminId");
        if (storedAdminId) {
          setAdminId(storedAdminId);
          const socket = connectAdminSocket();
          window.adminSocket = socket;
          // fetchUnreadNotifications();
        }

        // Verify company exists in backend
        const response = await axios.get(
          `${api}/api/v1/companies/${id}`,
          {
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${Cookie.get(
                "admin_access_token"
              )}`,
            },
          }
        );

        setSelectedCompany(response.data.company);
        setIsValidCompany(true);
      } catch (error) {
        console.error("Error validating company:", error);

        if (error.response && error.response.status === 404) {
          toast.error("Company not found");
        } else {
          toast.error("Error validating company access");
        }

        // Redirect to companies page if validation fails
        navigate("/admin/companies");
      } finally {
        setIsLoading(false);
        disconnectAdminSocket();
        window.adminSocket = null;
      }
    };

    validateCompany();
  }, [navigate]);

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
  useEffect(() => {
    if (
      window.adminSocket &&
      typeof window.adminSocket.addEventListener === "function"
    ) {
      const handleNewNotification = (notification) => {
        setUnreadNotifications((prev) => [
          notification,
          ...prev.slice(0, 4),
        ]);
        setUnreadCount((prev) => prev + 1);
      };

      window.adminSocket.on("notification", handleNewNotification);

      const interval = setInterval(fetchUnreadNotifications, 60000); // Refresh every minute

      return () => {
        window.adminSocket.off("notification", handleNewNotification);
        clearInterval(interval);
      };
    }
  }, []);
  const companytabs = [
    {
      name: "Overview",
      value: "overview",
      count: null,
      activeColor: "border-black",
      path: "",
    },
    {
      name: "Jobs",
      value: "jobs",
      count: jobsCount,
      activeColor: "border-black",
      path: "jobs",
    },
    {
      name: "Employees",
      value: "employees",
      count: employeesCount,
      activeColor: "border-blue-500",
      badgeVariant: "blue",
      path: "employees",
    },
    {
      name: "Teams",
      value: "teams",
      count: teamsCount,
      activeColor: "border-pink-500",
      badgeVariant: "pink",
      path: "teams",
    },
    {
      name: "Settings",
      value: "settings",
      count: null,
      activeColor: "border-gray-500",
      path: "settings",
    },
    {
      name: "Custom Messages",
      value: "custom-messages",
      count: null,
      activeColor: "border-gray-500",
      path: "custom-messages",
    },
  ];

  // Scroll to active tab when tab changes
  useEffect(() => {
    if (scrollContainerRef.current) {
      const activeTabElement =
        scrollContainerRef.current.querySelector(
          `[data-value="${activeTab}"]`
        );
      if (activeTabElement) {
        // Calculate position to center the active tab
        const container = scrollContainerRef.current;
        const scrollLeft =
          activeTabElement.offsetLeft -
          container.clientWidth / 2 +
          activeTabElement.clientWidth / 2;
        container.scrollTo({ left: scrollLeft, behavior: "smooth" });
      }
    }
  }, [activeTab]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="mt-4 text-gray-600">
          Validating company access...
        </p>
      </div>
    );
  }

  // Redirect if company is not valid (this is a fallback, the useEffect should handle redirection)
  if (!isValidCompany && !isLoading) {
    return <Navigate to="/admin/companies" />;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Toaster position="top-center" />
      {/* Header with Logo and User Icon */}
      <header className="bg-white">
        <div className="mx-auto px-7 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {/* Logo */}
            <Link to="/" className="flex items-center">
              <div className="text-blue-500">
                <img src="/logo.webp" alt="Logo" />
              </div>
            </Link>

            <div className="ml-4 hidden sm:block">
              <Breadcrumb />
            </div>
          </div>

          {/* Company Name Display */}
          {/* {selectedCompany && (
            <div className="hidden md:flex items-center">
              <span className="font-semibold text-gray-700">
                {selectedCompany.name}
              </span>
            </div>
          )} */}

          {/* User Profile and Notifications */}
          <div className="flex items-center space-x-4">
            <button className="text-gray-500 rounded-full border border-gray-200 h-9 w-9 flex items-center justify-center hover:bg-gray-100 ">
              <Bell size={18} />
            </button>
            <div className="h-9 w-9 rounded-full bg-gray-300 overflow-hidden">
              <img
                src="/avatar.avif"
                alt="User profile"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs - Now with horizontal scroll */}
      <nav className="bg-white border-b border-gray-200">
        <div className="px-6 relative">
          {/* Scrollable container - No bottom padding here */}
          <div
            ref={scrollContainerRef}
            className="flex overflow-x-auto scrollbar-hide"
            style={{
              scrollbarWidth: "none" /* Firefox */,
              msOverflowStyle: "none" /* IE and Edge */,
              WebkitOverflowScrolling:
                "touch" /* Smooth scrolling on iOS */,
            }}
          >
            {companytabs.map((tab) => (
              <Link
                key={tab.name}
                to={`/companies/${tab.path}`}
                data-value={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={clsx(
                  "relative whitespace-nowrap py-3 px-3 mr-3 flex-shrink-0 text-sm md:text-md font-semibold transition-colors duration-200",
                  activeTab === tab.value
                    ? `text-black border-b-[3px] border-black`
                    : "text-gray-700 hover:text-gray-800"
                )}
              >
                {tab.name}
                {tab.count !== null && (
                  <span
                    className={clsx(
                      "ml-2 inline-flex items-center justify-center w-5 h-5 rounded-sm text-xs font-semibold",
                      tab.value === "employees"
                        ? "bg-blue-100 text-blue-600"
                        : tab.value === "teams"
                        ? "bg-pink-100 text-pink-600"
                        : "bg-green-100 text-gray-600"
                    )}
                  >
                    {tab.count}
                  </span>
                )}
              </Link>
            ))}
          </div>

          {/* Optional: Fade indicators for scroll */}
          <div className="hidden sm:block absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent pointer-events-none"></div>
          <div className="hidden sm:block absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none"></div>
        </div>
      </nav>

      {/* Main Content Area with Outlet */}
      <main className="flex-grow bg-gray-50">
        <div className="px-8 py-6">
          <Outlet context={{ company: selectedCompany }} />
        </div>
      </main>
    </div>
  );
}

export default CompanyLayout;
