import { AdminSidebar } from "./AdminSidebar"
import {
  Breadcrumb,
  BreadcrumbList,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Navigate, Outlet } from "react-router-dom"
import { useEffect, useState } from "react"
import api from "@/functions/resources/axiosConfig"

function AdminLayout() {
    const [isAuthenticated, setIsAuthenticated] = useState(true)

//   useEffect(() => {
//     const verifyAdmin = async () => {
//       try {
//         const response = await api.get("/auth/admin/verify")
//         setIsAuthenticated(true)
//       } catch (error) {
//         if (error.response?.status === 403) {
//           setIsAuthenticated(false)
//         }
//       }
//     }

//     verifyAdmin()
//   }, [])

  if (isAuthenticated === null) {
    return
  }

  return (
    <>
      {isAuthenticated ? (
        <SidebarProvider>
          <AdminSidebar />
          <SidebarInset>
            <div className="flex flex-col h-screen">
              <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center pr-4 justify-between w-full gap-2 border-b bg-background">
                <div className="flex items-center j gap-2 px-3">
                  <SidebarTrigger />
                  <Separator
                    orientation="vertical"
                    className="mr-2 h-4"
                  />
                  <Breadcrumb>
                    <BreadcrumbList>
                      <h2 className="text-lg font-semibold">Admin Dashboard</h2>
                    </BreadcrumbList>
                  </Breadcrumb>
                </div>
                <div className="px-4 flex items-center gap-2 py-2">
                  <span className="text-sm font-medium">Admin Panel</span>
                </div>
              </header>
              <div className="flex-1 overflow-auto">
                <div className="pl-5 bg-slate-100 min-h-full">
                  <Outlet />
                </div>
              </div>
            </div>
          </SidebarInset>
        </SidebarProvider>
      ) : (
        <Navigate to="/auth" />
      )}
    </>
  )
}

export default AdminLayout