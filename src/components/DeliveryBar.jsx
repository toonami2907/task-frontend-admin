import React, { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Check, ChevronDown } from "lucide-react";

const DeliveryBar = () => {
  const [selected, setSelected] = useState("All");
  const options = ["All", "Active", "Inactive"];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-1 px-1 py-2 text-sm border rounded-md hover:bg-gray-50">
        <span className="text-black text-xs">Delivery: {selected}</span>
        <ChevronDown className="w-4 h-4 p-0 text-black" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-36">
        {options.map((option) => (
          <DropdownMenuItem
            key={option}
            className="flex items-center justify-between px-2 py-2 text-sm cursor-pointer"
            onClick={() => setSelected(option)}
          >
            <span className="text-gray-700 text-xs">{option}</span>
            {selected === option && (
              <div className="flex items-center justify-center w-5 h-5 bg-green-500 rounded-full">
                <Check className="w-3 h-3 text-white stroke-2" />
              </div>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default DeliveryBar;