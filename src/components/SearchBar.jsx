import React, { useState, useEffect } from 'react';
import { Search, ChevronRight, ChevronDown } from 'lucide-react';
import { actionCategories } from '@/functions/resources/arrays';

// Props type for data updates and selections
const SearchBar = ({ onFilterSelect, onDataUpdate }) => {
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [expandedFilters, setExpandedFilters] = useState({});
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [searchType, setSearchType] = useState(null); // For ID/Name type searches

  // Special filters that require specific handling
  const specialFilters = {
    ids: ['Ad ID', 'Ad set ID', 'Campaign ID', 'Account ID'],
    names: ['Ad name', 'Ad Set Name', 'Campaign name', 'Account name']
  };

  const findMatches = (searchTerm) => {
    if (!searchTerm) return [];
    
    const results = [];
    actionCategories.forEach(category => {
      category.items.forEach(item => {
        if (item.toLowerCase().includes(searchTerm.toLowerCase())) {
          results.push({
            name: item,
            category: category.name
          });
        }
      });
    });
    return results;
  };

  // Check if a filter is an ID or name type
  const getFilterType = (filterName) => {
    if (specialFilters.ids.includes(filterName)) return 'id';
    if (specialFilters.names.includes(filterName)) return 'name';
    return 'regular';
  };

  // Handle search term changes
  useEffect(() => {
    if (search) {
      const matches = findMatches(search);
      setSearchResults(matches);
    } else {
      setSearchResults([]);
    }
  }, [search]);

  // Handle selection of a search result or filter
  const handleSelectResult = (result) => {
    const filterType = getFilterType(result.name);
    
    setSearch(result.name);
    setShowDropdown(false);
    setSearchType(filterType);
    
    // Add to selected filters if not already present
    setSelectedFilters(prev => {
      if (!prev.find(f => f.name === result.name)) {
        const newFilters = [...prev, result];
        
        // Notify parent component of filter selection
        if (onFilterSelect) {
          onFilterSelect(newFilters, filterType);
        }
        
        return newFilters;
      }
      return prev;
    });
    
    // Add to recent searches
    setRecentSearches(prev => {
      const newSearches = prev.filter(item => item.name !== result.name);
      return [result, ...newSearches].slice(0, 5);
    });
  };

  // Handle removing a selected filter
  const handleRemoveFilter = (filter) => {
    setSelectedFilters(prev => {
      const newFilters = prev.filter(f => f.name !== filter.name);
      if (onFilterSelect) {
        onFilterSelect(newFilters, getFilterType(filter.name));
      }
      return newFilters;
    });
  };

  const toggleFilter = (filterName) => {
    setExpandedFilters(prev => ({
      ...prev,
      [filterName]: !prev[filterName]
    }));
  };

  // Handle data updates
  const updateData = (data) => {
    if (onDataUpdate) {
      onDataUpdate(data, selectedFilters, searchType);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDropdown && !event.target.closest('.search-container')) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDropdown]);

  const FilterItemsComponent = ({ items, category }) => (
    <div className="pl-4 py-1 space-y-1 bg-gray-50">
      {items.map((item, idx) => (
        <div 
          key={idx} 
          className="px-4 py-1.5 hover:bg-gray-100 cursor-pointer text-sm text-gray-700"
          onClick={() => handleSelectResult({ name: item, category })}
        >
          {item}
        </div>
      ))}
    </div>
  );


  return (
    <div className="search-container relative w-72">
      {/* Selected Filters Display */}
      {selectedFilters.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {/* {selectedFilters.map((filter, index) => (
            <div 
              key={index}
              className="flex items-center gap-2 px-3 py-1 bg-blue-100 rounded-full text-sm text-blue-700"
            >
              {filter.name}
              <button 
                onClick={() => handleRemoveFilter(filter)}
                className="hover:text-blue-900"
              >
                ×
              </button>
            </div>
          ))} */}
        </div>
      )}

      {/* Search Bar and Dropdown */}
      <div className="relative bg-white border border-gray-200 rounded-lg shadow">
        <div className="p-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              placeholder="Search by name, ID or metrics"
              className="w-full pl-10 pr-4 py-1.5 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Dropdown Content */}
        {showDropdown && (
          <div className="absolute w-full left-0 bg-white border border-gray-200 rounded-lg shadow-lg max-h-[calc(100vh-200px)] overflow-y-auto z-[9999]">
            {/* Recent Searches Section */}
            {recentSearches.length > 0 && (
              <div className="border-b border-gray-200">
                <div className="px-4 py-2 text-sm font-semibold text-gray-700">
                  Recent searches
                </div>
                <div className="space-y-1 pb-2">
                  {recentSearches.map((item, index) => (
                    <div 
                      key={`recent-${index}`}
                      className="px-4 py-1.5 hover:bg-gray-100 cursor-pointer"
                      onClick={() => handleSelectResult(item)}
                    >
                      <div className="text-sm text-gray-900">{item.name}</div>
                      <div className="text-sm text-gray-500">{item.category}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Search Results */}
            {search && (
              <div>
                {searchResults.length > 0 ? (
                  <div className="p-2">
                    <div className="text-xs font-semibold text-gray-500 px-2 py-1">
                      SEARCH RESULTS
                    </div>
                    {searchResults.map((result, index) => (
                      <div
                        key={`search-${index}`}
                        className="px-2 py-2 hover:bg-gray-100 cursor-pointer rounded"
                        onClick={() => handleSelectResult(result)}
                      >
                        <div className="font-medium">{result.name}</div>
                        <div className="text-sm text-gray-500">{result.category}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    No results found for "{search}"
                  </div>
                )}
              </div>
            )}

            {/* Filters */}
            {!search && (
              <>
                <div className="border-b border-gray-200">
                  <div className="px-4 py-2 text-sm font-semibold text-gray-700">
                    Filters
                  </div>
                  <div className="space-y-1">
                    {actionCategories.map((category, index) => (
                      <div key={index}>
                        <div 
                          className="px-4 py-1.5 hover:bg-gray-100 cursor-pointer flex items-center justify-between text-sm"
                          onClick={() => toggleFilter(category.name)}
                        >
                          <span className="text-gray-900">{category.name}</span>
                          {expandedFilters[category.name] ? 
                            <ChevronDown className="h-4 w-4 text-gray-400" /> :
                            <ChevronRight className="h-4 w-4 text-gray-400" />
                          }
                        </div>
                        {expandedFilters[category.name] && (
                          <FilterItemsComponent items={category.items} category={category.name} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchBar;