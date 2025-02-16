import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import api from '@/functions/resources/axiosConfig';

const DAYS_OF_WEEK = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
];

const TIME_SLOTS = [
  "12:00 AM - 01:00 AM", "01:00 AM - 02:00 AM", "02:00 AM - 03:00 AM",
  "03:00 AM - 04:00 AM", "04:00 AM - 05:00 AM", "05:00 AM - 06:00 AM",
  "06:00 AM - 07:00 AM", "07:00 AM - 08:00 AM", "08:00 AM - 09:00 AM",
  "09:00 AM - 10:00 AM", "10:00 AM - 11:00 AM", "11:00 AM - 12:00 PM",
  "12:00 PM - 01:00 PM", "01:00 PM - 02:00 PM", "02:00 PM - 03:00 PM",
  "03:00 PM - 04:00 PM", "04:00 PM - 05:00 PM", "05:00 PM - 06:00 PM",
  "06:00 PM - 07:00 PM", "07:00 PM - 08:00 PM", "08:00 PM - 09:00 PM",
  "09:00 PM - 10:00 PM", "10:00 PM - 11:00 PM", "11:00 PM - 12:00 AM"
];

const LoadingSkeleton = () => (
  <div className="space-y-2">
    {[...Array(5)].map((_, i) => (
      <Skeleton key={i} className="h-12 w-full" />
    ))}
  </div>
);

export const PurchaseReport = () => {
  const [orders, setOrders] = useState([]);
  const [adsData, setAdsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [uniqueCountries, setUniqueCountries] = useState([]);
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    fetchData();
    
    // Add responsive breakpoint detection
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 768);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchData = async () => {
    try {
      const [ordersResponse, adsResponse] = await Promise.all([
        api.get('/auth/user/orders'),
        api.get('/auth/db/ads')
      ]);

      const ordersData = ordersResponse.data.data || [];
      setOrders(ordersData);
      
      const countries = new Set(ordersData
        .map(order => order.shippingAddress)
        .filter(Boolean));
      setUniqueCountries(Array.from(countries).sort());
      
      setAdsData(adsResponse.data.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Rest of the data processing functions remain the same
  const getAdSpendForDateTime = (date, utmCampaign) => {
    const orderDate = new Date(date);
    
    const matchingAds = adsData.filter(ad => {
      const adDate = new Date(ad.createdTime);
      return adDate.toDateString() === orderDate.toDateString() &&
             ad.campaign_id === utmCampaign;
    });

    return matchingAds.reduce((sum, ad) => (
      sum + (ad.insights?.spend ? parseFloat(ad.insights.spend) : 0)
    ), 0);
  };

  const groupOrdersByDayAndTime = () => {
    const filteredOrders = selectedCountry === 'all' 
      ? orders 
      : orders.filter(order => order.shippingAddress === selectedCountry);

    const grouped = filteredOrders.reduce((acc, order) => {
      const orderDate = new Date(order.created_at);
      const dayName = DAYS_OF_WEEK[orderDate.getDay() === 0 ? 6 : orderDate.getDay() - 1];
      const hour = orderDate.getHours();
      const timeSlot = TIME_SLOTS[hour];
      const utmCampaign = order.utm_summary?.campaign;

      if (!acc[dayName]) {
        acc[dayName] = {};
      }
      if (!acc[dayName][timeSlot]) {
        acc[dayName][timeSlot] = {
          orders: 0,
          itemsPurchased: 0,
          totalRevenue: 0,
          spend: 0,
          countries: new Set(),
          utmSources: new Set(),
          campaigns: new Map()
        };
      }

      const slotData = acc[dayName][timeSlot];
      slotData.orders += 1;
      slotData.itemsPurchased += order.items_purchased || 0;
      slotData.totalRevenue += order.total_price || 0;
      
      const adSpend = getAdSpendForDateTime(order.created_at, utmCampaign);
      slotData.spend += adSpend;

      if (order.shippingAddress) {
        slotData.countries.add(order.shippingAddress);
      }
      if (order.utm_summary?.source) {
        slotData.utmSources.add(order.utm_summary.source);
      }

      if (utmCampaign) {
        const campaignData = slotData.campaigns.get(utmCampaign) || {
          orders: 0,
          items: 0,
          revenue: 0,
          spend: adSpend
        };
        campaignData.orders += 1;
        campaignData.items += order.items_purchased || 0;
        campaignData.revenue += order.total_price || 0;
        slotData.campaigns.set(utmCampaign, campaignData);
      }

      return acc;
    }, {});

    return DAYS_OF_WEEK.reduce((acc, day) => {
      acc[day] = grouped[day] || {};
      return acc;
    }, {});
  };

  const groupedData = groupOrdersByDayAndTime();

  const getFilteredSummary = () => {
    const filteredOrders = selectedCountry === 'all' 
      ? orders 
      : orders.filter(order => order.shippingAddress === selectedCountry);

    return {
      totalOrders: filteredOrders.length,
      totalRevenue: filteredOrders.reduce((sum, order) => sum + (order.total_price || 0), 0),
      totalItems: filteredOrders.reduce((sum, order) => sum + (order.items_purchased || 0), 0),
      averageOrderValue: filteredOrders.length > 0 
        ? filteredOrders.reduce((sum, order) => sum + (order.total_price || 0), 0) / filteredOrders.length 
        : 0
    };
  };

  const summary = getFilteredSummary();

  return (
    <div className="space-y-6 p-4">
      <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4 md:justify-between md:items-start">
        <div className="flex-1">
          <h2 className="text-xl md:text-2xl font-bold mb-4">Daily Purchase Report</h2>
        </div>
        <div className="w-full md:w-48">
          <Select value={selectedCountry} onValueChange={setSelectedCountry}>
            <SelectTrigger className="w-full bg-white">
              <SelectValue placeholder="Filter by Country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Countries</SelectItem>
              {uniqueCountries.map(country => (
                <SelectItem key={country} value={country}>
                  {country}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="w-full">
        <CardContent className="p-0 md:p-6">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-[180px] md:w-[300px]">Day & Time</TableHead>
                  <TableHead className="min-w-[100px]">Purchases</TableHead>
                  <TableHead className="min-w-[100px]">Spend</TableHead>
                  <TableHead className="min-w-[100px]">CPA</TableHead>
                  {!isSmallScreen && (
                    <>
                      <TableHead className="min-w-[100px]">NCPA</TableHead>
                      <TableHead className="min-w-[150px]">New Customer</TableHead>
                    </>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={isSmallScreen ? 4 : 6}>
                      <LoadingSkeleton />
                    </TableCell>
                  </TableRow>
                ) : (
                  Object.entries(groupedData).map(([day, timeSlots]) => (
                    <React.Fragment key={day}>
                      <TableRow>
                        <TableCell 
                          colSpan={isSmallScreen ? 4 : 6} 
                          className="bg-muted/30 font-semibold text-base md:text-lg"
                        >
                          {day}
                        </TableCell>
                      </TableRow>
                      {TIME_SLOTS.map((timeSlot, index) => {
                        const slotData = timeSlots[timeSlot] || {
                          orders: 0,
                          itemsPurchased: 0,
                          totalRevenue: 0,
                          spend: 0,
                          countries: new Set()
                        };
                        
                        const cpa = slotData.itemsPurchased > 0 ? 
                          slotData.spend / slotData.itemsPurchased : 0;
                        
                        return (
                          <TableRow key={`${day}-${index}`} className="hover:bg-muted/50">
                            <TableCell className="pl-4 md:pl-20 font-medium text-sm md:text-base">
                              {timeSlot}
                            </TableCell>
                            <TableCell className="text-sm md:text-base">
                              {slotData.itemsPurchased || '—'}
                            </TableCell>
                            <TableCell className="text-sm md:text-base">
                              {slotData.spend > 0 ? 
                                `$${slotData.spend.toFixed(2)}` : '$0'}
                            </TableCell>
                            <TableCell className="text-sm md:text-base">
                              {cpa > 0 ? `$${cpa.toFixed(2)}` : '$0'}
                            </TableCell>
                            {!isSmallScreen && (
                              <>
                                <TableCell className="text-sm md:text-base">
                                  $0
                                </TableCell>
                                <TableCell className="text-sm md:text-base">
                                  —
                                </TableCell>
                              </>
                            )}
                          </TableRow>
                        );
                      })}
                    </React.Fragment>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};