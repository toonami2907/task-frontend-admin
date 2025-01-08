import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { API_URL, useGlobalContext } from "@/functions/features/StateProvider";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import toast from "react-hot-toast";
import axios from "axios";
import StyledDropdown from "./StyledDropdown";
import DeliveryBar from "./DeliveryBar";
import { Link, Loader2 } from "lucide-react";
import NoAds from "@/components/NoAds"; // Assuming NoAds is located here
import Campaign from "./Campaign";
import Ads from "./Ads";

const AdsManager = ({ selectedBar, setSelectedBar }) => {
  const [viewMode, setViewMode] = useState("table");
  const [campaignNames, setCampaignNames] = useState({});
  const [fetchedData, setFetchData] = useState([]);
  const [selectedAds, setSelectedAds] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { state, customColumn } = useGlobalContext();

  const LoadingSpinner = () => (
    <div className="flex items-center justify-center w-full py-8">
      <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
    </div>
  );

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

  const FetchSelectedTabs = async (tabs, adSetId) => {
    localStorage.setItem("selectedBar", tabs);
    if (tabs === "Ads set") {
      const data = await fetchAdsSetById(adSetId);
      return data;
    }
    return "No data available";
  };

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
            try {
              const response = await fetchAdsSetById(adSetId);
              if (!response?.ads?.length) return [];

              const ads = await Promise.all(
                response.ads.map(async (ad) => {
                  const adId = typeof ad === "object" ? ad.adId : ad;
                  return await FetchAdsById(adId);
                })
              );

              return ads.filter(Boolean);
            } catch (error) {
              console.error(
                `Error fetching data for adSetId ${adSetId}:`,
                error
              );
              return [];
            }
          })
        );

        setSelectedAds((prevAds) => {
          const validPrevAds = prevAds.filter(
            (ad) => ad?.adId && selectedBar.includes(ad.adSetId)
          );

          const validNewAds = newAdsData
            .flat()
            .filter(
              (ad) =>
                ad?.adId &&
                !validPrevAds.some((prevAd) => prevAd.adId === ad.adId)
            );

          return [...validPrevAds, ...validNewAds];
        });
      } catch (error) {
        console.error("Error in FetchArrayData:", error);
        toast.error("Error fetching ads data", {
          position: "top-right",
          duration: 5000,
        });
      } finally {
        setIsLoading(false);
      }
    };

    FetchArrayData();
  }, [selectedBar]);

  const hasData = (data) => Array.isArray(data) && data.length > 0;

  const adsData = selectedAds.length > 0 ? selectedAds : fetchedData;

  return (
    <div className="w-full py-4 bg-inherit px-0 font-sans">
      {/* Top Navigation */}
      <div className="flex items-center justify-between px-5 pb-2">
        <div />
        <div className="flex items-center justify-end space-x-4">
          <StyledDropdown />
          <DeliveryBar />
        </div>
      </div>

      {/* Table View with Loading State */}
      {isLoading ? (
        <LoadingSpinner />
      ) : hasData(adsData) ? (
        <Table>
          {/* Render table based on `state` */}
          {state === "Campaign" && <Campaign fetchedData={fetchedData} />}
          {state === "Ads Set" && (
            <>
              <TableHeader>
                <TableRow className="border h-10">
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
                  <TableHead className="w-20 p-2 select-none">
                    <div className="flex items-center resize-x overflow-hidden">
                      Off/On
                    </div>
                  </TableHead>
                  <TableHead className="text-lg font-medium p-2 min-w-[200px] select-none">
                    <div className="resize-x overflow-hidden">{state}</div>
                  </TableHead>
                  <Separator orientation="vertical" className="h-8" />
                  <TableHead className="font-bold min-w-[120px] select-none">
                    <div className="resize-x overflow-hidden">Delivery</div>
                  </TableHead>
                  <TableHead className="font-bold min-w-[150px] select-none">
                    <div className="resize-x overflow-hidden flex justify-center">
                      Budget
                    </div>
                  </TableHead>
                  <TableHead className="font-bold min-w-[120px] select-none">
                    <div className="resize-x overflow-hidden">Impression</div>
                  </TableHead>
                  <TableHead className="font-bold min-w-[120px] select-none">
                    <div className="resize-x overflow-hidden">Reach</div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fetchedData.map((adsset, idx) => (
                  <TableRow
                    key={idx}
                    className="h-5 hover:bg-gray-50 transition-colors"
                  >
                    <TableCell className="p-2 w-12">
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
                    <TableCell className="p-2 w-20">
                      <Switch checked={true} />
                    </TableCell>
                    <TableCell className="font-semibold hover:text-blue-700 cursor-pointer p-2 min-w-[200px]">
                      <div className="space-y-1">
                        <p className="truncate">{adsset.adSetName}</p>
                        {adsset.ads && (
                          <p className="text-xs text-blue-900">
                            {adsset.ads.length} ads
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <Separator orientation="vertical" className="h-8" />
                    <TableCell className="font-sans p-2 min-w-[120px]">
                      <div className="truncate">{adsset.status}</div>
                    </TableCell>
                    <TableCell className="font-sans text-xs p-2 min-w-[150px]">
                      <div className="flex flex-col items-center">
                        <h1 className="flex flex-col items-end">
                          <span>NGN {adsset.dailyBudget}</span>
                          <span>daily</span>
                        </h1>
                      </div>
                    </TableCell>
                    <TableCell className="font-sans p-2 min-w-[120px]">
                      <div className="truncate">{adsset.impression || 0}</div>
                    </TableCell>
                    <TableCell className="font-sans p-2 min-w-[120px]">
                      <div className="truncate">{adsset.reach || "---"}</div>
                    </TableCell>
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
