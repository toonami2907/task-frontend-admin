import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { sortPresets } from "@/functions/Preset";
import api from "../resources/axiosConfig";
import PropTypes from 'prop-types';
import Cookies from 'js-cookie';
import io from 'socket.io-client';
import toast from 'react-hot-toast';

export const StateContext = createContext();

export const defaultCustomColumn = [
  "Delivery",
  "Amount spent",
  "Budget",
  "Impressions",
  "CPM (cost per 1,000 impressions)",
  "Reach",
  "Frequency",
  "CTR (all)",
  "Link clicks",
  "CPC (all)",
  "Attribution setting",
  "Results",
  "Cost per result",
  "Ad ID",
  "Cost per 1,000 Accounts Center accounts reached",
];

export const API_URL = import.meta.env.VITE_API_URL;

export const handleLogout = async () => {
  try {
    await api.post(`${API_URL}/auth/v1/logout`, {}, { withCredentials: true });
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    localStorage.clear();
    Cookies.remove("access_token");
    Cookies.remove("refresh_token");
    window.location.href = '/auth';
    window.location.reload();
  }
};

export default function StateProvider({ children }) {
  const [state, setState] = useState("Campaign");
  const [selectedBar, setSelectedBar] = useState("");
  const [selectedBarData, setSelectedBarData] = useState(0);
  const [selectedPresets, setSelectedPresets] = useState("Setup");
  const [activeFilters, setActiveFilters] = useState([]);
  const [selectedAdAccount, setSelectedAdAccount] = useState(null);
  const [userInfo, setUserInfo] = useState({});
  const [customColumn, setCustomColumn] = useState();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchParams, setFetchParams] = useState({});
  const [globalErrors, setGlobalErrors] = useState([]);
  const [isPlatformConnected, setIsPlatformConnected] = useState({ shopify: false, facebook: false });
  const [adsData, setAdsData] = useState(null);
  const [ordersData, setOrdersData] = useState(null);
  const [jobId, setJobId] = useState(null);
  const [orderJobId, setOrderJobId] = useState(null);
  const [socket, setSocket] = useState(null);
  const [ran, setRan] = useState(0);
  const [platformErrors, setPlatformErrors] = useState({
    shopify: false,
    facebook: false,
  });
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'asc',
  });
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Update online status
  const updateOnlineStatus = () => {
    setIsOnline(navigator.onLine);
  };

  useEffect(() => {
    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);
    return () => {
      window.removeEventListener("online", updateOnlineStatus);
      window.removeEventListener("offline", updateOnlineStatus);
    };
  }, []);

  const handleSort = (key) => {
    setSortConfig((currentSort) => {
      if (currentSort.key === key) {
        return {
          key,
          direction: currentSort.direction === 'asc' ? 'desc' : 'asc',
        };
      }
      return { key, direction: 'asc' };
    });
  };

  // Socket.IO Setup
  useEffect(() => {
    if (!userInfo._id) return;

    const socketInstance = io(API_URL, {
      withCredentials: true,
      query: { userId: userInfo._id },
    });

    socketInstance.on('connect', () => {
      console.log(`Connected to WebSocket server with userId: ${userInfo._id}`);
    });

    // Ads-related WebSocket events
    socketInstance.on('jobStarted', (data) => {
      console.log('Job started:', data);
      setLoading(true);
      setPlatformErrors((prev) => ({ ...prev, facebook: false }));
      setJobId(data.jobId);
      toast.loading('Fetching ad data...', { id: 'fetch-ads' });
    });

    socketInstance.on('jobCompleted', (data) => {
      setAdsData(data.data);
      setPlatformErrors((prev) => ({ ...prev, facebook: false }));
      setLoading(false);
      setJobId(null);
      toast.success('Ads data fetched successfully!', { id: 'fetch-ads' });
    });

    socketInstance.on('jobCompletedWithRateLimit', (data) => {
      setAdsData(data.data);
      setPlatformErrors((prev) => ({ ...prev, facebook: true }));
      setGlobalErrors((prev) => [
        ...prev,
        {
          message: `${data.rateLimitError.title}: ${data.rateLimitError.message}`,
          error: `Affected ${data.rateLimitError.failedCount} campaigns`,
          timestamp: new Date().toISOString(),
        },
      ]);
      setLoading(false);
      setJobId(null);
      toast.error(`Ads fetched with rate limit issues: ${data.rateLimitError.message}`, { id: 'fetch-ads' });
    });

    socketInstance.on('jobFailed', (data) => {
      console.log('Job failed:', data);
      setPlatformErrors((prev) => ({ ...prev, facebook: true }));
      setGlobalErrors((prev) => [
        ...prev,
        { message: data.message, error: data.error, timestamp: new Date().toISOString() },
      ]);
      setLoading(false);
      setJobId(null);
      toast.error('Failed to fetch ads: ' + data.message, { id: 'fetch-ads' });
    });

    // Orders-related WebSocket events
    socketInstance.on('orderJobStarted', (data) => {
      console.log('Order job started:', data);
      setLoading(true);
      setPlatformErrors((prev) => ({ ...prev, shopify: false }));
      setOrderJobId(data.jobId);
      toast.loading('Fetching order data...', { id: 'fetch-orders' });
    });

    socketInstance.on('orderJobCompleted', (data) => {
      console.log('Order job completed:', data);
      setOrdersData(data.data);
      setPlatformErrors((prev) => ({ ...prev, shopify: false }));
      setLoading(false);
      setOrderJobId(null);
      toast.success('Orders data fetched successfully!', { id: 'fetch-orders' });
    });

    socketInstance.on('orderJobFailed', (data) => {
      console.log('Order job failed:', data);
      setPlatformErrors((prev) => ({ ...prev, shopify: true }));
      setGlobalErrors((prev) => [
        ...prev,
        { message: data.message, error: data.error, timestamp: new Date().toISOString() },
      ]);
      setLoading(false);
      setOrderJobId(null);
      toast.error('Failed to fetch orders: ' + data.message, { id: 'fetch-orders' });
    });

    socketInstance.on('connect_error', (error) => {
      console.error('Socket.IO connection error:', error.message);
    });

    socketInstance.on('error', (err) => {
      socketInstance.destroy();
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
      console.log('WebSocket disconnected');
    };
  }, [userInfo._id]);

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get(`/api/plan/plans`, { withCredentials: true });
      setPlans(response.data.data);
    } catch (error) {
      console.error("Error fetching plans:", error.message);
      setGlobalErrors((prev) => [
        ...prev,
        { message: "Failed to fetch plans", error: error.message, timestamp: new Date().toISOString() },
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSelectedAdAccount = (account) => {
    setSelectedAdAccount(account);
    localStorage.setItem('selectedAdAccount', JSON.stringify(account));
  };

  const connectAccount = useCallback(async () => {
    try {
      const response = await api.get("/auth/profile", { withCredentials: true });
      const { user } = response.data;
      setUserInfo(user);
      setIsPlatformConnected((prevState) => ({
        ...prevState,
        shopify: user.isShopifyConnected || false,
        facebook: user.isFacebookConnected || false,
      }));
    } catch (error) {
      console.error("Error while connecting platform:", error.message);
      setGlobalErrors((prev) => [
        ...prev,
        { message: "Failed to connect account", error: error.message, timestamp: new Date().toISOString() },
      ]);
    }
  }, []);

  const fetchAds = useCallback(async (dateRange) => {
    if (!isOnline) {
      toast.error('You are currently offline');
      return;
    }

    setLoading(true);
    setAdsData(null);
    setJobId(null);

    const today = new Date();
    const defaultStartDate = new Date(today.setDate(today.getDate() - 90)).toISOString().split('T')[0];
    const defaultEndDate = new Date().toISOString().split('T')[0];
    const dates = dateRange || { startDate: defaultStartDate, endDate: defaultEndDate };
    const payload = selectedAdAccount
      ? {
          FACEBOOK_ADS_ACT_ID: selectedAdAccount.id,
          startDate: dates.startDate,
          endDate: dates.endDate,
        }
      : { startDate: dates.startDate, endDate: dates.endDate };

    try {
      const response = await api.post(`${API_URL}/auth/ads`, payload, { withCredentials: true });
      if (response.status === 200) {
        setAdsData(response.data);
        setLoading(false);
      } else if (response.status === 202) {
        setFetchParams(payload);
        // WebSocket will handle updates via jobStarted/jobCompleted
      }
    } catch (error) {
      console.error("Error fetching ads:", error.message);
      setGlobalErrors((prev) => [
        ...prev,
        { message: "Failed to fetch ads", error: error.message, timestamp: new Date().toISOString() },
      ]);
      setLoading(false);
      toast.error('Failed to initiate ads fetch: ' + error.message);
    }
  }, [selectedAdAccount, isOnline]);

  const fetchOrders = useCallback(async (dateRange) => {
    if (!isOnline) {
      toast.error('You are currently offline');
      return;
    }

    setLoading(true);
    setOrdersData(null);
    setOrderJobId(null);

    const today = new Date();
    const defaultStartDate = new Date(today.setDate(today.getDate() - 90)).toISOString().split('T')[0];
    const defaultEndDate = new Date().toISOString().split('T')[0];
    const dates = dateRange || { startDate: defaultStartDate, endDate: defaultEndDate };
    const payload = {
      startDate: dates.startDate,
      endDate: dates.endDate,
      page: 1, // Default page
      limit: 100, // Default limit
    };

    try {
      const response = await api.get(`${API_URL}/auth/fetchOrder`, {
        params: payload,
        withCredentials: true,
      });
      if (response.status === 200) {
        setOrdersData(response.data);
        setLoading(false);
        toast.success('Orders data loaded from cache');
      } else if (response.status === 202) {
        setFetchParams(payload);
        // WebSocket will handle updates via orderJobStarted/orderJobCompleted
      }
    } catch (error) {
      console.error("Error fetching orders:", error.message);
      setGlobalErrors((prev) => [
        ...prev,
        { message: "Failed to fetch orders", error: error.message, timestamp: new Date().toISOString() },
      ]);
      setLoading(false);
      toast.error('Failed to initiate orders fetch: ' + error.message);
    }
  }, [isOnline]);

  useEffect(() => {
    fetchPlans();
    const act_id = localStorage.getItem('Adsaccount');
    if (act_id) {
      setSelectedAdAccount(JSON.parse(act_id));
    } else {
      connectAccount().then(() => {
        if (userInfo.adAccounts?.length) {
          setSelectedAdAccount(userInfo.adAccounts[0]);
          localStorage.setItem('Adsaccount', JSON.stringify(userInfo.adAccounts[0]));
        }
      });
    }
  }, [fetchPlans, connectAccount]);

  useEffect(() => {
    const storedCustomColumn = localStorage.getItem("customColumn");
    setCustomColumn(storedCustomColumn ? JSON.parse(storedCustomColumn) : sortPresets(selectedPresets));
    connectAccount();
  }, [connectAccount, selectedPresets]);

  useEffect(() => {
    if (customColumn) localStorage.setItem("customColumn", JSON.stringify(customColumn));
  }, [customColumn]);

  useEffect(() => {
    if (!isOnline) {
      toast.error('You are currently offline');
    }
    if (selectedAdAccount) {
      fetchAds();
    }
  }, [selectedAdAccount, fetchAds]);

  return (
    <StateContext.Provider
      value={{
        state,
        setState,
        customColumn,
        platformErrors,
        setCustomColumn,
        selectedPresets,
        setSelectedPresets,
        selectedBar,
        setSelectedBar,
        selectedBarData,
        setSelectedBarData,
        activeFilters,
        setActiveFilters,
        selectedAdAccount,
        updateSelectedAdAccount,
        loading,
        setLoading,
        fetchAds,
        fetchOrders,
        isPlatformConnected,
        userInfo,
        globalErrors,
        plans,
        sortConfig,
        handleSort,
        fetchPlans,
        adsData,
        ordersData,
      }}
    >
      {children}
    </StateContext.Provider>
  );
}

StateProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useGlobalContext = () => {
  const context = useContext(StateContext);
  if (!context) throw new Error("useGlobalContext must be used within a StateProvider");
  return context;
};