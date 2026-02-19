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
import { cn } from "@/lib/utils";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

// Define Zod schema for employee form validation
const employeeSchema = z.object({
  fullName: z.string().min(1, "Full Name is required"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email format"),
  position: z.string().min(1, "Position is required"),
  roleId: z.string().optional(),
  roleName: z.string().optional(),
}).refine((data) => {
  if (data.roleId === "other") {
    return !!data.roleName && data.roleName.trim().length > 0;
  }
  return true;
}, {
  message: "Please enter a role name",
  path: ["roleName"]
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
    roleId: "",
    roleName: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [companyEmployeesCount, setCompanyEmployeesCount] = useState(0);
  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [roles, setRoles] = useState([]);
  const [isLoadingRoles, setIsLoadingRoles] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const employeesPerPage = 10;
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Load selected company and fetch employees on component mount
  useEffect(() => {
    const storedCompany = localStorage.getItem("selectedCompany");
    if (storedCompany) {
      const company = JSON.parse(storedCompany);
      setSelectedCompany(company);
      fetchEmployees(company.id);
      fetchRoles(company.id);
    } else {
      toast.error("No company selected");
    }
  }, []);

  useEffect(() => {
    const shouldOpenCreate = searchParams.get("modal") === "create";
    if (shouldOpenCreate) {
      setOpen(true);
    } else {
      setOpen(false);
    }
  }, [searchParams]);

  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(employees.length / employeesPerPage));
    if (currentPage > maxPage) {
      setCurrentPage(maxPage);
    }
  }, [employees.length, currentPage]);

  useEffect(() => {
    if (!showDeleteDialog) {
      document.body.style.pointerEvents = "";
    }
  }, [showDeleteDialog]);

  const closeEmployeeDialog = () => {
    setOpen(false);
    if (searchParams.get("modal") === "create") {
      navigate(location.pathname, { replace: true });
    }
  };

  const handleDeleteDialogChange = (nextOpen) => {
    setShowDeleteDialog(nextOpen);
    if (!nextOpen && !isDeleting) {
      setEmployeeToDelete(null);
    }
  };

  const fetchRoles = async (companyId) => {
    try {
      setIsLoadingRoles(true);
      const response = await axios.get(`${api}/api/v1/roles/company/${companyId}`, {
        params: { target: "worker" },
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${Cookies.get('admin_access_token')}`,
        },
      });
      setRoles(response.data.roles || []);
    } catch (error) {
      console.error("Error fetching roles:", error);
      toast.error("Failed to load roles");
    } finally {
      setIsLoadingRoles(false);
    }
  };

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
      let roleIdToUse = formData.roleId;
      if (formData.roleId === "other" && formData.roleName?.trim()) {
        const normalizedRoleName = formData.roleName.trim().toLowerCase();
        const existingRole = roles.find(
          (role) => role.name?.trim().toLowerCase() === normalizedRoleName
        );
        if (existingRole) {
          roleIdToUse = existingRole._id;
        } else {
          const supervisorRole = roles.find(
            (role) => role.name?.toLowerCase() === "supervisor"
          );
          const newRoleResponse = await axios.post(
            `${api}/api/v1/roles`,
            {
              companyId: selectedCompany.id,
              name: formData.roleName.trim(),
              target: "worker",
              permissions: supervisorRole?.permissions || [],
            },
            {
              withCredentials: true,
              headers: {
                Authorization: `Bearer ${Cookies.get('admin_access_token')}`,
              },
            }
          );
          roleIdToUse = newRoleResponse.data.role?._id;
          if (roleIdToUse) {
            setRoles((prev) => [...prev, newRoleResponse.data.role]);
          }
        }
      }

      // Prepare employee data
      const employeeData = {
        fullName: formData.fullName,
        email: formData.email,
        position: formData.position,
        roleId: roleIdToUse || undefined,
        companyId: selectedCompany.id,
      };
      // Use the addEmployee function from context
      const newEmployee = await addEmployee(employeeData);
      // Update local employees state
      setEmployees((prev) => [...prev, newEmployee]);
      setCompanyEmployeesCount((prev) => prev + 1);
      // Reset form and close dialog
      setFormData({ fullName: "", email: "", position: "", roleId: "", roleName: "" });
      setErrors({});
      closeEmployeeDialog();
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
    if (!employeeToDelete?.id) return;
    const targetEmployeeId = employeeToDelete.id;
    
    // Close first to avoid stuck overlay/pointer lock from delayed dialog close.
    setShowDeleteDialog(false);
    try {
      setIsDeleting(true);
      await axios.delete(`${api}/api/v1/employees/${targetEmployeeId}`, {
        withCredentials: true,
        headers: {
          'Authorization': `Bearer ${Cookies.get('admin_access_token')}`
        }
      });
      
      // Update local state
      setEmployees((prev) => prev.filter((emp) => emp.id !== targetEmployeeId));
      setCompanyEmployeesCount((prev) => Math.max(0, prev - 1));
      setEmployeesCount((prev) => Math.max(0, prev - 1));
      
      toast.success("Employee deleted successfully");
    } catch (error) {
      console.error("Error deleting employee:", error);
      toast.error(error.response?.data?.error || "Failed to delete employee");
    } finally {
      setIsDeleting(false);
      setEmployeeToDelete(null);
    }
  };

  // Pagination logic
  const filteredEmployees = employees.filter((employee) => {
    if (statusFilter === "deleted") {
      return employee.isDeleted || employee.status === "deleted";
    }
    if (statusFilter === "active") {
      return !employee.isDeleted && employee.status !== "deleted";
    }
    return true;
  });

  const totalPages = Math.ceil(filteredEmployees.length / employeesPerPage);
  const startIndex = (currentPage - 1) * employeesPerPage;
  const currentEmployees = filteredEmployees.slice(
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
    <div className="p-4 sm:p-6 max-w-[1400px] mx-auto min-h-screen">
  <Toaster position="top-center" />
  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3 sm:mb-4">
    <div>
      <h1 className="text-xl sm:text-2xl font-semibold text-slate-900">Employees</h1>
      <p className="text-xs sm:text-sm text-slate-500 mt-1">
        Total: {companyEmployeesCount} employee
        {companyEmployeesCount !== 1 ? "s" : ""}
      </p>
    </div>
    <div className="mt-2 sm:mt-0 flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
      <select
        value={statusFilter}
        onChange={(event) => {
          setStatusFilter(event.target.value);
          setCurrentPage(1);
        }}
        className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700"
      >
        <option value="all">All Employees</option>
        <option value="active">Active Employees</option>
        <option value="deleted">Deleted Employees</option>
      </select>
      <Button onClick={() => setOpen(true)} className="h-10 w-full sm:w-auto bg-blue-700 text-white hover:bg-blue-600">
        New Employee
      </Button>
    </div>
  </div>
  {isLoading || globalLoading ? (
    <div className="flex justify-center items-center h-40">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  ) : (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <div className="grid grid-cols-1 sm:grid-cols-7 p-3 font-semibold bg-slate-50 text-[11px] uppercase tracking-wide text-slate-600">
        <div className="sm:col-span-1">Full Name</div>
        <div className="sm:col-span-1">Email</div>
        <div className="sm:col-span-1">Position</div>
        <div className="sm:col-span-1">Role</div>
        <div className="sm:col-span-1">Status</div>
        <div className="sm:col-span-1">Teams</div>
        <div className="text-center">Actions</div>
      </div>
      {currentEmployees.length > 0 ? (
        <div className="overflow-y-auto max-h-[calc(100vh-300px)] divide-y divide-slate-100">
          {currentEmployees.map((employee) => (
            <div
              key={employee.id}
              className="grid grid-cols-1 sm:grid-cols-7 p-3 text-sm hover:bg-slate-50/70 transition-colors"
            >
              <div className="line-clamp-1 font-medium text-slate-900">
                {employee.isDeleted ? "Deleted employee" : employee.fullName}
              </div>
              <div className="line-clamp-1 text-slate-700">{employee.email}</div>
              <div className="line-clamp-1 text-slate-700">{employee.position}</div>
              <div className="line-clamp-1 text-slate-700">
                {roles.find((role) => role._id === employee.role)?.name || "--"}
              </div>
              <div className="line-clamp-1">
                <span
                  className={cn(
                    "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
                    employee.isDeleted || employee.status === "deleted"
                      ? "bg-red-100 text-red-700"
                      : "bg-emerald-100 text-emerald-700"
                  )}
                >
                  {employee.isDeleted ? "Deleted" : employee.status || "active"}
                </span>
              </div>
              <div className="line-clamp-1 text-slate-700">
                {employee.teams && employee.teams.length > 0
                  ? employee.teams
                      .map((team) => team.name)
                      .join(", ")
                  : "None"}
              </div>
              <div className="flex justify-center">
                {employee.isDeleted ? (
                  <span className="text-xs text-slate-400">N/A</span>
                ) : (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0 text-slate-600 hover:text-slate-900">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        className="text-red-600 cursor-pointer flex items-center text-sm"
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
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-6 text-center text-slate-500 text-sm">
          No employees found.
        </div>
      )}
    </div>
  )}
  <div className="flex justify-end mt-3 sm:mt-4 gap-2">
    <Button
      variant="outline"
      onClick={handlePrevious}
      disabled={currentPage === 1}
      className="h-9 px-3 text-sm border-slate-300"
    >
      Previous
    </Button>
    <Button
      variant="outline"
      onClick={handleNext}
      disabled={currentPage === totalPages || totalPages === 0}
      className="h-9 px-3 text-sm border-slate-300"
    >
      Next
    </Button>
  </div>
  <Dialog open={open} onOpenChange={(nextOpen) => (nextOpen ? setOpen(true) : closeEmployeeDialog())}>
    <DialogContent className="w-[90%] rounded-md sm:max-w-md p-4 sm:p-6">
      <DialogHeader>
        <DialogTitle className="text-lg sm:text-xl">Add New Employee</DialogTitle>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Create a new employee profile
        </p>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="grid gap-2 sm:gap-4 py-2 sm:py-4">
        <div className="grid gap-1 sm:gap-2">
          <Label htmlFor="fullName" className="text-xs sm:text-sm">Full Name</Label>
          <Input
            id="fullName"
            placeholder="Employee Full Name"
            value={formData.fullName}
            onChange={handleInputChange}
            className="text-sm"
          />
          {errors.fullName && (
            <p className="text-red-500 text-xs">{errors.fullName}</p>
          )}
        </div>
        <div className="grid gap-1 sm:gap-2">
          <Label htmlFor="email" className="text-xs sm:text-sm">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="Employee Email"
            value={formData.email}
            onChange={handleInputChange}
            className="text-sm"
          />
          {errors.email && (
            <p className="text-red-500 text-xs">{errors.email}</p>
          )}
        </div>
        <div className="grid gap-1 sm:gap-2">
          <Label htmlFor="position" className="text-xs sm:text-sm">Position</Label>
          <Input
            id="position"
            placeholder="Employee Position"
            value={formData.position}
            onChange={handleInputChange}
            className="text-sm"
          />
          {errors.position && (
            <p className="text-red-500 text-xs">{errors.position}</p>
          )}
        </div>
        <div className="grid gap-1 sm:gap-2">
          <Label htmlFor="roleId" className="text-xs sm:text-sm">Role</Label>
          <select
            id="roleId"
            value={formData.roleId}
            onChange={handleInputChange}
            className="h-10 rounded-md border border-gray-200 bg-white px-3 text-sm"
            disabled={isLoadingRoles}
          >
            <option value="">Supervisor (Default)</option>
            {roles.map((role) => (
              <option key={role._id} value={role._id}>{role.name}</option>
            ))}
            <option value="other">Other (create new)</option>
          </select>
          {formData.roleId === "other" && (
            <Input
              id="roleName"
              placeholder="Enter role name"
              value={formData.roleName}
              onChange={handleInputChange}
              className="text-sm"
            />
          )}
          {errors.roleName && (
            <p className="text-red-500 text-xs">{errors.roleName}</p>
          )}
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={closeEmployeeDialog}
            disabled={isLoading}
            className="text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-1 bg-blue-700 text-white hover:bg-blue-600"
          >
            {isLoading ? "Submitting..." : "Submit"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>

  {/* Delete Confirmation Dialog */}
  <AlertDialog open={showDeleteDialog} onOpenChange={handleDeleteDialogChange}>
    <AlertDialogContent className="w-[90%] sm:max-w-md p-4 sm:p-6">
      <AlertDialogHeader>
        <AlertDialogTitle className="text-lg sm:text-xl">Are you sure you want to delete this employee?</AlertDialogTitle>
        <AlertDialogDescription className="text-sm sm:text-base">
          This action cannot be undone. This will permanently delete the employee
          "{employeeToDelete?.fullName}" and remove them from all teams.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel disabled={isDeleting} className="text-sm">Cancel</AlertDialogCancel>
        <AlertDialogAction
          onClick={handleDeleteEmployee}
          disabled={isDeleting}
          className="bg-red-600 hover:bg-red-700 text-sm"
        >
          {isDeleting ? "Deleting..." : "Delete Employee"}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</div>
  );
}


