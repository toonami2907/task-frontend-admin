/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { sortPresets } from "@/functions/Preset";
import api from "../resources/axiosConfig";
import PropTypes from 'prop-types';

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
    document.cookie.split(";").forEach(cookie => {
      document.cookie = cookie
        .replace(/^ +/, "")
        .replace(/=.*/, `=;expires=${new Date(0).toUTCString()};path=/`);
    });
    window.location.href = '/auth';
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
  const [isPlatformConnected, setIsPlatformConnected] = useState({ shopify: false, facebook: false });
  const [adsData, setAdsData] = useState(null); // New state for ads data
  const [jobId, setJobId] = useState(null); // New state for job ID

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get(`/api/plan/plans`, { withCredentials: true });
      setPlans(response.data.data);
    } catch (error) {
      console.error("Error fetching plans:", error.message);
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
    }
  }, []);

  // Updated fetchAds to handle worker threads and polling
  // StateProvider.jsx (relevant parts)
  const fetchAds = useCallback(async (dateRange) => {
    setLoading(true);
    setAdsData(null);
    setJobId(null);

    const today = new Date().toISOString().split('T')[0];
    const dates = dateRange || { startDate: today, endDate: today };
    const payload = selectedAdAccount ? { 
      FACEBOOK_ADS_ACT_ID: selectedAdAccount.id,
      startDate: dates.startDate,
      endDate: dates.endDate,
    } : { startDate: dates.startDate, endDate: dates.endDate };

    try {
      await api.get("/auth/fetchOrder", { withCredentials: true });
      console.log(`fetchAds: Sending payload`, payload);
      const response = await api.post(`${API_URL}/auth/ads`, payload, { withCredentials: true });
      console.log(`fetchAds response:`, response.data);
      if (response.status === 200) {
        setAdsData(response.data);
        setLoading(false);
      } else if (response.status === 202) {
        setJobId(response.data.jobId);
        setFetchParams(payload); // Store params for polling
      }
    } catch (error) {
      console.error("Error fetching ads:", error.message);
      setLoading(false);
    }
  }, [selectedAdAccount]);

  const checkAdsStatus = useCallback(async () => {
    if (!jobId) return;

    try {
      const response = await api.get(`${API_URL}/auth/ads/status/${jobId}`, {
        params: fetchParams, // Pass original fetch parameters
        withCredentials: true,
      });
      console.log(`checkAdsStatus response for ${jobId}:`, response.data);
      if (response.status === 200) {
        console.log(`checkAdsStatus: Setting adsData for ${jobId}`);
        setAdsData(response.data);
        setJobId(null);
        setLoading(false);
      } else {
        console.log(`checkAdsStatus: Still processing ${jobId}`);
      }
    } catch (error) {
      console.error("Error checking ads status:", error.message);
      setLoading(false);
    }
  }, [jobId, fetchParams]);

  // Polling logic
  useEffect(() => {
    if (jobId) {
      const interval = setInterval(() => {
        checkAdsStatus();
      }, 5000); // Poll every 5 seconds
      return () => clearInterval(interval);
    }
  }, [jobId, checkAdsStatus]);
  // Initial setup
  useEffect(() => {
    fetchPlans();
    const act_id = localStorage.getItem('Adsaccount');
    if (act_id) {
      setSelectedAdAccount(JSON.parse(act_id));
    } else {
      // Fetch user profile to set default ad account
      connectAccount().then(() => {
        if (userInfo.adAccounts?.length) {
          setSelectedAdAccount(userInfo.adAccounts[0]);
          localStorage.setItem('Adsaccount', JSON.stringify(userInfo.adAccounts[0]));
        }
      });
    }
  }, [fetchPlans, connectAccount]);

  // Poll every 5 seconds when jobId exists

  // Initialize customColumn and fetch initial data
  useEffect(() => {
    const storedCustomColumn = localStorage.getItem("customColumn");
    setCustomColumn(storedCustomColumn ? JSON.parse(storedCustomColumn) : sortPresets(selectedPresets));
    connectAccount();
    // Only fetchAds if explicitly needed, not on every state change
  }, [connectAccount, selectedPresets]);

  // Save customColumn to localStorage
  useEffect(() => {
    if (customColumn) localStorage.setItem("customColumn", JSON.stringify(customColumn));
  }, [customColumn]);

  return (
    <StateContext.Provider
      value={{
        state,
        setState,
        customColumn,
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
        isPlatformConnected,
        userInfo,
        plans,
        fetchPlans,
        adsData, // Expose ads data to consumers
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