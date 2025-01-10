import React, { useState, useEffect } from "react";
import { Search, X, ChevronDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const SearchBar2 = ({ onFilterApply }) => {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [filters, setFilters] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState(null);
  const [tempFilter, setTempFilter] = useState({
    field: "campaign_name",
    label: "Campaign name",
    condition: "Contains",
    value: ""
  });

  // Predefined search categories
  const searchCategories = [
    { label: "Campaign name", field: "campaign_name", value: query },
    { label: "Ad set name", field: "adset_name", value: query },
    { label: "Ad name", field: "ad_name", value: query },
  ];

  const handleAddFilter = (category) => {
    setTempFilter({
      field: category.field,
      label: category.label,
      condition: "Contains",
      value: query
    });
    setSelectedFilter(null);
    setDialogOpen(true);
    setQuery("");
    setOpen(false);
  };

  const handleApplyFilter = () => {
    if (selectedFilter !== null) {
      // Update existing filter
      setFilters((prev) => 
        prev.map((filter, index) => 
          index === selectedFilter ? { ...tempFilter, id: filter.id } : filter
        )
      );
    } else {
      // Add new filter
      const isDuplicate = filters.some(
        (filter) =>
          filter.field === tempFilter.field &&
          filter.condition === tempFilter.condition &&
          filter.value === tempFilter.value
      );
    
      if (!isDuplicate) {
        setFilters((prev) => [
          ...prev,
          { 
            ...tempFilter,
            id: Math.random().toString(36).substr(2, 9),
          },
        ]);
      }
    }
  
    setDialogOpen(false);
    setSelectedFilter(null);
  };

  const handleRemoveFilter = (index) => {
    setFilters((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFilterClick = (filter, index) => {
    setSelectedFilter(index);
    setTempFilter(filter);
    setDialogOpen(true);
  };

  useEffect(() => {
    onFilterApply(filters);
  }, [filters, onFilterApply]);

  return (
    <div className="w-full max-w-2xl relative font-sans">
      {/* Search Input */}
      <div className="relative">
        <div className="flex items-center border border-gray-300 rounded-3xl bg-white">
          <div className="flex flex-wrap gap-2 p-2 w-full">
            {filters.map((filter, index) => (
              <div
                key={filter.id}
                className="flex items-center gap-2 bg-gray-200 text-gray-700 rounded px-2 py-1 cursor-pointer hover:bg-gray-100"
                onClick={() => handleFilterClick(filter, index)}
              >
                <span className="text-sm">{filter.label} {filter.condition} <span className='text-black font-bold'>{filter.value}</span></span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveFilter(index);
                  }}
                  className="hover:bg-blue-100 rounded"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
            <div className="flex items-center flex-1 min-w-[200px]">
              <Search className="h-4 w-4 text-gray-400 ml-2" />
              <input
                type="text"
                className="w-full px-2 py-1.5 bg-transparent border-none focus:ring-0 text-sm"
                placeholder="Search"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setOpen(e.target.value.length > 0);
                }}
              />
            </div>
          </div>
        </div>

        {/* Suggestions Dropdown */}
        {open && query && (
          <Card className="absolute w-full border border-gray-300 border-t-0 rounded-t-none rounded-b-lg shadow-lg z-50 bg-white">
            <div className="p-3 text-sm text-gray-500">
              Suggested searches
            </div>
            <div className="divide-y">
              {searchCategories.map((category) => (
                <div
                  key={category.field}
                  className="px-3 py-2 hover:bg-gray-50 flex gap-5 items-center cursor-pointer"
                  onClick={() => handleAddFilter(category)}
                >
                  <div className="text-sm">{category.label}</div>
                  <div className="text-sm text-gray-500">
                    contains <span className="text-blue-600">{query}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* Filter Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md p-0">
          <div className="p-4 space-y-4">
            <h2 className="text-lg font-semibold">{tempFilter.label}</h2>
            <div className="flex gap-2">
              {selectedFilter === null ? (
                <Select
                  value={tempFilter.field}
                  onValueChange={(value) => {
                    const category = searchCategories.find(cat => cat.field === value);
                    setTempFilter(prev => ({
                      ...prev,
                      field: value,
                      label: category.label
                    }));
                  }}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {searchCategories.map((category) => (
                      <SelectItem key={category.field} value={category.field}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="w-[180px] px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-600">
                  {tempFilter.label}
                </div>
              )}

              <Select
                value={tempFilter.condition}
                onValueChange={(value) => setTempFilter(prev => ({ ...prev, condition: value }))}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Contains">Contains</SelectItem>
                  <SelectItem value="Doesn`t contain">Doesn`t contain</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={tempFilter.value}
              onChange={(e) => setTempFilter(prev => ({ ...prev, value: e.target.value }))}
            />
            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setDialogOpen(false);
                  setSelectedFilter(null);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleApplyFilter}
              >
                Apply
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SearchBar2;