import { useState } from 'react';
import api from '@/functions/resources/axiosConfig';

export const useTargetSearch = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);

  const searchTargets = async (searchTerm) => {
    if (!searchTerm || searchTerm.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const [campaignsRes, adSetsRes, adsRes] = await Promise.all([
        api.get("/auth/db/campaigns"),
        api.get("/auth/db/ads_set"),
        api.get("/auth/db/ads"),
      ]);

      const formattedResults = [
        ...formatResults(campaignsRes.data, 'campaign', 'campaignId', 'campaignName'),
        ...formatResults(adSetsRes.data, 'adSet', 'adSetId', 'adSetName'),
        ...formatResults(adsRes.data, 'ad', 'adId', 'adName'),
      ];

      setResults(formattedResults.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      ));
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    results,
    searchTargets
  };
};

const formatResults = (data, type, idKey, nameKey) => 
  data.map(item => ({
    id: item[idKey] || '',
    name: item[nameKey] || '',
    type
  }));