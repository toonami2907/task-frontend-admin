import { useState } from "react";
import { Button } from "@/components/ui/button";
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
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, Trash2 } from "lucide-react";
import { useGlobalContext } from "@/functions/features/StateProvider";
import { useNavigate } from "react-router-dom";
import {
  formatCardNumber,
  formatExpiryDate,
  luhnCheck,
} from "@/functions/resources/aglorithm";
import api from "@/functions/resources/axiosConfig";
import Billing from "@/sections/Billing";
import { AccountManager } from "@/services/User/AccountManager";
import ManageSubscription from "./SubscriptionSection";
import TrialBanner from "./TrialBanner";

export default function AccountSettings() {
  const { toast } = useToast();
  const { userInfo } = useGlobalContext();
  const navigate = useNavigate();
  // Color Constants
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
    shopifyStore: userInfo.Shopify_shopDomain || "my-awesome-store",
  });
  const [isEditingBilling, setIsEditingBilling] = useState(false);
  const [billingData, setBillingData] = useState(
    userInfo?.billingInfo
      ? {
          cardNumber: userInfo.billingInfo.cardNumber || "",
          expiry: userInfo.billingInfo.expiry || "",
          cvc: userInfo.billingInfo.cvc || "",
        }
      : {
          cardNumber: "",
          expiry: "",
          cvc: "",
        }
  );
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
        description: "Your ads account has been successfully updated.",
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

  const handleRemoveAdAccount = async(_id) => {

try {
  await accountManager.removeAdAccount(_id)
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
  });
  const [isEditingPassword, setIsEditingPassword] = useState(false);



  // Profile Handlers
  const handleProfileEdit = () => setIsEditingProfile(true);
  const handleProfileSave = async () => {
    try {
      const data = {
        name: profileData.name,
        email: profileData.email,
        shopifyStore: profileData.shopifyStore,
      }
      await accountManager.updateProfile(data);
      setIsEditingProfile(false);
      toast({
        title: "Profile Updated",
        description: "Your profile information has been successfully updated.",
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

  // Billing Handlers
  const handleBillingEdit = () => {
    // Reset to current billing info when starting to edit
    if (userInfo?.billingInfo) {
      setBillingData({
        cardNumber: userInfo.billingInfo.cardNumber || "",
        expiry: userInfo.billingInfo.expiry || "",
        cvc: userInfo.billingInfo.cvc || "",
      });
    }
    setIsEditingBilling(true);
  };

  const handleBillingSave = async () => {
    // Validate card details
    if (
      !billingData.cardNumber ||
      !billingData.expiry ||
      !billingData.cvc
    ) {
      toast({
        title: "Error",
        description: "Please fill in all billing fields",
        variant: "destructive",
      });
      return;
    }

    // Validate card number (Luhn algorithm)
    const isValidCard = luhnCheck(
      billingData.cardNumber.replace(/\s/g, "")
    );
    if (!isValidCard) {
      toast({
        title: "Error",
        description: "Invalid card number",
        variant: "destructive",
      });
      return;
    }

    // Validate expiry date
    const [month, year] = billingData.expiry.split("/");
    const expiry = new Date(
      2000 + parseInt(year),
      parseInt(month) - 1
    );
    if (expiry < new Date()) {
      toast({
        title: "Error",
        description: "Card has expired",
        variant: "destructive",
      });
      return;
    }

    // Validate CVV
    if (!/^\d{3,4}$/.test(billingData.cvc)) {
      toast({
        title: "Error",
        description: "Invalid CVV",
        variant: "destructive",
      });
      return;
    }

    // try {
    // return
    //   const response = await api.post("/auth/add/card", {
    //     cardNumber: billingData.cardNumber.replace(/\s/g, ""),
    //     expirationDate: billingData.expiry,
    //     cvv: billingData.cvc,
    //     userId: userInfo._id,
    //   }, {withCredentials:true})

    //   if (response.status !== 201)
    //     throw new Error("Failed to save card details");

    //   setIsEditingBilling(false);
    //   toast({
    //     title: userInfo?.billingInfo
    //       ? "Billing Updated"
    //       : "Billing Added",
    //     description: "Payment method has been successfully saved.",
    //     className: colors.success.border,
    //   });
    // } catch (error) {
    //   toast({
    //     title: "Error",
    //     description: error.response.data?.message || "Failed to save card details. Please try again.",
    //     variant: "destructive",
    //   });
    // }
  };

  const handleBillingCancel = () => {
    setIsEditingBilling(false);
    // Reset to original billing info when canceling
    setBillingData(
      userInfo?.billingInfo
        ? {
            cardNumber: userInfo.billingInfo.cardNumber || "",
            expiry: userInfo.billingInfo.expiry || "",
            cvc: userInfo.billingInfo.cvc || "",
          }
        : {
            cardNumber: "",
            expiry: "",
            cvc: "",
          }
    );
  };

  // Password Handlers
  const handlePasswordEdit = () => setIsEditingPassword(true);
  const handlePasswordSave = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords don't match.",
        variant: "destructive",
      });
      return;
    }
    setIsEditingPassword(false);
    toast({
      title: "Password Updated",
      description: "Your password has been successfully changed.",
      className: colors.success.border,
    });
  };
  const handlePasswordCancel = () => {
    setIsEditingPassword(false);
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  // Subscription Handlers
  const handleSubscriptionCancel = () => {
    toast({
      title: "Subscription Cancelled",
      description:
        "Your subscription will end at the end of the billing period.",
      className: colors.success.border,
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

  return (
    <div className="container mx-auto py-8 px-4 md:px-6 lg:max-w-4xl space-y-8 bg-[#F3F4F6]">
      {/* Profile Section */}
      {userInfo.hasUsedTrial && (
        <TrialBanner expiryDate={userInfo.subscriptionExpiresAt}/>
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
              placeholder="Enter your Shopify store name"
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
      <section className="bg-white rounded-lg shadow-sm border border-[#E5E7EB]">
        <div className="p-6">
          <h2 className="text-2xl font-semibold text-[#111827]">
            Security
          </h2>
          <p className="text-sm text-[#374151] mt-1">
            Manage your password and security preferences.
          </p>
        </div>
        <Separator className="bg-[#E5E7EB]" />
        <div className="p-6 space-y-6 w-full md:max-w-md">
          <div className="space-y-2">
            <Label
              htmlFor="current-password"
              className={`${colors.primary.text} font-medium`}
            >
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
              className={`bg-white ${colors.primary.ring}`}
              disabled={!isEditingPassword}
            />
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="new-password"
              className={`${colors.primary.text} font-medium`}
            >
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
              className={`bg-white ${colors.primary.ring}`}
              disabled={!isEditingPassword}
            />
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="confirm-password"
              className={`${colors.primary.text} font-medium`}
            >
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
              className={`bg-white ${colors.primary.ring}`}
              disabled={!isEditingPassword}
            />
          </div>
          {isEditingPassword ? (
            <div className="flex gap-2">
              <Button
                onClick={handlePasswordSave}
                className={colors.primary.bg}
              >
                Save Changes
              </Button>
              <Button
                variant="outline"
                onClick={handlePasswordCancel}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <Button
              onClick={handlePasswordEdit}
              className={colors.primary.bg}
            >
              Change Password
            </Button>
          )}
        </div>
      </section>
    </div>
  );
}
