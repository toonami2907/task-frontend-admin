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

function Layout() {
  const UserId = localStorage.getItem("UserId");
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const { isPlatformConnected } = useGlobalContext();

  useEffect(() => {
    const verifyUser = async () => {
      try {
        const response = await api.get("/auth/verify");
        setIsAuthenticated(true);
      } catch (error) {
        if (error.response?.status === 403) {
          localStorage.removeItem("UserId");
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
            <header className="flex h-16 shrink-0 items-center pr-4 justify-between w-full gap-2 border-b">
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
                <h1 className=" text-xs text-black sm:text-sm">Connected Platform Status:</h1>
                <div
                  className={`w-2 h-2 rounded-full ${
                    isPlatformConnected.shopify === true &&
                    isPlatformConnected.facebook === true
                      ? "bg-green-500"
                      : "bg-red-500"
                  }`}
                />
              </div>
            </header>
            <div className="pl-5 bg-slate-100 min-h-screen ">
              <Outlet />
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
