import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthService } from "./auth.service";
import toast from "react-hot-toast";
import Cookies from "js-cookie";
import { Loader2, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ErrorToast } from "@/hooks/customToast";

const GoogleCallback = () => {
  const authService = new AuthService();
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  const handleCallback = async (code) => {
    try {
      const result = await authService.handleGoogleCallback(code);
      const { accessToken, refreshToken, UserId } = result;

      if (result.success) {
        toast.success("User Logged in successfully");
        localStorage.setItem("UserId", UserId);
        Cookies.set("access_token", accessToken);
        Cookies.set("refresh_token", refreshToken);
        navigate("/");
        window.location.reload();
      }
    } catch (err) {
      setError(
        err.response?.data.error ||
          "Authentication failed. Please try again."
      );
      const errrorMessage =
        err.response.data?.error === "invalid_grant"
          ? "Oauth Token expired, Please Sign in with Google again"
          : err.response.data.error;
      ErrorToast(errrorMessage);
    }
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    if (code) {
      handleCallback(code);
    } else {
      setError("No authentication code found");
    }
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>

              <h2 className="text-2xl font-semibold text-gray-900 text-center">
                Authentication Failed
              </h2>

              <p className="text-gray-500 text-center">
                {error === "invalid_grant"
                  ? "Oauth Token expired, Please Sign in with Google again"
                  : error}
              </p>

              <button
                onClick={() => navigate("/auth")}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Return to Login
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>

            <h2 className="text-2xl font-semibold text-gray-900 text-center">
              Completing Sign In
            </h2>

            <p className="text-gray-500 text-center">
              Please wait while we authenticate your Google account...
            </p>

            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
              <span>Securing your session</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GoogleCallback;
