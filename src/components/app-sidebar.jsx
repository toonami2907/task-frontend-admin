import * as React from "react"
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  SquareTerminal, 
  BarChart2, 
  FileText, 
  ShoppingCart, 
  Settings, 
  Activity, 
  TrendingUp, 
  Users
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

// This is sample data.
const data = {
  user: {
    name: "test",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "UTM TRACKER",
      logo: BarChart2,
      plan: "Test",
    },
    {
      name: "Utm tracker.",
      logo: TrendingUp,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Users,
      plan: "Free",
    },
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: [],
    },
    {
      title: "Campaigns",
      url: "#",
      icon: Activity,
      items: [
        {
          title: "Active Campaigns",
          url: "#",
        },
        {
          title: "Paused Campaigns",
          url: "#",
        },
        {
          title: "Archived Campaigns",
          url: "#",
        },
      ],
    },
    {
      title: "Analytics",
      url: "#",
      icon: BarChart2,
      items: [
        {
          title: "Overview",
          url: "#",
        },
        {
          title: "UTM Tracking",
          url: "#",
        },
        {
          title: "Ad Performance",
          url: "#",
        },
      ],
    },
    {
      title: "Orders",
      url: "#",
      icon: ShoppingCart,
      items: [
        {
          title: "All Orders",
          url: "#",
        },
        {
          title: "New Orders",
          url: "#",
        },
        {
          title: "Order Analytics",
          url: "#",
        },
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings,
      items: [
        {
          title: "General",
          url: "#",
        },
        {
          title: "Integrations",
          url: "#",
        },
        {
          title: "Billing",
          url: "#",
        },
        {
          title: "Limits",
          url: "#",
        },
      ],
    },
  ],
  projects: [
    {
      name: "Ad Manager",
      url: "#",
      icon: FileText,
    },
    {
      name: "Shopify Sync",
      url: "#",
      icon: ShoppingCart,
    },
    {
      name: "Performance Reports",
      url: "#",
      icon: BarChart2,
    },
  ],
};

export function AppSidebar({
  ...props
}) {
  return (
    (<Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>)
  );
}
