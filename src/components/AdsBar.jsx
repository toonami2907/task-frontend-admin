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

  const getAdLink = (ad) => ad?.creative?.objectStorySpec?.link_data?.link || null;

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
          {state === "Campaign" && (
            <>
              <TableHeader>
                <TableRow className="border ">
                  <TableHead className="w-12">
                    <input type="checkbox" />
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center">Off/On</div>
                  </TableHead>
                  <TableHead className="text-lg font-medium">
                    {state}
                  </TableHead>
                  <Separator orientation="vertical" className="h-10" />
                  {/* <TableHead className="font-sans">Ads sets</TableHead> */}
                  <TableHead className="font-sans">Delivery</TableHead>
                  <TableHead className="font-sans">Bid strategy</TableHead>
                  <TableHead className="font-sans">Budget</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fetchedData.map((campaign, idx) => (
                  <TableRow key={idx}>
                    <TableCell>
                      <input type="checkbox" />
                    </TableCell>
                    <TableCell>
                      <Switch checked={true} />
                    </TableCell>
                    <TableCell className="font-sans hover:text-blue-700 cursor-pointer">
                      <p>{campaign.campaignName}</p>
                      <p>{campaign?.adSets?.length} Ad sets</p>
                    </TableCell>
                    <Separator orientation="vertical" className="h-10" />
                    <TableCell className="font-sans">
                      {campaign.status}
                    </TableCell>
                    <TableCell className="font-extralight">
                      Using ad set bid strategy
                    </TableCell>
                    <TableCell className="font-extralight">
                      Using ad set budget
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </>
          )}
           {state === "Ads Set" && (
            <>
              <TableHeader>
                <TableRow className="border h-10">
                  <TableHead className="w-12 p-2">
                    <input
                      type="checkbox"
                      checked={
                        fetchedData.length > 0 &&
                        selectedBar?.length === fetchedData.length
                      }
                      onChange={(e) => {
                        if (e.target.checked) {
                          // Select all
                          setSelectedBar(
                            fetchedData.map((adsset) => adsset.adSetId)
                          );
                        } else {
                          // Deselect all
                          setSelectedBar([]);
                        }
                      }}
                    />
                  </TableHead>
                  <TableHead className="p-2">
                    <div className="flex items-center">Off/On</div>
                  </TableHead>
                  <TableHead className="text-lg font-medium p-2">
                    {state}
                  </TableHead>
                  <Separator orientation="vertical" className="h-8" />
                  <TableHead className="font-sans p-2">Delivery</TableHead>
                  <TableHead className="font-sans flex justify-center p-2">
                    Budget
                  </TableHead>
                  <TableHead className="font-sans p-2">
                    Impression
                  </TableHead>
                  <TableHead className="font-sans p-2">Reach</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fetchedData.map((adsset, idx) => (
                  <TableRow key={idx} className="h-8">
                    <TableCell className="p-2">
                      <Checkbox
                        checked={
                          selectedBar?.includes(adsset.adSetId) || false
                        }
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
                    <TableCell className="p-2">
                      <Switch checked={true} />
                    </TableCell>
                    <TableCell className="font-sans hover:text-blue-700 cursor-pointer p-2">
                      <p>{adsset.adSetName}</p>
                      {adsset.ads && (
                        <p className="text-xs text-blue-900">
                          {adsset.ads.length} ads
                        </p>
                      )}
                    </TableCell>
                    <Separator orientation="vertical" className="h-8" />
                    <TableCell className="font-sans p-2">
                      {adsset.status}
                    </TableCell>
                    <TableCell className="font-sans flex flex-col items-center p-2">
                      <h1 className="flex flex-col items-end">
                        <span>NGN {adsset.dailyBudget}</span>
                        <span>daily</span>
                      </h1>
                    </TableCell>
                    <TableCell className="font-sans p-2">
                      {adsset.impression || 0}
                    </TableCell>
                    <TableCell className="font-sans p-2">
                      {adsset.reach || "---"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </>
          )}
          {state === "Ads" && (
            <div className="relative flex">
            <div className="flex-grow">
              <TableHeader>
                <TableRow className="border">
                  <TableHead className="w-5">
                    <input type="checkbox" />
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center">Off/On</div>
                  </TableHead>
                  <TableHead className="text-lg font-medium">Ads</TableHead>
                  <Separator orientation="vertical" className="h-10" />
                  {customColumn.map((col, idx) => (
                    <TableHead key={idx} className="font-sans">
                      {col}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {adsData.map((ads, idx) => (
                  <TableRow key={idx}>
                    <TableCell>
                      <input type="checkbox" />
                    </TableCell>
                    <TableCell>
                      <Switch checked={ads.status === "ACTIVE"} />
                    </TableCell>
                    <TableCell className="min-w-[200px]">
                      <div className="flex items-center space-x-3">
                        <div
                          className="relative cursor-pointer"
                          onMouseEnter={() => setPreviewImage(ads)}
                        >
                          <img
                            src={ads.imageUrl}
                            alt={ads.adName}
                            className="h-8 w-8 object-cover rounded hover:ring-2 hover:ring-blue-500"
                          />
                        </div>
                        <span
                          className="text-sm truncate max-w-[150px]"
                          title={ads.adName}
                        >
                          {ads.adName}
                        </span>
                      </div>
                    </TableCell>
                    <Separator orientation="vertical" className="h-10" />
                    {customColumn.map((col, idx) => {
                      const value = (() => {
                        switch(col) {
                          case "Ad ID": return ads.adId;
                          case "Ad name": return ads.adName;
                          case "Ad Set Name": return ads.adSetName;
                          case "Amount spent": return ads.metrics?.spend || 0;
                          case "Ad set ID": return ads.adSetId;
                          case "Campaign ID": return ads.campaignId;
                          case "Campaign name": return ads.campaignName || "---";
                          default:
                            { const normalizedKey = col.toLowerCase().replace(/\s+/g, "");
                            return ads[normalizedKey]; }
                        }
                      })();
      
                      return (
                        <TableCell key={idx} className="font-sans">
                          {value !== undefined ? value : "---"}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </div>
      
            {previewImage && (
              <div
                className="fixed left-48 top-1/4 bg-white shadow-lg rounded-lg p-4 max-h-[200px] overflow-y-auto h-full mx-4 border border-gray-200 w-[200px]"
                onMouseLeave={() => setPreviewImage(null)}
              >
                <div className="space-y-4">
                  <img
                    src={previewImage.imageUrl}
                    alt={previewImage.adName}
                    className="w-full h-[200px] object-contain bg-gray-50 rounded"
                  />
                  <div className="space-y-2">
                    <h3 className="font-medium text-sm">{previewImage.adName}</h3>
                    {getAdLink(previewImage) && (
                      <div className="mt-2 p-2 bg-gray-50 rounded">
                        <div className="flex items-center gap-2 text-blue-600">
                          <Link size={14} />
                          <a
                            href={getAdLink(previewImage)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs break-all hover:underline"
                          >
                            {getAdLink(previewImage)}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
          )}
        </Table>
      ) : (
        <div className="flex flex-col h-full items-center justify-center">
          {state === 'Campaign' && (
            <NoAds state={'Campaign'} />
          )}
          {state === 'Ads Set' && (
            <NoAds state={'Ads set'}/>
          )}
          {state === 'Ads' && (
            <NoAds state={'Ads'}/>
          )}
        </div>
      )}
    </div>
  );
};

export default AdsManager;
