import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/context/StateProvider";

const TARGETS = [
  { id: "worker", label: "Worker Roles" },
  { id: "dashboard", label: "Dashboard Roles" }
];

const PERMISSIONS_BY_TARGET = {
  worker: [
    { id: "jobs.manage", label: "Jobs" },
    { id: "tasks.assign", label: "Assign Tasks" },
    { id: "tasks.approve_completion", label: "Approve Completion" },
    { id: "chat.manage", label: "Chat" },
    { id: "reports.view", label: "Reports" },
    { id: "notifications.view", label: "Notifications" }
  ],
  dashboard: [
    { id: "company.manage", label: "Company" },
    { id: "settings.manage", label: "Settings" },
    { id: "roles.dashboard.manage", label: "Manage Dashboard Roles" },
    { id: "roles.worker.manage", label: "Manage Worker Roles" },
    { id: "dashboard_admins.manage", label: "Manage Dashboard Admins" },
    { id: "invites.dashboard.send", label: "Invite Dashboard Admins" },
    { id: "invites.worker.send", label: "Invite Workers" },
    { id: "employees.manage", label: "Employees" },
    { id: "teams.manage", label: "Teams" },
    { id: "jobs.manage", label: "Jobs" },
    { id: "tasks.assign", label: "Assign Tasks" },
    { id: "tasks.approve_completion", label: "Approve Completion" },
    { id: "chat.manage", label: "Chat" },
    { id: "reports.view", label: "Reports" },
    { id: "notifications.view", label: "Notifications" }
  ]
};

const defaultForm = { name: "", permissions: [], target: "worker" };

export default function RolesPage() {
  const [roles, setRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState(null);
  const [activeTarget, setActiveTarget] = useState("worker");
  const [form, setForm] = useState(defaultForm);
  const { toast } = useToast();

  const permissionOptions = useMemo(
    () => PERMISSIONS_BY_TARGET[form.target] || [],
    [form.target]
  );

  const getCompanyId = () => {
    const stored = localStorage.getItem("selectedCompany");
    if (!stored) return null;
    try {
      return JSON.parse(stored).id;
    } catch {
      return null;
    }
  };

  const loadRoles = async (target = activeTarget) => {
    const companyId = getCompanyId();
    if (!companyId) {
      toast({
        title: "No company selected",
        description: "Please select a company",
        variant: "destructive"
      });
      return;
    }
    try {
      setIsLoading(true);
      const response = await axios.get(`${api}/api/v1/roles/company/${companyId}`, {
        params: { target },
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${Cookies.get("admin_access_token")}`
        }
      });
      setRoles(response.data.roles || []);
    } catch (error) {
      console.error("Error loading roles:", error);
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to load roles",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRoles(activeTarget);
  }, [activeTarget]);

  const handlePermissionToggle = (permission) => {
    setForm((prev) => {
      const exists = prev.permissions.includes(permission);
      return {
        ...prev,
        permissions: exists
          ? prev.permissions.filter((perm) => perm !== permission)
          : [...prev.permissions, permission]
      };
    });
  };

  const handleEdit = (role) => {
    setEditingRoleId(role._id);
    setForm({
      name: role.name || "",
      permissions: role.permissions || [],
      target: role.target || "worker"
    });
    setActiveTarget(role.target || "worker");
  };

  const resetForm = () => {
    setEditingRoleId(null);
    setForm({ ...defaultForm, target: activeTarget });
  };

  const handleTargetChange = (nextTarget) => {
    if (editingRoleId) {
      return;
    }
    setForm((prev) => ({
      ...prev,
      target: nextTarget,
      permissions: (prev.permissions || []).filter((perm) =>
        (PERMISSIONS_BY_TARGET[nextTarget] || []).some((opt) => opt.id === perm)
      )
    }));
  };

  const handleSubmit = async () => {
    const companyId = getCompanyId();
    if (!companyId) {
      toast({
        title: "No company selected",
        description: "Please select a company",
        variant: "destructive"
      });
      return;
    }
    if (!form.name.trim()) {
      toast({
        title: "Role name required",
        description: "Please enter a role name",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsSaving(true);
      if (editingRoleId) {
        await axios.put(
          `${api}/api/v1/roles/${editingRoleId}`,
          { name: form.name.trim(), permissions: form.permissions },
          {
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${Cookies.get("admin_access_token")}`
            }
          }
        );
      } else {
        await axios.post(
          `${api}/api/v1/roles`,
          {
            companyId,
            name: form.name.trim(),
            target: form.target,
            permissions: form.permissions
          },
          {
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${Cookies.get("admin_access_token")}`
            }
          }
        );
      }

      toast({
        title: "Success",
        description: editingRoleId ? "Role updated" : "Role created",
        variant: "success"
      });
      resetForm();
      loadRoles(activeTarget);
    } catch (error) {
      console.error("Error saving role:", error);
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to save role",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (role) => {
    try {
      await axios.delete(`${api}/api/v1/roles/${role._id}`, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${Cookies.get("admin_access_token")}`
        }
      });
      toast({
        title: "Deleted",
        description: "Role deleted",
        variant: "success"
      });
      loadRoles(activeTarget);
    } catch (error) {
      console.error("Error deleting role:", error);
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to delete role",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h2 className="text-xl font-semibold">Permissions</h2>
        <p className="text-sm text-gray-500 mt-1">
          Build roles for dashboard managers and worker employees.
        </p>

        <div className="mt-4 inline-flex rounded-md border border-slate-300 p-1">
          {TARGETS.map((target) => (
            <button
              key={target.id}
              type="button"
              onClick={() => setActiveTarget(target.id)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                activeTarget === target.id
                  ? "bg-slate-900 text-white"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              {target.label}
            </button>
          ))}
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="roleName">Role Name</Label>
            <Input
              id="roleName"
              value={form.name}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, name: event.target.value }))
              }
              placeholder={activeTarget === "worker" ? "e.g. Supervisor" : "e.g. Dashboard Admin"}
            />

            <Label htmlFor="target" className="pt-2">Role Target</Label>
            <select
              id="target"
              value={form.target}
              disabled={Boolean(editingRoleId)}
              onChange={(event) => handleTargetChange(event.target.value)}
              className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm disabled:cursor-not-allowed disabled:bg-slate-100"
            >
              {TARGETS.map((target) => (
                <option key={target.id} value={target.id}>
                  {target.label}
                </option>
              ))}
            </select>
            {editingRoleId ? (
              <p className="text-xs text-slate-500">
                Role target is locked after creation for security.
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label>Permissions</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {permissionOptions.map((perm) => (
                <label key={perm.id} className="flex items-center gap-2 text-sm text-gray-700">
                  <Checkbox
                    checked={form.permissions.includes(perm.id)}
                    onCheckedChange={() => handlePermissionToggle(perm.id)}
                  />
                  {perm.label}
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex gap-2">
          <Button onClick={handleSubmit} disabled={isSaving}>
            {isSaving ? "Saving..." : editingRoleId ? "Update Role" : "Create Role"}
          </Button>
          {editingRoleId ? (
            <Button variant="outline" onClick={resetForm}>
              Cancel
            </Button>
          ) : null}
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h2 className="text-xl font-semibold">{activeTarget === "worker" ? "Worker Roles" : "Dashboard Roles"}</h2>
        {isLoading ? (
          <div className="mt-4 text-sm text-gray-500">Loading roles...</div>
        ) : roles.length === 0 ? (
          <div className="mt-4 text-sm text-gray-500">No roles yet.</div>
        ) : (
          <div className="mt-4 space-y-3">
            {roles.map((role) => (
              <div
                key={role._id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between border rounded-md p-3"
              >
                <div>
                  <p className="font-medium text-gray-900">{role.name}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {(role.permissions || []).join(", ") || "No permissions"}
                  </p>
                </div>
                <div className="mt-3 sm:mt-0 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(role)}
                    disabled={role.isOwner}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(role)}
                    disabled={role.isOwner}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
