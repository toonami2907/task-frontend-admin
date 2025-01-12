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
import NoCampaign from "./NoCampaign";
import toast from "react-hot-toast";
import { Pen } from "lucide-react";
import BudgetEditor from "./BudgetEditor";
import { formatCurrency } from "@/hooks/func";

// New NoCampaign component

const Campaign = ({ fetchedData, customColumn }) => {
  const [campaignData, setCampaignData] = useState(fetchedData);
  const { activeFilters } = useGlobalContext();
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [editingCampaignId, setEditingCampaignId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [editingBudgetId, setEditingBudgetId] = useState(null);

  // Add this function to handle name updates
  const handleNameUpdate = async (campaignId, newName) => {
    try {
      const response = await axios.post(`${API_URL}/auth/update/campaign`, {
        campaignId,
        newName,
      });

      if (response.status === 200) {
        setCampaignData((prevData) =>
          prevData.map((campaign) =>
            campaign.campaignId === campaignId
              ? { ...campaign, campaignName: newName }
              : campaign
          )
        );
        toast.success("Campaign name updated successfully", {
          position: "bottom-right",
          duration: 3000,
        });
      }
      setEditingCampaignId(null);
    } catch (error) {
      toast.error("Failed to update campaign name", {
        position: "bottom-right",
        duration: 3000,
      });
    }
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      const allIds = campaignData.map((campaign) => campaign.campaignId);
      setSelectedItems(new Set(allIds));
    } else {
      setSelectedItems(new Set());
    }
  };

  const handleSelectItem = (campaignId, checked) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(campaignId);
      } else {
        newSet.delete(campaignId);
      }
      return newSet;
    });
  };

  const isAllSelected =
    campaignData.length > 0 && selectedItems.size === campaignData.length;

  useEffect(() => {
    setCampaignData(fetchedData);
  }, [fetchedData]);

  useEffect(() => {
    if (!activeFilters || activeFilters.length === 0) {
      setCampaignData(fetchedData);
      return;
    }

    // Get only campaign name filters
    const campaignFilters = activeFilters.filter(
      (rule) => rule.field === "campaign_name"
    );

    // If no campaign filters, return original data
    if (campaignFilters.length === 0) {
      setCampaignData(fetchedData);
      return;
    }

    const filteredCampaign = fetchedData.filter((campaign) => {
      return campaignFilters.every((rule) => {
        const campaignName = (campaign.campaignName || "").trim().toLowerCase();
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
      if (response.status === 200) {
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

  const getValue = (campaign, col) => {
    switch (col) {
      case "Campaign ID":
        return campaign.campaignId;
      case "Campaign Name":
        return campaign.campaignName;
      case "Objective":
        return campaign.objective?.substring(8).toLowerCase();
      case "Delivery":
        return (
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
        );
      case "Bid strategy":
        return campaign.bidStrategy || "Using ad set bid strategy";
      // Add more cases for other columns
      default:
        return "—";
    }
  };

  if (!campaignData || campaignData.length === 0) {
    return <NoCampaign />;
  }

  const renderCell = (campaign, columnType) => {
    switch (columnType) {
      case "checkbox":
        return (
          <Checkbox
            checked={selectedItems.has(campaign.campaignId)}
            onCheckedChange={(checked) =>
              handleSelectItem(campaign.campaignId, checked)
            }
          />
        );
      case "status":
        return (
          <Switch
            checked={campaign.status === "ACTIVE"}
            onCheckedChange={(checked) =>
              handleSwitchToggle(
                campaign.campaignId,
                checked ? "ACTIVE" : "PAUSED"
              )
            }
          />
        );
      case "campaign":
        return (
          <>
            {editingCampaignId === campaign.campaignId ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onBlur={() =>
                    handleNameUpdate(campaign.campaignId, editingName)
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter")
                      handleNameUpdate(campaign.campaignId, editingName);
                    if (e.key === "Escape") return;
                  }}
                  className="border rounded px-2 py-1 w-full"
                  autoFocus
                />
                <button
                  onClick={() => setEditingCampaignId(null)}
                  className="text-gray-500 hover:text-red-500"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 group">
                  <p className="font-medium truncate">
                    {campaign.campaignName}
                  </p>
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
                  {campaign?.adSets?.length} Ad sets
                </Badge>
              </div>
            )}
          </>
        );
      case "Budget":
        return editingBudgetId === campaign.campaignId ? (
          <BudgetEditor
            initialBudget={campaign.budget?.replace(/[^0-9.]/g, "") || ""}
            campaignId={campaign.campaignId}
            onClose={() => setEditingBudgetId(null)}
            onSuccess={(newBudget) => {
              setCampaignData((prevData) =>
                prevData.map((c) =>
                  c.campaignId === campaign.campaignId
                    ? { ...c, budget: `${newBudget}` }
                    : c
                )
              );
              toast.success("Budget updated successfully");
            }}
          />
        ) : (
          <div
            className="group flex items-center gap-2 cursor-pointer"
            onClick={() => setEditingBudgetId(campaign.campaignId)}
          >
            <h1 className="text-xs flex flex-col">
              <span>
                {campaign.dailyBudget
                  ? formatCurrency(campaign.dailyBudget)
                  : "Using ad set budget"}
              </span>
              <span>Daily</span>
            </h1>
            <Pen
              size={14}
              className="opacity-0 group-hover:opacity-100 text-blue-500"
            />
          </div>
        );
      default:
        return getValue(campaign, columnType);
    }
  };

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
              <TableHead className="w-20 border-r">
                <div className="resize-x overflow-hidden">Status</div>
              </TableHead>
              <TableHead className="border-r">
                <div className="resize-x overflow-hidden min-w-[200px] cursor-col-resize">
                  Campaign
                </div>
              </TableHead>
              {customColumn.map((col, idx) => (
                <TableHead key={idx} className="border-r">
                  <div className="resize-x overflow-hidden min-w-[120px] cursor-col-resize">
                    {col}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {campaignData.map((campaign) => (
              <TableRow key={campaign.campaignId} className="hover:bg-gray-50">
                {["checkbox", "status", "campaign", ...customColumn].map(
                  (col, idx) => (
                    <TableCell
                      key={idx}
                      className={`border-r ${
                        col === "checkbox"
                          ? "w-12"
                          : col === "status"
                          ? "w-20"
                          : "min-w-[120px]"
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
