import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
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
} from "@/components/ui/alert-dialog"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { Trash2 } from "lucide-react"
import { useGlobalContext } from "@/functions/features/StateProvider"
import SubscriptionSection from "@/sections/SubscriptionSection"

export default function AccountSettings() {
  const { toast } = useToast()
  const {userInfo} =useGlobalContext()

  // Color Constants
  const colors = {
    primary: {
      bg: "bg-[#1E3A8A] hover:bg-[#0F2D6B]",
      text: "text-[#1E3A8A]",
      ring: "focus:ring-[#1E3A8A]"
    },
    destructive: {
      bg: "bg-[#7F1D1D] hover:bg-[#6B1919]"
    },
    success: {
      border: "border-l-4 border-[#0F766E]"
    }
  }

  // Profile Section
  const [profileData, setProfileData] = useState({
    name: userInfo.name,
    email: userInfo.email,
    adAccounts:userInfo?.adAccounts,
     shopifyStore: userInfo.Shopify_shopDomain ||  "my-awesome-store"
  })
  const [isEditingBilling, setIsEditingBilling] = useState(false)
  const [billingData, setBillingData] = useState(
    userInfo?.billingInfo ? {
      cardNumber: userInfo.billingInfo.cardNumber || "",
      expiry: userInfo.billingInfo.expiry || "",
      cvc: userInfo.billingInfo.cvc || ""
    } : {
      cardNumber: "",
      expiry: "",
      cvc: ""
    }
  )
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [newAdAccount, setNewAdAccount] = useState({
    account_id: "",
    id: "",
  })

  const handleAddAdAccount = () => {
    if (!newAdAccount.account_id || !newAdAccount.id) {
      toast({
        title: "Error",
        description: "Please fill in all ad account fields",
        variant: "destructive"
      })
      return
    }

    const updatedAdAccounts = [
      ...profileData.adAccounts,
      {
        ...newAdAccount,
        _id: `temp-${Date.now()}` // In real app, this would come from backend
      }
    ]

    setProfileData({
      ...profileData,
      adAccounts: updatedAdAccounts
    })

    setNewAdAccount({
      account_id: "",
      id: ""
    })

    toast({
      title: "Ad Account Added",
      description: "New Facebook Ad account has been added successfully.",
      className: colors.success.border
    })
  }

  const handleRemoveAdAccount = (_id) => {
    const updatedAdAccounts = profileData.adAccounts.filter(
      account => account._id !== _id
    )
    setProfileData({
      ...profileData,
      adAccounts: updatedAdAccounts
    })
    
    toast({
      title: "Ad Account Removed",
      description: "Facebook Ad account has been removed successfully.",
      className: colors.success.border
    })
  }

  // Billing Section


  // Password Section
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  })
  const [isEditingPassword, setIsEditingPassword] = useState(false)

  // Subscription Section
  const [autoRenew, setAutoRenew] = useState(true)

  // Profile Handlers
  const handleProfileEdit = () => setIsEditingProfile(true)
  const handleProfileSave = () => {
    setIsEditingProfile(false)
    // Here you would typically make an API call to update the profile
    toast({
      title: "Profile Updated",
      description: "Your profile information has been successfully updated.",
      className: colors.success.border
    })
  }
  const handleProfileCancel = () => {
    setIsEditingProfile(false)
    setProfileData({
      name: "John Doe",
      email: "john@example.com",
      adAccounts:userInfo ? userInfo?.adAccounts : [],
      shopifyStore: userInfo.Shopify_shopDomain ||  "my-awesome-store"
    })
    setNewAdAccount({
      account_id: "",
      id: ""
    })
  }


  // Billing Handlers
  const handleBillingEdit = () => {
    // Reset to current billing info when starting to edit
    if (userInfo?.billingInfo) {
      setBillingData({
        cardNumber: userInfo.billingInfo.cardNumber || "",
        expiry: userInfo.billingInfo.expiry || "",
        cvc: userInfo.billingInfo.cvc || ""
      })
    }
    setIsEditingBilling(true)
  }

  const handleBillingSave = () => {
    // Validate billing data
    if (!billingData.cardNumber || !billingData.expiry || !billingData.cvc) {
      toast({
        title: "Error",
        description: "Please fill in all billing fields",
        variant: "destructive"
      })
      return
    }
    
    setIsEditingBilling(false)
    toast({
      title: userInfo?.billingInfo ? "Billing Updated" : "Billing Added",
      description: userInfo?.billingInfo 
        ? "Payment method has been successfully updated."
        : "Payment method has been successfully added.",
      className: colors.success.border
    })
  }

  const handleBillingCancel = () => {
    setIsEditingBilling(false)
    // Reset to original billing info when canceling
    setBillingData(
      userInfo?.billingInfo ? {
        cardNumber: userInfo.billingInfo.cardNumber || "",
        expiry: userInfo.billingInfo.expiry || "",
        cvc: userInfo.billingInfo.cvc || ""
      } : {
        cardNumber: "",
        expiry: "",
        cvc: ""
      }
    )
  }

  // Password Handlers
  const handlePasswordEdit = () => setIsEditingPassword(true)
  const handlePasswordSave = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords don't match.",
        variant: "destructive"
      })
      return
    }
    setIsEditingPassword(false)
    toast({
      title: "Password Updated",
      description: "Your password has been successfully changed.",
      className: colors.success.border
    })
  }
  const handlePasswordCancel = () => {
    setIsEditingPassword(false)
    setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
  }

  // Subscription Handlers
  const handleSubscriptionCancel = () => {
    toast({
      title: "Subscription Cancelled",
      description: "Your subscription will end at the end of the billing period.",
      className: colors.success.border
    })
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-6 lg:max-w-4xl space-y-8 bg-[#F3F4F6]">
      {/* Profile Section */}
      <section className="bg-white rounded-lg shadow-sm border border-[#E5E7EB]">
        <div className="p-6">
          <h2 className="text-2xl font-semibold text-[#111827]">Personal Information</h2>
          <p className="text-sm text-[#374151] mt-1">
            Manage your personal information and connected accounts.
          </p>
        </div>
        <Separator className="bg-[#E5E7EB]" />
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name" className={`${colors.primary.text} font-medium`}>
                Full Name
              </Label>
              <Input 
                id="name" 
                value={profileData.name}
                onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                className={`bg-white ${colors.primary.ring}`}
                disabled={!isEditingProfile}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className={`${colors.primary.text} font-medium`}>
                Email
              </Label>
              <Input 
                id="email" 
                type="email" 
                value={profileData.email}
                onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                className={`bg-white ${colors.primary.ring}`}
                disabled={!isEditingProfile}
              />
            </div>
          </div>

          {/* Facebook Ad Accounts Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-[#111827]">Facebook Ad Accounts</h3>
            
            {/* Existing Ad Accounts List */}
            <div className="space-y-3">
              {profileData.adAccounts.map((account) => (
                <div 
                  key={account._id}
                  className="flex items-center justify-between p-3 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]"
                >
                  <div className="space-y-1">
                    <p className="font-medium text-[#111827]">ID: {account.account_id}</p>
                    <p className="text-sm text-[#374151]">Account: {account.id}</p>
                  </div>
                  {isEditingProfile && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveAdAccount(account._id)}
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
                <h4 className="font-medium text-[#111827]">Add New Ad Account</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-account-id" className={`${colors.primary.text} font-medium`}>
                      Account ID
                    </Label>
                    <Input
                      id="new-account-id"
                      value={newAdAccount.account_id}
                      onChange={(e) => setNewAdAccount({...newAdAccount, account_id: e.target.value})}
                      className={`bg-white ${colors.primary.ring}`}
                      placeholder="Enter account ID"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-account-name" className={`${colors.primary.text} font-medium`}>
                      Account Name
                    </Label>
                    <Input
                      id="new-account-name"
                      value={newAdAccount.id}
                      onChange={(e) => setNewAdAccount({...newAdAccount, id: e.target.value})}
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
            <Label htmlFor="shopify-store" className={`${colors.primary.text} font-medium`}>
              Shopify Store Name
            </Label>
            <Input 
              id="shopify-store" 
              value={profileData.shopifyStore}
              onChange={(e) => setProfileData({...profileData, shopifyStore: e.target.value})}
              className={`bg-white ${colors.primary.ring}`}
              disabled={!isEditingProfile}
              placeholder="Enter your Shopify store name"
            />
          </div>

          {isEditingProfile ? (
            <div className="flex gap-2">
              <Button onClick={handleProfileSave} className={colors.primary.bg}>
                Save Changes
              </Button>
              <Button variant="outline" onClick={handleProfileCancel}>
                Cancel
              </Button>
            </div>
          ) : (
            <Button onClick={handleProfileEdit} className={colors.primary.bg}>
              Edit Profile
            </Button>
          )}
        </div>
      </section>

      {/* Subscription Section */}
      <SubscriptionSection userInfo={userInfo} colors={colors}/>
      {/* <section className="bg-white rounded-lg shadow-sm border border-[#E5E7EB]">
        <div className="p-6">
          <h2 className="text-2xl font-semibold text-[#111827]">Subscription</h2>
          <p className="text-sm text-[#374151] mt-1">
            Manage your subscription and billing preferences.
          </p>
        </div>
        <Separator className="bg-[#E5E7EB]" />
        <div className="p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-[#F9FAFB] p-4 rounded-lg border border-[#E5E7EB]">
            <div>
              <h3 className="font-medium text-[#111827]">Pro Plan</h3>
              <p className="text-sm text-[#374151]">$29/month</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 mt-4 sm:mt-0">
              <Button variant="outline" className="w-full sm:w-auto">
                Change Plan
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className={colors.destructive.bg}>
                    Cancel Subscription
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="sm:max-w-[425px]">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Cancel Subscription</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to cancel your subscription? You'll lose access to all Pro features at the end of your billing period.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="sm:space-x-2">
                    <AlertDialogCancel className="mt-2 sm:mt-0">Keep Subscription</AlertDialogCancel>
                    <AlertDialogAction className={colors.destructive.bg}>
                      Yes, Cancel
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Switch 
              id="auto-renew" 
              checked={autoRenew}
              onCheckedChange={setAutoRenew}
              className="data-[state=checked]:bg-[#1E3A8A]"
            />
            <Label htmlFor="auto-renew" className="text-[#374151]">
              Auto-renew subscription
            </Label>
          </div>
        </div>
      </section> */}

      {/* Billing Section */}
      <section className="bg-white rounded-lg shadow-sm border border-[#E5E7EB]">
      <div className="p-6">
        <h2 className="text-2xl font-semibold text-[#111827]">Billing Information</h2>
        <p className="text-sm text-[#374151] mt-1">
          Update your payment method and billing details.
        </p>
      </div>
      <Separator className="bg-[#E5E7EB]" />
      <div className="p-6">
        {isEditingBilling ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="card" className={`${colors.primary.text} font-medium`}>
                  Card Number
                </Label>
                <Input 
                  id="card" 
                  value={billingData.cardNumber}
                  onChange={(e) => setBillingData({...billingData, cardNumber: e.target.value})}
                  className={`bg-white ${colors.primary.ring}`}
                  placeholder="1234 5678 9012 3456"
                />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="expiry" className={`${colors.primary.text} font-medium`}>
                    Expiry Date
                  </Label>
                  <Input 
                    id="expiry" 
                    value={billingData.expiry}
                    onChange={(e) => setBillingData({...billingData, expiry: e.target.value})}
                    className={`bg-white ${colors.primary.ring}`}
                    placeholder="MM/YY"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvc" className={`${colors.primary.text} font-medium`}>
                    CVC
                  </Label>
                  <Input 
                    id="cvc" 
                    value={billingData.cvc}
                    onChange={(e) => setBillingData({...billingData, cvc: e.target.value})}
                    className={`bg-white ${colors.primary.ring}`}
                    placeholder="123"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleBillingSave} className={colors.primary.bg}>
                {userInfo?.billingInfo ? 'Save Changes' : 'Add Payment Method'}
              </Button>
              <Button variant="outline" onClick={handleBillingCancel}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div>
            {userInfo?.billingInfo ? (
              <div className="space-y-6">
                <div className="bg-[#F9FAFB] p-4 rounded-lg border border-[#E5E7EB]">
                  <p className="font-medium text-[#111827]">Current Payment Method</p>
                  <p className="text-sm text-[#374151] mt-1">
                    Card ending in {userInfo.billingInfo.cardNumber.slice(-4)}
                  </p>
                  <p className="text-sm text-[#374151]">
                    Expires {userInfo.billingInfo.expiry}
                  </p>
                </div>
                <Button onClick={handleBillingEdit} className={colors.primary.bg}>
                  Edit Billing Information
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-2">
                  <svg 
                    className="w-8 h-8 text-blue-500" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" 
                    />
                  </svg>
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-medium text-gray-900">No Billing Information</h3>
                  <p className="text-sm text-gray-500 max-w-sm">
                    You haven't added any billing information yet. Add a payment method to manage your subscription.
                  </p>
                </div>
                <Button 
                  onClick={handleBillingEdit} 
                  className={`${colors.primary.bg} mt-4`}
                >
                  Add Payment Method
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </section>

      {/* Security Section */}
      <section className="bg-white rounded-lg shadow-sm border border-[#E5E7EB]">
        <div className="p-6">
          <h2 className="text-2xl font-semibold text-[#111827]">Security</h2>
          <p className="text-sm text-[#374151] mt-1">
            Manage your password and security preferences.
          </p>
        </div>
        <Separator className="bg-[#E5E7EB]" />
        <div className="p-6 space-y-6 w-full md:max-w-md">
          <div className="space-y-2">
            <Label htmlFor="current-password" className={`${colors.primary.text} font-medium`}>
              Current Password
            </Label>
            <Input 
              id="current-password" 
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
              className={`bg-white ${colors.primary.ring}`}
              disabled={!isEditingPassword}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password" className={`${colors.primary.text} font-medium`}>
              New Password
            </Label>
            <Input 
              id="new-password" 
              type="password"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
              className={`bg-white ${colors.primary.ring}`}
              disabled={!isEditingPassword}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password" className={`${colors.primary.text} font-medium`}>
              Confirm New Password
            </Label>
            <Input 
              id="confirm-password" 
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
              className={`bg-white ${colors.primary.ring}`}
              disabled={!isEditingPassword}
            />
          </div>
          {isEditingPassword ? (
            <div className="flex gap-2">
              <Button onClick={handlePasswordSave} className={colors.primary.bg}>
                Save Changes
              </Button>
              <Button variant="outline" onClick={handlePasswordCancel}>
                Cancel
              </Button>
            </div>
          ) : (
            <Button onClick={handlePasswordEdit} className={colors.primary.bg}>
              Change Password
            </Button>
          )}
        </div>
      </section>
    </div>
  )
}