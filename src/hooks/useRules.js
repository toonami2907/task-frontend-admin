// src/hooks/useRules.js

import { useState, useCallback } from 'react';
import api from "@/functions/resources/axiosConfig";
import { ErrorToast } from "@/hooks/customToast";
import toast from "react-hot-toast";

export const useRuleManager = () => {
  const [loading, setLoading] = useState(false);

  const handleTargetSearch = useCallback(async (searchTerm) => {
    if (!searchTerm || searchTerm.length < 2) {
      return [];
    }

    setLoading(true);
    try {
      const [campaignsRes, adSetsRes, adsRes] = await Promise.all([
        api.get("/auth/db/campaigns"),
        api.get("/auth/db/ads_set"),
        api.get("/auth/db/ads"),
      ]);

      const formattedResults = [
        ...campaignsRes.data.map(item => ({
          id: item.campaignId || "",
          name: item.campaignName || "",
          type: "campaign",
        })),
        ...adSetsRes.data.map(item => ({
          id: item.adSetId || "",
          name: item.adSetName || "",
          type: "adSet",
        })),
        ...adsRes.data.map(item => ({
          id: item.adId || "",
          name: item.adName || "",
          type: "ad",
        })),
      ];

      return formattedResults.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } catch (error) {
      console.error("Search error:", error);
      ErrorToast("Error searching targets");
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const handleStatusToggle = async (rule) => {
    const newStatus = rule.status === "active" ? "paused" : "active";
    
    try {
      await api.patch(`/rules/${rule._id}/status`, { status: newStatus });
      toast.success(`Rule ${newStatus === "active" ? "activated" : "paused"} successfully`);
      return newStatus;
    } catch (error) {
      ErrorToast(`Failed to ${newStatus === "active" ? "activate" : "pause"} rule`);
      throw error;
    }
  };

  return {
    loading,
    handleTargetSearch,
    handleStatusToggle,
  };
};