/* eslint-disable react-refresh/only-export-components */

import {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";
import PropTypes from "prop-types";
import { adminService } from "@/services/admin.service";
import adminApi from "@/services/API/adminAxiosConfig";
import {useNavigate} from 'react-router-dom';
import { ErrorToast } from "@/hooks/customToast";
import { useToast } from "@/hooks/use-toast";

const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();


  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const { data } = await adminApi.get('/api/admin/users');
      setUsers(data.data);
      
      // const statsData = {
      //   active: data.data.filter(user => user.status === 'ACTIVE').length,
      //   inactive: data.data.filter(user => user.status === 'INACTIVE').length,
      //   suspended: data.data.filter(user => user.status === 'SUSPENDED').length,
      //   total: data.data.length
      // };
    } catch (error) {
      toast({
        title: "Error fetching users",
        description: error.message || "An error occurred while fetching users.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const verifyAdminSession = async () => {
    try {
      const data  = await adminService.verifyAdmin();
      if (data.admin) {
        setAdmin(data.admin);
      }
    } catch (error) {
        console.error('Failed to verify admin session', error);
      setAdmin(null);
      localStorage.removeItem('AdminId');
      navigate('/admin/login');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAdminProfile = async () => {
    try {
      const { data } = await adminService.getAdminProfile();
      setAdmin(data.admin);
    } catch (error) {
      console.error('Failed to fetch admin profile', error);
    }
  };

  const logout = async () => {
    await adminApi.post(
      `/api/admin/logout`,
      {},
      {
        withCredentials: true,
      }
    );
    setAdmin(null);
  };

  const updatePermissions = (newPermissions) => {
    setAdmin((prev) => ({
      ...prev,
      permissions: newPermissions,
    }));
  };

  useEffect(() => {
    verifyAdminSession();
    fetchUsers()
  }, []);

  const value = {
    admin,
    isLoading,
    logout,
    users,
    fetchAdminProfile,
    updatePermissions,
    isAuthenticated: !!admin,
    hasPermission: (module, action) =>
      admin?.permissions?.[module]?.includes(action) || false,
  };

  return (
    <AdminContext.Provider value={value}>
      {!isLoading && children}
    </AdminContext.Provider>
  );
};

AdminProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
};
