import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, AlertCircle, RefreshCcw, Link2, HelpCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import {
  API_URL,
  useGlobalContext,
} from "@/functions/features/StateProvider";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useNavigate } from "react-router-dom";
import { ErrorToast } from "@/hooks/customToast";

const ConnectedPlatformsButton = ({ onClick }) => {
  const { isPlatformConnected } = useGlobalContext();
  const allConnected =
    isPlatformConnected.facebook && isPlatformConnected.shopify;

  if (allConnected) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              className="group flex items-center gap-2 border-green-500 bg-green-50 hover:bg-green-100"
              onClick={onClick}
            >
              <Check className="w-5 h-5 text-green-600 group-hover:scale-110 transition-transform" />
              <span className="text-green-800 font-semibold">
                Platforms Connected
              </span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Facebook Ads and Shopify are successfully linked</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <Button
      variant="outline"
      className="group flex items-center gap-2"
      onClick={onClick}
    >
      <Link2 className="w-5 h-5 text-blue-600 group-hover:rotate-12 transition-transform" />
      <span className="text-blue-600 group-hover:text-blue-800">
        Connect Platforms
      </span>
    </Button>
  );
};

const PlatformConnectorDialog = () => {
  const [shopifyStore, setShopifyStore] = useState("");
  const [loading, setLoading] = useState(false);
  const { isPlatformConnected } =
    useGlobalContext();
    const [accessToken, setAccessToken] = useState('');
    const navigate = useNavigate()

  const UserId = localStorage.getItem("UserId");
  const renderConnectionStatus = (status) => {
    const statusMap = {
      connected: {
        icon: Check,
        text: "Connected",
        color: "text-green-600",
      },
      connecting: {
        icon: RefreshCcw,
        text: "Connecting...",
        color: "text-blue-600 animate-pulse",
      },
      error: {
        icon: AlertCircle,
        text: "Connection Error",
        color: "text-red-600",
      },
      disconnected: {
        icon: AlertCircle,
        text: "Not Connected",
        color: "text-gray-600",
      },
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

    console.log("reached here");
    setLoading(true);

    try {
      const response = await axios.post(
        `${API_URL}/auth/shopify/link`,
        {
          shop: `${shopifyStore}.myshopify.com`,
          userId:UserId,
          accessToken
        },
        {
          withCredentials: true,
        }
      );

      if (response.status === 200) {
        setLoading(false);
       navigate('/shopify/success')
      } else {
        setLoading(false);
        throw new Error("Connection failed");
      }
    } catch (error) {
      console.error(error);
      setLoading(false);
      ErrorToast("Shopify connection failed");
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <ConnectedPlatformsButton />
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Connect Your Marketing Platforms</DialogTitle>
          <DialogDescription>
            Link your Facebook Ads and Shopify accounts to streamline
            your marketing workflow
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Facebook Connection */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <img
                  src="/meta ads.svg"
                  className="w-6 h-6"
                  alt="Facebook Logo"
                />
                <h3 className="font-semibold">Facebook Ads</h3>
              </div>
              {renderConnectionStatus(
                isPlatformConnected.facebook
                  ? "connected"
                  : "disconnected"
              )}
            </div>
            <Button
              onClick={handleFacebookConnect}
              disabled={isPlatformConnected.facebook}
              className="w-full"
            >
              {isPlatformConnected.facebook
                ? "Reconnect"
                : "Connect Facebook"}
            </Button>
          </div>

          {/* Shopify Connection */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <img
                  src="/shopify-bag.svg"
                  className="w-5 h-5"
                  alt="Shopify Logo"
                />
                <h3 className="font-semibold">Shopify Store</h3>
              </div>
              {renderConnectionStatus(
                isPlatformConnected.shopify
                  ? "connected"
                  : "disconnected"
              )}
            </div>
            <div className="space-y-2">
              <div className="relative">
                <label htmlFor="shopify-store" className="block text-sm font-medium text-gray-700 mb-1">
                  Store Name
                </label>
                <Input
                  id="shopify-store"
                  placeholder="Your Shopify store name"
                  value={shopifyStore}
                  onChange={(e) => setShopifyStore(e.target.value)}
                  disabled={isPlatformConnected.shopify || loading}
                  className="flex-grow"
                />
              </div>
              
              <div className="relative">
                <label htmlFor="access-token" className="blok text-sm font-medium text-gray-700 mb-1 flex items-center">
                  Access Token
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
                </label>
                <Input
                  id="access-token"
                  type="password"
                  placeholder="Enter your Shopify Access Token"
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                  disabled={isPlatformConnected.shopify || loading}
                  className="flex-grow"
                />
              </div>
              
              <Button
                onClick={handleShopifyConnect}
                disabled={isPlatformConnected.shopify || loading}
                className="w-full"
              >
                {loading
                  ? "Connecting..."
                  : isPlatformConnected.shopify
                  ? "Reconnect"
                  : "Connect"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PlatformConnectorDialog;
