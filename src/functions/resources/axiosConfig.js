import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = import.meta.env.VITE_API_URL;
let isRefreshing = false; // Flag to track ongoing refresh token requests
let refreshSubscribers = []; // Queue to hold requests while refresh token is being processed

const api = axios.create({
  baseURL: API_URL,
});

// Notify all subscribers with the new access token
const onRefreshed = (newToken) => {
  refreshSubscribers.forEach((callback) => callback(newToken));
  refreshSubscribers = [];
};

// Add requests to queue while token is being refreshed
const addSubscriber = (callback) => {
  refreshSubscribers.push(callback);
};

// Request interceptor to add access_token
api.interceptors.request.use((config) => {
  const token = Cookies.get('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
//   if (!token) {
//     const refreshToken = Cookies.get('refresh_token');
//     config.headers.Authorization = `Bearer2 ${refreshToken}`;
//   }
  return config;
});

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle only 401 errors
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        // Queue the request while the token is being refreshed
        return new Promise((resolve) => {
          addSubscriber((newToken) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            resolve(api(originalRequest));
          });
        });
      }

      isRefreshing = true;

      try {
        const refreshToken = Cookies.get('refresh_token');
        console.log('refreshToken', refreshToken)
        if (refreshToken) {
          const { data } = await axios.post(
            `${API_URL}/auth/refresh-token`,
            { refreshToken },
            { withCredentials: true }
          );

          const newAccessToken = data.accessToken;

          // Save the new access token in cookies
          Cookies.set('access_token', newAccessToken, { path: '/', expires: 1 });

          // Notify subscribers with the new token
          onRefreshed(newAccessToken);

          // Retry the original request with the new token
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        } else {
          throw new Error('Refresh token not available');
        }
      } catch (refreshError) {
        // Remove tokens and redirect to login on failure
        Cookies.remove('access_token');
        Cookies.remove('refresh_token');
        localStorage.clear()
        window.location.href = '/auth';
        
      } finally {
        isRefreshing = false; // Reset the flag once done
      }
    }

    return Promise.reject(error);
  }
);

export default api;
