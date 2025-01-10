/* eslint-disable react/prop-types */
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { API_URL, useGlobalContext } from "@/functions/features/StateProvider";
import NoCampaign from './NoCampaign'
import toast from "react-hot-toast";

// New NoCampaign component


const Campaign = ({ fetchedData }) => {
  const [campaignData, setCampaignData] = useState(fetchedData);
  const { activeFilters } = useGlobalContext();
  const [selectedItems, setSelectedItems] = useState(new Set());

  const handleSelectAll = (checked) => {
    if (checked) {
      const allIds = campaignData.map(campaign => campaign.campaignId);
      setSelectedItems(new Set(allIds));
    } else {
      setSelectedItems(new Set());
    }
  };

  const handleSelectItem = (campaignId, checked) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(campaignId);
      } else {
        newSet.delete(campaignId);
      }
      return newSet;
    });
  };

  const isAllSelected = campaignData.length > 0 && selectedItems.size === campaignData.length;

  useEffect(() => {
    setCampaignData(fetchedData);
  }, [fetchedData]);

  useEffect(() => {
    if (!activeFilters || activeFilters.length === 0) {
      setCampaignData(fetchedData);
      return;
    }

    const filteredCampaign = fetchedData.filter((campaign) => {
      return activeFilters.some((rule) => {
        if (rule.field !== 'campaign_name') {
          return true;
        }

        const campaignName = (campaign.campaignName || '').trim().toLowerCase();
        const searchValue = (rule.value || "").trim().toLowerCase();

        if (!searchValue) {
          return true;
        }
        switch (rule.condition) {
          case "Contains":
            return campaignName.includes(searchValue);
          case "Doesn`t contain":
            return !campaignName.includes(searchValue);
          default:
            return true;
        }
      });
    });

    setCampaignData(filteredCampaign);
    setSelectedItems(new Set());
  }, [activeFilters, fetchedData]);

  const handleSwitchToggle = async (campaignId, newStatus) => {
    try {
      const response = await axios.post(`${API_URL}/auth/pause/${campaignId}`, {
        status: newStatus,
      });
      if(response.status === 200){
        toast.success(`Campaign status has be set ${newStatus}`, {
          position: "bottom-right",
          duration: 5000,
        });
      }

      setCampaignData((prevData) =>
        prevData.map((campaign) =>
          campaign.campaignId === campaignId
            ? { ...campaign, status: newStatus }
            : campaign
        )
      );
    } catch (error) {
      console.error(`Failed to update campaign ${campaignId} status:`, error);
    }
  };

  // Show NoCampaign component if there's no data
  if (!campaignData || campaignData.length === 0) {
    return <NoCampaign />;
  }

  return (
    <div className="border rounded-lg">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="w-12 select-none border-r">
                <Checkbox 
                  checked={isAllSelected}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead className="border-r">Status</TableHead>
              <TableHead className="border-r">Campaign</TableHead>
              <TableHead className="border-r">Delivery</TableHead>
              <TableHead className="border-r">Bid Strategy</TableHead>
              <TableHead>Budget</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {campaignData.map((campaign) => (
              <TableRow key={campaign.campaignId} className="hover:bg-gray-50">
                <TableCell className="w-12 border-r">
                  <Checkbox 
                    checked={selectedItems.has(campaign.campaignId)}
                    onCheckedChange={(checked) => handleSelectItem(campaign.campaignId, checked)}
                  />
                </TableCell>
                <TableCell className="w-20 border-r">
                  <Switch
                    checked={campaign.status === "ACTIVE"}
                    onCheckedChange={(checked) =>
                      handleSwitchToggle(campaign.campaignId, checked ? "ACTIVE" : "PAUSED")
                    }
                  />
                </TableCell>
                <TableCell className="min-w-[200px] border-r">
                  <p className="font-medium truncate">{campaign.campaignName}</p>
                  <Badge variant="secondary" className="text-xs">
                    {campaign?.adSets?.length} Ad sets
                  </Badge>
                </TableCell>
                <TableCell className="min-w-[120px] border-r">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        campaign.status === "ACTIVE" ? "bg-green-500" : "bg-gray-400"
                      }`}
                    />
                    <span className="text-sm text-gray-600">
                      {campaign.status === "ACTIVE" ? "Delivering" : "Not delivering"}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="min-w-[150px] border-r">
                  <Badge variant="secondary">{campaign.bidStrategy || "Using ad set bid strategy"}</Badge>
                </TableCell>
                <TableCell className="min-w-[120px]">
                  <Badge variant="secondary">{campaign.budget || "Using ad set budget"}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Campaign;