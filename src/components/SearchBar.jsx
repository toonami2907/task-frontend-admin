import React, { useState, useEffect } from 'react';
import { Search, ChevronRight, ChevronDown, ArrowUpDown } from 'lucide-react';
import { actionCategories } from '@/functions/resources/arrays';

const STORAGE_KEYS = {
  RECENT_SEARCHES: 'recent_searches',
  SELECTED_FILTERS: 'selected_filters',
  SORT_PREFERENCE: 'sort_preference'
};

const SearchBar = ({ onFilterSelect, onDataUpdate }) => {
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [recentSearches, setRecentSearches] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.RECENT_SEARCHES);
    return stored ? JSON.parse(stored) : [];
  });
  const [showDropdown, setShowDropdown] = useState(false);
  const [expandedFilters, setExpandedFilters] = useState({});
  const [selectedFilters, setSelectedFilters] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.SELECTED_FILTERS);
    return stored ? JSON.parse(stored) : [];
  });
  const [searchType, setSearchType] = useState(null);
  const [sortConfig, setSortConfig] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.SORT_PREFERENCE);
    return stored ? JSON.parse(stored) : { field: null, direction: 'asc' };
  });

  const specialFilters = {
    ids: ['Ad ID', 'Ad set ID', 'Campaign ID', 'Account ID'],
    names: ['Ad name', 'Ad Set Name', 'Campaign name', 'Account name'],
    sortable: ['Amount spent', 'Impression', 'Reach', 'Clicks', 'CTR']
  };

  // Persist selected filters to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SELECTED_FILTERS, JSON.stringify(selectedFilters));
  }, [selectedFilters]);

  // Persist recent searches to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.RECENT_SEARCHES, JSON.stringify(recentSearches));
  }, [recentSearches]);

  // Persist sort preference to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SORT_PREFERENCE, JSON.stringify(sortConfig));
  }, [sortConfig]);

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

  const getFilterType = (filterName) => {
    if (specialFilters.ids.includes(filterName)) return 'id';
    if (specialFilters.names.includes(filterName)) return 'name';
    if (specialFilters.sortable.includes(filterName)) return 'sortable';
    return 'regular';
  };

  useEffect(() => {
    if (search) {
      const matches = findMatches(search);
      setSearchResults(matches);
    } else {
      setSearchResults([]);
    }
  }, [search]);

  const handleSelectResult = (result) => {
    const filterType = getFilterType(result.name);
    
    setSearch(result.name);
    setShowDropdown(false);
    setSearchType(filterType);
    
    // Add to selected filters if not already present
    setSelectedFilters(prev => {
      if (!prev.find(f => f.name === result.name)) {
        const newFilters = [...prev, result];
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

    // Handle sort if it's a sortable field
    if (filterType === 'sortable') {
      setSortConfig({
        field: result.name,
        direction: 'desc'
      });
      if (onDataUpdate) {
        onDataUpdate({ sortField: result.name, sortDirection: 'desc' });
      }
    }
  };

  const handleRemoveFilter = (filter) => {
    setSelectedFilters(prev => {
      const newFilters = prev.filter(f => f.name !== filter.name);
      if (onFilterSelect) {
        onFilterSelect(newFilters, getFilterType(filter.name));
      }
      return newFilters;
    });

    // Clear sort if removing sorted field
    if (sortConfig.field === filter.name) {
      setSortConfig({ field: null, direction: 'asc' });
      if (onDataUpdate) {
        onDataUpdate({ sortField: null, sortDirection: 'asc' });
      }
    }
  };

  const toggleSort = (field) => {
    const newDirection = sortConfig.field === field && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    setSortConfig({
      field,
      direction: newDirection
    });
    if (onDataUpdate) {
      onDataUpdate({ sortField: field, sortDirection: newDirection });
    }
  };

  const toggleFilter = (filterName) => {
    setExpandedFilters(prev => ({
      ...prev,
      [filterName]: !prev[filterName]
    }));
  };

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
          className="px-4 py-1.5 hover:bg-gray-100 cursor-pointer text-sm text-gray-700 flex items-center justify-between"
          onClick={() => handleSelectResult({ name: item, category })}
        >
          <span>{item}</span>
          {specialFilters.sortable.includes(item) && (
            <ArrowUpDown className="h-4 w-4 text-gray-400" />
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="search-container relative w-72">
      {/* Selected Filters Display */}
     
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
            {search && searchResults.length > 0 ? (
              <div className="p-2">
                <div className="text-xs font-semibold text-gray-500 px-2 py-1">
                  SEARCH RESULTS
                </div>
                {searchResults.map((result, index) => (
                  <div
                    key={`search-${index}`}
                    className="px-2 py-2 hover:bg-gray-100 cursor-pointer rounded flex items-center justify-between"
                    onClick={() => handleSelectResult(result)}
                  >
                    <div>
                      <div className="font-medium">{result.name}</div>
                      <div className="text-sm text-gray-500">{result.category}</div>
                    </div>
                    {specialFilters.sortable.includes(result.name) && (
                      <ArrowUpDown className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                ))}
              </div>
            ) : search ? (
              <div className="p-4 text-center text-gray-500">
                No results found for `{search}`
              </div>
            ) : (
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
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchBar;