import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = import.meta.env.VITE_API_URL;
let isRefreshing = false;
let refreshSubscribers = [];

const adminApi = axios.create({
  baseURL: API_URL,
});

const onRefreshed = (newToken) => {
  refreshSubscribers.forEach((callback) => callback(newToken));
  refreshSubscribers = [];
};

const addSubscriber = (callback) => {
  refreshSubscribers.push(callback);
};

adminApi.interceptors.request.use((config) => {
  const token = Cookies.get('admin_access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

adminApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve) => {
          addSubscriber((newToken) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            resolve(adminApi(originalRequest));
          });
        });
      }

      isRefreshing = true;

      try {
        const refreshToken = Cookies.get('admin_refresh_token');
        if (refreshToken) {
          const { data } = await axios.post(
            `${API_URL}/admin/refresh-token`,
            { refreshToken },
            { withCredentials: true }
          );

          const newAccessToken = data.accessToken;
          Cookies.set('admin_access_token', newAccessToken, { path: '/', expires: 1 });
          onRefreshed(newAccessToken);
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return adminApi(originalRequest);
        }
      } catch (refreshError) {
        Cookies.remove('admin_access_token');
        Cookies.remove('admin_refresh_token');
        window.location.href = '/admin/login';
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default adminApi;
