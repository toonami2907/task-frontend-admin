/* eslint-disable react/prop-types */
import React from 'react';
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
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
import { Check } from "lucide-react"

const SubscriptionSection = ({ userInfo, colors }) => {
  const [autoRenew, setAutoRenew] = React.useState(true);
  
  const plans = [
    {
      name: "Basic",
      price: "Free",
      features: [
        "1 Facebook Ad Account",
        "Basic Analytics",
        "Email Support",
        "Standard Reports"
      ],
      current: !userInfo?.plan
    },
    {
      name: "Pro",
      price: "$29",
      interval: "month",
      features: [
        "5 Facebook Ad Accounts",
        "Advanced Analytics",
        "Priority Support",
        "Custom Reports",
        "API Access",
        "Team Collaboration"
      ],
      current: userInfo?.plan === "pro"
    },
    {
      name: "Enterprise",
      price: "$99",
      interval: "month",
      features: [
        "Unlimited Ad Accounts",
        "Enterprise Analytics",
        "24/7 Priority Support",
        "Custom Solutions",
        "Dedicated Account Manager",
        "Advanced API Access",
        "Team Management"
      ],
      current: userInfo?.plan === "enterprise"
    }
  ];

  const getCurrentPlan = () => {
    return plans.find(plan => plan.current) || plans[0];
  };

  const handleUpgrade = (planName) => {
    // In a real app, this would redirect to a checkout page or payment flow
    console.log(`Upgrading to ${planName} plan`);
  };

  return (
    <section className="bg-white rounded-lg shadow-sm border border-[#E5E7EB]">
      <div className="p-6">
        <h2 className="text-2xl font-semibold text-[#111827]">Subscription</h2>
        <p className="text-sm text-[#374151] mt-1">
          Manage your subscription and billing preferences.
        </p>
      </div>
      <Separator className="bg-[#E5E7EB]" />
      <div className="p-6 space-y-6">
        {/* Current Plan Display */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-[#F9FAFB] p-4 rounded-lg border border-[#E5E7EB]">
          <div>
            <h3 className="font-medium text-[#111827]">{getCurrentPlan().name} Plan</h3>
            <p className="text-sm text-[#374151]">
              {getCurrentPlan().price}{getCurrentPlan().interval ? `/${getCurrentPlan().interval}` : ''}
            </p>
          </div>
          {getCurrentPlan().name !== "Enterprise" && (
            <div className="flex flex-col sm:flex-row gap-2 mt-4 sm:mt-0">
              <Button 
                onClick={() => handleUpgrade("pro")} 
                className={`${colors.primary.bg} w-full sm:w-auto`}
              >
                Upgrade Plan
              </Button>
            </div>
          )}
        </div>

        {/* Available Plans */}
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-lg border ${
                plan.current ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
              } p-6 space-y-4`}
            >
              {plan.current && (
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-500 text-white">
                    Current Plan
                  </span>
                </div>
              )}
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                <div className="mt-2">
                  <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                  {plan.interval && (
                    <span className="text-gray-500">/{plan.interval}</span>
                  )}
                </div>
              </div>
              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-blue-500" />
                    <span className="text-sm text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>
              {!plan.current && (
                <Button
                  onClick={() => handleUpgrade(plan.name.toLowerCase())}
                  className={`${colors.primary.bg} w-full mt-6`}
                >
                  Upgrade to {plan.name}
                </Button>
              )}
            </div>
          ))}
        </div>

        {/* Subscription Controls */}
        {userInfo?.subscription && (
          <>
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
                    Are you sure you want to cancel your subscription? You&rsquo;ll lose access to all {getCurrentPlan().name} features at the end of your billing period.
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
          </>
        )}
      </div>
    </section>
  );
};

export default SubscriptionSection;