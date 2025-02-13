import React, { useState, useEffect } from 'react';
import { Timer, X } from 'lucide-react';
import {useNavigate} from 'react-router-dom';

const TrialBanner = ({expiryDate}) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  
  const [isVisible, setIsVisible] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const expirationDate = new Date(expiryDate);

    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = expirationDate - now;

      if (difference <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / (1000 * 60)) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      };
    };

    // Initial calculation
    setTimeLeft(calculateTimeLeft());

    // Update every second
    const timer = setInterval(() => {
      const timeRemaining = calculateTimeLeft();
      setTimeLeft(timeRemaining);
      
      // Clear interval when time is up
      if (timeRemaining.days === 0 && 
          timeRemaining.hours === 0 && 
          timeRemaining.minutes === 0 && 
          timeRemaining.seconds === 0) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (!isVisible) return null;

  const formatNumber = (num) => num.toString().padStart(2, '0');

  return (
    <div className="">
      <div className="w-full  px-2 sm:px-6 lg:px-8">
        <div className="p-2 rounded-lg bg-blue-600 shadow-lg sm:p-3">
          <div className="flex items-center justify-between flex-wrap">
            <div className="w-0 flex-1 flex items-center">
              <span className="flex p-2 rounded-lg bg-blue-800">
                <Timer className="h-6 w-6 text-white" />
              </span>
              <div className="ml-3 font-medium text-white">
                <span className="md:hidden">Trial expires soon!</span>
                <span className="hidden md:inline">Your free trial will expire in</span>
                <span className="ml-2 font-bold">
                  {timeLeft.days > 0 && `${timeLeft.days}d `}
                  {formatNumber(timeLeft.hours)}:{formatNumber(timeLeft.minutes)}:{formatNumber(timeLeft.seconds)}
                </span>
              </div>
            </div>
            
            <div className="order-3 mt-2 flex-shrink-0 w-full sm:order-2 sm:mt-0 sm:w-auto">
              <button
                className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-blue-600 bg-white hover:bg-blue-50"
                onClick={() => {
                  navigate('/billing/pricing');
                }}
              >
                Upgrade Now
              </button>
            </div>
            
            <div className="order-2 flex-shrink-0 sm:order-3 sm:ml-2">
              <button
                type="button"
                className="-mr-1 flex p-2 rounded-md hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-white"
                onClick={() => setIsVisible(false)}
              >
                <span className="sr-only">Dismiss</span>
                <X className="h-6 w-6 text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrialBanner;