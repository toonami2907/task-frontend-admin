import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {  ArrowRight } from 'lucide-react';

const FbSucess = () => {
    const navigate = useNavigate();

    useEffect(() => {
      const timer = setTimeout(() => {
        navigate('/')
        window.location.reload()
    }, 3000);
      return () => clearTimeout(timer);
    }, [navigate]);

  return (
     <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4">
      <div className="bg-white shadow-2xl rounded-2xl p-8 text-center max-w-md w-full">
        <div className="flex justify-center mb-6">
          <img src="/meta ads.svg" alt=""  className='h-28 w-28'/>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Facebook Connected
        </h1>
        
        <p className="text-gray-600 mb-6">
          Your Facebook ads account is now successfully integrated with our platform.
        </p>
        
        <div className="flex items-center justify-center space-x-2 text-blue-600">
          <span>Redirecting to Dashboard</span>
          <ArrowRight size={20} className="animate-bounce" />
        </div>
        
        <div className="w-full bg-blue-200 h-1.5 rounded-full mt-6 overflow-hidden">
          <div 
            className="bg-blue-600 h-full animate-progress-bar" 
            style={{
              animation: 'progressBar 3s linear forwards'
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default FbSucess