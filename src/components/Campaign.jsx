import React, { useState } from "react";
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
import { API_URL} from "@/functions/features/StateProvider";
import toast from "react-hot-toast";

const Campaign = ({ fetchedData }) => {
  const [campaignData, setCampaignData] = useState(fetchedData);

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

  return (
    <div className="border rounded-lg">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="w-12 select-none border-r">
                <Checkbox />
              </TableHead>
              <TableHead className="border-r">Status</TableHead>
              <TableHead className="border-r">Campaign</TableHead>
              <TableHead className="border-r">Delivery</TableHead>
              <TableHead className="border-r">Bid Strategy</TableHead>
              <TableHead>Budget</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {campaignData.map((campaign, idx) => (
              <TableRow key={idx} className="hover:bg-gray-50">
                <TableCell className="w-12 border-r">
                  <Checkbox />
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
