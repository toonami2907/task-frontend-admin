/* eslint-disable react/prop-types */
import React, { useState, useEffect, useCallback, useMemo } from "react";
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
import NoCampaign from "./NoCampaign";
import toast from "react-hot-toast";
import { Pen, Loader } from "lucide-react";
import BudgetEditor from "./BudgetEditor";
import { formatCurrency } from "@/hooks/func";

const STATUS_COLORS = {
  ACTIVE: "bg-green-500",
  PAUSED: "bg-gray-400",
};

const Campaign = ({ fetchedData, customColumn,  SelectedCamapiagn,disableState , SetCamapiagn }) => {
  const [campaignData, setCampaignData] = useState(fetchedData);
  const { activeFilters, fetchAds } = useGlobalContext();
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [editingCampaignId, setEditingCampaignId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [editingBudgetId, setEditingBudgetId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(null);

  const handleNameUpdate = async (campaignId, newName) => {
    if (!newName.trim()) {
      toast.error("Campaign name cannot be empty");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(`${API_URL}/auth/update/campaign`, {
        campaignId,
        newName: newName.trim(),
      });

      if (response.data.success) {
        fetchAds()
        setCampaignData((prevData) =>
          prevData.map((campaign) =>
            campaign.campaignId === campaignId
              ? { ...campaign, campaignName: newName.trim() }
              : campaign
          )
        );
        toast.success("Campaign name updated successfully");

      } else {
        throw new Error(response.data.message || "Failed to update campaign name");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update campaign name");
    } finally {
      setIsLoading(false);
      setEditingCampaignId(null);
    }
  };

  const handleSelectAll = useCallback((checked) => {
    if (checked) {
      SetCamapiagn(campaignData.map((campaign) => campaign.campaignId))
      const allIds = campaignData.map((campaign) => campaign.campaignId);
      setSelectedItems(new Set(allIds));
    } else {
      setSelectedItems(new Set());
      SetCamapiagn([])
    }
  }, [campaignData, SelectedCamapiagn]);
  // In Campaign component, add this effect to watch for status changes
useEffect(() => {
  if (disableState && SelectedCamapiagn?.length) {
    const newStatus = disableState === "On" ? "ACTIVE" : "PAUSED";
    
    setCampaignData(prevData => 
      prevData.map(campaign => 
        SelectedCamapiagn.includes(campaign.campaignId)
          ? { ...campaign, status: newStatus }
          : campaign
      )
    );
  }
}, [disableState, SelectedCamapiagn]);


  const handleSelectItem = useCallback((campaignId, checked) => {
    if(SelectedCamapiagn.length === 0){
      return setSelectedItems([])
    }
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(campaignId);
      } else {
        newSet.delete(campaignId);
      }
      return newSet;
    });
  }, [SelectedCamapiagn]);



  useEffect(() => {
    setCampaignData(fetchedData);
  }, [fetchedData]);

  useEffect(() => {
    if (!activeFilters?.length) {
      setCampaignData(fetchedData);
      return;
    }

    const campaignFilters = activeFilters.filter(
      (rule) => rule.field === "campaign_name"
    );

    if (!campaignFilters.length) {
      setCampaignData(fetchedData);
      return;
    }

    const filteredCampaigns = fetchedData.filter((campaign) =>
      campaignFilters.every((rule) => {
        const campaignName = (campaign.campaignName || "").trim().toLowerCase();
        const searchValue = (rule.value || "").trim().toLowerCase();

        if (!searchValue) return true;

        switch (rule.condition) {
          case "Contains":
            return campaignName.includes(searchValue);
          case "Doesn`t contain":
            return !campaignName.includes(searchValue);
          default:
            return true;
        }
      })
    );

    setCampaignData(filteredCampaigns);
    setSelectedItems(new Set());
  }, [activeFilters, fetchedData]);

  const handleSwitchToggle = async (campaignId, newStatus) => {
    setUpdatingStatus(campaignId);
    try {
      const response = await axios.post(`${API_URL}/auth/pause/${campaignId}`, {
        status: newStatus,
      });

      if (response.status == 200) {
        setCampaignData((prevData) =>
          prevData.map((campaign) =>
            campaign.campaignId === campaignId
              ? { ...campaign, status: newStatus }
              : campaign
          )
        );
        toast.success(`Campaign status updated to ${newStatus.toLowerCase()}`);
      } else {
        throw new Error(response.data.message || "Failed to update status");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update campaign status");
      // Revert the switch state
      setCampaignData((prevData) =>
        prevData.map((campaign) =>
          campaign.campaignId === campaignId
            ? { ...campaign, status: campaign.status === "ACTIVE" ? "PAUSED" : "ACTIVE" }
            : campaign
        )
      );
    } finally {
      setUpdatingStatus(null);
    }
  };


  
  const getValue = useCallback((campaign, col) => {
    switch (col) {
      case "Campaign ID":
        return campaign.campaignId;
      case "Campaign Name":
        return campaign.campaignName;
      case "Buying type":
        return campaign.buying_type;
      case "Campaign spending limit":
        return campaign.spendCap ? formatCurrency(campaign.spendCap) : "—";
      case "Objective":
        return campaign.objective?.substring(8).toLowerCase();
      case "Delivery":
        return (
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${STATUS_COLORS[campaign.status] || "bg-gray-400"}`}
            />
            <span className="text-sm text-gray-600">
              {campaign.status === "ACTIVE" ? "Delivering" : "Not delivering"}
            </span>
          </div>
        );
      case "Bid strategy":
        return campaign.bidStrategy || "Using ad set bid strategy";
      default:
        return "—";
    }
  }, []);

  const renderCell = useCallback((campaign, columnType) => {
    switch (columnType) {
      case "checkbox":
        return (
          <Checkbox
            checked={SelectedCamapiagn?.includes(campaign.campaignId) || false}
            onCheckedChange={(checked) =>{
              handleSelectItem(campaign.campaignId, checked)
              SetCamapiagn((prev)=> {
                const exists = prev?.some(
                  (item)=> item === campaign.campaignId
                );
                if(exists){
                  return prev.filter((item)=> item !== campaign.campaignId);
                }
                return [...(prev || []), campaign.campaignId];
              });
            }}
          />
        );
      case "status":
        return (
          <div className="flex items-center justify-center">
            {updatingStatus === campaign.campaignId ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <Switch
                checked={
                  SelectedCamapiagn.includes(campaign.campaignId) &&
                  (disableState === "On" || disableState === "Off")
                    ? disableState === "On"
                    : campaign.status === "ACTIVE"
                }
                onCheckedChange={(checked) =>
                  handleSwitchToggle(
                    campaign.campaignId,
                    checked ? "ACTIVE" : "PAUSED"
                  )
                }
              />
            )}
          </div>
        );
      case "campaign":
        return (
          <>
          {editingCampaignId === campaign.campaignId ? (
            <div className="flex flex-col space-y-2">
              <input
                type="text"
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleNameUpdate(campaign.campaignId, editingName);
                  }
                  if (e.key === "Escape") {
                    setEditingCampaignId(null);
                  }
                }}
                className="border rounded px-2 py-1 w-full font-normal focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoFocus
                placeholder="Enter new campaign name"
              />
              <div className="flex space-x-2">
                <button
                  onClick={() => setEditingCampaignId(null)}
                  className="w-1/2 border rounded py-1 text-sm hover:bg-gray-100"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleNameUpdate(campaign.campaignId, editingName)}
                  className="w-1/2 bg-blue-500 text-white rounded py-1 text-sm hover:bg-blue-600"
                  disabled={isLoading}
                >
                  {isLoading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 group">
                <p className="font-medium truncate max-w-[200px]">{campaign.campaignName}</p>
                <Pen
                  size={14}
                  className="opacity-0 group-hover:opacity-100 cursor-pointer text-blue-500"
                  onClick={() => {
                    setEditingCampaignId(campaign.campaignId);
                    setEditingName(campaign.campaignName);
                  }}
                />
              </div>
              <Badge variant="secondary" className="text-xs w-fit">
                {campaign?.adSets?.length || 0} Ad sets
              </Badge>
            </div>
          )}
        </>
        
        );
      case "Budget":
        return editingBudgetId === campaign.campaignId ? (
          <BudgetEditor
            initialBudget={campaign.dailyBudget?.toString() || ""}
            campaignId={campaign.campaignId}
            onClose={() => setEditingBudgetId(null)}
            onSuccess={(newBudget) => {
              setCampaignData((prevData) =>
                prevData.map((c) =>
                  c.campaignId === campaign.campaignId
                    ? { ...c, dailyBudget: newBudget }
                    : c
                )
              );
              setEditingBudgetId(null);
              toast.success("Budget updated successfully");
            }}
          />
        ) : (
          <>
          {campaign.dailyBudget ? (
               <div
               className="group flex items-center gap-2 cursor-pointer"
               onClick={() => setEditingBudgetId(campaign.campaignId)}
             >
               <div className="text-xs flex flex-col">
                 <span>
                   {campaign.dailyBudget
                     ? formatCurrency(campaign.dailyBudget)
                     : "Using ad set budget"}
                 </span>
                 <span>Daily</span>
               </div>
               <Pen
                 size={14}
                 className={`${campaign.dailyBudget ? 'opacity-0 group-hover:opacity-100 text-blue-500': 'hidden'}`}
               />
             </div>
          ) : (
            <div
               className="group flex items-center gap-2 cursor-pointer"
             >
               <div className="text-xs flex flex-col">
                 <span>
                   {campaign.dailyBudget
                     ? formatCurrency(campaign.dailyBudget)
                     : "Using ad set budget"}
                 </span>
                 {campaign.dailyBudget && (
                   <span>Daily</span>
                 )}
               </div>
               <Pen
                 size={14}
                 className={`${campaign.dailyBudget ? 'opacity-0 group-hover:opacity-100 text-blue-500': 'hidden'}`}
               />
             </div>
          )}
          </>
        );
      default:
        return getValue(campaign, columnType);
    }
  }, [selectedItems, editingCampaignId, editingBudgetId, isLoading, updatingStatus, editingName, handleSelectItem, getValue]);

  const hiddenColumns = useMemo(() => [
    // Add the column names you want to hide
    // For example: "Buying type", "Campaign spending limit"
    "Preview link",
    "Link (ad settings)",
    "URL parameters",
    "Meta Pixel",
    "App event",
    "Offline event",
    "Included custom audiences",
    "Excluded custom audiences",
    "Audience location (Ad set settings)",
    "Ad ID",
    "Schedule",
    "Ad Set Name",
     "Correct Purchases",
    "Conversion rate ranking",
    "Engagement rate ranking",
    "Quality ranking",
    "Ad set ID",
  ], []);

  // Filter out hidden columns from customColumn
  const visibleColumns = useMemo(() => 
    customColumn.filter(col => !hiddenColumns.includes(col))
  , [customColumn, hiddenColumns]);
  if (!campaignData?.length) {
    return <NoCampaign />;
  }

  return (
    <div className="border rounded-lg">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="w-12 select-none">
                <Checkbox
                  checked={campaignData.length > 0 && SelectedCamapiagn?.length === campaignData.length}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead className="w-20 text-xs font-bold text-color border-r">Status</TableHead>
              <TableHead className="border-r text-color text-xs font-bold min-w-[200px]">Campaign</TableHead>
              {visibleColumns.map((col) => (
                <TableHead key={col} className="border-r text-color text-xs min-w-[120px]">
                  {col}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {campaignData.map((campaign) => (
              <TableRow key={campaign.campaignId} 
              className={`h-5 group transition-colors ${
                SelectedCamapiagn?.includes(campaign.campaignId)
                  ? "bg-green-100 hover:bg-green-50"
                  : " hover:bg-gray-50 "
              }`}
              >
                {["checkbox", "status", "campaign", ...visibleColumns].map(
                  (col, idx) => (
                    <TableCell
                      key={`${campaign.campaignId}-${col}-${idx}`}
                      className={` text-xs ${
                        col === "checkbox"
                          ? "w-12 "
                          : col === "status"
                          ? "w-20 border-r"
                          : "min-w-[120px] border-r"
                      }`}
                    >
                      {renderCell(campaign, col)}
                    </TableCell>
                  )
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Campaign;