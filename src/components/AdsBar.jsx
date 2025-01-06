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
import { Link } from "lucide-react";

const AdsManager = ({ selectedBar, setSelectedBar }) => {
  const [viewMode, setViewMode] = useState("table");
  const [campaignNames, setCampaignNames] = useState({});
  const [fetchedData, setFetchData] = useState([]);
  const [selectedAds, setSelectedAds]= useState([]);
  const [previewImage, setPreviewImage] = useState(null);
  const { state, customColumn,setState  } = useGlobalContext();

  useEffect(() => {
    const FetchDashboardStats = async () => {
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
            endpoint =`${API_URL}/auth/db/campaigns`;
            break;
        }
        const response = await axios.get(endpoint, { withCredentials: true });
        setFetchData(response.data); // Update state with fetched data
      } catch (error) {
        console.log(error.message);
        toast.error("Error while fetching dashboard data");
      }
    };

    FetchDashboardStats();
  }, [state]);
  const getAdLink = (ad) => {
    return ad?.creative?.objectStorySpec?.link_data?.link || null;
  };

  const fetchCampaignId = async (campaignId) => {
    try {
      const response = await axios.get(
        `${API_URL}/auth/campaign/${campaignId}`,
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      console.log(error.message);
      // toast.error("Error while fetching campaign data");
    }
  };
  const fetchAdsSetById = async (adSetId) => {
    try {
      const response = await axios.get(
        `${API_URL}/auth/adsset/${adSetId}`,
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      console.log(error.message);
      toast.error("Error while fetching campaign data");
    }
  };

  useEffect(() => {
    const fetchCampaignNames = async () => {
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
    };

    fetchCampaignNames();
  }, [fetchedData]);

  const FetchSelectedTabs = async (tabs, adSetId) => {
    localStorage.setItem("selectedBar", tabs);

    if (tabs === "Ads set") {
      // console.log("===== ads set id", adSetId);
      const data = await fetchAdsSetById(adSetId);
      // console.log("===== ads set", data);
      return data;
    } else {
      console.log("No data available");
      return "No data available";
    }
  };

const FetchAdsById = async (adId) => {
  try {
    const response = await axios.get(`${API_URL}/auth/ads/${adId}`, { withCredentials: true });
    return response.data;
  } catch (error) {
    console.log(error.message);
    toast.error('Error while fetching ads data');
  }
}
function formatMoney(amount, locale = 'en-NG', currency = 'NGN') {
  return amount.toLocaleString(locale, {
    style: 'currency',
    currency: currency,
  });
}

useEffect(() => {
  const FetchArrayData = async () => {
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
                // Make sure we're passing just the ad ID
                const adId = typeof ad === 'object' ? ad.adId : ad;
                return await FetchAdsById(adId);
              })
            );
            
            return ads.filter(Boolean); // Filter out null responses
          } catch (error) {
            console.error(`Error fetching data for adSetId ${adSetId}:`, error);
            return [];
          }
        })
      );

      setSelectedAds((prevAds) => {
        const validPrevAds = prevAds.filter(ad => 
          ad?.adId && selectedBar.includes(ad.adSetId)
        );
        
        const validNewAds = newAdsData.flat().filter(ad => 
          ad?.adId && !validPrevAds.some(prevAd => prevAd.adId === ad.adId)
        );
        
        return [...validPrevAds, ...validNewAds];
      });

    } catch (error) {
      console.error("Error in FetchArrayData:", error);
      toast.error("Error fetching ads data");
    }
  };

  FetchArrayData();
}, [selectedBar]);

  const adsData = selectedAds.length > 0 ? selectedAds : fetchedData

  return (
    <div className="w-full py-4 bg-inherit px-0 font-sans">
      {/* Top Navigation */}
      <div className="flex items-center justify-between  px-5 pb-2">
        <div />
        <div className="flex items-center justify-end space-x-4">
          <StyledDropdown />
          <DeliveryBar />
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex items-center justify-end gap-5 pr-5 mb-2 "></div>
      {/* Table View */}
      {viewMode === "table" && (
        <Table>
          {state === "Campaign" && (
            <>
              <TableHeader>
                <TableRow className="border ">
                  <TableHead className="w-12">
                    <input type="checkbox" />
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center">
                      Off/On
                    </div>
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
                    <TableCell 
                    className="font-sans hover:text-blue-700 cursor-pointer">
                     <p>{campaign.campaignName}</p>
                     <p>
                    {campaign?.adSets?.length} Ad sets
                      </p> 
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
                <TableRow className="border ">
                  <TableHead className="w-12">
                    <input type="checkbox" />
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center">
                      Off/On
                    </div>
                  </TableHead>
                  <TableHead className="text-lg font-medium">
                    {state}
                  </TableHead>
                  <Separator orientation="vertical" className="h-10" />
                  {/* <TableHead className="font-sans">Ads </TableHead> */}
                  <TableHead className="font-sans">Delivery</TableHead>
                  <TableHead className="font-sans flex justify-center">Budget</TableHead>
                  <TableHead className="font-sans ">Impression</TableHead>
                  <TableHead className="font-sans ">Reach</TableHead>
                  {/* <TableHead className="font-sans">Ads sets</TableHead> */}
                </TableRow>
              </TableHeader>
              <TableBody>
                {fetchedData.map((adsset, idx) => (
                  <TableRow key={idx}>
                    <TableCell>
                      <Checkbox
                        checked={selectedBar?.includes(adsset.adSetId) || false} // Check if adsset.adSetId exists
                        onCheckedChange={() => {
                          setSelectedBar((prev) => {
                            const exists = prev?.some(
                              (item) => item === adsset.adSetId
                            ); // Check if it already exists
                            if (exists) {
                              console.log(
                                "Removing selected checkbox",
                                adsset.adSetId
                              );
                              return prev.filter(
                                (item) => item !== adsset.adSetId
                              ); // Remove if exists
                            }
                            return [...(prev || []), adsset.adSetId]; // Add if doesn't exist
                          });
                        }}
                      />

                    </TableCell>
                    <TableCell>
                      <Switch checked={true} />
                    </TableCell>
                    <TableCell
                      
                      className="font-sans hover:text-blue-700 cursor-pointer"
                    >
                      <p> {adsset.adSetName}</p>
                      {adsset.ads && (
                        <p className="text-xs text-blue-900">
                          {adsset.ads.length} ads
                        </p>
                      )}
                    </TableCell>
                    <Separator orientation="vertical" className="h-10" />
                    <TableCell className="font-sans">
                       {adsset.status}
                    </TableCell>
                    <TableCell className="font-sans flex flex-col items-center ">
                      <h1 className="flex flex-col items-end">
                      <span>NGN {adsset.dailyBudget}</span>
                      <span>daily</span>
                      </h1>
                    </TableCell>
                    <TableCell className="font-sans">
                      {adsset.impression || 0}
                    </TableCell>
                    <TableCell className="font-sans ">
                      {adsset.reach || '---'}
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
                   <div className="flex items-center">
                     Off/On
                   </div>
                 </TableHead>
                 <TableHead className="text-lg font-medium">
                   {state}
                 </TableHead>
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
                       <span className="text-sm truncate max-w-[150px]" title={ads.adName}>
                         {ads.adName}
                       </span>
                     </div>
                   </TableCell>
                   <Separator orientation="vertical" className="h-10" />
                   {customColumn.map((col, idx) => {
                     let value;
                     if (col === "Ad ID") {
                       value = ads.adId;
                     } else if (col === "Ad name") {
                       value = ads.adName;
                     } else if (col === "Ad Set Name") {
                       value = ads.adSetName;
                     } else if (col === "Amount spent") {
                       value = ads.spend;
                     } else if (col === "Ad set ID") {
                       value = ads.adSetId;
                     } else if (col === "Campaign ID") {
                       value = ads.campaignId;
                     } else if (col === "Campaign name") {
                       value = campaignNames[ads.campaignId] || "---";
                     } else {
                       const normalizedKey = col
                         .toLowerCase()
                         .replace(/\s+/g, "");
                       value = ads[normalizedKey];
                     }
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
           
           {/* Large Image Preview with Link */}
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
                   <p className="text-xs text-gray-500">Ad ID: {previewImage.adId}</p>
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
      )}

    
      <div className="h-[550px] bg-gray-200">
        {state === "Campaign" && (
          <div className="flex flex-col h-full items-center justify-center">
            {/* <NoAds/> */}
          </div>
        )}
        {state === "Ads Set" && (
          <div className="flex flex-col h-full items-center justify-center">
            {/* <NoAds/> */}
          </div>
        )}
        {state === "Ads" && (
          <div className="flex flex-col h-full items-center justify-center">
            {/* <NoAds/> */}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdsManager;
