import React, { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
const ComponentB = ({ data, onSelectionChange, selectedIds, toggleStates }) => {
    return (
      <div className="p-4 border rounded-lg bg-gray-50">
        <h3 className="text-lg font-semibold mb-4">Component B</h3>
        <div className="space-y-3">
          {data.map((item) => (
            <div key={item.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(item.id)}
                  onChange={(e) => onSelectionChange(item.id, e.target.checked)}
                  className="w-4 h-4"
                />
                <span>{item.name}</span>
              </div>
              <Switch
                checked={toggleStates[item.id] === 'Active'}
                disabled
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

export default ComponentB;
