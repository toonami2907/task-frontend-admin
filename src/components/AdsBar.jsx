/* eslint-disable react/prop-types */
import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ErrorToast } from "@/hooks/customToast";
import { API_URL, useGlobalContext } from "@/functions/features/StateProvider";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import toast from "react-hot-toast";
import axios from "axios";
import StyledDropdown from "./StyledDropdown";
import DeliveryBar from "./DeliveryBar";
import { Loader2, Pen } from "lucide-react";
import NoAds from "@/components/NoAds"; // Assuming NoAds is located here
import Campaign from "./Campaign";
import Ads from "./Ads";
import AdsCalendarDialog from "./AdsCalendarDialog";
import SearchBar2 from "./SearchBar2";

import AdSetBudgetEditor from "./AdSetBudgetEditor";
import { formatCurrency } from "@/hooks/func";
import { formatDate } from "@/functions/resources";
import SelectState from "@/components/SelectState";

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
  const { state, customColumn, activeFilters, fetchAds } = useGlobalContext();
  const [originalData, setOriginalData] = useState([]);
  const [editingAdSetId, setEditingAdSetId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [isFilterLoading, setIsFilterLoading] = useState(false);
  const [isCampaignFilterLoading, setIsCampaignFilterLoading] = useState(false);
  const [editingBudgetAdSetId, setEditingBudgetAdSetId] = useState(null);
  const [disableState, setDisableState] = useState("");
  const [adsSelectedBar, setAdsSelectedBar] = useState([]);

  const LoadingSpinner = () => (
    <div className="flex items-center justify-center w-full py-8">
      <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
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
        let endpoint = "";
        switch (state) {
          case "Campaign":
            endpoint = `${API_URL}/auth/db/campaigns`;
            break;
          case "Ads Set":
            endpoint = `${API_URL}/auth/db/ads_set`;
            break;
          case "Ads":
            endpoint = `${API_URL}/auth/db/ads`;
            break;
          default:
            endpoint = `${API_URL}/auth/db/campaigns`;
            break;
        }
        const response = await axios.get(endpoint, { withCredentials: true });
        setOriginalData(response.data);
        setFetchData(response.data);
      } catch (error) {
        console.log(error.message);
        toast.error("Error fetching dashboards data", {
          position: "top-right",
          duration: 5000,
        });
      } finally {
        setIsLoading(false);
      }
    };

    FetchDashboardStats();
  }, [state]);

  const handleAdSetNameUpdate = async (adSetId, newName) => {
    try {
      const response = await axios.post(`${API_URL}/auth/update/ads_set`, {
        adSetId,
        newName,
      });

      if (response.status === 200) {
        setFetchData((prevData) =>
          prevData.map((adset) =>
            adset.adSetId === adSetId ? { ...adset, adSetName: newName } : adset
          )
        );
        toast.success("Ad Set name updated successfully", {
          position: "bottom-right",
          duration: 3000,
        });
        fetchAds();
      }
      setEditingAdSetId(null);
    } catch (error) {
      toast.error("Failed to update ad set name", {
        position: "bottom-right",
        duration: 3000,
      });
    }
  };
  const handleAdSetStatusChange = async (adSetId, currentStatus) => {
    const newStatus = currentStatus === "ACTIVE" ? "PAUSED" : "ACTIVE";

    try {
      const endpoint = `${API_URL}/auth/pause/Adset/${adSetId}`;
      await axios.post(
        endpoint,
        { status: newStatus },
        { withCredentials: true }
      );

      setFetchData((prevData) =>
        prevData.map((adSet) =>
          adSet.adSetId === adSetId ? { ...adSet, status: newStatus } : adSet
        )
      );

      toast.success(`Ad Set ${newStatus.toLowerCase()} successfully`, {
        position: "bottom-right",
        duration: 3000,
      });

      fetchAds();
    } catch (error) {
      toast.error(`Failed to update Ad Set status: ${error.message}`, {
        position: "bottom-right",
        duration: 3000,
      });
    }
  };

  const getAdLink = (ad) =>
    ad?.creative?.objectStorySpec?.link_data?.link || null;

  const fetchCampaignId = async (campaignId) => {
    try {
      const response = await axios.get(
        `${API_URL}/auth/campaign/${campaignId}`,
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      console.log(error.message);
    }
  };

  const fetchAdsSetById = async (adSetId) => {
    try {
      const response = await axios.get(`${API_URL}/auth/adsset/${adSetId}`, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      console.log(error.message);
      toast.error("Error while fetching campaign data", {
        position: "top-right",
        duration: 5000,
      });
    }
  };

  useEffect(() => {
    const fetchCampaignNames = async () => {
      setIsLoading(true);
      try {
        const campaignData = await Promise.all(
          fetchedData.map(async (ads) => {
            const campaign = await fetchCampaignId(ads.campaignId);
            return {
              campaignId: ads.campaignId,
              campaignName: campaign.campaignName,
            };
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

    if (fetchedData.length > 0) {
      fetchCampaignNames();
    }
  }, [fetchedData]);

  const FetchAdsById = async (adId) => {
    try {
      const response = await axios.get(`${API_URL}/auth/ads/${adId}`, {
        withCredentials: true,
      });
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

            // Return early if no ads found
            if (!response?.ads?.length) {
              return [];
            }

            const ads = await Promise.all(
              response.ads.map(async (ad) => {
                const adId = typeof ad === "object" ? ad.adId : ad;
                const adData = await FetchAdsById(adId);
                // Parse the JSON if it's a string
                return typeof adData === "string" ? JSON.parse(adData) : adData;
              })
            );

            return ads.filter(Boolean);
          })
        );

        // Directly set the flattened and filtered new data
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

  const adsData = (() => {
    if (selectedBar?.length > 0) {
      return selectedAds;
    }

    return originalData;
  })();

  useEffect(() => {
    let currentData = originalData;

    // First filter by selected campaigns if in Ad Set view
    if (state === "Ads Set" && SelectedCamapiagn?.length) {
      currentData = currentData.filter((adSet) =>
        SelectedCamapiagn.includes(adSet.campaignId)
      );
    }

    // Then apply active filters
    if (activeFilters?.length) {
      const adsetFilters = activeFilters.filter(
        (rule) => rule.field === "adset_name"
      );

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

    // Use requestAnimationFrame for smoother transitions
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
      // Define only the columns you want to show for Ad Sets
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

    // Return all columns for other views (like Ads view)
    return customColumn;
  };
  const getValue = (adsset, col) => {
    switch (col) {
      case "Ad Set ID":
        return adsset.adSetId;
      case "Ad Set Name":
        // Already handled in the main name column
        return "—";
      case "Campaign ID":
        return adsset.campaignId;
      case "Audience location (Ad set settings)":
        return adsset.targeting?.geo_locations?.countries[0] || "—";
      case "Schedule":
        return adsset.start_time
          ? `${formatDate(adsset.start_time)} - Ongoing`
          : "—";
      case "Campaign Name":
        return campaignNames[adsset.campaignId] || "—";
      case "Budget":
        return editingBudgetAdSetId === adsset.adSetId ? (
          <AdSetBudgetEditor
            initialBudget={adsset.dailyBudget?.toString() || ""}
            adSetId={adsset.adSetId}
            // campaignId={adsset.campaignId}
            onClose={() => setEditingBudgetAdSetId(null)}
            onSuccess={(newBudget) => {
              setFetchData((prevData) =>
                prevData.map((set) =>
                  set.adSetId === adsset.adSetId
                    ? { ...set, dailyBudget: newBudget }
                    : set
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
              ) && <span className="text-gray-500">Daily</span>}
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
        return "—"; // Not available at Ad Set level
      case "Amount spent":
        return "—"; // Not available at Ad Set level
      case "Bid strategy":
        return adsset.bidStrategy?.toLowerCase(); // Not available at Ad Set level
      case "Ends":
        return "—"; // Not available at Ad Set level
      case "Last significant edit":
        return "—"; // Not available at Ad Set level
      case "Ad ID":
        return "—"; // Not available at Ad Set level
      case "Objective":
        return adsset.objective?.substring(8).toLowerCase() || "—";
      case "Meta Pixel":
        return "—"; // Not available at Ad Set level
      case "Preview link":
        return "—"; // Not available at Ad Set level
      case "URL parameters":
        return "—"; // Not available at Ad Set level
      case "Link (ad settings)":
        return "—"; // Not available at Ad Set level
      default: {
        const normalizedKey = col.toLowerCase().replace(/\s+/g, "");
        // By default, show dash for most fields unless explicitly handled above
        return "—";
      }
    }
  };
  const handleStateStatus = async (action) => {
    const statusMap = {
      Campaign: {
        ids: SelectedCamapiagn,
        endpoint: `${API_URL}/auth/pause/status/campaigns`,
        idField: "campaignIds",
        entityName: "Campaign",
      },
      "Ads Set": {
        ids: selectedBar,
        endpoint: `${API_URL}/auth/pause/status/AdSets`,
        idField: "adSetIds",
        entityName: "Ads set",
      },
      Ads: {
        ids: adsSelectedBar,
        endpoint: `${API_URL}/auth/pause/status/Ads`,
        idField: "adIds",
        entityName: "Ads",
      },
    };

    const entityConfig = statusMap[state];
    if (!entityConfig) return;

    if (!entityConfig.ids?.length) {
      ErrorToast(`Please select ${entityConfig.entityName}(s) first`);
      return;
    }

    try {
      const status = action === "On" ? "ACTIVE" : "PAUSED";
      const payload = {
        status,
        [entityConfig.idField]: entityConfig.ids,
      };

      const response = await axios.post(entityConfig.endpoint, payload);

      if (response.status === 200) {
        toast.success(
          `${
            entityConfig.entityName
          } status changed to ${status.toLowerCase()} successfully`
        );
        setDisableState("");
        fetchAds();
      }
    } catch (error) {
      toast.error(
        `Error changing ${entityConfig.entityName.toLowerCase()} status: ${
          error.message
        }`
      );
      console.error(`Error while changing ${entityConfig.entityName}:`, error);
    }
  };

  //  if(state === 'Campaign'){
  //      console.log('Campaign', SelectedCamapiagn)
  //   } else if(state === 'Ads Set'){
  //      console.log('Ads set ', selectedBar)
  //   }else if (state === 'Ads'){
  //     console.log('Ads', adsSelectedBar)
  //   }

  return (
    <div className="w-full py-4 bg-inherit px-0 font-sans">
      {/* Top Navigation */}
      <div className="flex  items-center justify-between mb-2  px-5 pb-2">
        <div className="flex items-center w-full gap-2">
          <SelectState
            state={disableState}
            setState={setDisableState}
            handleStateStatus={handleStateStatus}
          />
          <SearchBar2 />
        </div>
        <div className="flex items-center justify-end gap-2 w-full">
          <AdsCalendarDialog />
          <StyledDropdown />
          <DeliveryBar />
        </div>
      </div>

      {/* Table View with Loading State */}
      {isLoading ? (
        <LoadingSpinner />
      ) : hasData(originalData) ? (
        <Table>
          {state === "Campaign" && (
            <Campaign
              fetchedData={originalData}
              SetCamapiagn={SetCamapiagn}
              SelectedCamapiagn={SelectedCamapiagn}
              customColumn={customColumn}
            />
          )}
          {state === "Ads Set" && (
            <>
              <TableHeader>
                <TableRow className="bg-gray-50 h-10">
                  <TableHead className="w-12 p-2 select-none">
                    <Checkbox
                      checked={
                        fetchedData.length > 0 &&
                        selectedBar?.length === fetchedData.length
                      }
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedBar(
                            fetchedData.map((adsset) => adsset.adSetId)
                          );
                        } else {
                          setSelectedBar([]);
                        }
                      }}
                    />
                  </TableHead>
                  <TableHead className="w-20 p-2 select-none border-r">
                    <div className="flex items-center">Off/On</div>
                  </TableHead>
                  <TableHead className="text-lg font-medium p-2 min-w-[60px] select-none border-r">
                    <div className="">Ad Sets</div>
                  </TableHead>
                  {getVisibleColumns().map((col, idx) => (
                    <TableHead
                      key={idx}
                      className={`font-bold text-xs select-none ${
                        idx !== getVisibleColumns().length - 1 ? "border-r" : ""
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
                {fetchedData.map((adsset, idx) => (
                  <TableRow
                    key={idx}
                    className={`h-5 transition-colors ${
                      selectedBar?.includes(adsset.adSetId)
                        ? "bg-green-100 hover:bg-green-50" // Selected state
                        : "hover:bg-gray-50 h-5  transition-colors" // Default hover state
                    }`}
                    // className=""
                  >
                    <TableCell className="p-2 w-12 ">
                      <Checkbox
                        checked={selectedBar?.includes(adsset.adSetId) || false}
                        onCheckedChange={() => {
                          setSelectedBar((prev) => {
                            const exists = prev?.some(
                              (item) => item === adsset.adSetId
                            );
                            if (exists) {
                              return prev.filter(
                                (item) => item !== adsset.adSetId
                              );
                            }
                            return [...(prev || []), adsset.adSetId];
                          });
                        }}
                      />
                    </TableCell>
                    <TableCell className="p-2 w-20 border-r">
                      <Switch
                        checked={adsset.status === "ACTIVE"}
                        onCheckedChange={() =>
                          handleAdSetStatusChange(adsset.adSetId, adsset.status)
                        }
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
                                if (e.key === "Enter") {
                                  handleAdSetNameUpdate(
                                    adsset.adSetId,
                                    editingName
                                  );
                                }
                                if (e.key === "Escape") {
                                  handleCancel();
                                }
                              }}
                              className="border rounded px-2 py-1 w-full font-normal focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              autoFocus
                              placeholder="Enter new ad set name"
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
                                  handleAdSetNameUpdate(
                                    adsset.adSetId,
                                    editingName
                                  )
                                }
                                className="w-1/2 bg-blue-500 text-white rounded py-1 text-sm hover:bg-blue-600"
                              >
                                Save
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 group">
                            <p className="truncate max-w-[200px]">
                              {adsset.adSetName}
                            </p>
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
                        {adsset.ads && (
                          <p className="text-xs text-blue-900">
                            {adsset.ads.length} ads
                          </p>
                        )}
                      </div>
                    </TableCell>

                    {getVisibleColumns().map((col, idx) => (
                      <TableCell
                        key={idx}
                        className={`font-sans text-xs p-2 min-w-[120px] ${
                          idx !== getVisibleColumns().length - 1
                            ? "border-r"
                            : ""
                        }`}
                      >
                        <div className="truncate">{getValue(adsset, col)}</div>
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </>
          )}
          {state === "Ads" && (
            <Ads
              adsData={adsData}
              customColumn={customColumn}
              getAdLink={getAdLink}
              previewImage={previewImage}
              setPreviewImage={setPreviewImage}
              adsSelectedBar={adsSelectedBar}
              setAdsSelectedBar={setAdsSelectedBar}
            />
          )}
        </Table>
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
