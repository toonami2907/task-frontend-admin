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
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Switch } from "./ui/switch";
import { Checkbox } from "./ui/checkbox";
import { Link, Pen } from "lucide-react";
import NoAd from "./NoAd";
import { API_URL, useGlobalContext } from "@/functions/features/StateProvider";
import { formatCurrency } from "@/hooks/func";

const Ads = ({
  previewImage,
  customColumn,
  adsData: initialAdsData,
  setPreviewImage,
  setAdsSelectedBar,
  adsSelectedBar,
  getAdLink,
}) => {
  const [adsData, setAdsData] = useState(initialAdsData);
  const { activeFilters, fetchAds } = useGlobalContext();
  const [selectedAds, setSelectedAds] = useState({});
  const [selectAll, setSelectAll] = useState(false);
  const [editingAdId, setEditingAdId] = useState(null);
  const [editingName, setEditingName] = useState("");

  useEffect(() => {
    const selectedAdIds = Object.entries(selectedAds)
      .filter(([_, isSelected]) => isSelected)
      .map(([adId]) => adId);
    setAdsSelectedBar(selectedAdIds);
  }, [selectedAds, setAdsSelectedBar]);

  const handleSelectAll = (checked) => {
    setSelectAll(checked);
    const newSelectedAds = {};
    adsData.forEach((ad) => {
      newSelectedAds[ad.adId] = checked;
    });
    setSelectedAds(newSelectedAds);
  };

  const handleSelectSingle = (adId, checked) => {
    setSelectedAds((prev) => ({
      ...prev,
      [adId]: checked,
    }));

    const updatedSelected = {
      ...selectedAds,
      [adId]: checked,
    };
    const allSelected = adsData.every((ad) => updatedSelected[ad.adId]);
    setSelectAll(allSelected);
  };

  const handleStatusChange = async (adId, newStatus) => {
    try {
      const endpoint = `${API_URL}/auth/pause/ads/${adId}`;
      await axios.post(endpoint, { status: newStatus });
      console.log(`Ad ${adId} status updated to ${newStatus}`);

      setAdsData((prevAds) =>
        prevAds.map((ad) =>
          ad.adId === adId ? { ...ad, status: newStatus } : ad
        )
      );
    } catch (error) {
      console.error(`Failed to update Ad ${adId} status:`, error.message);
    }
  };
  const handleNameUpdate = async (adId, newName) => {
    try {
      await axios.post(`${API_URL}/auth/update/ads`, {
        adId,
        newName,
      });

      setAdsData((prevAds) =>
        prevAds.map((ad) =>
          ad.adId === adId ? { ...ad, adName: newName } : ad
        )
      );
      fetchAds();
      setEditingAdId(null);
    } catch (error) {
      console.error("Failed to update ad name:", error);
    }
  };

  // Update local state when prop changes
  useEffect(() => {
    setAdsData(initialAdsData);
    // Reset selection state when data changes
    setSelectedAds({});
    setSelectAll(false);
  }, [initialAdsData]);
  const handleCancel = () => {
    setEditingAdId(null);
    setEditingName("");
  };

  // Filter ads based on active filters
  useEffect(() => {
    if (!activeFilters || activeFilters.length === 0) {
      setAdsData(initialAdsData);
      return;
    }

    // Get only ad name filters
    const adFilters = activeFilters.filter((rule) => rule.field === "ad_name");

    // If no ad filters, return original data
    if (adFilters.length === 0) {
      setAdsData(initialAdsData);
      return;
    }

    const filteredAds = initialAdsData.filter((ad) => {
      return adFilters.every((rule) => {
        const adName = (ad.adName || "").trim().toLowerCase();
        const searchValue = (rule.value || "").trim().toLowerCase();

        if (!searchValue) {
          return true;
        }

        switch (rule.condition) {
          case "Contains":
            return adName.includes(searchValue);
          case "Doesn`t contain":
            return !adName.includes(searchValue);
          default:
            return true;
        }
      });
    });

    setAdsData(filteredAds);
  }, [activeFilters, initialAdsData]);

  const getFbPixel = (trackingSpecs) => {
    if (!trackingSpecs || !Array.isArray(trackingSpecs)) {
      return [];
    }
    const pixelSpec = trackingSpecs.find((spec) => spec["fb_pixel"]);
    return pixelSpec?.fb_pixel || [];
  };

  if (!adsData || adsData.length === 0) {
    return <NoAd />;
  }

  return (
    <div>
      <div className="relative flex">
        <div className="flex-grow overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="w-5 select-none ">
                  <Checkbox
                    checked={selectAll}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead className="w-20 select-none border-r">
                  <div className="flex items-center">Off/On</div>
                </TableHead>
                <TableHead className="text-lg font-medium min-w-[200px] select-none border-r">
                  <div className=" overflow-hidden">Ads</div>
                </TableHead>
                {customColumn.map((col, idx) => (
                  <TableHead
                    key={idx}
                    className={`font-bold text-xs select-none ${
                      idx !== customColumn.length - 1 ? "border-r" : ""
                    }`}
                  >
                    <div className="resize-x overflow-hidden min-w-[120px]">
                      {col}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {adsData.map((ads, idx) => (
                <TableRow
                  key={idx}
                  className={`h-5 group transition-colors ${
                    adsSelectedBar?.includes(ads.adId)
                      ? "bg-green-100 hover:bg-green-50"
                      : " hover:bg-gray-50 "
                  }`}
                >
                  <TableCell className="w-5 ">
                    <Checkbox
                      checked={selectedAds[ads.adId] || false}
                      onCheckedChange={(checked) =>
                        handleSelectSingle(ads.adId, checked)
                      }
                    />
                  </TableCell>
                  <TableCell className="w-20 border-r">
                    <Switch
                      checked={ads.status === "ACTIVE"}
                      onCheckedChange={(checked) =>
                        handleStatusChange(
                          ads.adId,
                          checked ? "ACTIVE" : "PAUSED"
                        )
                      }
                    />
                  </TableCell>
                  <TableCell className="max-w-[300px] border-r">
                    <div className="flex items-center space-x-3">
                      <div
                        className="relative cursor-pointer"
                        onMouseEnter={() => setPreviewImage(ads)}
                      >
                        <img
                          src={ads.creative && ads.creative.thumbnailUrl}
                          alt={ads.adName}
                          className="h-8 max-w-8 object-cover rounded hover:ring-2 hover:ring-blue-500"
                        />
                      </div>
                      <span
                        className="text-sm min-w-[170px] group relative"
                        title={`Edit ${ads.adName}`}
                      >
                        {editingAdId === ads.adId ? (
                          <div className="flex flex-col space-y-2">
                            <input
                              type="text"
                              value={editingName}
                              onChange={(e) => setEditingName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  handleNameUpdate(ads.adId, editingName);
                                }
                                if (e.key === "Escape") {
                                  handleCancel();
                                }
                              }}
                              className="border rounded px-2 py-1 w-full font-normal focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              autoFocus
                              placeholder="Enter new ad name"
                            />
                            <div className="flex space-x-2">
                              <button
                                onClick={handleCancel}
                                className="w-1/2 border rounded py-1 text-sm hover:bg-gray-100"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() =>
                                  handleNameUpdate(ads.adId, editingName)
                                }
                                className="w-1/2 bg-blue-500 text-white rounded py-1 text-sm hover:bg-blue-600"
                              >
                                Save
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <p className="truncate max-w-[150px]">
                              {ads.adName}
                            </p>
                            <Pen
                              size={14}
                              className="opacity-0 group-hover:opacity-100 cursor-pointer text-blue-500"
                              onClick={() => {
                                setEditingAdId(ads.adId);
                                setEditingName(ads.adName);
                              }}
                            />
                          </div>
                        )}
                      </span>
                    </div>
                  </TableCell>
                  {customColumn.map((col, idx) => {
                    const value = (() => {
                      switch (col) {
                        case "Ad ID":
                          return ads.adId;
                        case "Ad name":
                          return ads.adName;
                        case "Ad Set Name":
                          return ads.adSetName;
                        case "Amount spent":
                          return ads.metrics?.spend || 0;
                        case "Ad set ID":
                          return ads.adSetId;
                        case "Campaign ID":
                          return ads.campaignId;
                        case "Budget":
                          if (ads.objective === "OUTCOME_ENGAGEMENT") {
                            return "Using campaign budget";
                          }
                          return ads.dailyBudget
                            ? formatCurrency(ads.dailyBudget)
                            : "—";

                        case "URL parameters":
                          return ads.creative?.urlTags;
                        case "Audience location (Ad set settings)":
                          return "NG";
                        case "Objective":
                          return ads.objective?.substring(8).toLowerCase();
                        case "Meta Pixel": {
                          const pixels = getFbPixel(ads.trackingSpecs);
                          return (
                            <div className="flex flex-wrap gap-1">
                              {pixels.length > 0 ? (
                                pixels.map((pixel, index) => (
                                  <span key={index}>(ID:{pixel})</span>
                                ))
                              ) : (
                                <span className="text-gray-400">—</span>
                              )}
                            </div>
                          );
                        }
                        case "Preview link":
                          return ads.preview_shareable_link;
                        case "Link (ad settings)":
                          return (
                            ads.creative?.objectStorySpec?.link_data?.link ||
                            "—"
                          );
                        case "Campaign name":
                          return ads.campaignName || "—";
                        case "Delivery":
                          return (
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-2 h-2 rounded-full ${
                                  ads.campaignStatus === "PAUSED"
                                    ? "bg-gray-400"
                                    : ads.status === "ACTIVE"
                                    ? "bg-green-500"
                                    : "bg-gray-400"
                                }`}
                              ></div>
                              <span>
                                {ads.campaignStatus === "PAUSED"
                                  ? "Campaign off"
                                  : ads.status === "ACTIVE"
                                  ? "Active"
                                  : "Paused"}
                              </span>
                            </div>
                          );
                        default: {
                          const normalizedKey = col
                            .toLowerCase()
                            .replace(/\s+/g, "");
                          return ads[normalizedKey] || "—";
                        }
                      }
                    })();

                    return (
                      <TableCell
                        key={idx}
                        className={`font-sans text-xs max-w-[120px] ${
                          idx !== customColumn.length - 1 ? "border-r" : ""
                        }`}
                      >
                        <div className="truncate">
                          {value !== undefined ? value : "—"}
                        </div>
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {previewImage && (
          <div
            className="fixed left-48 top-1/4 bg-white shadow-lg rounded-lg p-4 max-h-[350px]  overflow-hidden h-full mx-4 border border-gray-200 w-full max-w-[350px] z-10"
            onMouseLeave={() => setPreviewImage(null)}
          >
            <div className="space-y-4 h-[300px]">
              <img
                src={
                  (previewImage.creative && previewImage.creative?.imageUrl) ||
                  previewImage.creative?.thumbnailUrl
                }
                alt={previewImage.adName}
                className="w-full h-[250px] object-cover object-center bg-gray-50 rounded"
              />
              <div className="space-y-2">
                <h3 className="font-medium text-sm">{previewImage.adName}</h3>
                {getAdLink(previewImage) && (
                  <div className="mt-2 p-2 bg-gray-50 rounded">
                    <div className="flex items-center gap-2 text-blue-600">
                      <Link size={14} />
                      <a
                        href={previewImage.preview_shareable_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs break-all hover:underline"
                      >
                        {previewImage.preview_shareable_link}
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Ads;
