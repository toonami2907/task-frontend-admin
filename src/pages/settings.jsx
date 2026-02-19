import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { api, useGlobalContext } from "@/context/StateProvider";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import toast, { Toaster } from "react-hot-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";

const Settings = () => {
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const [isMembersLoading, setIsMembersLoading] = useState(false);
  const { setCompanies, companies, setCompaniesCount } = useGlobalContext(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    timezone: "UTC",
    defaultReminderIntervalMinutes: 60,
    requireCompletionApproval: true
  });
  const [dashboardRoles, setDashboardRoles] = useState([]);
  const [dashboardOwner, setDashboardOwner] = useState(null);
  const [dashboardMembers, setDashboardMembers] = useState([]);
  const [inviteForm, setInviteForm] = useState({
    email: "",
    roleId: ""
  });

  const authHeaders = useMemo(
    () => ({
      withCredentials: true,
      headers: {
        Authorization: `Bearer ${Cookies.get("admin_access_token")}`
      }
    }),
    []
  );

  useEffect(() => {
    const storedCompany = localStorage.getItem("selectedCompany");
    if (storedCompany) {
      setSelectedCompany(JSON.parse(storedCompany));
    }
  }, []);

  const loadCompanySettings = async (companyId) => {
    try {
      const response = await axios.get(`${api}/api/v1/companies/${companyId}`, authHeaders);
      const companyData = response.data.company;
      if (companyData?.settings) {
        setSettings({
          timezone: companyData.settings.timezone || "UTC",
          defaultReminderIntervalMinutes: companyData.settings.defaultReminderIntervalMinutes ?? 60,
          requireCompletionApproval: companyData.settings.requireCompletionApproval !== false
        });
      }
    } catch (error) {
      console.error("Error fetching company settings:", error);
      toast.error("Failed to load company settings");
    }
  };

  const loadDashboardRoles = async (companyId) => {
    try {
      const response = await axios.get(`${api}/api/v1/roles/company/${companyId}`, {
        ...authHeaders,
        params: { target: "dashboard" }
      });
      const roles = response.data.roles || [];
      setDashboardRoles(roles);
      setInviteForm((prev) => ({
        ...prev,
        roleId: prev.roleId || roles.find((role) => !role.isOwner)?._id || ""
      }));
    } catch (error) {
      console.error("Error loading dashboard roles:", error);
      toast.error(error.response?.data?.error || "Failed to load dashboard roles");
    }
  };

  const loadDashboardMembers = async (companyId) => {
    try {
      setIsMembersLoading(true);
      const response = await axios.get(`${api}/api/v1/company-admin-members`, {
        ...authHeaders,
        params: { companyId }
      });
      setDashboardOwner(response.data.owner || null);
      setDashboardMembers(response.data.members || []);
    } catch (error) {
      console.error("Error loading dashboard members:", error);
      toast.error(error.response?.data?.error || "Failed to load dashboard members");
    } finally {
      setIsMembersLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedCompany?.id) return;
    loadCompanySettings(selectedCompany.id);
    loadDashboardRoles(selectedCompany.id);
    loadDashboardMembers(selectedCompany.id);
  }, [selectedCompany?.id]);

  const handleSettingsChange = (field, value) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveSettings = async () => {
    if (!selectedCompany?.id) {
      toast.error("No company selected");
      return;
    }
    try {
      setIsSaving(true);
      await axios.put(
        `${api}/api/v1/companies/${selectedCompany.id}`,
        {
          settings: {
            timezone: settings.timezone,
            defaultReminderIntervalMinutes: Number(settings.defaultReminderIntervalMinutes),
            requireCompletionApproval: !!settings.requireCompletionApproval
          }
        },
        authHeaders
      );
      toast.success("Settings updated");
    } catch (error) {
      console.error("Error updating settings:", error);
      toast.error(error.response?.data?.error || "Failed to update settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleInviteDashboardManager = async () => {
    if (!selectedCompany?.id) {
      toast.error("No company selected");
      return;
    }
    if (!inviteForm.email.trim() || !inviteForm.roleId) {
      toast.error("Email and role are required");
      return;
    }

    try {
      setIsInviting(true);
      await axios.post(
        `${api}/api/v1/company-admin-members`,
        {
          companyId: selectedCompany.id,
          email: inviteForm.email.trim().toLowerCase(),
          roleId: inviteForm.roleId
        },
        authHeaders
      );
      toast.success("Dashboard manager access granted");
      setInviteForm((prev) => ({ ...prev, email: "" }));
      loadDashboardMembers(selectedCompany.id);
    } catch (error) {
      console.error("Error granting dashboard access:", error);
      toast.error(error.response?.data?.error || "Failed to grant dashboard access");
    } finally {
      setIsInviting(false);
    }
  };

  const handleUpdateMember = async (memberId, payload) => {
    try {
      await axios.patch(`${api}/api/v1/company-admin-members/${memberId}`, payload, authHeaders);
      toast.success("Dashboard manager updated");
      loadDashboardMembers(selectedCompany.id);
    } catch (error) {
      console.error("Error updating dashboard member:", error);
      toast.error(error.response?.data?.error || "Failed to update dashboard manager");
    }
  };

  const handleRemoveMember = async (memberId) => {
    try {
      await axios.delete(`${api}/api/v1/company-admin-members/${memberId}`, authHeaders);
      toast.success("Dashboard manager removed");
      loadDashboardMembers(selectedCompany.id);
    } catch (error) {
      console.error("Error removing dashboard member:", error);
      toast.error(error.response?.data?.error || "Failed to remove dashboard manager");
    }
  };

  const handleDeleteCompany = async () => {
    if (!selectedCompany) {
      toast.error("No company selected");
      return;
    }

    try {
      setIsLoading(true);
      await axios.delete(`${api}/api/v1/companies/${selectedCompany.id}`, authHeaders);

      localStorage.removeItem("selectedCompany");
      setCompanies(companies.filter((company) => company.id !== selectedCompany.id));
      setCompaniesCount((prev) => prev - 1);

      toast.success("Company deleted successfully");
      navigate("/admin");
    } catch (error) {
      console.error("Error deleting company:", error);
      toast.error(error.response?.data?.error || "Failed to delete company");
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

      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm mb-6">
        <h2 className="text-xl font-semibold mb-6">Operational Settings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="timezone" className="text-sm font-medium text-gray-700">
              Company Timezone
            </Label>
            <Input
              id="timezone"
              value={settings.timezone}
              onChange={(event) => handleSettingsChange("timezone", event.target.value)}
              placeholder="e.g. Africa/Lagos"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="interval" className="text-sm font-medium text-gray-700">
              Default Reminder Interval (minutes)
            </Label>
            <Input
              id="interval"
              type="number"
              min="1"
              value={settings.defaultReminderIntervalMinutes}
              onChange={(event) =>
                handleSettingsChange("defaultReminderIntervalMinutes", event.target.value)
              }
            />
          </div>
          <div className="flex items-center gap-3">
            <Switch
              id="requireApproval"
              checked={settings.requireCompletionApproval}
              onCheckedChange={(checked) => handleSettingsChange("requireCompletionApproval", checked)}
            />
            <Label htmlFor="requireApproval" className="text-sm font-medium text-gray-700">
              Require completion approval
            </Label>
          </div>
        </div>
        <div className="mt-6">
          <Button onClick={handleSaveSettings} disabled={isSaving || !selectedCompany}>
            {isSaving ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm mb-6">
        <h2 className="text-xl font-semibold mb-2">Dashboard Access</h2>
        <p className="text-sm text-gray-600 mb-5">
          Grant dashboard management access to other admins in this company.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr_auto] gap-3 mb-6">
          <Input
            placeholder="admin@company.com"
            value={inviteForm.email}
            onChange={(event) =>
              setInviteForm((prev) => ({ ...prev, email: event.target.value }))
            }
          />
          <select
            value={inviteForm.roleId}
            onChange={(event) =>
              setInviteForm((prev) => ({ ...prev, roleId: event.target.value }))
            }
            className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm"
          >
            <option value="">Select dashboard role</option>
            {dashboardRoles
              .filter((role) => !role.isOwner)
              .map((role) => (
                <option key={role._id} value={role._id}>
                  {role.name}
                </option>
              ))}
          </select>
          <Button onClick={handleInviteDashboardManager} disabled={isInviting || !selectedCompany}>
            {isInviting ? "Granting..." : "Grant Access"}
          </Button>
        </div>

        {isMembersLoading ? (
          <p className="text-sm text-gray-500">Loading dashboard managers...</p>
        ) : (
          <div className="space-y-3">
            {dashboardOwner ? (
              <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                <p className="font-semibold text-slate-900">{dashboardOwner.fullName}</p>
                <p className="text-sm text-slate-600">{dashboardOwner.email}</p>
                <p className="text-xs font-medium text-blue-700 mt-1">Owner (Full Access)</p>
              </div>
            ) : null}

            {dashboardMembers.length === 0 ? (
              <p className="text-sm text-gray-500">No additional dashboard managers.</p>
            ) : (
              dashboardMembers.map((member) => (
                <div
                  key={member.id}
                  className="rounded-md border border-slate-200 p-3 grid grid-cols-1 md:grid-cols-[1.5fr_1fr_1fr_auto] gap-3 items-center"
                >
                  <div>
                    <p className="font-medium text-slate-900">{member.admin?.fullName || "Admin"}</p>
                    <p className="text-sm text-slate-600">{member.admin?.email}</p>
                  </div>
                  <select
                    defaultValue={member.role?._id || ""}
                    onChange={(event) =>
                      handleUpdateMember(member.id, { roleId: event.target.value })
                    }
                    className="h-9 rounded-md border border-slate-300 bg-white px-2 text-sm"
                  >
                    {dashboardRoles
                      .filter((role) => !role.isOwner)
                      .map((role) => (
                        <option key={role._id} value={role._id}>
                          {role.name}
                        </option>
                      ))}
                  </select>
                  <select
                    defaultValue={member.status}
                    onChange={(event) =>
                      handleUpdateMember(member.id, { status: event.target.value })
                    }
                    className="h-9 rounded-md border border-slate-300 bg-white px-2 text-sm"
                  >
                    <option value="active">Active</option>
                    <option value="disabled">Disabled</option>
                  </select>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRemoveMember(member.id)}
                  >
                    Remove
                  </Button>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h2 className="text-xl font-semibold mb-6">Danger Zone</h2>
        <div className="border border-red-200 rounded-md p-4 bg-red-50">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h3 className="text-lg font-medium text-red-800">Delete Company</h3>
              <p className="text-sm text-gray-600 mt-1">
                This action is permanent. All teams, employees, and jobs in this company will be removed.
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
              onClick={(event) => {
                event.preventDefault();
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
