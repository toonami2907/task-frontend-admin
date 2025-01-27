/* eslint-disable react-refresh/only-export-components */
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { sortPresets } from "@/functions/Preset";
import api from "../resources/axiosConfig";




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

const updateSelectedAdAccount = (account) => {
  setSelectedAdAccount(account);
  localStorage.setItem('selectedAdAccount', JSON.stringify(account));
};
  const [loading, setLoading] = useState(false);
  const [isPlatformConnected, setIsPlatformConnected] = useState({
    shopify: false,
    facebook: false,
  });
 
  console.log('selectedAdAccount', selectedAdAccount)

  useEffect(() => {
  const act_id =  localStorage.getItem('Adsaccount')
  if (act_id) {
    setSelectedAdAccount(act_id)
  }
  }, [])
  
  // Fetch user info and update platform connection statuses
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

      console.log("User info fetched successfully:", user);
    } catch (error) {
      console.error("Error while connecting platform:", error.message);
    }
  }, []);




  
  const fetchAds = useCallback(async () => {
    setLoading(true);

    try {
      await api.get("/auth/fetchOrder", { withCredentials: true });
      if (selectedAdAccount) {
        await api.post(`${API_URL}/auth/ads`, { 
          FACEBOOK_ADS_ACT_ID: selectedAdAccount.id 
        });
      } else {
        await api.post(`${API_URL}/auth/ads`);
      }
      console.log("Ads fetched successfully");
    } catch (error) {
      console.error("Error fetching ads:", error.message);
    } finally {
      setLoading(false);
    }
  }, [selectedAdAccount]);

  // Initialize customColumn from localStorage and set up presets
  useEffect(() => {
    const storedCustomColumn = localStorage.getItem("customColumn");
    if (storedCustomColumn) {
      setCustomColumn(JSON.parse(storedCustomColumn));
    } else {
      setCustomColumn(sortPresets(selectedPresets));
    }
  }, [selectedPresets]);

  // Save customColumn to localStorage whenever it changes
  useEffect(() => {
    if (customColumn) {
      localStorage.setItem("customColumn", JSON.stringify(customColumn));
    }
  }, [customColumn]);

  // Initialize data on mount
  useEffect(() => {
    fetchAds();
    connectAccount();
  }, [fetchAds, connectAccount]);

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
        selectedAdAccount,
        updateSelectedAdAccount,
        setSelectedBarData,
        activeFilters,
        setActiveFilters,
        loading,
        setLoading,
        fetchAds,
        isPlatformConnected,
        userInfo,
      }}
    >
      {children}
    </StateContext.Provider>
  );
}

export const useGlobalContext = () => {
  const context = useContext(StateContext);
  if (!context) {
    throw new Error("useGlobalContext must be used within a StateProvider");
  }
  return context;
};
