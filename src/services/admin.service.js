
import adminApi from "./API/adminAxiosConfig";




export const adminService = {
  verifyAdmin: async () => {
    const response = await adminApi.get(`/api/admin/verify`, {
      withCredentials: true
    });
    return response.data;
  },

  getAdminProfile: async () => {
    const response = await adminApi.get(`/api/admin/profile`, {
      withCredentials: true
    });
    return response.data;
  }
};
