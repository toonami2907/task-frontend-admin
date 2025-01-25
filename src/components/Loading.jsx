/* eslint-disable react/prop-types */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Server, Database, ChartBar } from 'lucide-react';

const LoadingStages = [
  { 
    icon: Server, 
    message: "Connecting to Ads Platform", 
    subtext: "Establishing secure connection"
  },
  { 
    icon: Database, 
    message: "Loading Campaign Data", 
    subtext: "Retrieving performance metrics"
  },
  { 
    icon: ChartBar, 
    message: "Preparing Dashboard", 
    subtext: "Generating visualizations"
  }
];

const Loading = ({ 
  error = null, 
  onRetry = () => {} 
}) => {
  const [currentStage, setCurrentStage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStage((prev) => (prev + 1) % LoadingStages.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-red-50 p-6">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Connection Error
          </h2>
          <p className="text-red-500 mb-6">{error}</p>
          <button 
            onClick={onRetry}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition"
          >
            Retry Connection
          </button>
        </motion.div>
      </div>
    );
  }

  const CurrentStage = LoadingStages[currentStage];

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-100 to-blue-200">
      <motion.div 
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-center mb-6">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              ease: "linear" 
            }}
          >
            <CurrentStage.icon 
              size={64} 
              className="text-blue-600 animate-pulse"
            />
          </motion.div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5 }}
            className="space-y-2"
          >
            <h2 className="text-3xl font-bold text-blue-800">
              {CurrentStage.message}
            </h2>
            <p className="text-blue-600">
              {CurrentStage.subtext}
            </p>
          </motion.div>
        </AnimatePresence>

        <div className="mt-8 flex justify-center space-x-2">
          {LoadingStages.map((stage, index) => (
            <div 
              key={index} 
              className={`h-2 w-8 rounded-full transition-colors ${
                index === currentStage 
                  ? 'bg-blue-600' 
                  : 'bg-blue-300'
              }`}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Loading;