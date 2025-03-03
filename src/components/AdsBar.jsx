/* eslint-disable react/prop-types */
import React, { useEffect, useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ErrorToast } from "@/hooks/customToast";
import { cn } from "@/lib/utils";
import {
  API_URL,
  useGlobalContext,
} from "@/functions/features/StateProvider";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import toast from "react-hot-toast";
import StyledDropdown from "./StyledDropdown";
import DeliveryBar from "./DeliveryBar";
import { Loader2, Pen, ChevronLeft, ChevronRight } from "lucide-react";
import NoAds from "@/components/NoAds";
import Campaign from "./Campaign";
import Ads from "./Ads";
import AdsCalendarDialog from "./AdsCalendarDialog";
import SearchBar2 from "./SearchBar2";
import AdSetBudgetEditor from "./AdSetBudgetEditor";
import { formatCurrency } from "@/hooks/func";
import { formatDate } from "@/functions/resources";
import SelectState from "@/components/SelectState";
import api from "@/functions/resources/axiosConfig";
import { ResizableTable } from "./ResizableTable";
import { Button } from "./ui/button";

const AdsManager = ({
  selectedBar,
  setSelectedBar,
  SelectedCamapiagn,
  SetCamapiagn,
}) => {
  const [campaignNames, setCampaignNames] = useState({});
  const [fetchedData, setFetchData] = useState([]);
  const [selectedAds, setSelectedAds] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { state, customColumn, adsData, loading, activeFilters, fetchAds } = useGlobalContext();
  const [originalData, setOriginalData] = useState([]);
  const [editingAdSetId, setEditingAdSetId] = useState(null);
  const [campaignLoading, setCampaignLoading] = useState(false);
  const [adsLoading, setAdsLoading] = useState(false);
  const [editingName, setEditingName] = useState("");
  const [updatingSwitches, setUpdatingSwitches] = useState(new Set());
  const [isCampaignFilterLoading, setIsCampaignFilterLoading] = useState(false);
  const [editingBudgetAdSetId, setEditingBudgetAdSetId] = useState(null);
  const [disableState, setDisableState] = useState("");
  const [adsSelectedBar, setAdsSelectedBar] = useState([]);

  // Individual pagination states for each view
  const [pagination, setPagination] = useState({
    Campaign: { currentPage: 1, totalItems: 0 },
    "Ads Set": { currentPage: 1, totalItems: 0 },
    Ads: { currentPage: 1, totalItems: 0 }
  });
  const itemsPerPage = 10; // Fixed limit, could be made configurable

  const LoadingSpinner = () => (
    <div className="flex flex-col items-center justify-center w-full py-8 space-y-2">
      <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      <p className="text-sm text-gray-600">Loading {state.toLowerCase()} data...</p>
    </div>
  );

  const handleCancel = () => {
    setEditingAdSetId(null);
    setEditingName("");
  };

  useEffect(() => {
    const FetchDashboardStats = async () => {
      setIsLoading(true);
      try {
        let endpoint = state === "Campaign" ? `/auth/db/campaigns` : state === "Ads Set" ? `/auth/db/ads_set` : `/auth/db/ads`;
        const response = await api.get(endpoint, { 
          withCredentials: true,
          params: { 
            page: pagination[state].currentPage, 
            limit: itemsPerPage 
          }
        });
        setOriginalData(response.data.data);
        setFetchData(response.data.data);
        setPagination(prev => ({
          ...prev,
          [state]: { ...prev[state], totalItems: response.data.pagination.totalItems || 0 }
        }));
      } catch (error) {
        console.log(error.message);
        toast.error(`Error fetching ${state.toLowerCase()} data`, { position: "top-right", duration: 5000 });
      } finally {
        setIsLoading(false);
      }
    };

    FetchDashboardStats();
  }, [state, pagination[state].currentPage]); // Re-fetch when state or its currentPage changes

  const handleAdSetNameUpdate = async (adSetId, newName) => {
    try {
      const response = await api.post(`/auth/update/ads_set`, { adSetId, newName });
      if (response.status === 200) {
        setFetchData((prevData) =>
          prevData.map((adset) =>
            adset.adSetId === adSetId ? { ...adset, adSetName: newName } : adset
          )
        );
        toast.success("Ad Set name updated successfully", { position: "bottom-right", duration: 3000 });
        fetchAds();
      }
      setEditingAdSetId(null);
    } catch (error) {
      toast.error("Failed to update ad set name", { position: "bottom-right", duration: 3000 });
    }
  };

  const handleAdSetStatusChange = async (adSetId, currentStatus) => {
    const newStatus = currentStatus === "ACTIVE" ? "PAUSED" : "ACTIVE";
    try {
      const endpoint = `/auth/pause/Adset/${adSetId}`;
      await api.post(endpoint, { status: newStatus }, { withCredentials: true });
      setFetchData((prevData) =>
        prevData.map((adSet) =>
          adSet.adSetId === adSetId ? { ...adSet, status: newStatus } : adSet
        )
      );
      toast.success(`Ad Set ${newStatus.toLowerCase()} successfully`, { position: "bottom-right", duration: 3000 });
      fetchAds();
    } catch (error) {
      toast.error(`Failed to update Ad Set status: ${error.message}`, { position: "bottom-right", duration: 3000 });
    }
  };

  const getAdLink = (ad) => ad?.creative?.objectStorySpec?.link_data?.link || null;

  const fetchCampaignId = async (campaignId) => {
    try {
      const response = await api.get(`/auth/campaign/${campaignId}`, { withCredentials: true });
      return response.data;
    } catch (error) {
      console.log(error.message);
    }
  };

  const fetchAdsSetById = async (adSetId) => {
    try {
      const response = await api.get(`/auth/adsset/${adSetId}`, { withCredentials: true });
      return response.data;
    } catch (error) {
      console.log(error.message);
      toast.error("Error while fetching campaign data", { position: "top-right", duration: 5000 });
    }
  };

  useEffect(() => {
    const fetchCampaignNames = async () => {
      setIsLoading(true);
      try {
        const campaignData = await Promise.all(
          fetchedData.map(async (ads) => {
            const campaign = await fetchCampaignId(ads.campaignId);
            return { campaignId: ads.campaignId, campaignName: campaign.campaignName };
          })
        );
        const campaignMap = campaignData.reduce((acc, campaign) => {
          acc[campaign.campaignId] = campaign.campaignName;
          return acc;
        }, {});
        setCampaignNames(campaignMap);
      } catch (error) {
        console.error("Error fetching campaign names:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (fetchedData.length > 0) fetchCampaignNames();
  }, [fetchedData]);

  const FetchAdsById = async (adId) => {
    try {
      const response = await api.get(`/auth/ads/${adId}`, { withCredentials: true });
      return response.data;
    } catch (error) {
      console.log(error.message);
      toast.error("Error while fetching ads data");
    }
  };

  useEffect(() => {
    const FetchArrayData = async () => {
      setIsLoading(true);
      try {
        if (!selectedBar?.length) {
          setSelectedAds([]);
          return;
        }

        const newAdsData = await Promise.all(
          selectedBar.map(async (adSetId) => {
            const response = await fetchAdsSetById(adSetId);
            if (!response?.ads?.length) return [];
            const ads = await Promise.all(
              response.ads.map(async (ad) => {
                const adId = typeof ad === "object" ? ad.adId : ad;
                const adData = await FetchAdsById(adId);
                return typeof adData === "string" ? JSON.parse(adData) : adData;
              })
            );
            return ads.filter(Boolean);
          })
        );
        setSelectedAds(newAdsData.flat());
      } catch (error) {
        console.error("Error in FetchArrayData:", error);
        toast.error("Error fetching ads data");
      } finally {
        setIsLoading(false);
      }
    };

    FetchArrayData();
  }, [selectedBar]);

  const hasData = (data) => Array.isArray(data) && data.length > 0;

  const effectiveAdsData = useMemo(() => {
    return selectedBar?.length > 0 ? selectedAds : adsData || originalData;
  }, [selectedBar, selectedAds, adsData, originalData]);

  useEffect(() => {
    let currentData = originalData;

    if (state === "Ads Set" && SelectedCamapiagn?.length) {
      currentData = currentData.filter((adSet) =>
        SelectedCamapiagn.includes(adSet.campaignId)
      );
    }

    if (activeFilters?.length) {
      const adsetFilters = activeFilters.filter((rule) => rule.field === "adset_name");
      if (adsetFilters.length) {
        currentData = currentData.filter((adsset) => {
          return adsetFilters.every((rule) => {
            const adsetName = (adsset.adSetName || "").trim().toLowerCase();
            const searchValue = (rule.value || "").trim().toLowerCase();
            if (!searchValue) return true;
            switch (rule.condition) {
              case "Contains":
                return adsetName.includes(searchValue);
              case "Doesn`t contain":
                return !adsetName.includes(searchValue);
              default:
                return true;
            }
          });
        });
      }
    }

    setFetchData(currentData);
  }, [activeFilters, originalData, state]);

  useEffect(() => {
    if (state !== "Ads Set") return;

    setIsCampaignFilterLoading(true);
    const filterTimeout = requestAnimationFrame(() => {
      try {
        let filteredData = originalData;
        if (SelectedCamapiagn?.length) {
          filteredData = originalData.filter((adSet) =>
            SelectedCamapiagn.includes(adSet.campaignId)
          );
        }
        setFetchData(filteredData);
      } finally {
        setIsCampaignFilterLoading(false);
      }
    });

    return () => cancelAnimationFrame(filterTimeout);
  }, [SelectedCamapiagn, originalData, state]);

  const getVisibleColumns = () => {
    if (state === "Ads Set") {
      const allowedColumns = [
        "Delivery",
        "Budget",
        "Impressions",
        "Reach",
        "Results",
        "Amount spent",
        "Included custom audiences",
        "Excluded custom audiences",
        "Audience location (Ad set settings)",
        "Bid strategy",
        "Schedule",
        "Last significant edit",
        "Attribution setting",
        "Cost per result",
        "Ends",
        "Cost per 1,000 Accounts Center accounts reached",
        "CPM (cost per 1,000 impressions)",
        "Page engagement",
        "Post reactions",
        "Post comments",
        "Post saves",
        "Post shares",
        "Link clicks",
        "Follows or likes",
        "CPC (cost per link click)",
      ];
      return customColumn.filter((col) => allowedColumns.includes(col));
    }
    return customColumn;
  };

  const getValue = (adsset, col) => {
    switch (col) {
      case "Ad Set ID":
        return adsset.adSetId;
      case "Ad Set Name":
        return "—";
      case "Campaign ID":
        return adsset.campaignId;
      case "Audience location (Ad set settings)":
        return adsset.targeting?.geo_locations?.countries[0] || "—";
      case "Schedule":
        return adsset.start_time ? `${formatDate(adsset.start_time)} - Ongoing` : "—";
      case "Campaign Name":
        return campaignNames[adsset.campaignId] || "—";
      case "Budget":
        return editingBudgetAdSetId === adsset.adSetId ? (
          <AdSetBudgetEditor
            initialBudget={adsset.dailyBudget?.toString() || ""}
            adSetId={adsset.adSetId}
            onClose={() => setEditingBudgetAdSetId(null)}
            onSuccess={(newBudget) => {
              setFetchData((prevData) =>
                prevData.map((set) =>
                  set.adSetId === adsset.adSetId ? { ...set, dailyBudget: newBudget } : set
                )
              );
              toast.success("Ad set budget updated successfully");
            }}
          />
        ) : (
          <div
            className="group flex items-center gap-2 cursor-pointer"
            onClick={() => setEditingBudgetAdSetId(adsset.adSetId)}
          >
            <div className="text-xs flex flex-col">
              <span>
                {adsset.campaignObjective === "OUTCOME_TRAFFIC" ||
                adsset.campaignObjective === "OUTCOME_ENGAGEMENT"
                  ? "Using campaign budget"
                  : adsset.dailyBudget
                  ? `${formatCurrency(adsset.dailyBudget)}`
                  : "—"}
              </span>
              {!(
                adsset.campaignObjective === "OUTCOME_TRAFFIC" ||
                adsset.campaignObjective === "OUTCOME_ENGAGEMENT"
              ) && <span className="text-color">Daily</span>}
            </div>
            {!(
              adsset.campaignObjective === "OUTCOME_TRAFFIC" ||
              adsset.campaignObjective === "OUTCOME_ENGAGEMENT"
            ) && (
              <Pen
                size={14}
                className="opacity-0 group-hover:opacity-100 text-blue-500"
              />
            )}
          </div>
        );
      case "Delivery":
        return (
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                adsset.campaignStatus === "PAUSED"
                  ? "bg-gray-400"
                  : adsset.status === "ACTIVE"
                  ? "bg-green-500"
                  : "bg-gray-400"
              }`}
            ></div>
            <span>
              {adsset.campaignStatus === "PAUSED"
                ? "Campaign off"
                : adsset.status === "ACTIVE"
                ? "Active"
                : "Paused"}
            </span>
          </div>
        );
      case "Impressions":
        return adsset.impression || 0;
      case "Reach":
        return adsset.reach || "—";
      case "Results":
        return "—";
      case "Amount spent":
        return "—";
      case "Bid strategy":
        return adsset.bidStrategy?.toLowerCase();
      case "Ends":
        return "—";
      case "Last significant edit":
        return "—";
      case "Ad ID":
        return "—";
      case "Objective":
        return adsset.objective?.substring(8).toLowerCase() || "—";
      case "Meta Pixel":
        return "—";
      case "Preview link":
        return "—";
      case "URL parameters":
        return "—";
      case "Link (ad settings)":
        return "—";
      default:
        return "—";
    }
  };

  const handleStateStatus = async (action) => {
    const statusMap = {
      Campaign: {
        ids: SelectedCamapiagn,
        endpoint: `/auth/pause/status/campaigns`,
        idField: "campaignIds",
        entityName: "Campaign",
        idKey: "campaignId",
      },
      "Ads Set": {
        ids: selectedBar,
        endpoint: `/auth/pause/status/AdSets`,
        idField: "adSetIds",
        entityName: "Ads set",
        idKey: "adSetId",
      },
      Ads: {
        ids: adsSelectedBar,
        endpoint: `/auth/pause/status/Ads`,
        idField: "adIds",
        entityName: "Ads",
        idKey: "adId",
      },
    };

    const entityConfig = statusMap[state];
    if (!entityConfig) {
      setAdsLoading(!adsLoading);
      return;
    }

    if (entityConfig.entityName === "Ads") {
      setAdsLoading(true);
    }

    if (!entityConfig.ids?.length) {
      ErrorToast(`Please select ${entityConfig.entityName}(s) first`);
      return;
    }

    console.log("action", action);
    const status = action === "On" ? "ACTIVE" : "PAUSED";
    setDisableState(action);

    try {
      const payload = { status, [entityConfig.idField]: entityConfig.ids };
      const response = await api.post(entityConfig.endpoint, payload);

      if (response.status === 200) {
        fetchAds();
        toast.success(
          `${entityConfig.entityName} status changed to ${status.toLowerCase()} successfully`
        );
        if (entityConfig.entityName === "Ads") setAdsLoading(false);
      }
    } catch (error) {
      setDisableState(action === "On" ? "Off" : "On");
      if (entityConfig.entityName === "Ads") setAdsLoading(false);
      toast.error(`Error changing ${entityConfig.entityName.toLowerCase()} status: ${error.message}`);
    } finally {
      setDisableState("");
    }
  };

  // Pagination handlers for the current state
  const totalPages = Math.ceil(pagination[state].totalItems / itemsPerPage);

  const handlePreviousPage = () => {
    if (pagination[state].currentPage > 1) {
      setPagination(prev => ({
        ...prev,
        [state]: { ...prev[state], currentPage: prev[state].currentPage - 1 }
      }));
    }
  };

  const handleNextPage = () => {
    if (pagination[state].currentPage < totalPages) {
      setPagination(prev => ({
        ...prev,
        [state]: { ...prev[state], currentPage: prev[state].currentPage + 1 }
      }));
    }
  };

  return (
    <div className="w-full py-4 bg-inherit px-0 font-sans">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-2">
        <div className="flex items-center gap-2 min-w-0">
          <SelectState
            state={disableState}
            setState={setDisableState}
            disableState={setDisableState}
            ads={adsSelectedBar}
            adset={selectedBar}
            campaign={SelectedCamapiagn}
            handleStateStatus={handleStateStatus}
          />
          <div className="max-w-[200px] sm:max-w-none">
            <SearchBar2 />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto sm:justify-end">
          <AdsCalendarDialog />
          <StyledDropdown />
          <DeliveryBar />
        </div>
      </div>

      {isLoading || loading ? (
        <LoadingSpinner />
      ) : hasData(state === "Ads" ? effectiveAdsData : originalData) ? (
        <>
          <Table className="min-w-[1000px]">
            {state === "Campaign" && (
              <Campaign
                fetchedData={originalData}
                SetCamapiagn={SetCamapiagn}
                SelectedCamapiagn={SelectedCamapiagn}
                customColumn={customColumn}
                isLoading={campaignLoading}
                disableState={disableState}
              />
            )}
            {state === "Ads Set" && (
              <ResizableTable className="adset-table">
                <TableHeader>
                  <TableRow className="bg-gray-50 h-10">
                    <TableHead className="w-[50px] min-w-[50px] select-none">
                      <Checkbox
                        checked={fetchedData.length > 0 && selectedBar?.length === fetchedData.length}
                        onCheckedChange={(checked) => {
                          setSelectedBar(checked ? fetchedData.map(adsset => adsset.adSetId) : []);
                        }}
                      />
                    </TableHead>
                    <TableHead className="w-[80px] min-w-[80px] select-none border-r">
                      <div className="flex text-xs font-bold items-center">status</div>
                    </TableHead>
                    <TableHead className="w-[200px] min-w-[400px] text-xs font-bold select-none border-r">
                      <div className="text-color">Ad Sets</div>
                    </TableHead>
                    {getVisibleColumns().map((col, idx) => (
                      <TableHead
                        key={idx}
                        className={`w-[180px] min-w-[180px] font-bold text-xs select-none ${idx !== getVisibleColumns().length - 1 ? "border-r" : ""}`}
                      >
                        <div className="text-color overflow-hidden">{col}</div>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fetchedData.map((adsset, idx) => (
                    <TableRow
                      key={idx}
                      className={cn("h-5 transition-colors", selectedBar?.includes(adsset.adSetId) ? "bg-green-100 hover:bg-green-50" : "hover:bg-gray-50")}
                    >
                      <TableCell className="p-2 w-12">
                        <Checkbox
                          checked={selectedBar?.includes(adsset.adSetId) || false}
                          onCheckedChange={() => {
                            setSelectedBar(prev =>
                              prev?.includes(adsset.adSetId)
                                ? prev.filter(item => item !== adsset.adSetId)
                                : [...(prev || []), adsset.adSetId]
                            );
                          }}
                        />
                      </TableCell>
                      <TableCell className="p-2 w-20 border-r">
                        <Switch
                          checked={updatingSwitches.has(adsset.adSetId) ? disableState === "On" : adsset.status === "ACTIVE"}
                          onCheckedChange={() => handleAdSetStatusChange(adsset.adSetId, adsset.status)}
                        />
                      </TableCell>
                      <TableCell className="font-semibold p-2 min-w-[200px] border-r">
                        <div className="space-y-1">
                          {editingAdSetId === adsset.adSetId ? (
                            <div className="flex flex-col space-y-2">
                              <input
                                type="text"
                                value={editingName}
                                onChange={(e) => setEditingName(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") handleAdSetNameUpdate(adsset.adSetId, editingName);
                                  if (e.key === "Escape") handleCancel();
                                }}
                                className="border rounded px-2 py-1 w-full font-normal focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                autoFocus
                                placeholder="Enter new ad set name"
                              />
                              <div className="flex space-x-2">
                                <button onClick={handleCancel} className="w-1/2 border rounded py-1 text-sm hover:bg-gray-100">Cancel</button>
                                <button onClick={() => handleAdSetNameUpdate(adsset.adSetId, editingName)} className="w-1/2 bg-blue-500 text-white rounded py-1 text-sm hover:bg-blue-600">Save</button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 group">
                              <p className="truncate max-w-[200px]">{adsset.adSetName}</p>
                              <Pen
                                size={14}
                                className="opacity-0 group-hover:opacity-100 cursor-pointer text-blue-500"
                                onClick={() => {
                                  setEditingAdSetId(adsset.adSetId);
                                  setEditingName(adsset.adSetName);
                                }}
                              />
                            </div>
                          )}
                          {adsset.ads && <p className="text-xs text-blue-900">{adsset.ads.length} ads</p>}
                        </div>
                      </TableCell>
                      {getVisibleColumns().map((col, idx) => (
                        <TableCell
                          key={idx}
                          className={cn("font-sans text-xs p-2 min-w-[120px]", idx !== getVisibleColumns().length - 1 ? "border-r" : "")}
                        >
                          <div className="truncate">{getValue(adsset, col)}</div>
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </ResizableTable>
            )}
            {state === "Ads" && (
              <Ads
                adsData={effectiveAdsData}
                customColumn={customColumn}
                getAdLink={getAdLink}
                previewImage={previewImage}
                setPreviewImage={setPreviewImage}
                adsSelectedBar={adsSelectedBar}
                setAdsSelectedBar={setAdsSelectedBar}
                isLoading={adsLoading}
                disableState={disableState}
              />
            )}
          </Table>

          {/* Pagination Controls */}
          <div className="flex items-center justify-between mt-4 px-2">
            <div className="text-sm text-gray-600">
              Showing {(pagination[state].currentPage - 1) * itemsPerPage + 1} - 
              {Math.min(pagination[state].currentPage * itemsPerPage, pagination[state].totalItems)} of {' '}
              {pagination[state].totalItems} items
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousPage}
                disabled={pagination[state].currentPage === 1 || isLoading}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <span className="text-sm text-gray-600">
                Page {pagination[state].currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={pagination[state].currentPage === totalPages || isLoading}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-col h-full items-center justify-center">
          {state === "Campaign" && <NoAds state={"Campaign"} />}
          {state === "Ads Set" && <NoAds state={"Ads set"} />}
          {state === "Ads" && <NoAds state={"Ads"} />}
        </div>
      )}
    </div>
  );
};

export default AdsManager;