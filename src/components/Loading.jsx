import React from 'react';
import { motion } from 'framer-motion';

const Loading = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-50">
      <div className="flex flex-col items-center">
        <motion.div
          className="w-24 h-24 mb-8 relative"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Outer circle */}
          <motion.div 
            className="absolute inset-0 rounded-full border-4 border-teal-500/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          />
          
          {/* Spinning arc */}
          <motion.div 
            className="absolute inset-0 rounded-full border-4 border-transparent border-t-teal-600"
            animate={{ rotate: 360 }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity, 
              ease: "linear" 
            }}
          />
          
          {/* Inner pulse */}
          <motion.div 
            className="absolute inset-4 rounded-full bg-teal-50"
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.7, 1, 0.7]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              ease: "easeInOut" 
            }}
          />
          
          {/* Center dot */}
          <motion.div 
            className="absolute inset-10 rounded-full bg-teal-600"
            animate={{ 
              scale: [1, 0.9, 1]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              ease: "easeInOut" 
            }}
          />
        </motion.div>
        
        <motion.div
          className="flex flex-col items-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Loading</h2>
          <p className="text-sm text-gray-500">Please wait a moment...</p>
        </motion.div>
      </div>
    </div>
  );
};

export default Loading;
