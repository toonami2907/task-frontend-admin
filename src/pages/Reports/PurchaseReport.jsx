import React, { useState, useEffect, useMemo, useRef } from "react";
import { format, parseISO, isWithinInterval } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, ShoppingCart } from "lucide-react"; // Added ShoppingCart for no-data icon
import { CSVLink } from "react-csv";
import api from "@/functions/resources/axiosConfig";
import CheckboxSelect from "./CheckboxSelect";

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
const TIME_SLOTS = [
  "12:00 AM - 01:00 AM",
  "01:00 AM - 02:00 AM",
  "02:00 AM - 03:00 AM",
  "03:00 AM - 04:00 AM",
  "04:00 AM - 05:00 AM",
  "05:00 AM - 06:00 AM",
  "06:00 AM - 07:00 AM",
  "07:00 AM - 08:00 AM",
  "08:00 AM - 09:00 AM",
  "09:00 AM - 10:00 AM",
  "10:00 AM - 11:00 AM",
  "11:00 AM - 12:00 PM",
  "12:00 PM - 01:00 PM",
  "01:00 PM - 02:00 PM",
  "02:00 PM - 03:00 PM",
  "03:00 PM - 04:00 PM",
  "04:00 PM - 05:00 PM",
  "05:00 PM - 06:00 PM",
  "06:00 PM - 07:00 PM",
  "07:00 PM - 08:00 PM",
  "08:00 PM - 09:00 PM",
  "09:00 PM - 10:00 PM",
  "10:00 PM - 11:00 PM",
  "11:00 PM - 12:00 AM",
];

const LoadingSkeleton = () => (
  <div className="space-y-2">
    {[...Array(5)].map((_, i) => (
      <Skeleton key={i} className="h-12 w-full" />
    ))}
  </div>
);

const NoDataMessage = () => (
  <div className="flex flex-col items-center justify-center h-full py-16 text-center">
    <ShoppingCart className="w-16 h-16 text-gray-400 mb-4" />
    <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">No Purchase Data Available</h3>
    <p className="text-gray-500 dark:text-gray-400 mt-2">
      There are no orders or ad spends to display. Connect your platforms or wait for data to populate.
    </p>
  </div>
);

export const PurchaseReport = () => {
  const [orders, setOrders] = useState([]);
  const [adsData, setAdsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCountries, setSelectedCountries] = useState(["all"]);
  const [uniqueCountries, setUniqueCountries] = useState([]);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [dateRange, setDateRange] = useState({
    start: null,
    end: null,
  });
  const [uniqueDates, setUniqueDates] = useState([]);
  const [currentDay, setCurrentDay] = useState("");
  const dayRefs = useRef({});

  useEffect(() => {
    // Create refs for each day section
    DAYS_OF_WEEK.forEach(day => {
      dayRefs.current[day] = dayRefs.current[day] || React.createRef();
    });

    const options = {
      root: null,
      rootMargin: '-100px 0px 0px 0px',
      threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setCurrentDay(entry.target.dataset.day);
        }
      });
    }, options);

    Object.values(dayRefs.current).forEach(ref => {
      if (ref.current) {
        observer.observe(ref.current);
      }
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    fetchData();
    const handleResize = () =>
      setIsSmallScreen(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (orders.length > 0) {
      const dates = [
        ...new Set(
          orders.map((order) =>
            format(parseISO(order.created_at), "yyyy-MM-dd")
          )
        ),
      ].sort();
      setUniqueDates(dates);
      if (!dateRange.start)
        setDateRange({
          start: dates[0],
          end: dates[dates.length - 1],
        });
    }
  }, [orders, dateRange.start]);

  const fetchData = async () => {
    try {
      const [ordersResponse, adsResponse] = await Promise.all([
        api.get("/auth/user/orders"),
        api.get("/auth/db/ads"),
      ]);

      const ordersData = ordersResponse.data.data || [];
      setOrders(ordersData);

      const countries = new Set(
        ordersData
          .map((order) => order.shippingAddress)
          .filter(Boolean)
      );
      setUniqueCountries(Array.from(countries).sort());

      setAdsData(adsResponse.data.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      if (!dateRange.start || !dateRange.end) return false;

      const orderDate = parseISO(order.created_at);
      const isInDateRange = isWithinInterval(orderDate, {
        start: parseISO(dateRange.start),
        end: parseISO(dateRange.end),
      });

      const isInSelectedCountries =
        selectedCountries.includes("all") ||
        (order.shippingAddress &&
          selectedCountries.includes(order.shippingAddress));

      return isInDateRange && isInSelectedCountries;
    });
  }, [orders, dateRange, selectedCountries]);

  const getAdSpendForDateTime = (date, utmCampaign) => {
    const orderDate = new Date(date);
    const matchingAds = adsData.filter((ad) => {
      const adDate = new Date(ad.createdTime);
      return (
        adDate.toDateString() === orderDate.toDateString() &&
        ad.campaign_id === utmCampaign
      );
    });
    return matchingAds.reduce(
      (sum, ad) =>
        sum +
        (ad.insights?.spend
          ? Number.parseFloat(ad.insights.spend)
          : 0),
      0
    );
  };

  const groupedData = useMemo(() => {
    const grouped = filteredOrders.reduce((acc, order) => {
      const orderDate = parseISO(order.created_at);
      const dayName =
        DAYS_OF_WEEK[
          orderDate.getDay() === 0 ? 6 : orderDate.getDay() - 1
        ];
      const hour = orderDate.getHours();
      const timeSlot = TIME_SLOTS[hour];
      const utmCampaign = order.utm_summary?.campaign;

      if (!acc[dayName]) acc[dayName] = {};
      if (!acc[dayName][timeSlot]) {
        acc[dayName][timeSlot] = {
          orders: 0,
          itemsPurchased: 0,
          totalRevenue: 0,
          spend: 0,
          countries: new Set(),
          utmSources: new Set(),
          campaigns: new Map(),
        };
      }

      const slotData = acc[dayName][timeSlot];
      slotData.orders += 1;
      slotData.itemsPurchased += order.items_purchased || 0;
      slotData.totalRevenue += order.total_price || 0;

      const adSpend = getAdSpendForDateTime(
        order.created_at,
        utmCampaign
      );
      slotData.spend += adSpend;

      if (order.shippingAddress)
        slotData.countries.add(order.shippingAddress);
      if (order.utm_summary?.source)
        slotData.utmSources.add(order.utm_summary.source);

      if (utmCampaign) {
        const campaignData = slotData.campaigns.get(utmCampaign) || {
          orders: 0,
          items: 0,
          revenue: 0,
          spend: adSpend,
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
  }, [filteredOrders]);

  const getCellHighlightClass = (value, type) => {
    if (!value || value === "—" || value === "$0") return "";

    switch (type) {
      case 'purchases':
        return 'bg-green-200 dark:bg-green-900/20';
      case 'spend':
        return 'bg-blue-50 dark:bg-blue-900/20';
      case 'cpa':
        return 'bg-purple-50 dark:bg-purple-900/20';
      default:
        return '';
    }
  };

  const summary = useMemo(
    () => ({
      totalOrders: filteredOrders.length,
      totalRevenue: filteredOrders.reduce(
        (sum, order) => sum + (order.total_price || 0),
        0
      ),
      totalItems: filteredOrders.reduce(
        (sum, order) => sum + (order.items_purchased || 0),
        0
      ),
      averageOrderValue:
        filteredOrders.length > 0
          ? filteredOrders.reduce(
              (sum, order) => sum + (order.total_price || 0),
              0
            ) / filteredOrders.length
          : 0,
    }),
    [filteredOrders]
  );

  const csvData = useMemo(
    () =>
      Object.entries(groupedData).flatMap(([day, timeSlots]) =>
        Object.entries(timeSlots).map(([timeSlot, data]) => ({
          Day: day,
          Time: timeSlot,
          Purchases: data.itemsPurchased,
          Spend: data.spend,
          CPA:
            data.itemsPurchased > 0
              ? data.spend / data.itemsPurchased
              : 0,
        }))
      ),
    [groupedData]
  );

  const handleDateRangeChange = (type, date) => {
    setDateRange((prev) => ({ ...prev, [type]: date }));
  };

  console.log(currentDay);

  return (
    <div className="space-y-2 p-4">
      <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4 md:justify-between md:items-start">
        <div className="flex-1">
          <h2 className="text-xl md:text-2xl uppercase font-bold mb-4">
            Marketing Efficiency Report
          </h2>
        </div>
        <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:space-x-4">
          <div className="flex space-x-2">
            <Select
              value={dateRange.start}
              onValueChange={(date) =>
                handleDateRangeChange("start", date)
              }
            >
              <SelectTrigger className="w-[150px] bg-white">
                <SelectValue placeholder="Start Date" />
              </SelectTrigger>
              <SelectContent>
                {uniqueDates.map((date) => (
                  <SelectItem key={date} value={date}>
                    {format(parseISO(date), "MMM dd, yyyy")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={dateRange.end}
              onValueChange={(date) =>
                handleDateRangeChange("end", date)
              }
            >
              <SelectTrigger className="w-[150px] bg-white">
                <SelectValue placeholder="End Date" />
              </SelectTrigger>
              <SelectContent>
                {uniqueDates.map((date) => (
                  <SelectItem key={date} value={date}>
                    {format(parseISO(date), "MMM dd, yyyy")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <CheckboxSelect
            options={uniqueCountries}
            selectedValues={selectedCountries}
            onChange={setSelectedCountries}
            placeholder="Select countries"
          />

          <CSVLink data={csvData} filename={"purchase-report.csv"}>
            <Button
              variant="outline"
              className="bg-green-700 hover:bg-green-600 text-white"
            >
              Export to CSV
            </Button>
          </CSVLink>
        </div>
      </div>

      <Card className="w-full shadow-md">
        <CardContent className="p-0">
          <div className="relative" style={{ height: "600px" }}>
            <div className="sticky top-0 left-0 right-0 bg-white dark:bg-gray-900 z-10 shadow-sm border-b border-gray-200 dark:border-gray-700">
              <Table>
                <TableHeader>
                  <TableRow className="bg-white py-4 ">
                    <TableHead className="w-[180px] md:w-[300px]">
                      <h1>Day & Time</h1>
                      <h1 className="text-black">{currentDay !== "Monday" && currentDay}</h1>
                    </TableHead>
                    <TableHead className="min-w-[100px] text-center">
                      Purchases
                    </TableHead>
                    <TableHead className="min-w-[100px] text-center">
                      Spend
                    </TableHead>
                    <TableHead className="min-w-[100px] text-center">
                      CPA
                    </TableHead>
                    {!isSmallScreen && (
                      <>
                        <TableHead className="min-w-[130px] text-center">
                          NCPA
                        </TableHead>
                        <TableHead className="min-w-[150px] text-center">
                          New Customer Purchases
                        </TableHead>
                      </>
                    )}
                  </TableRow>
                </TableHeader>
              </Table>
            </div>
            <div
              className="overflow-auto w-full"
              style={{ height: "calc(600px - 57px)" }}
            >
              {loading ? (
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell colSpan={isSmallScreen ? 4 : 6}>
                        <LoadingSkeleton />
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              ) : orders.length === 0 && adsData.length === 0 ? (
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell colSpan={isSmallScreen ? 4 : 6}>
                        <NoDataMessage />
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              ) : (
                <Table>
                  <TableBody>
                    {Object.entries(groupedData).map(
                      ([day, timeSlots]) => (
                        <React.Fragment key={day}>
                          <TableRow
                            ref={dayRefs.current[day]}
                            data-day={day}
                          >
                            <TableCell
                              colSpan={isSmallScreen ? 4 : 6}
                              className="bg-gray-100 dark:bg-gray-700 font-semibold text-base md:text-lg py-1 border-y border-gray-200 dark:border-gray-600"
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
                              countries: new Set(),
                            };

                            const cpa =
                              slotData.itemsPurchased > 0
                                ? slotData.spend /
                                  slotData.itemsPurchased
                                : 0;

                            return (
                              <TableRow
                                key={`${day}-${index}`}
                                className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-b border-gray-200 dark:border-gray-700 [&>td]:border-r [&>td]:border-gray-200 dark:[&>td]:border-gray-700 [&>td:last-child]:border-r-0"
                              >
                                <TableCell className="pl-4 md:pl-8 w-[180px] md:w-[300px] font-medium text-sm md:text-base py-3">
                                  {timeSlot}
                                </TableCell>
                                <TableCell className={`text-sm md:text-base min-w-[100px] py-3 text-center transition-colors ${getCellHighlightClass(slotData.itemsPurchased, 'purchases')}`}>
                                  {slotData.itemsPurchased || "—"}
                                </TableCell>
                                <TableCell className="text-sm md:text-base min-w-[100px] py-3 text-center">
                                  {slotData.spend > 0
                                    ? `$${slotData.spend.toFixed(2)}`
                                    : "$0"}
                                </TableCell>
                                <TableCell className="text-sm md:text-base min-w-[100px] py-3 text-center">
                                  {cpa > 0
                                    ? `$${cpa.toFixed(2)}`
                                    : "$0"}
                                </TableCell>
                                {!isSmallScreen && (
                                  <>
                                    <TableCell className="text-sm md:text-base min-w-[130px] py-3 text-center">
                                      $0
                                    </TableCell>
                                    <TableCell className="text-sm md:text-base py-3 min-w-[150px] text-center">
                                      —
                                    </TableCell>
                                  </>
                                )}
                              </TableRow>
                            );
                          })}
                        </React.Fragment>
                      )
                    )}
                  </TableBody>
                </Table>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};