import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { api,useGlobalContext } from "@/context/StateProvider";
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import Cookies from "js-cookie";
import toast, { Toaster } from "react-hot-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Settings = () => {

  const [selectedCompany, setSelectedCompany] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const {setCompanies, companies, setCompaniesCount} = useGlobalContext(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const navigate = useNavigate();

  // Load selected company from localStorage on component mount
  useEffect(() => {
    const storedCompany = localStorage.getItem("selectedCompany");
    if (storedCompany) {
      setSelectedCompany(JSON.parse(storedCompany));
    }
  }, []);

  const handleDeleteCompany = async () => {
    if (!selectedCompany) {
      toast.error("No company selected");
      return;
    }

    try {
      setIsLoading(true);
      await axios.delete(`${api}/api/v1/companies/${selectedCompany.id}`, {
        withCredentials: true,
        headers: {
          'Authorization': `Bearer ${Cookies.get('admin_access_token')}`
        }
      });

      // Remove company from localStorage
      localStorage.removeItem("selectedCompany");
      
      // Remove company from companies array
      setCompanies(companies.filter(company => company.id !== selectedCompany.id));
      setCompaniesCount(prev => prev - 1);
      
      toast.success("Company deleted successfully");
      
      // Navigate back to companies page
      navigate("/admin/companies");
    } catch (error) {
      console.error("Error deleting company:", error);
      
      if (error.response?.status === 400 && error.response?.data?.error) {
        // Handle specific error messages from the backend
        toast.error(error.response.data.error);
      } else {
        toast.error("Failed to delete company");
      }
    } finally {
      setIsLoading(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <div className="p-6">
      <Toaster position="top-center" />
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Company Settings</h1>
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h2 className="text-xl font-semibold mb-6">Danger Zone</h2>
        <div className="border border-red-200 rounded-md p-4 bg-red-50">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h3 className="text-lg font-medium text-red-800">Delete Company</h3>
              <p className="text-sm text-gray-600 mt-1">
                Once you delete a company, there is no going back. This action cannot be undone.
                All teams, employees, and jobs associated with this company will be permanently deleted.
              </p>
            </div>
            <Button 
              variant="destructive" 
              onClick={() => setShowDeleteDialog(true)}
              disabled={isLoading || !selectedCompany}
              className="whitespace-nowrap"
            >
              {isLoading ? "Deleting..." : "Delete Company"}
            </Button>
          </div>
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the company
              `{selectedCompany?.name}` and all associated data including teams, employees, and jobs.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDeleteCompany();
              }}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {isLoading ? "Deleting..." : "Delete Company"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Settings;