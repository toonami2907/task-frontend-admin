"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { z } from "zod";

import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { useGlobalContext } from "@/context/StateProvider";
import { MoreHorizontal, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import Cookies from "js-cookie";

// Define Zod schema for employee form validation
const employeeSchema = z.object({
  fullName: z.string().min(1, "Full Name is required"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email format"),
  position: z.string().min(1, "Position is required"),
});

export default function EmployeesPage() {
  const {
    addEmployee,
    fetchEmployeesByCompany,
    setEmployeesCount,
    loading: globalLoading,
    api
  } = useGlobalContext();
  const [employees, setEmployees] = useState([]);
  const [open, setOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    position: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [companyEmployeesCount, setCompanyEmployeesCount] = useState(0);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const employeesPerPage = 10;

  // Load selected company and fetch employees on component mount
  useEffect(() => {
    const storedCompany = localStorage.getItem("selectedCompany");
    if (storedCompany) {
      const company = JSON.parse(storedCompany);
      setSelectedCompany(company);
      fetchEmployees(company.id);
    } else {
      toast.error("No company selected");
    }
  }, []);

  // Fetch employees from backend
  const fetchEmployees = async (companyId) => {
    try {
      setIsLoading(true);
      const data = await fetchEmployeesByCompany(companyId);
      setEmployees(data.employees);
      setCompanyEmployeesCount(data.count);
    } catch (error) {
      console.error("Error fetching employees:", error);
      toast.error("Failed to fetch employees");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    // Clear error for the field being edited
    setErrors((prev) => ({ ...prev, [id]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCompany) {
      toast.error("No company selected");
      return;
    }
    try {
      // Validate form data with Zod
      employeeSchema.parse(formData);
      setIsLoading(true);
      // Prepare employee data
      const employeeData = {
        fullName: formData.fullName,
        email: formData.email,
        position: formData.position,
        companyId: selectedCompany.id,
      };
      // Use the addEmployee function from context
      const newEmployee = await addEmployee(employeeData);
      // Update local employees state
      setEmployees((prev) => [...prev, newEmployee]);
      setCompanyEmployeesCount((prev) => prev + 1);
      // Reset form and close dialog
      setFormData({ fullName: "", email: "", position: "" });
      setErrors({});
      setOpen(false);
      toast.success("Employee added successfully");
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors = error.errors.reduce((acc, curr) => {
          acc[curr.path[0]] = curr.message;
          return acc;
        }, {});
        setErrors(newErrors);
      } else {
        console.error("Error creating employee:", error);
        toast.error(
          error.response?.data?.error || "Failed to create employee"
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle employee deletion
  const handleDeleteEmployee = async () => {
    if (!employeeToDelete) return;
    
    try {
      setIsDeleting(true);
      await axios.delete(`${api}/api/v1/employees/${employeeToDelete.id}`, {
        withCredentials: true,
        headers: {
          'Authorization': `Bearer ${Cookies.get('admin_access_token')}`
        }
      });
      
      // Update local state
      setEmployees(employees.filter(emp => emp.id !== employeeToDelete.id));
      setCompanyEmployeesCount(prev => prev - 1);
      setEmployeesCount(prev => prev - 1);
      
      toast.success("Employee deleted successfully");
      setShowDeleteDialog(false);
      setEmployeeToDelete(null);
    } catch (error) {
      console.error("Error deleting employee:", error);
      toast.error(error.response?.data?.error || "Failed to delete employee");
    } finally {
      setIsDeleting(false);
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(employees.length / employeesPerPage);
  const startIndex = (currentPage - 1) * employeesPerPage;
  const currentEmployees = employees.slice(
    startIndex,
    startIndex + employeesPerPage
  );

  const handlePrevious = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div className="p-6 max-w-screen-lg mx-auto">
      <Toaster position="top-center" />
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold">Employees</h1>
          <p className="text-sm text-gray-500 mt-1">
            Total: {companyEmployeesCount} employee
            {companyEmployeesCount !== 1 ? "s" : ""}
          </p>
        </div>
        <Button onClick={() => setOpen(true)}>New Employee</Button>
      </div>
      {isLoading || globalLoading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="border rounded-md">
          <div className="grid grid-cols-5 p-3 font-semibold bg-gray-100">
            <div>Full Name</div>
            <div>Email</div>
            <div>Position</div>
            <div>Teams</div>
            <div className="text-center">Actions</div>
          </div>
          {currentEmployees.length > 0 ? (
            currentEmployees.map((employee) => (
              <div
                key={employee.id}
                className="grid grid-cols-5 p-3 border-t"
              >
                <div>{employee.fullName}</div>
                <div>{employee.email}</div>
                <div>{employee.position}</div>
                <div>
                  {employee.teams && employee.teams.length > 0
                    ? employee.teams
                        .map((team) => team.name)
                        .join(", ")
                    : "None"}
                </div>
                <div className="flex justify-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        className="text-red-600 cursor-pointer flex items-center"
                        onClick={() => {
                          setEmployeeToDelete(employee);
                          setShowDeleteDialog(true);
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Employee
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))
          ) : (
            <div className="p-3 text-center text-gray-500">
              No employees found.
            </div>
          )}
        </div>
      )}
      <div className="flex justify-end mt-4 gap-2">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentPage === 1}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          onClick={handleNext}
          disabled={currentPage === totalPages || totalPages === 0}
        >
          Next
        </Button>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Employee</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Create a new employee profile
            </p>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                placeholder="Employee Full Name"
                value={formData.fullName}
                onChange={handleInputChange}
              />
              {errors.fullName && (
                <p className="text-red-500 text-sm">
                  {errors.fullName}
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Employee Email"
                value={formData.email}
                onChange={handleInputChange}
              />
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="position">Position</Label>
              <Input
                id="position"
                placeholder="Employee Position"
                value={formData.position}
                onChange={handleInputChange}
              />
              {errors.position && (
                <p className="text-red-500 text-sm">
                  {errors.position}
                </p>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Submitting..." : "Submit"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this employee?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the employee
              "{employeeToDelete?.fullName}" and remove them from all teams.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDeleteEmployee();
              }}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Deleting..." : "Delete Employee"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
