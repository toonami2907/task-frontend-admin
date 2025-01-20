import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_URL } from "@/functions/features/StateProvider";

const FacebookCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get("code");
      const state = urlParams.get("state");
      const error = urlParams.get("error");
        console.log('code', code)
        console.log('state', state)
      if (error) {
        console.error("Facebook login error:", error);
        // navigate("/error?message=Facebook login failed.");
        return;
      }

      if (code) {
        try {
          const response = await axios.post(`${API_URL}/auth/fb/callback`, {
            code,
            state
          });

          console.log("Successfully authenticated:", response.data);
          navigate("/"); // Redirect to the dashboard after success
        } catch (err) {
          console.error("Failed to complete login:", err.response?.data || err.message);
          navigate("/error?message=Authentication failed.");
        }
      }
    };

    handleCallback();
  }, [navigate]);

  return <div>Processing Facebook Login...</div>;
};

export default FacebookCallback;
