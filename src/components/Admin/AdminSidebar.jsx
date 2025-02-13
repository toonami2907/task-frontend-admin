import * as React from "react"
import {
  LayoutDashboard,
  Users,
  Settings,
  DollarSign,
  Mail,
  CreditCard,
  BarChart3,
  ShieldAlert,
  HelpCircle
} from "lucide-react"

import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { NavAdmin } from "./ultils/nav-admin"
import { AdminMain } from "./nav-admin"


export function AdminSidebar({ ...props }) {
  const data = {
    teams: [
      {
        name: "ADMIN PANEL",
        logo: ShieldAlert,
        plan: "Admin",
      }
    ],
    navMain: [
      {
        title: "Dashboard",
        url: "/admin/dashboard",
        icon: LayoutDashboard,
        isActive: true,
        items: [],
      },
      {
        title: "Users",
        url: "/admin/users",
        icon: Users,
        items: [
          {
            title: "Manage users",
            url: "/admin/users",
          },
         
        ],
      },
      {
        title: "Pricing",
        url: "/admin/pricing",
        icon: DollarSign,
        items: [
          {
            title: "Create Plans",
            url: "/admin/plan/create",
          },
          {
            title: "Manage Plans",
            url: "/admin/plan/manage",
          }
        ],
      },
      {
        title: "FAQs",
        url: "/admin/faq",
        icon: HelpCircle,
        items: [
          {
            title: "Manage FAQs",
            url: "/admin/faq",
          }
         
        ],
      },
      // {
      //   title: "Marketing",
      //   url: "/admin/marketing",
      //   icon: Mail,
      //   items: [
      //     {
      //       title: "Email Campaigns",
      //       url: "/admin/marketing/campaigns",
      //     },
      //     {
      //       title: "Campaign Analytics",
      //       url: "/admin/marketing/analytics",
      //     }
      //   ],
      // },
      // {
      //   title: "Analytics",
      //   url: "/admin/analytics",
      //   icon: BarChart3,
      //   items: [
      //     {
      //       title: "Overview",
      //       url: "/admin/analytics/overview",
      //     },
      //     {
      //       title: "Reports",
      //       url: "/admin/analytics/reports",
      //     }
      //   ],
      // },
      // {
      //   title: "Settings",
      //   url: "/admin/settings",
      //   icon: Settings,
      //   items: [
      //     {
      //       title: "General",
      //       url: "/admin/settings/general",
      //     },
      //     {
      //       title: "Email Templates",
      //       url: "/admin/settings/email-templates",
      //     }
      //   ],
      // },
    ]
  }

  return (
    <Sidebar  collapsible="icon" {...props}>
      <SidebarHeader>
      <NavAdmin user={{ name: "Admin", email: "admin@example.com", avatar: "/avatars/admin.jpg" }} />
      </SidebarHeader>
      <SidebarContent>
        <AdminMain items={data.navMain} />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}