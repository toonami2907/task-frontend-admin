import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { sortPresets } from "@/functions/Preset";
import axios from "axios";

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

export const API_URL = import.meta.env.VITE_API_URL
export default function StateProvider({ children }) {
  const [state, setState] = useState("Campaign");
  const [selectedBar, setSelectedBar] = useState("");
  const [selectedBarData, setSelectedBarData] = useState(0);
  const [selectedPresets, setSelectedPresets] = useState("Setup");
  const [activeFilters, setActiveFilters] = useState([]);

  const [customColumn, setCustomColumn] = useState()

useEffect(()=>{
  setCustomColumn(localStorage.getItem("customColumn"))
},[])
  // Save customColumn to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("customColumn", JSON.stringify(customColumn));
  }, [customColumn]);

  useEffect(() => {
   const presets =  sortPresets(selectedPresets);
   setCustomColumn(presets)
  }, [selectedPresets]);
  useEffect(()=>{

  }, [activeFilters])

  useEffect(()=>{
    const fetchAds = async()=>{
      try {
       await axios.get(`${API_URL}/auth/ads`)
      } catch (error) {
        console.error('error fetching ads', error.message)
      }
    }
    fetchAds()
  },[])
  useEffect(() => {
    // console.log('selectedbar from provider', selectedBar)

  }, [selectedBar, setSelectedBar])
  return (
    <StateContext.Provider value={{ state, setState, setCustomColumn, customColumn, selectedPresets,setActiveFilters,activeFilters,  setSelectedPresets, setSelectedBar,selectedBarData,setSelectedBarData, selectedBar}}>
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
