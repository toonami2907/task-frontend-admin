import {
    LayoutDashboard,
    Users,
    Settings,
    DollarSign,
    Mail,
    CreditCard,
    BarChart3
  } from "lucide-react"

export const navigationItems = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      href: "/admin"
    },
    {
      title: "Users",
      icon: Users,
      href: "/admin/users",
      items: [
        { title: "All Users", href: "/admin/users/list" },
        { title: "User Analytics", href: "/admin/users/analytics" }
      ]
    },
    {
      title: "Pricing",
      icon: DollarSign,
      href: "/admin/pricing",
      items: [
        { title: "Create Plans", href: "/admin/pricing/create" },
        { title: "Manage Plans", href: "/admin/pricing/manage" }
      ]
    },
    {
      title: "Subscriptions",
      icon: CreditCard,
      href: "/admin/subscriptions",
      items: [
        { title: "Active Subscriptions", href: "/admin/subscriptions/active" },
        { title: "Revenue Analytics", href: "/admin/subscriptions/analytics" }
      ]
    },
    {
      title: "Marketing",
      icon: Mail,
      href: "/admin/marketing",
      items: [
        { title: "Email Campaigns", href: "/admin/marketing/campaigns" },
        { title: "Campaign Analytics", href: "/admin/marketing/analytics" }
      ]
    },
    {
      title: "Analytics",
      icon: BarChart3,
      href: "/admin/analytics"
    },
    {
      title: "Settings",
      icon: Settings,
      href: "/admin/settings"
    }
  ]