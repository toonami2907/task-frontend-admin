/* eslint-disable react/prop-types */
import React, { useState, useEffect, useCallback } from "react";
import { X, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useGlobalContext } from "@/functions/features/StateProvider";

const SearchBar2 = () => {
  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filters, setFilters] = useState([]);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState(null);
  const [tempFilter, setTempFilter] = useState({
    field: "campaign_name",
    label: "Campaign name",
    condition: "Contains",
    value: "",
  });
  const { setActiveFilters, activeFilters } = useGlobalContext();

  const MAX_VISIBLE_FILTERS = 20;
  const isAtMaxFilters = filters.length >= MAX_VISIBLE_FILTERS;

  const searchCategories = [
    { label: "Campaign name", field: "campaign_name", value: query },
    { label: "Ad set name", field: "adset_name", value: query },
    { label: "Ad name", field: "ad_name", value: query },
  ];

  useEffect(() => {
    if (activeFilters?.length > 0 && filters.length === 0) {
      setFilters(activeFilters);
    }
  }, []);

  const handleAddFilter = useCallback((category) => {
    const newFilter = {
      field: category.field,
      label: category.label,
      condition: "Contains",
      value: query,
      id: Math.random().toString(36).substr(2, 9),
    };

    const isDuplicate = filters.some(
      (filter) =>
        filter.field === newFilter.field &&
        filter.condition === newFilter.condition &&
        filter.value === newFilter.value
    );

    if (!isDuplicate) {
      setFilters((prev) => [...prev, newFilter]);
    }
    setQuery("");
    setShowSuggestions(false);
    
    // Automatically open dialog when max filters is reached
   
  }, [query, filters]);

  const handleEditFilter = useCallback((filter, index) => {
    setSelectedFilter(index);
    setTempFilter(filter);
    setEditDialogOpen(true);
  }, []);

  const handleApplyEdit = useCallback(() => {
    if (selectedFilter !== null) {
      setFilters((prev) =>
        prev.map((filter, index) =>
          index === selectedFilter ? { ...tempFilter, id: filter.id } : filter
        )
      );
    }
    setEditDialogOpen(false);
    setSelectedFilter(null);
  }, [selectedFilter, tempFilter]);

  const FilterCard = ({ filter, index, onRemove }) => (
    <div className={`
      flex items-center gap-1 sm:gap-2 
      bg-gray-200 text-gray-700 rounded
      ${filter.length >= 4 ? 'text-[10px] sm:text-xs py-0.5' : 'px-1.5 sm:px-2 py-1'}
      transition-all duration-200 ease-in-out
      hover:bg-gray-300
      max-w-[200px] sm:max-w-none
    `}>
      <span className={`${filter.length >= 4 ? 'text-[10px] sm:text-xs' : 'text-xs sm:text-sm'} truncate`}>
        {filter.label}{" "}
        <span 
          className="text-black font-medium cursor-pointer text-[10px] sm:text-xs hover:text-blue-600 truncate"
          onClick={() => handleEditFilter(filter, index)}
        >
          {filter.condition} {filter.value}
        </span>
      </span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove(index);
        }}
        className="hover:bg-blue-100 rounded p-0.5"
      >
        <X className="h-3 w-3 sm:h-4 sm:w-4" />
      </button>
    </div>
  );

  const handleRemoveFilter = useCallback((index) => {
    setFilters((prev) => prev.filter((_, i) => i !== index));
  }, []);

  useEffect(() => {
    setActiveFilters(filters);
  }, [filters, setActiveFilters]);

  return (
    <div className="xs:w-full max-w-[300px] xs:max-w-[470px] w-full lg:max-w-[800px] relative font-sans">
    <div className="relative">
      <div className="flex items-start border border-black w-full rounded-2xl sm:rounded-3xl bg-white">
        <div className="flex flex-wrap gap-1.5 sm:gap-2 p-1.5 sm:p-2 w-full min-h-[30px] overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
          <div className="flex flex-wrap gap-1.5 sm:gap-2 max-w-full">
            {filters.slice(0, MAX_VISIBLE_FILTERS).map((filter, index) => (
              <FilterCard
                key={filter.id}
                filter={filter}
                index={index}
                onRemove={handleRemoveFilter}
              />
            ))}
              
              {isAtMaxFilters && (
                <Button
                  variant="ghost"
                  className="h-6 sm:h-7 px-1.5 sm:px-2 text-xs sm:text-sm text-blue-600 shrink-0"
                  onClick={() => setFilterDialogOpen(true)}
                >
                  {filters.length > MAX_VISIBLE_FILTERS ? (
                    <span className="flex items-center">
                      View more ({filters.length - MAX_VISIBLE_FILTERS})
                      <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4 ml-1" />
                    </span>
                  ) : (
                    "Add filter"
                  )}
                </Button>
              )}
            </div>

            {!isAtMaxFilters && (
              <div className="flex items-center min-w-[80px] xs:min-w-[120px] sm:min-w-[200px] flex-1">
                <input
                  type="text"
                  className="w-full px-1.5 sm:px-2 py-1 sm:py-1.5 bg-transparent rounded-2xl sm:rounded-3xl border-none focus:ring-0 text-[10px] sm:text-xs"
                  placeholder="Search by name, ID, metric"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setShowSuggestions(e.target.value.length > 0);
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {showSuggestions && query && !filterDialogOpen && !isAtMaxFilters && (
          <Card className="absolute w-full border border-gray-300 border-t-0 rounded-t-none rounded-b-lg shadow-lg z-50 bg-white">
            <div className="p-2 sm:p-3 text-xs sm:text-sm text-gray-500">Suggested searches</div>
            <div className="divide-y max-h-[250px] sm:max-h-[300px] overflow-y-auto">
              {searchCategories.map((category) => (
                <div
                  key={category.field}
                  className="px-2 sm:px-3 py-1.5 sm:py-2 hover:bg-gray-50 flex gap-3 sm:gap-5 items-center cursor-pointer"
                  onClick={() => handleAddFilter(category)}
                >
                  <div className="text-[10px] sm:text-xs truncate">{category.label}</div>
                  <div className="text-[10px] sm:text-xs text-gray-500 truncate">
                    contains <span className="text-blue-600">{query}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* Dialog components remain unchanged */}
      <Dialog open={filterDialogOpen} onOpenChange={setFilterDialogOpen}>
        <DialogContent className="max-w-[90vw] sm:max-w-2xl m-4">
          <DialogTitle className="text-base sm:text-lg">View All Filters</DialogTitle>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {filters.map((filter, index) => (
                <FilterCard
                  key={filter.id}
                  filter={filter}
                  index={index}
                  onRemove={handleRemoveFilter}
                />
              ))}
            </div>
            <div className="flex items-center">
              <input
                type="text"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Add new filter..."
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setShowSuggestions(e.target.value.length > 0);
                }}
              />
            </div>
            {showSuggestions && query && (
              <Card className="border border-gray-300 rounded-lg shadow-sm">
                <div className="divide-y">
                  {searchCategories.map((category) => (
                    <div
                      key={category.field}
                      className="px-3 py-2 hover:bg-gray-50 flex gap-5 items-center cursor-pointer"
                      onClick={() => handleAddFilter(category)}
                    >
                      <div className="text-xs">{category.label}</div>
                      <div className="text-xs text-gray-500">
                        contains <span className="text-blue-600">{query}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-[90vw] sm:max-w-md m-4">
          <DialogTitle className="text-base sm:text-lg">Edit Filter</DialogTitle>
          <div className="space-y-4">
            <div className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-gray-600">
              {tempFilter.label}
            </div>
            <Select
              value={tempFilter.condition}
              onValueChange={(value) =>
                setTempFilter((prev) => ({ ...prev, condition: value }))
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Contains">Contains</SelectItem>
                <SelectItem value="Doesn't contain">Doesn` t contain</SelectItem>
              </SelectContent>
            </Select>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={tempFilter.value}
              onChange={(e) =>
                setTempFilter((prev) => ({ ...prev, value: e.target.value }))
              }
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setEditDialogOpen(false);
                  setSelectedFilter(null);
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleApplyEdit}>Apply</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SearchBar2;