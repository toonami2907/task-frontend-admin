/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
// Sidebar.js
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
const navigationItemsSm = [
  { name: "Repositories", icon: Home, href: "/" },
  { name: "AI Code Review", icon: Code2, href: "#" },
  { name: "Cloud Security", icon: Cloud, href: "#" },
  { name: "How to Use", icon: Book, href: "#" },
  { name: "Settings", icon: Settings, href: "#" },
  { name: "Support", icon: Phone, href: "#" },
  { name: "Logout", icon: LogOut, href: "#" },
];

const DownNav = [
  { name: "Support", icon: Phone, href: "#" },
  { name: "Logout", icon: LogOut, href: "#" },
];

function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [current, setCurrent] = useState("Repositories");
  const location = useLocation();

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location]);

  //   // Update page title
  //   useEffect(() => {
  //     document.title = current ? `${current} - KnowledgePulse` : "KnowledgePulse";
  //   }, [current]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Navigation Bar */}
      <div className="sticky top-0 z-40 lg:hidden">
        <div className="flex items-center justify-between bg-white px-4 py-2 shadow-md">
          <Link to="/" className="text-xl font-bold text-gray-800">
            <img src="/Frame 9.png" alt="" />
          </Link>
          <SidebarToggle onClick={() => setIsSidebarOpen(!isSidebarOpen)} />
        </div>
      </div>

      {/* Sidebar - Desktop */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)}>
        <div className="flex flex-col overflow-y-auto border-r border-gray-200 bg-white pt-5">
          <div className="flex flex-shrink-0 items-center px-4 pt-1">
            <Link to="/" className="text-xl font-bold text-gray-800">
              <img src="/Frame 9.png" alt="" />
            </Link>
          </div>
          <div className="px-4 pt-2">
            <SelectNav className="w-[202px]" />
          </div>
          <nav className="mt-5 flex-1 space-y-1 px-4">
            {navigationItems.map((item) => (
              <SidebarItem
                key={item.name}
                as={Link}
                to={item.href}
                onClick={() => {
                  setCurrent(item.name);
                  setIsSidebarOpen(false);
                }}
                className={`group flex items-center px-4 rounded-[8px] h-12 w-52 text-lg ${
                  current === item.name
                    ? "bg-[#1570EF] text-white"
                    : "text-gray-900 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <item.icon className={`mr-3 h-5 w-5 flex-shrink-0 ${current === item.name ? "text-white" : "text-gray-900 group-hover:text-gray-500"}`} />
                {item.name}
              </SidebarItem>
            ))}
          </nav>
        </div>
      </Sidebar>

      {/* Main Content */}
      <div className="flex flex-1 flex-col lg:pl-64">
        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-4 bg-[#FFFFFF] border rounded-xl">
              <main className="h-full">
                <Outlet />
              </main>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Layout;
