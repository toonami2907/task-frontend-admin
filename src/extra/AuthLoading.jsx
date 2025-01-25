import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

const AuthLoading = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prevProgress => 
        prevProgress >= 100 ? 0 : prevProgress + 10
      );
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="text-center p-8 bg-white rounded-xl shadow-2xl">
        <div className="flex justify-center mb-6">
          <Loader2 
            className="animate-spin text-blue-500" 
            size={64} 
          />
        </div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Authenticating
        </h2>
        <p className="text-gray-600 mb-4">
          Verifying your credentials...
        </p>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
            style={{
              width: `${progress}%`,
              transition: 'width 0.5s ease-in-out'
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default AuthLoading;