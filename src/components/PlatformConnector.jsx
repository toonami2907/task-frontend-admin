import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // If using react-router-dom
import axios from 'axios';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Check, AlertCircle, RefreshCcw } from 'lucide-react';
import {toast} from 'react-hot-toast'
import { API_URL } from '@/functions/features/StateProvider';

const PlatformConnector = () => {
  const [facebookStatus, setFacebookStatus] = useState('disconnected');
  const [shopifyStatus, setShopifyStatus] = useState('disconnected');
  const [shopifyStore, setShopifyStore] = useState(''); // Store name input
  const navigate = useNavigate(); // Hook for navigation

  const handleFacebookConnect = async () => {
    setFacebookStatus('connecting');
    try {
      const response = await axios.get(`${API_URL}/auth/fb/auth`, {
        withCredentials: true,
      });

      if (response.status === 200) {
        console.log(response.data.redirectUrl);
        window.location.href = response.data.redirectUrl;
      } else {
        throw new Error('Connection failed');
      }
    } catch (error) {
      console.error(error);
      setFacebookStatus('error');
    }
  };

  const handleShopifyConnect = async () => {
    if (!shopifyStore) {
      toast.error('Please enter your Shopify store name.');
      return;
    }

    // https://unduly-possible-piglet.ngrok-free.app/auth?shop=utm-fusion.myshopify.com
    setShopifyStatus('connecting');
    try {
      const response = await axios.get(`${API_URL}/auth?shop=${shopifyStore}.myshopify.com`, {
        withCredentials: true,
      });

      if (response.status === 200) {
        console.log(response.data.redirectUrl);
        window.location.href = response.data.redirectUrl;
      } else {
        throw new Error('Connection failed');
      }
    } catch (error) {
      console.error(error);
      setShopifyStatus('error');
    }
  };

  const handleDisconnect = async (platform) => {
    try {
      if (platform === 'facebook') {
        await axios.post('/api/disconnect/facebook'); // Optional: call your backend to handle disconnect
        setFacebookStatus('disconnected');
      } else {
        await axios.post('/api/disconnect/shopify'); // Optional: call your backend to handle disconnect
        setShopifyStatus('disconnected');
      }
    } catch (error) {
      console.error('Error during disconnection:', error);
    }
  };

  const renderConnectionStatus = (platform, status) => {
    switch (status) {
      case 'connected':
        return (
          <div className="flex items-center space-x-2 text-green-600">
            <Check className="w-5 h-5" />
            <span>Connected</span>
          </div>
        );
      case 'connecting':
        return (
          <div className="flex items-center space-x-2 text-blue-600">
            <RefreshCcw className="w-5 h-5 animate-spin" />
            <span>Connecting...</span>
          </div>
        );
      case 'error':
        return (
          <div className="flex items-center space-x-2 text-red-600">
            <AlertCircle className="w-5 h-5" />
            <span>Connection Error</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center space-x-2 text-gray-600">
            <AlertCircle className="w-5 h-5" />
            <span>Not Connected</span>
          </div>
        );
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto font-sans p-4 space-y-6">
      <h2 className="text-2xl font-bold mb-6">Connect Your Accounts</h2>

      {/* Facebook Connection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <img src="/meta ads.svg" className="w-6 h-6 text-blue-600" alt="Facebook Logo" />
            <span>Facebook Ads Account</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex md:flex-row gap-3 flex-col items-center justify-between">
            <div className="space-y-3 md:space-y-1">
              <p className="text-sm text-gray-600">
                Connect your Facebook account to manage ads and track performance
              </p>
              {renderConnectionStatus('facebook', facebookStatus)}
            </div>
            {facebookStatus === 'connected' ? (
              <Button
                variant="outline"
                onClick={() => handleDisconnect('facebook')}
                className="bg-red-50 text-red-600 hover:bg-red-100"
              >
                Disconnect
              </Button>
            ) : (
              <Button
                onClick={handleFacebookConnect}
                className="border-blue-600 border bg-white font-sans hover:bg-white text-blue-600"
                disabled={facebookStatus === 'connecting'}
              >
                <img src="/meta ads.svg" className="w-6 h-6 text-blue-600" alt="Facebook Icon" />
                Connect Facebook
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Shopify Connection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <img src="/shopify-bag.svg" className="w-4 h-4 mr-2" alt="Shopify Logo" />
            <span className="font-sans">Shopify Store</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex md:flex-row gap-3 flex-col items-center justify-between">
            <div className="space-y-3 md:space-y-1">
              <p className="text-sm text-gray-600">
                Connect your Shopify store to sync products and track conversions
              </p>
              {renderConnectionStatus('shopify', shopifyStatus)}
            </div>
            {shopifyStatus === 'connected' ? (
              <Button
                variant="outline"
                onClick={() => handleDisconnect('shopify')}
                className="bg-red-50 text-red-600 hover:bg-red-100"
              >
                Disconnect
              </Button>
            ) : (
              <div className="flex flex-col md:flex-row items-center gap-2">
                <Input
                  type="text"
                  placeholder="Enter your store name"
                  value={shopifyStore}
                  onChange={(e) => setShopifyStore(e.target.value)}
                  className="border-gray-300 text-sm rounded-md"
                />
                <Button
                  onClick={handleShopifyConnect}
                  className="border-green-600 border bg-white font-sans text-green-600 hover:bg-white"
                  disabled={shopifyStatus === 'connecting'}
                >
                  <img src="/shopify-bag.svg" className="w-4 h-4 mr-2" alt="Shopify Icon" />
                  Connect Shopify
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlatformConnector;
