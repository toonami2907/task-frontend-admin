import React, { useState,useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useGlobalContext } from "@/functions/features/StateProvider";
import { sortPresets } from "@/functions/Preset";
import { Button } from "@/components/ui/button";
import { ChevronDown,Columns3, Pencil } from "lucide-react";
import ToolkitDesc from "./ToolkitDesc";
import ColumnCustomizer from "./CustomDialog";

const StyledDropdown = () => {
  // const [selectedOption, setSelectedOption] = useState("Delivery");
  const {selectedPresets, setSelectedPresets} = useGlobalContext()
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const options = {
    "Recently used": [
      {
        name: "Delivery",
        description: "View delivery-related metrics and statistics",
      },
      {
        name: "Performance and clicks",
        description: "Track engagement and click-through rates",
      },
      {
        name: "Performance",
        description: "Monitor overall performance metrics",
      },
    ],
    Popular: [
      {
        name: "Setup",
        description:
          "Here are the metrics and details included in this column preset:",
      },
      {
        name: "Engagement",
        description: "Track video-specific engagement metrics",
      },
    ],
    Custom: [
      {
        name: "Custom",
        description: "Create and configure custom column layouts",
      },
    ],
  };

  const handleOptionSelect = (optionName) => {
    setSelectedPresets(optionName)
  };

  const handleCustomize = (e) => {
    e.stopPropagation();
    setIsDialogOpen(true);
  };

  useEffect(()=>{
  sortPresets(selectedPresets)
  },[selectedPresets])


  return (
    <TooltipProvider>
      <div className="relative">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="flex items-center gap-2 px-1 py-1.5 w-full justify-between"
            >
              <span className="font-normal flex items-center text-black gap-2"><Columns3/> Columns: {selectedPresets}</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64">
            {Object.entries(options).map(([category, items], index) => (
              <div key={index} className="px-2">
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  {category}
                </h3>
                {items.map((item, idx) => (
                  <Tooltip key={idx} delayDuration={300}>
                    <TooltipTrigger asChild>
                      <DropdownMenuItem
                        // onClick={() => sortPresets(item.name)}
                        className="flex items-center justify-between rounded-md focus:bg-accent"
                        onSelect={() => handleOptionSelect(item.name)}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            id={item.name}
                            name="dropdown-option"
                            checked={selectedPresets === item.name}
                            onChange={() => handleOptionSelect(item.name)}
                            className="h-4 w-4"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <label htmlFor={item.name} className="cursor-pointer">
                            {item.name}
                          </label>
                        </div>
                        {item.name === "Custom" && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={handleCustomize}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="left" align="center">
                              <p>Customize your column layout</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </DropdownMenuItem>
                    </TooltipTrigger>
                    <TooltipContent
                      side="left"
                      align="center"
                      className="bg-transparent border-o"
                    >
                      <ToolkitDesc
                        name={item.name}
                        description={item.description}
                      />
                    </TooltipContent>
                  </Tooltip>
                ))}
                {index < Object.entries(options).length - 1 && (
                  <div className="my-2 h-px bg-border" />
                )}
              </div>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Dialog
          className="w-[1500px] mx-auto max-h-[90vh] overflow-auto"
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
        >
          <DialogContent className="sm:max-w-screen-xl">
            <div className="p">
              <ColumnCustomizer />
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
};

export default StyledDropdown;
