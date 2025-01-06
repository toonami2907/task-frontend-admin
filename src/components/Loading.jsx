import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

const words = ["Exploring", "Traveling", "Discovering", "Adventuring"];

const Laoding = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % words.length);
    }, 700); // Change words every 2 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <AnimatePresence mode="wait">
        <motion.div
          key={words[currentIndex]}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.8 }}
          className="text-4xl font-bold text-monochrome-900"
        >
          {words[currentIndex]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Laoding;
