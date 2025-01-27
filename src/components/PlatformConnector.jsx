import React, { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, AlertCircle, RefreshCcw, HelpCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import { API_URL, useGlobalContext } from "@/functions/features/StateProvider";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useNavigate } from "react-router-dom";
import { ErrorToast } from "@/hooks/customToast";

export default function PlatformConnectionPage() {
  const [shopifyStore, setShopifyStore] = useState("");
  const [loading, setLoading] = useState(false);
  const { isPlatformConnected } = useGlobalContext();
  const [accessToken, setAccessToken] = useState("");
  const navigate = useNavigate();
  const UserId = localStorage.getItem("UserId");

  const renderConnectionStatus = (status) => {
    const statusMap = {
      connected: { icon: Check, text: "Connected", color: "text-green-600" },
      connecting: { icon: RefreshCcw, text: "Connecting...", color: "text-blue-600 animate-pulse" },
      error: { icon: AlertCircle, text: "Connection Error", color: "text-red-600" },
      disconnected: { icon: AlertCircle, text: "Not Connected", color: "text-gray-600" },
    };

    const { icon: Icon, text, color } = statusMap[status];
    return (
      <div className={`flex items-center space-x-2 ${color}`}>
        <Icon className="w-5 h-5" />
        <span>{text}</span>
      </div>
    );
  };

  const handleFacebookConnect = async () => {
    try {
      const response = await axios.get(`${API_URL}/auth/fb/auth`, {
        withCredentials: true,
      });
      if (response.status === 200) {
        window.location.href = response.data.redirectUrl;
      } else {
        throw new Error("Connection failed");
      }
    } catch (error) {
      console.error(error);
      toast.error("Facebook connection failed");
    }
  };

  const handleShopifyConnect = async () => {
    if (!shopifyStore) {
      ErrorToast("Please enter your Shopify store name");
      return;
    }
    if (!accessToken) {
      ErrorToast("Please enter your accessToken");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${API_URL}/auth/shopify/link`,
        {
          shop: `${shopifyStore}.myshopify.com`,
          userId: UserId,
          accessToken
        },
        { withCredentials: true }
      );

      if (response.status === 200) {
        setLoading(false);
        navigate('/shopify/success');
      } else {
        throw new Error("Connection failed");
      }
    } catch (error) {
      console.error(error);
      setLoading(false);
      ErrorToast("Shopify connection failed");
    }
  };

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Platform Connections</h1>
        <p className="text-slate-500">Connect your marketing platforms to streamline your workflow</p>
      </div>

      <div className="grid gap-6">
        {/* Connection Status Overview */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold mb-4">Connection Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <span className="font-medium">Facebook Ads</span>
              {renderConnectionStatus(isPlatformConnected.facebook ? "connected" : "disconnected")}
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <span className="font-medium">Shopify</span>
              {renderConnectionStatus(isPlatformConnected.shopify ? "connected" : "disconnected")}
            </div>
          </div>
        </div>

        {/* Facebook Connection */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center space-x-3 mb-4">
            <img src="/meta ads.svg" className="w-8 h-8" alt="Facebook Logo" />
            <div>
              <h2 className="text-xl font-semibold">Facebook Ads</h2>
              <p className="text-sm text-slate-500">Connect your Facebook Ads account</p>
            </div>
          </div>
          <Button
            onClick={handleFacebookConnect}
            disabled={isPlatformConnected.facebook}
            className="w-full md:w-auto"
          >
            {isPlatformConnected.facebook ? "Reconnect" : "Connect Facebook"}
          </Button>
        </div>

        {/* Shopify Connection */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center space-x-3 mb-4">
            <img src="/shopify-bag.svg" className="w-8 h-8" alt="Shopify Logo" />
            <div>
              <h2 className="text-xl font-semibold">Shopify Store</h2>
              <p className="text-sm text-slate-500">Connect your Shopify store</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="shopify-store" className="block text-sm font-medium text-gray-700">
                Store Name
              </label>
              <Input
                id="shopify-store"
                placeholder="Your Shopify store name"
                value={shopifyStore}
                onChange={(e) => setShopifyStore(e.target.value)}
                disabled={isPlatformConnected.shopify || loading}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center">
                <label htmlFor="access-token" className="block text-sm font-medium text-gray-700">
                  Access Token
                </label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="ml-2 w-4 h-4 text-gray-500 hover:text-gray-700" />
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-xs">
                      <p>To get your Shopify Access Token:</p>
                      <ol className="list-decimal list-inside mt-2 text-sm">
                        <li>Go to Shopify Admin</li>
                        <li>Navigate to Apps &gt; Manage private apps</li>
                        <li>Create a new private app</li>
                        <li>Set required permissions (Read/Write)</li>
                        <li>Generate the access token</li>
                      </ol>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Input
                id="access-token"
                type="password"
                placeholder="Enter your Shopify Access Token"
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
                disabled={isPlatformConnected.shopify || loading}
              />
            </div>

            <Button
              onClick={handleShopifyConnect}
              disabled={isPlatformConnected.shopify || loading}
              className="w-full md:w-auto"
            >
              {loading ? "Connecting..." : isPlatformConnected.shopify ? "Reconnect" : "Connect"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}