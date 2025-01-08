import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

const Campaign = ({ fetchedData }) => {
  const [columnSizes, setColumnSizes] = useState({
    checkbox: 12,
    status: 20,
    campaign: 200,
    delivery: 120,
    bidStrategy: 150,
    budget: 120
  });

  return (
    <div className="border rounded-lg">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={100}>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="w-12 select-none">
                    <Checkbox />
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center w-20 select-none">Status</div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center min-w-[200px] select-none resize-x overflow-hidden">
                      <span>Campaign</span>
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center min-w-[120px] select-none resize-x overflow-hidden">
                      <span>Delivery</span>
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center min-w-[150px] select-none resize-x overflow-hidden">
                      <span>Bid Strategy</span>
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center min-w-[120px] select-none resize-x overflow-hidden">
                      <span>Budget</span>
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fetchedData.map((campaign, idx) => (
                  <TableRow 
                    key={idx}
                    className="group hover:bg-gray-50 transition-colors"
                  >
                    <TableCell className="w-12">
                      <Checkbox />
                    </TableCell>
                    <TableCell className="w-20">
                      <Switch 
                        checked={campaign.status === 'ACTIVE'} 
                      />
                    </TableCell>
                    <TableCell className="min-w-[200px]">
                      <div className="space-y-1">
                        <p className="font-medium truncate hover:text-blue-600 cursor-pointer">
                          {campaign.campaignName}
                        </p>
                        <Badge variant="secondary" className="text-xs">
                          {campaign?.adSets?.length} Ad sets
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="min-w-[120px]">
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          campaign.status === 'ACTIVE' ? 'bg-green-500' : 'bg-gray-400'
                        }`} />
                        <span className="text-sm text-gray-600">
                          {campaign.status === 'ACTIVE' ? 'Delivering' : 'Not delivering'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="min-w-[150px]">
                      <Badge 
                        variant="secondary"
                        className="font-normal"
                      >
                        {campaign.bidStrategy || "Using ad set bid strategy"}
                      </Badge>
                    </TableCell>
                    <TableCell className="min-w-[120px]">
                      <Badge 
                        variant="secondary"
                        className="font-normal"
                      >
                        {campaign.budget || "Using ad set budget"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={0}>
          {/* Additional panel for details view */}
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default Campaign;