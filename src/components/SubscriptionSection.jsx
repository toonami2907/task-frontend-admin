/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  CreditCard,
  Clock,
  AlertTriangle,
  Settings,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import api from "@/functions/resources/axiosConfig";

const ManageSubscription = ({ userInfo }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const getRemainingDays = () => {
    if (!userInfo.subscriptionExpiresAt) return null;
    const expiryDate = new Date(userInfo.subscriptionExpiresAt);
    const now = new Date();
    const diffTime = expiryDate - now;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const isTrialActive =
    getRemainingDays() > 0 &&
    userInfo.subscriptionStatus === "active" &&
    !userInfo.hasUsedTrial;
  const daysRemaining = getRemainingDays();

  const handleBillingPortal = async () => {
    try {
      if (userInfo.plan === "Hobby") {
        toast({
          title: "Free Plan",
          description:
            "You are currently on the Free plan. You can upgrade to a paid plan to access more features.",
          variant: "destructive",
        });
        return;
      }
      setIsLoading(true);
      const response = await api.get("/api/plan/manage");

      if (response.data?.url) {
        window.location.href = response.data.url;
      }
    } catch (error) {
      console.error("Error accessing billing portal:", error);
      toast({
        title: "Error",
        description:
          "Could not access billing portal. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePlan = () => {
    navigate("/billing/pricing");
  };

  return (
    <Card className="bg-white">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-semibold text-[#111827]">
              Subscription
            </CardTitle>
            <CardDescription className="text-[#374151] mt-1">
              Manage your subscription and billing preferences
            </CardDescription>
          </div>
          {isTrialActive && (
            <Badge
              variant="secondary"
              className="bg-blue-50 text-blue-700 hover:bg-blue-100"
            >
              Trial Active
            </Badge>
          )}
        </div>
      </CardHeader>
      <Separator className="bg-[#E5E7EB]" />
      <CardContent className="p-6 space-y-6">
        <div className="bg-[#F9FAFB] p-6 rounded-lg border border-[#E5E7EB]">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-[#111827]">
                  {userInfo.plan} 
                </h3>
                <div className="flex items-center gap-2 mt-1 text-[#374151]">
                  <CreditCard className="h-4 w-4" />
                  <span>
                    {isTrialActive
                      ? "Trial Period"
                      : "Monthly Billing"}
                  </span>
                </div>
              </div>

              {daysRemaining && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-[#374151]" />
                  <span className="text-[#374151]">
                    {isTrialActive
                      ? `${daysRemaining} days left in trial`
                      : `Renews in ${daysRemaining} days`}
                  </span>
                </div>
              )}

              {userInfo.subscriptionExpiresAt && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-[#374151]" />
                  <span className="text-[#374151]">
                    Next billing date:{" "}
                    {new Date(
                      userInfo.subscriptionExpiresAt
                    ).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3 min-w-[200px]">
              {/* <Button
                onClick={handleChangePlan}
                variant="outline"
                className="w-full"
              >
                Change Plan
              </Button> */}

              {!isTrialActive && (
                <>
                  {userInfo.plan === "Hobby" ? (
                  <Link
                  to="/billing/pricing"
                  className="inline-flex items-center px-4 py-2 text-sm font-medium bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white rounded-md transition-colors duration-200"
                >
                  Upgrade Plan
                </Link>
                  ) : (
                    <Button
                      onClick={handleBillingPortal}
                      className="w-full bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 text-white"
                      disabled={isLoading}
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      {isLoading ? "Loading..." : "Manage Plan"}
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {!isTrialActive && (
          <div className="flex items-center justify-between p-4 rounded-lg border border-[#E5E7EB]">
            <div className="flex items-center space-x-2">
              <div className="space-y-1">
                <p className="text-sm text-[#6B7280]">
                  Need to update your payment method or view billing
                  history? Visit the{" "}
                  <button
                    onClick={handleBillingPortal}
                    className="text-[#1E3A8A] hover:underline font-medium"
                    disabled={isLoading}
                  >
                    billing portal
                  </button>
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ManageSubscription;
