import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  AlertCircle,
  KeyRound,
  Lock,
  Shield,
  Trash2,
} from "lucide-react";
import { useGlobalContext } from "@/functions/features/StateProvider";
import api from "@/functions/resources/axiosConfig";

import { AccountManager } from "@/services/User/AccountManager";
import ManageSubscription from "./SubscriptionSection";
import TrialBanner from "./TrialBanner";
import { Link } from "react-router-dom";

export default function AccountSettings() {
  const { toast } = useToast();
  const { userInfo } = useGlobalContext();
  const colors = {
    primary: {
      bg: "bg-[#1E3A8A] hover:bg-[#0F2D6B]",
      text: "text-[#1E3A8A]",
      ring: "focus:ring-[#1E3A8A]",
    },
    destructive: {
      bg: "bg-[#7F1D1D] hover:bg-[#6B1919]",
    },
    success: {
      border: "border-l-4 border-[#0F766E]",
    },
  };
  const accountManager = new AccountManager(api, userInfo);

  // Profile Section
  const [profileData, setProfileData] = useState({
    name: userInfo.name,
    email: userInfo.email,
    adAccounts: userInfo?.adAccounts,
    shopifyStore: userInfo.Shopify_shopDomain || "",
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [newAdAccount, setNewAdAccount] = useState({
    account_id: "",
    id: "",
  });

  const handleAddAdAccount = async () => {
    try {
      accountManager.validateAdAccount(newAdAccount);
      await accountManager.addAdAccount(newAdAccount);
      // Update UI state
      toast({
        title: "Account Added",
        description:
          "Your ads account has been successfully updated.",
        className: colors.success.border,
      });
      window.location.reload()
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleRemoveAdAccount = async (_id) => {
    try {
      await accountManager.removeAdAccount(_id);
      const updatedAdAccounts = profileData.adAccounts.filter(
        (account) => account._id !== _id
      );
      setProfileData({
        ...profileData,
        adAccounts: updatedAdAccounts,
      });

      toast({
        title: "Ad Account Removed",
        description:
          "Facebook Ad account has been removed successfully.",
        className: colors.success.border,
      });
      window.location.reload()
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Billing Section

  // Password Section
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    otp: "",
  });
  const [isEditingPassword, setIsEditingPassword] = useState(false);

  // Profile Handlers
  const handleProfileEdit = () => setIsEditingProfile(true);
  const handleProfileSave = async () => {
    try {
      if (profileData.shopifyStore && !profileData.shopifyStore.includes(".myshopify.com")) {
        toast({
          title: "Error",
          description: "Invalid Shopify Store URL. Please include.myshopify.com",
          variant: "destructive",
        })
      }
      const data = {
        name: profileData.name,
        email: profileData.email,
        shopifyStore: profileData.shopifyStore,
      };
      await accountManager.updateProfile(data);
      setIsEditingProfile(false);
      toast({
        title: "Profile Updated",
        description:
          "Your profile information has been successfully updated.",
        className: colors.success.border,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };
  const handleProfileCancel = () => {
    setIsEditingProfile(false);
    setProfileData({
      name: "John Doe",
      email: "john@example.com",
      adAccounts: userInfo ? userInfo?.adAccounts : [],
      shopifyStore: userInfo.Shopify_shopDomain || "my-awesome-store",
    });
    setNewAdAccount({
      account_id: "",
      id: "",
    });
  };

  
 
  const handlePasswordSave = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords don't match",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await api.post(
        "/auth/v1/user/change/password",
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
          confirmPassword: passwordData.confirmPassword,
          otp: passwordData.otp,
        }
      );

      setIsEditingPassword(false);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
        otp: "",
      });
      if (response.status === 200) {
        toast({
          title: "Success",
          description: "Password changed successfully",
          className: colors.success.border,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message,
        variant: "destructive",
      });
    }
  };
  const handlePasswordCancel = () => {
    setIsEditingPassword(false);
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const handleSendVerification = async () => {
    try {
      const response = await api.post(`/auth/v1/verify/email`);
      if (response.status === 200) {
        toast({
          title: "Verification Email Sent",
          description:
            "Please check your inbox for the verification link",
          status: "success",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message ||
          "Failed to send verification email",
        status: "error",
      });
    }
  };
  const handleRequestOTP = async () => {
    try {
         await api.post('/auth/v1/user/mail/change/password');
      toast({
        title: "Verification Code Sent",
        description: "Please check your email for the verification code",
        className: colors.success.border,
      });
      setIsEditingPassword(true);
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to send verification code",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 md:px-6 lg:max-w-4xl space-y-8 bg-[#F3F4F6]">
      {/* Profile Section */}
      {userInfo.hasUsedTrial && (
        <TrialBanner expiryDate={userInfo.subscriptionExpiresAt} />
      )}

      <section className="bg-white rounded-lg shadow-sm border border-[#E5E7EB]">
        <div className="p-6">
          <h2 className="text-2xl font-semibold text-[#111827]">
            Personal Information
          </h2>
          <p className="text-sm text-[#374151] mt-1">
            Manage your personal information and connected accounts.
          </p>
        </div>
        <Separator className="bg-[#E5E7EB]" />
        <div className="p-6 space-y-6">
          {!userInfo.isEmailVerified && (
            <div className="mb-6 p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-yellow-800">
                    Email Not Verified
                  </h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    Please verify your email address to access all
                    features.
                  </p>
                </div>
                <Button
                  onClick={handleSendVerification}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white"
                  size="sm"
                >
                  Send Verification Email
                </Button>
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label
                htmlFor="name"
                className={`${colors.primary.text} font-medium`}
              >
                Full Name
              </Label>
              <Input
                id="name"
                value={profileData.name}
                onChange={(e) =>
                  setProfileData({
                    ...profileData,
                    name: e.target.value,
                  })
                }
                className={`bg-white ${colors.primary.ring}`}
                disabled={!isEditingProfile}
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className={`${colors.primary.text} font-medium`}
              >
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={profileData.email}
                onChange={(e) =>
                  setProfileData({
                    ...profileData,
                    email: e.target.value,
                  })
                }
                className={`bg-white ${colors.primary.ring}`}
                disabled={!isEditingProfile}
              />
            </div>
          </div>

          {/* Facebook Ad Accounts Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-[#111827]">
              Facebook Ad Accounts
            </h3>

            {/* Existing Ad Accounts List */}
            <div className="space-y-3">
              {profileData?.adAccounts?.map((account) => (
                <div
                  key={account._id}
                  className="flex items-center justify-between p-3 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]"
                >
                  <div className="space-y-1">
                    <p className="font-medium text-[#111827]">
                      ID: {account.account_id}
                    </p>
                    <p className="text-sm text-[#374151]">
                      Account: {account.id}
                    </p>
                  </div>
                  {isEditingProfile && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        handleRemoveAdAccount(account._id)
                      }
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {/* Add New Ad Account Form */}
            {isEditingProfile && (
              <div className="space-y-4 p-4 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]">
                <h4 className="font-medium text-[#111827]">
                  Add New Ad Account
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="new-account-id"
                      className={`${colors.primary.text} font-medium`}
                    >
                      Account ID
                    </Label>
                    <Input
                      id="new-account-id"
                      value={newAdAccount.account_id}
                      onChange={(e) =>
                        setNewAdAccount({
                          ...newAdAccount,
                          account_id: e.target.value,
                        })
                      }
                      className={`bg-white ${colors.primary.ring}`}
                      placeholder="Enter account ID"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="new-account-name"
                      className={`${colors.primary.text} font-medium`}
                    >
                      Account Name
                    </Label>
                    <Input
                      id="new-account-name"
                      value={newAdAccount.id}
                      onChange={(e) =>
                        setNewAdAccount({
                          ...newAdAccount,
                          id: e.target.value,
                        })
                      }
                      className={`bg-white ${colors.primary.ring}`}
                      placeholder="Enter account name"
                    />
                  </div>
                </div>
                <Button
                  onClick={handleAddAdAccount}
                  className={colors.primary.bg}
                >
                  Add Ad Account
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="shopify-store"
              className={`${colors.primary.text} font-medium`}
            >
              Shopify Store Name
            </Label>
            <Input
              id="shopify-store"
              value={profileData.shopifyStore}
              onChange={(e) =>
                setProfileData({
                  ...profileData,
                  shopifyStore: e.target.value,
                })
              }
              className={`bg-white ${colors.primary.ring}`}
              disabled={!isEditingProfile}
              placeholder="Shopify Store (e.g., mystore.myshopify.com)"
            />
          </div>

          {isEditingProfile ? (
            <div className="flex gap-2">
              <Button
                onClick={handleProfileSave}
                className={colors.primary.bg}
              >
                Save Changes
              </Button>
              <Button variant="outline" onClick={handleProfileCancel}>
                Cancel
              </Button>
            </div>
          ) : (
            <Button
              onClick={handleProfileEdit}
              className={colors.primary.bg}
            >
              Edit Profile
            </Button>
          )}
        </div>
      </section>

      {/* Subscription Section */}
      <ManageSubscription userInfo={userInfo} />

      {/* Security Section */}
      <section className="bg-white rounded-xl shadow-lg border border-gray-200 transition-all duration-200 hover:shadow-xl">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-50 p-2 rounded-lg">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">
                Security Settings
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Manage your password and security preferences
              </p>
            </div>
          </div>
        </div>

        <Separator className="bg-gray-100" />

        <div className="p-8 space-y-6 w-full md:max-w-xl">
          <div className="space-y-4">
            <div className="relative">
              <Label
                htmlFor="otp"
                className="text-sm font-medium text-gray-700"
              >
                Verification Code
              </Label>
              <Input
                id="otp"
                value={passwordData.otp}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    otp: e.target.value,
                  })
                }
                disabled={!isEditingPassword}
                className="mt-2"
                placeholder="Enter code from email"
              />
            </div>
            <div className="relative">
              <Label
                htmlFor="current-password"
                className="text-sm font-medium text-gray-700 flex items-center gap-2"
              >
                <Lock className="w-4 h-4 text-gray-400" />
                Current Password
              </Label>
              <Input
                id="current-password"
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    currentPassword: e.target.value,
                  })
                }
                className="mt-2 bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                disabled={!isEditingPassword}
                placeholder={
                  isEditingPassword
                    ? "Enter current password"
                    : "••••••••"
                }
              />
            </div>

            <div className="relative">
              <Label
                htmlFor="new-password"
                className="text-sm font-medium text-gray-700 flex items-center gap-2"
              >
                <KeyRound className="w-4 h-4 text-gray-400" />
                New Password
              </Label>
              <Input
                id="new-password"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    newPassword: e.target.value,
                  })
                }
                className="mt-2 bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                disabled={!isEditingPassword}
                placeholder={
                  isEditingPassword
                    ? "Enter new password"
                    : "••••••••"
                }
              />
            </div>

            <div className="relative">
              <Label
                htmlFor="confirm-password"
                className="text-sm font-medium text-gray-700 flex items-center gap-2"
              >
                <KeyRound className="w-4 h-4 text-gray-400" />
                Confirm New Password
              </Label>
              <Input
                id="confirm-password"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    confirmPassword: e.target.value,
                  })
                }
                className="mt-2 bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                disabled={!isEditingPassword}
                placeholder={
                  isEditingPassword
                    ? "Confirm new password"
                    : "••••••••"
                }
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4">
            <Link
              to="/auth/forgotten/password"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              Forgot your password?
            </Link>

            {isEditingPassword ? (
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handlePasswordCancel}
                  className="border-gray-200 hover:bg-gray-50 text-gray-700"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handlePasswordSave}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Save Changes
                </Button>
              </div>
            ) : (
              <Button
                onClick={handleRequestOTP}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Change Password
              </Button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
