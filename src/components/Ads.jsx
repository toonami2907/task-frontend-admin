import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "./ui/separator";
import { Switch } from "./ui/switch";
import { Link } from "lucide-react";

const Ads = ({previewImage, customColumn, adsData, setPreviewImage, getAdLink}) => {
  return (
    <div>
      <div className="relative flex">
        <div className="flex-grow overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border">
                <TableHead className="w-5 select-none">
                  <input type="checkbox" />
                </TableHead>
                <TableHead className="w-20 select-none">
                  <div className="flex items-center">Off/On</div>
                </TableHead>
                <TableHead className="text-lg font-medium min-w-[200px] select-none">
                  <div className="resize-x overflow-hidden">Ads</div>
                </TableHead>
                {customColumn.map((col, idx) => (
                  <React.Fragment key={idx}>
                    <Separator orientation="vertical" className="h-10" />
                    <TableHead className="font-bold text-xs select-none">
                      <div className="resize-x overflow-hidden min-w-[120px]">
                        {col}
                      </div>
                    </TableHead>
                  </React.Fragment>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {adsData.map((ads, idx) => (
                <TableRow 
                  key={idx}
                  className="group hover:bg-gray-50 transition-colors"
                >
                  <TableCell className="w-5">
                    <input type="checkbox" />
                  </TableCell>
                  <TableCell className="w-20">
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
                        case "Campaign name":
                          return ads.campaignName || "---";
                        default: {
                          const normalizedKey = col
                            .toLowerCase()
                            .replace(/\s+/g, "");
                          return ads[normalizedKey];
                        }
                      }
                    })();

                    return (
                      <React.Fragment key={idx}>
                        <Separator orientation="vertical" className="h-10" />
                        <TableCell className="font-sans text-xs min-w-[120px]">
                          <div className="truncate">
                            {value !== undefined ? value : "---"}
                          </div>
                        </TableCell>
                      </React.Fragment>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {previewImage && (
          <div
            className="fixed left-48 top-1/4 bg-white shadow-lg rounded-lg p-4 max-h-[200px] overflow-y-auto h-full mx-4 border border-gray-200 w-[200px] z-10"
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
    </div>
  );
};

export default Ads;