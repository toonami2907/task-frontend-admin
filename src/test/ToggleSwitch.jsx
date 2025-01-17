import React from 'react';

const ToggleSwitch = ({ id, state, loading }) => {
  return (
    <div className="flex items-center">
      {loading ? (
        <span className="text-yellow-500 font-semibold">Loading...</span>
      ) : (
        <div
          className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer ${
            state ? 'bg-green-500' : 'bg-gray-400'
          }`}
        >
          <div
            className={`bg-white w-4 h-4 rounded-full shadow transform ${
              state ? 'translate-x-6' : ''
            }`}
          ></div>
        </div>
      )}
    </div>
  );
};

export default ToggleSwitch;
