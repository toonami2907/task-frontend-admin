import React, { useEffect, useState } from "react";
import {
  BarChart2,
  Users,
  CreditCard,
  Menu,
  X,
  List,
  Edit,
  FilePlus,
  Target,
  Home,
  Code2,
  Cloud,
  Book,
  Settings,
  Phone,
  LogOut,
} from "lucide-react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import SelectNav from "../components/Select";
import { Sidebar, SidebarItem, SidebarToggle } from '../components/ui/sidebar';

const navigationItems = [
  { name: "Repositories", icon: Home, href: "/" },
  { name: "AI Code Review", icon: Code2, href: "#" },
  { name: "Cloud Security", icon: Cloud, href: "#" },
  { name: "How to Use", icon: Book, href: "#" },
  { name: "Settings", icon: Settings, href: "#" },
];

const DownNav = [
  { name: "Support", icon: Phone, href: "#" },
  { name: "Logout", icon: LogOut, href: "#" },
];

function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [current, setCurrent] = useState("Repositories");
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(false);

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Navigation Bar */}
      <div className="sticky top-0 z-40 lg:hidden">
        <div className="flex items-center justify-between bg-white px-4 py-2 shadow-md">
          <Link to="/" className="text-xl font-bold text-gray-800">
            <img src="/Frame 9.png" alt="Logo" className="h-8" />
          </Link>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-gray-600 hover:text-gray-900 focus:outline-none"
          >
            {isSidebarOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-30 w-64 transform bg-white transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-center border-b border-gray-200">
            <Link to="/" className="flex items-center">
              <img src="/Frame 9.png" alt="Logo" className="h-8" />
            </Link>
          </div>

          {/* Select Nav */}
          {/* <div className="px-4 pt-4">
            <SelectNav className="w-full" />
          </div> */}

          {/* Main Navigation */}
          <nav className="mt-5 flex-1 space-y-1 px-4 overflow-y-auto">
            {navigationItems.map((item) => (
              <SidebarItem
                key={item.name}
                as={Link}
                to={item.href}
                onClick={() => {
                  setCurrent(item.name);
                  isMobile && setIsSidebarOpen(false);
                }}
                className={`group flex items-center px-4 rounded-lg h-12 text-sm font-medium transition-colors ${
                  current === item.name
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <item.icon 
                  className={`mr-3 h-5 w-5 flex-shrink-0 transition-colors ${
                    current === item.name 
                      ? "text-white" 
                      : "text-gray-400 group-hover:text-gray-500"
                  }`} 
                />
                {item.name}
              </SidebarItem>
            ))}
          </nav>

          {/* Bottom Navigation */}
          <div className="border-t border-gray-200 px-4 py-4 space-y-1">
            {DownNav.map((item) => (
              <SidebarItem
                key={item.name}
                as={Link}
                to={item.href}
                className="group flex items-center px-4 rounded-lg h-12 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <item.icon className="mr-3 h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-gray-500" />
                {item.name}
              </SidebarItem>
            ))}
          </div>
        </div>
      </div>

      {/* Backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex flex-1 flex-col lg:pl-64">
        <main className="flex-1">
          <div className="py-6">
            <div className="mx-4 bg-red-700 border rounded-xl shadow-sm">
              <div className="min-h-screen p-4">
                <Outlet />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Layout;