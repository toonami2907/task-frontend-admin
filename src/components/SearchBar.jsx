import React, { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const SearchBar = ({ onFilterApply }) => {
  const [query, setQuery] = useState("");
  const [isSearchMode, setIsSearchMode] = useState(true);
  const [open, setOpen] = useState(false);
  const [filters, setFilters] = useState([]);
  const [tempFilter, setTempFilter] = useState({
    field: "campaign_name",
    label: "Campaign name",
    condition: "Contains",
    value: ""
  });

  const searchCategories = [
    { label: "Campaign name", field: "campaign_name" },
    { label: "Ad set name", field: "adset_name" },
    { label: "Ad name", field: "ad_name" },
  ];

  const handleAddFilter = (category) => {
    setTempFilter({
      field: category.field,
      label: category.label,
      condition: "Contains",
      value: query
    });
    setIsSearchMode(false);
    setQuery("");
    setOpen(false);
  };

  const handleApplyFilter = () => {
    setFilters(prev => [...prev, {
      ...tempFilter,
      id: Math.random().toString(36).substr(2, 9),
    }]);
    setIsSearchMode(true);
  };

  const handleRemoveFilter = (index) => {
    setFilters((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFilterClick = (filter) => {
    setTempFilter(filter);
    setIsSearchMode(false);
  };

  useEffect(() => {
    onFilterApply(filters);
  }, [filters, onFilterApply]);

  return (
    <div className="w-full max-w-2xl relative font-sans">
      <div className="relative">
        <div className="border border-gray-300 rounded-lg bg-white shadow-sm">
          <div className="flex flex-wrap gap-2 p-2 w-full">
            {filters.map((filter, index) => (
              <div
                key={filter.id}
                className="flex items-center gap-2 bg-blue-100 text-blue-700 rounded px-2 py-1 cursor-pointer hover:bg-blue-200 transition-colors"
                onClick={() => handleFilterClick(filter)}
              >
                <span className="text-sm font-medium">{filter.label} {filter.condition} {filter.value}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveFilter(index);
                  }}
                  className="hover:bg-blue-300 rounded-full p-0.5 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}

            {isSearchMode ? (
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
            ) : (
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-2">
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
                    <SelectTrigger className="h-9 border-gray-300 bg-white hover:bg-gray-50 transition-colors">
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

                  <Select
                    value={tempFilter.condition}
                    onValueChange={(value) => setTempFilter(prev => ({ ...prev, condition: value }))}
                  >
                    <SelectTrigger className="h-9 border-gray-300 bg-white hover:bg-gray-50 transition-colors">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Contains">Contains</SelectItem>
                      <SelectItem value="Doesn`t contain">Doesn`t contain</SelectItem>

                    </SelectContent>
                  </Select>

                  <input
                    type="text"
                    className="flex-1 px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    value={tempFilter.value}
                    onChange={(e) => setTempFilter(prev => ({ ...prev, value: e.target.value }))}
                    placeholder="Enter value..."
                  />

                  <Button
                    variant="outline"
                    size="sm"
                    className="border-gray-300 hover:bg-gray-50 text-gray-700"
                    onClick={() => setIsSearchMode(true)}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={handleApplyFilter}
                  >
                    Apply
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Suggestions Dropdown */}
        {isSearchMode && open && query && (
          <div className="absolute w-full border border-gray-300 border-t-0 rounded-b-lg shadow-lg z-50 bg-white">
            <div className="p-3 text-sm font-medium text-gray-500">
              Suggested searches
            </div>
            <div className="divide-y divide-gray-100">
              {searchCategories.map((category) => (
                <div
                  key={category.field}
                  className="px-3 py-2 hover:bg-gray-50 cursor-pointer flex justify-between transition-colors"
                  onClick={() => handleAddFilter(category)}
                >
                  <div className="text-sm font-medium text-gray-900">{category.label}</div>
                  <div className="text-sm text-gray-500">
                    contains <span className="text-blue-600 font-medium">{query}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchBar;