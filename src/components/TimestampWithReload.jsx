/* eslint-disable react/prop-types */
import React from 'react';
import { RotateCw } from 'lucide-react';

const TimestampWithReload = ({ timestamp, onReload, isLoading }) => {
  const formatTime = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(date);
  };

  const getUpdateText = (timestamp) => {
    const now = new Date();
    const updateDate = new Date(timestamp);
    
    if (updateDate.toDateString() === now.toDateString()) {
      return `Updated today at ${formatTime(updateDate)}`;
    }
    return `Updated at ${formatTime(updateDate)}`;
  };

  return (
    <div className="lg:flex hidden items-center absolute right-5 gap-3 text-gray-700 text-md">
      <h1>{getUpdateText(timestamp)}</h1>
      <button
        onClick={onReload}
        disabled={isLoading}
        className="p-1.5 rounded-md hover:bg-gray-100 border border-gray-800 transition-colors"
        aria-label="Reload data"
      >
        <RotateCw 
        size={20}
          className={` ${isLoading ? 'animate-spin' : ''}`}
        />
      </button>
    </div>
  );
};

export default TimestampWithReload;