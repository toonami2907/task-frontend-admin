/* eslint-disable react/prop-types */
import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useTargetSearch } from './useTargetSearch';


export const TargetSection = ({ value, selectedTargets, onChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const { loading, results, searchTargets } = useTargetSearch();

  return (
    <div className="space-y-4">
      <div className="relative">
        <Input
          type="text"
          placeholder="Search campaigns, ad sets, or ads..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            searchTargets(e.target.value);
          }}
          className="pr-10"
        />
        {loading ? (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent" />
          </div>
        ) : (
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        )}
      </div>

      {/* Search Results */}
      {results.length > 0 && (
        <div className="space-y-2 max-h-60 overflow-y-auto border rounded-md p-2">
          {results.map((result) => (
            <div key={result.id} className="flex items-center gap-2 p-2 hover:bg-gray-50">
              <input
                type="checkbox"
                checked={selectedTargets?.includes(result.id)}
                onChange={() => {
                  const newTargets = selectedTargets?.includes(result.id)
                    ? selectedTargets.filter(id => id !== result.id)
                    : [...(selectedTargets || []), result.id];
                  onChange(result.type, newTargets);
                }}
                className="rounded border-gray-300"
              />
              <label className="flex-1 cursor-pointer">
                <div className="text-sm font-medium">{result.name}</div>
                <div className="text-xs text-gray-500">ID: {result.id}</div>
              </label>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
