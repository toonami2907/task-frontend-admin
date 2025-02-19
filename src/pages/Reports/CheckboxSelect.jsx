/* eslint-disable react/prop-types */
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChevronDown } from "lucide-react";

const CheckboxSelect = ({ 
  options, 
  selectedValues, 
  onChange, 
  placeholder = "Select options" 
}) => {
  const [open, setOpen] = useState(false);

  const handleCheckboxChange = (value) => {
    let newSelection;
    if (value === "all") {
      newSelection = selectedValues.includes("all") ? [] : ["all"];
    } else {
      newSelection = selectedValues.filter(v => v !== "all");
      if (newSelection.includes(value)) {
        newSelection = newSelection.filter(v => v !== value);
      } else {
        newSelection.push(value);
      }
    }
    onChange(newSelection);
    if (value === "all") setOpen(false);
  };

  const selectionText = selectedValues.includes("all") 
    ? "All Countries"
    : selectedValues.length 
      ? `${selectedValues.length} selected`
      : placeholder;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          className="w-[200px] justify-between"
        >
          {selectionText}
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <Card className="max-h-[300px] overflow-auto">
          <div className="p-2 space-y-2">
            <label className="flex items-center space-x-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded cursor-pointer">
              <Checkbox 
                checked={selectedValues.includes("all")}
                onCheckedChange={() => handleCheckboxChange("all")}
              />
              <span className="text-sm">All Countries</span>
            </label>
            <div className="h-px bg-gray-200 dark:bg-gray-700" />
            {options.map((option) => (
              <label 
                key={option} 
                className="flex items-center space-x-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded cursor-pointer"
              >
                <Checkbox 
                  checked={selectedValues.includes(option)}
                  onCheckedChange={() => handleCheckboxChange(option)}
                  disabled={selectedValues.includes("all")}
                />
                <span className="text-sm">{option}</span>
              </label>
            ))}
          </div>
        </Card>
      </PopoverContent>
    </Popover>
  );
};

export default CheckboxSelect;