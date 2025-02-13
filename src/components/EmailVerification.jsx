import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Check, X, Loader2 } from "lucide-react";
import api from "@/functions/resources/axiosConfig";
import { API_URL } from "@/functions/features/StateProvider";

const EmailVerification = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("verifying");

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await api.get(
          `${API_URL}/auth/v1/verify/token/${token}`
        );
        if (response.status === 200) {
          setStatus("success");
          setTimeout(() => navigate("/"), 3000);
        }
      } catch (error) {
        setStatus("error");
      }
    };

    verifyEmail();
  }, [token, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-md w-full p-8 bg-white rounded-xl shadow-lg transform transition-all">
        <div className="text-center">
          {status === "verifying" && (
            <div className="space-y-6">
              <div className="relative mx-auto w-24 h-24">
                <Loader2 className="w-24 h-24 text-blue-500 animate-spin" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Verifying Your Email
                </h2>
                <p className="text-gray-600">
                  Please wait while we verify your email address...
                </p>
              </div>
            </div>
          )}

          {status === "success" && (
            <div className="space-y-6">
              <div className="relative mx-auto w-24 h-24 flex items-center justify-center bg-green-100 rounded-full">
                <Check className="w-14 h-14 text-green-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-green-600 mb-2">
                  Email Verified Successfully!
                </h2>
                <p className="text-gray-600">
                  Thank you for verifying your email. You'll be redirected to the dashboard in a moment...
                </p>
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="space-y-6">
              <div className="relative mx-auto w-24 h-24 flex items-center justify-center bg-red-100 rounded-full">
                <X className="w-14 h-14 text-red-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-red-600 mb-2">
                  Verification Failed
                </h2>
                <p className="text-gray-600 mb-6">
                  The verification link appears to be invalid or has expired. Please try again or contact support.
                </p>
                <div className="space-y-3">
                  <button
                    onClick={() => navigate("/")}
                    className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                  >
                    Return to Dashboard
                  </button>
                  <button
                    onClick={() => navigate("#")}
                    className="w-full px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                  >
                    Contact Support
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;