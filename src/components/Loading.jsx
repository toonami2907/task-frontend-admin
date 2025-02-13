/* eslint-disable react/prop-types */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Server, Database, LineChart, BarChart, PieChart } from 'lucide-react';

const LoadingStages = [
  { 
    icon: Server, 
    message: "Establishing Connection", 
    subtext: "Connecting to Facebook Marketing API"
  },
  { 
    icon: Database, 
    message: "Processing Data", 
    subtext: "Fetching campaign metrics and insights"
  },
  { 
    icon: LineChart, 
    message: "Analyzing Performance", 
    subtext: "Calculating ROI and conversions"
  },
  { 
    icon: BarChart, 
    message: "Generating Reports", 
    subtext: "Preparing detailed analytics"
  },
  { 
    icon: PieChart, 
    message: "Finalizing Dashboard", 
    subtext: "Optimizing data visualization"
  }
];

const Loading = ({ error = null, onRetry = () => {} }) => {
  const [currentStage, setCurrentStage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStage((prev) => (prev + 1) % LoadingStages.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-red-50 to-red-100 p-6">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center max-w-md"
        >
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Connection Error
          </h2>
          <p className="text-red-500 mb-6">{error}</p>
          <button 
            onClick={onRetry}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl"
          >
            Retry Connection
          </button>
        </motion.div>
      </div>
    );
  }

  const CurrentStage = LoadingStages[currentStage];

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <motion.div 
        className="text-center max-w-md p-8 rounded-2xl bg-white/80 backdrop-blur-sm shadow-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="relative mb-8">
          <motion.div
            className="absolute inset-0 bg-blue-100 rounded-full opacity-20"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="relative"
          >
            <CurrentStage.icon 
              size={72} 
              className="text-blue-600"
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
            className="space-y-3"
          >
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
              {CurrentStage.message}
            </h2>
            <p className="text-gray-600 font-medium">
              {CurrentStage.subtext}
            </p>
          </motion.div>
        </AnimatePresence>

        <div className="mt-8 flex justify-center space-x-2">
          {LoadingStages.map((_, index) => (
            <motion.div 
              key={index} 
              className={`h-2 rounded-full ${
                index === currentStage 
                  ? 'w-8 bg-blue-600' 
                  : 'w-2 bg-blue-200'
              }`}
              animate={index === currentStage ? { scale: 1.2 } : { scale: 1 }}
              transition={{ duration: 0.3 }}
            />
          ))}
        </div>

        <motion.div 
          className="mt-8 h-1 bg-blue-100 rounded-full overflow-hidden"
          initial={{ width: "100%" }}
        >
          <motion.div 
            className="h-full bg-blue-600"
            animate={{ 
              x: ["-100%", "100%"],
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 1.5,
              ease: "linear"
            }}
          />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Loading;