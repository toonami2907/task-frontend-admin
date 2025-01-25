import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  AlertCircle, 
  Link2, 
  Check, 
  RefreshCcw 
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const IntegrationsPage = () => {
  const [integrations, setIntegrations] = useState({
    facebook: { status: 'disconnected', details: null },
    shopify: { status: 'disconnected', details: null },
    google: { status: 'disconnected', details: null }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlatform, setSelectedPlatform] = useState(null);

  useEffect(() => {
    fetchIntegrationStatus();
  }, []);

  const fetchIntegrationStatus = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('/api/integrations/status');
      setIntegrations(response.data);
    } catch (error) {
      toast.error('Failed to fetch integration status');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStatusBadge = (status) => {
    const statusMap = {
      connected: { 
        icon: Check, 
        text: 'Connected', 
        color: 'bg-green-100 text-green-600' 
      },
      disconnected: { 
        icon: AlertCircle, 
        text: 'Not Connected', 
        color: 'bg-red-100 text-red-600' 
      },
      connecting: { 
        icon: RefreshCcw, 
        text: 'Connecting', 
        color: 'bg-blue-100 text-blue-600 animate-pulse' 
      }
    };

    const { icon: Icon, text, color } = statusMap[status];
    return (
      <div className={`px-3 py-1 rounded-full text-xs font-medium ${color} inline-flex items-center space-x-1`}>
        <Icon className="w-4 h-4" />
        <span>{text}</span>
      </div>
    );
  };

  const platformDetails = [
    {
      key: 'facebook',
      name: 'Facebook Ads',
      description: 'Connect to manage ad campaigns and performance tracking',
      icon: '/meta ads.svg'
    },
    {
      key: 'shopify',
      name: 'Shopify',
      description: 'Sync products and track e-commerce conversions',
      icon: '/shopify-bag.svg'
    },
    {
      key: 'google',
      name: 'Google Analytics',
      description: 'Track website performance and user insights',
      icon: '/google-analytics.svg'
    }
  ];

  const handleConnectPlatform = (platform) => {
    setSelectedPlatform(platform);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Platform Integrations</h1>
        <p className="text-gray-600">Connect your marketing and e-commerce platforms to unlock powerful insights</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {platformDetails.map((platform) => (
          <Card key={platform.key} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <img 
                src={platform.icon} 
                alt={`${platform.name} logo`} 
                className="w-8 h-8"
              />
              {/* {renderStatusBadge(integrations[platform.key].status)} */}
            </CardHeader>
            <CardContent>
              <CardTitle className="mb-2">{platform.name}</CardTitle>
              <CardDescription>{platform.description}</CardDescription>
              <Button 
                variant="outline" 
                className="w-full mt-4"
                onClick={() => handleConnectPlatform(platform.key)}
                // disabled={integrations[platform.key].status === 'connecting'}
              >
                <Link2 className="mr-2 h-4 w-4" />
                {/* {integrations[platform.key].status === 'connected' 
                  ? 'Reconnect' 
                  : 'Connect Platform'} */}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Connection Dialog Placeholder */}
      {selectedPlatform && (
        <Dialog open={!!selectedPlatform} onOpenChange={() => setSelectedPlatform(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Connect {platformDetails.find(p => p.key === selectedPlatform)?.name}</DialogTitle>
            </DialogHeader>
            {/* Add platform-specific connection logic here */}
            <p>Connection details for {selectedPlatform}</p>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default IntegrationsPage;