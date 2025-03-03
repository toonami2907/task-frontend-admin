import React, { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, AlertCircle, RefreshCcw, HelpCircle, ArrowRight, Unlink, AlertTriangle } from "lucide-react";
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import api  from "@/functions/resources/axiosConfig";

export default function PlatformConnectionPage() {
  const [shopifyStore, setShopifyStore] = useState("");
  const [loading, setLoading] = useState(false);
  const { isPlatformConnected, fetchAds, globalErrors } = useGlobalContext();
  const [accessToken, setAccessToken] = useState("");
  const navigate = useNavigate();
  const UserId = localStorage.getItem("UserId");

  // Display global errors as toasts when they arrive
  useEffect(() => {
    globalErrors.forEach(error => {
      toast.error(error.message, {
        duration: 5000,
        position: "top-right",
        action: {
          label: "Contact Support",
          onClick: () => window.location.href = "mailto:support@example.com",
        },
      });
    });
  }, [globalErrors]);

  const renderConnectionStatus = (status) => {
    const statusMap = {
      connected: { 
        icon: Check, 
        text: "Connected", 
        color: "bg-green-100 text-green-700" 
      },
      connecting: { 
        icon: RefreshCcw, 
        text: "Connecting...", 
        color: "bg-blue-100 text-blue-700 animate-pulse" 
      },
      error: { 
        icon: AlertCircle, 
        text: "Connection Error", 
        color: "bg-red-100 text-red-700" 
      },
      disconnected: { 
        icon: AlertCircle, 
        text: "Not Connected", 
        color: "bg-gray-100 text-gray-700" 
      },
    };

    const { icon: Icon, text, color } = statusMap[status];
    return (
      <div className={`px-3 py-1.5 rounded-full text-sm font-medium ${color} inline-flex items-center space-x-2`}>
        <Icon className="w-4 h-4" />
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

  const handleDisconnectFacebook = async () => {
    setLoading(true);
    try {
      const response = await api.post('/auth/disconnect-facebook');
      toast.success(response.data.message);
      window.location.reload();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to disconnect Facebook Ads");
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnectShopify = async () => {
    setLoading(true);
    try {
      const response = await api.post('/auth/disconnect-shopify');
      toast.success(response.data.message);
      window.location.reload();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to disconnect Shopify");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container max-w-4xl mx-auto py-16 px-4 space-y-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Platform Connections
          </h1>
          <p className="text-lg text-gray-600">
            Connect your marketing platforms to streamline your workflow
          </p>
        </div>

        {/* Global Errors Section */}
        {globalErrors.length > 0 && (
          <Card className="shadow-sm border-red-200">
            <CardHeader className="bg-red-50">
              <CardTitle className="text-red-700 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                System Alerts
              </CardTitle>
              <CardDescription className="text-red-600">
                The following issues have been detected in the system:
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <ul className="space-y-4">
                {globalErrors.map((error, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <p className="text-red-700">{error.message}</p>
                      <p className="text-gray-500 text-xs">
                        {new Date(error.timestamp).toLocaleString()}
                      </p>
                      <Button
                        variant="link"
                        className="text-blue-600 p-0 h-auto text-xs"
                        onClick={() => window.location.href = "mailto:support@example.com"}
                      >
                        Contact Support
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        <div className="space-y-6">
          {/* Connection Status Overview */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Connection Status</CardTitle>
              <CardDescription>Current status of your platform connections</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <span className="font-medium">Facebook Ads</span>
                  {renderConnectionStatus(isPlatformConnected.facebook ? "connected" : "disconnected")}
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <span className="font-medium">Shopify</span>
                  {renderConnectionStatus(isPlatformConnected.shopify ? "connected" : "disconnected")}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Facebook Connection */}
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4 mb-6">
                <div className="p-2 bg-gray-50 rounded-lg">
                  <img src="/meta ads.svg" className="w-8 h-8" alt="Facebook Logo" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Facebook Ads</h2>
                  <p className="text-sm text-gray-600">Connect your Facebook Ads account</p>
                </div>
              </div>
              <div className="flex space-x-4">
                <Button
                  onClick={handleFacebookConnect}
                  disabled={isPlatformConnected.facebook || loading}
                  className="group relative"
                >
                  <span className="flex items-center">
                    {isPlatformConnected.facebook ? "Connected" : "Connect Facebook"}
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </Button>
                {isPlatformConnected.facebook && (
                  <Button
                    onClick={handleDisconnectFacebook}
                    disabled={loading}
                    variant="outline"
                    className="border-red-500 text-red-500 hover:bg-red-50"
                  >
                    <Unlink className="mr-2 h-4 w-4" />
                    {loading ? "Disconnecting..." : "Disconnect"}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Shopify Connection */}
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4 mb-6">
                <div className="p-2 bg-gray-50 rounded-lg">
                  <img src="/shopify-bag.svg" className="w-8 h-8" alt="Shopify Logo" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Shopify Store</h2>
                  <p className="text-sm text-gray-600">Connect your Shopify store</p>
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
                    className="border-gray-200 focus:ring-2 focus:ring-blue-500"
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
                          <HelpCircle className="ml-2 w-4 h-4 text-gray-500 hover:text-gray-700 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent side="right" className="max-w-xs bg-white p-4 rounded-lg shadow-lg">
                          <p className="font-medium mb-2">To get your Shopify Access Token:</p>
                          <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
                            <li>Go to Shopify Admin</li>
                            <li>Navigate to Apps > Manage private apps</li>
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
                    className="border-gray-200 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex space-x-4">
                  <Button
                    onClick={handleShopifyConnect}
                    disabled={isPlatformConnected.shopify || loading}
                    className="group relative"
                  >
                    <span className="flex items-center">
                      {loading ? "Connecting..." : isPlatformConnected.shopify ? "Connected" : "Connect Shopify"}
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </Button>
                  {isPlatformConnected.shopify && (
                    <Button
                      onClick={handleDisconnectShopify}
                      disabled={loading}
                      variant="outline"
                      className="border-red-500 text-red-500 hover:bg-red-50"
                    >
                      <Unlink className="mr-2 h-4 w-4" />
                      {loading ? "Disconnecting..." : "Disconnect"}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}