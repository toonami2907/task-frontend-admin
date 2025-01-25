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
    const diffInMillis = now - updateDate;
  
    if (diffInMillis < 0) {
      return "Updated in the future"; // Handle edge case if the timestamp is in the future
    }
  
    const diffInMinutes = Math.floor(diffInMillis / 60000);
    const diffInHours = Math.floor(diffInMillis / 3600000);
  
    if (updateDate.toDateString() === now.toDateString()) {
      if (diffInMinutes < 1) {
        return "Updated just now";
      } else if (diffInMinutes < 60) {
        return `Updated ${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
      } else {
        return `Updated today at ${formatTime(updateDate)}`;
      }
    }
  
    if (diffInHours < 24) {
      return `Updated ${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
    }
  
    return `Updated at ${formatTime(updateDate)}`;
  };
  
  return (
    <div className="hidden lg:flex items-center gap-2 text-gray-700 text-sm sm:text-base md:absolute md:right-5 md:gap-3">
      <span className="whitespace-nowrap">{getUpdateText(timestamp)}</span>
      <button
        onClick={onReload}
        disabled={isLoading}
        className="p-1 sm:p-1.5 rounded-md hover:bg-gray-100 border border-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-gray-400"
        aria-label="Reload data"
      >
        <RotateCw 
          size={16}
          className={`sm:w-5 sm:h-5 ${isLoading ? 'animate-spin' : ''} transition-transform hover:rotate-180`}
        />
      </button>
    </div>
  );
};

export default TimestampWithReload;