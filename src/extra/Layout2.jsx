/* eslint-disable no-unused-vars */
import { AppSidebar } from "@/components/app-sidebar";
import ConnectAcc from "@/components/ConnectAcc";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import api from "@/functions/resources/axiosConfig";
import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import AuthLoading from "./AuthLoading";
import AdAccountSelector from "@/components/AdAccountSelector";
import { useGlobalContext } from "@/functions/features/StateProvider";
import { notificationConsumer } from "@/services/RabbitMq/consumer";

function Layout() {
  const UserId = localStorage.getItem("UserId");
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const { isPlatformConnected, platformErrors } = useGlobalContext();

  // useEffect(() => {
  //   if (UserId) {
  //     notificationConsumer.connect(UserId);
  //   }
  //   return () => notificationConsumer.close();
  // }, [UserId]);

  useEffect(() => {
    const verifyUser = async () => {
      try {
        const response = await api.get("/auth/verify");
        setIsAuthenticated(true);
      } catch (error) {
        if (error.response?.status === 403) {
          localStorage.removeItem("UserId");
          window.location.href = "/auth";
          setIsAuthenticated(false);
        }
      }
    };

    verifyUser();
  }, []);

  if (isAuthenticated === null) {
    return;
  }

  return (
    <>
      {isAuthenticated ? (
        <SidebarProvider>
          <AppSidebar />
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
                      <AdAccountSelector />
                    </BreadcrumbList>
                  </Breadcrumb>
                </div>
                <div className="px-4 flex items-center gap-2 py-2">
                  <h1 className="hidden text-xs text-black sm:block sm:text-sm">
                    Connected Platform Status:
                  </h1>
                  <div
                    className={`w-2 h-2 rounded-full ${
                      isPlatformConnected.shopify &&
                      isPlatformConnected.facebook &&
                      !platformErrors.facebook
                        ? "bg-green-500"
                        : "bg-red-500 animate-pulse"
                    }`}
                  />
                </div>
              </header>
              <div className="flex-1 overflow-auto bg-slate-100">
                <div className="pl-5 bg-slate-100 min-h-full">
                  <Outlet />
                </div>
              </div>
            </div>
          </SidebarInset>
        </SidebarProvider>
      ) : (
        <Navigate to={"/auth"} />
      )}
    </>
  );
}
export default Layout;
