/* eslint-disable react/prop-types */
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Switch } from "./ui/switch";
import { Separator } from "./ui/separator";
import { Checkbox } from "./ui/checkbox";

const AdSet = ({selectedBar,fetchedData, setSelectedBar }) => {
  return (
    <div>
      <Table>
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
                    setSelectedBar(fetchedData.map((adsset) => adsset.adSetId));
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
            <TableHead className="text-lg font-medium p-2">Ads Set</TableHead>
            <Separator orientation="vertical" className="h-8" />
            <TableHead className="font-sans p-2">Delivery</TableHead>
            <TableHead className="font-sans flex justify-center p-2">
              Budget
            </TableHead>
            <TableHead className="font-sans p-2">Impression</TableHead>
            <TableHead className="font-sans p-2">Reach</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {fetchedData.map((adsset, idx) => (
            <TableRow key={idx} className="h-8">
              <TableCell className="p-2">
                <Checkbox
                  checked={selectedBar?.includes(adsset.adSetId) || false}
                  onCheckedChange={() => {
                    setSelectedBar((prev) => {
                      const exists = prev?.some(
                        (item) => item === adsset.adSetId
                      );
                      if (exists) {
                        return prev.filter((item) => item !== adsset.adSetId);
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
              <TableCell className="font-sans p-2">{adsset.status}</TableCell>
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
      </Table>
    </div>
  );
};

export default AdSet;
