import * as React from "react"
import {
  SquareTerminal, 
  BarChart2, 
  FileText, 
  ShoppingCart, 
  Settings, 
  Activity, 
  TrendingUp, 
  ScrollText ,
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
import { useGlobalContext } from "@/functions/features/StateProvider"



export function AppSidebar({
  ...props
}) {
  const {userInfo} = useGlobalContext()

  const data = {
    user: {
      name: userInfo.name,
      email: userInfo.email,
      avatar: userInfo.profilePic,
    },
    navMain: [
      {
        title: "Dashboard",
        url: "/",
        icon: SquareTerminal,
        isActive: true,
        items: [],
      },
      {
        title: "Rules",
        url: "/rules",
        icon: ScrollText,
        items: [
          {
            title: "Manage Rules",
            url: "/rules",
          },
        ],
      },
      {
        title: "Settings",
        url: "/user/account",
        icon: Settings,
        items: [
          {
            title: "General",
            url: "/user/account",
          },
          {
            title: "Integrations",
            url: "/user/platform",
          },
          {
            title: "Billing",
            url: "/billing/pricing",
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
  return (
    (<Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
      <NavUser user={data.user} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>)
  );
}
