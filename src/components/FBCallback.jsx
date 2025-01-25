import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_URL } from "@/functions/features/StateProvider";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const FacebookCallback = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState("processing");
  const [error, setError] = useState("");

  const userId = localStorage.getItem("UserId")

  useEffect(() => {
    const handleCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get("code");
      const state = urlParams.get("state");
      const error = urlParams.get("error");

      // Handle missing parameters
      if (!code && !error) {
        setStatus("error");
        setError("Invalid callback URL. Missing required parameters.");
        setTimeout(() => navigate("/"), 3000);
        return;
      }

      // Handle Facebook OAuth errors
      if (error) {
        setStatus("error");
        setError(
          error === "access_denied" 
            ? "Facebook login was canceled or denied" 
            : `Facebook login error: ${error}`
        );
        setTimeout(() => navigate("/"), 3000);
        return;
      }
      if (code) {
        try {
          const response = await axios.post(`${API_URL}/auth/fb/callback`, {
            code,
            state,
            userId
          });

          // Validate response data
          if (!response.data) {
            throw new Error("Invalid response from server");
          }

          setStatus("success");
          setTimeout(() => {
            navigate("/facebook/success");
           
          }, 1500);
        } catch (err) {
          setStatus("error");
          setError(
            err.response?.data?.message || 
            err.message || 
            "Authentication failed. Please try again."
          );
          setTimeout(() => navigate("/auth"), 3000);
        }
      }
    };

    // Wrap the callback in a try-catch to handle any unexpected errors
    try {
      handleCallback();
    } catch (unexpectedError) {
      setStatus("error");
      setError("An unexpected error occurred. Please try again.");
      setTimeout(() => navigate("/"), 3000);
    }
  }, [navigate]);

  const getErrorMessage = (error) => {
    if (!error) return "An unknown error occurred";
    if (typeof error === "string") return error;
    return error.message || "Authentication failed. Please try again.";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md p-6">
        <CardContent className="flex flex-col items-center space-y-6">
          {status === "processing" && (
            <>
              <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
              <h2 className="text-xl font-semibold text-gray-900">
                Completing Facebook Login
              </h2>
              <p className="text-gray-500 text-center">
                Please wait while we authenticate your account...
              </p>
            </>
          )}

          {status === "success" && (
            <Alert className="bg-green-50 border-green-200">
              <AlertTitle className="text-green-800">
                Successfully Authenticated
              </AlertTitle>
              <AlertDescription className="text-green-600">
                Redirecting you to the dashboard...
              </AlertDescription>
            </Alert>
          )}

          {status === "error" && (
            <Alert variant="destructive">
              <AlertTitle>Authentication Failed</AlertTitle>
              <AlertDescription>
                {getErrorMessage(error)}
                <br />
                Redirecting you back to login...
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FacebookCallback;