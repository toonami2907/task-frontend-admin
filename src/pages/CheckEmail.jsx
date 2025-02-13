import { Mail } from 'lucide-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';


const CheckEmail = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            <Mail className="mx-auto h-12 w-12 text-blue-600" />
            <h2 className="mt-4 text-2xl font-bold text-gray-900">Check your email</h2>
            <p className="mt-2 text-sm text-gray-600">
              We've sent a password reset link to your email address. Please check your inbox and follow the instructions.
            </p>
          </div>

          <div className="mt-6">
            <p className="text-sm text-center text-gray-600">
              Didn't receive the email?
            </p>
            <button
              onClick={() => navigate('/forgot-password')}
              className="mt-2 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Try again
            </button>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/auth')}
              className="text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              Back to login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckEmail;
