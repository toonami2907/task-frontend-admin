import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Check, ArrowLeft, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useGlobalContext } from "@/functions/features/StateProvider";
import { Link } from "react-router-dom";
import { formatPrice } from "./Admin/Plans/ManagePlans";
import api from "@/functions/resources/axiosConfig";

const PricingPage = () => {
  const { toast } = useToast();
  const { userInfo, plans } = useGlobalContext();

  const getRemainingTrialTime = () => {
    if (!userInfo.subscriptionExpiresAt) return null;
    const expiryDate = new Date(userInfo.subscriptionExpiresAt);
    const now = new Date();
    const diffTime = expiryDate - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const trialDaysRemaining = getRemainingTrialTime();
  const isFreePlan = userInfo.plan === "Free Plan" || !userInfo.plan;
  const isTrialActive = userInfo.hasUsedTrial === false; // Ensure Free Plan doesn't activate trials
  const isOnTrial =
    trialDaysRemaining > 0 &&
    userInfo.subscriptionStatus === "trialing";

  const handleUpgrade = async (id, planName) => {
    if (planName === "Free Plan") {
      toast({
        title: "Free Plan",
        description: "Sorry, You can`t upgrade to default plan",
        variant: "destructive",
      });
      return;
    }
    if (isOnTrial) {
      toast({
        title: "Upgrade Not Available",
        description:
          "Please wait until your trial period ends to upgrade your plan.",
        variant: "destructive",
      });
      return;
    }

    try {
      const sub = await api.post(`/api/plan/subscribe`, {
        planId: id,
        isTrialUpgrade: isTrialActive,
      });

      if (sub.status === 200) {
        toast({
          title: "Redirecting to Checkout",
          description: `Preparing ${
            isTrialActive ? "trial of" : "upgrade to"
          } ${planName} plan...`,
          className: "border-l-4 border-[#0F766E]",
        });
        window.location.href = sub.data.url;
      }
    } catch (error) {
      console.log(error);
      toast({
        title: "Upgrade Failed",
        variant: "destructive",
        description: `An error occurred while upgrading to ${planName} plan. Please try again later.`,
      });
    }
  };

  const getButtonText = (plan) => {
    if (plan.name === "Free Plan") return "Default Plan";
    if (userInfo.plan === plan.name) return "Current Plan"; // Ensure this check is before trials
    if (isOnTrial) return `Available after trial (${trialDaysRemaining} days)`;
    if (isTrialActive) return `Try The  ${plan.name} free Trial`;
    if (userInfo.hasUsedTrial) return `Upgrade to ${plan.name}`;
    return `Choose ${plan.name}`;
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6]">
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => window.history.back()}
            className="mb-4 text-[#374151] hover:text-[#111827]"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            <span className="text-sm font-medium">
              Back to Settings
            </span>
          </Button>

          <div className="text-center max-w-3xl mx-auto mb-16">
            <h1 className="text-5xl font-extrabold text-[#111827] mb-6 leading-tight tracking-tight">
              Find Your Perfect Plan
            </h1>
            <p className="text-xl text-[#4B5563] font-light leading-relaxed">
              Tailored solutions for every business size.
              <span className="block">
                Flexible options that grow with your needs.
              </span>
            </p>
            <div className="mt-2">
              <span className="text-md text-[#4B5563] leading-relaxed">
                Visit our{" "}
                <Link
                  to={"/pricing"}
                  className="underline text-purple-700"
                >
                  {" "}
                  pricing page
                </Link>{" "}
                to learn more
              </span>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {plans
          .filter(plan => plan.status !== 'ARCHIVED' && plan.status !== 'INACTIVE')
          .map((plan) => {
            const isCurrentPlanOnTrial =
              isOnTrial &&
              plan.name === userInfo.plan &&
              plan.name !== "Free Plan";
            const isFreePlan = plan.name === "Free Plan";
            return (
              <Card
                key={plan.name}
                className={`relative transition-all hover:transform hover:scale-[1.02] ${
                  isFreePlan
                    ? "border-[#E5E7EB] bg-gray-50"
                    : plan.popular
                    ? "border-2 border-blue-500"
                    : "border-[#E5E7EB]"
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <span className="inline-block bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                {isCurrentPlanOnTrial ? (
                  <div className="absolute top-0 right-0 m-4">
                    <span className="inline-flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                      <Clock className="w-4 h-4 mr-1" />
                      Trial - {trialDaysRemaining} days left
                    </span>
                  </div>
                ) : (
                  userInfo.plan=== plan.name  && (
                    <div className="absolute top-0 right-0 m-4">
                      <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                        Current Plan
                      </span>
                    </div>
                  )
                )}
                <CardHeader>
                  <CardTitle>
                    <div className="space-y-4">
                      <h3 className="text-3xl font-bold text-[#111827] tracking-tight">
                        {plan.name}
                      </h3>
                      <div className="flex items-baseline">
                        <span className="text-4xl font-extrabold text-[#111827]">
                          {formatPrice(plan.price, plan.currency)}
                        </span>
                        {plan.billingCycle && (
                          <span className="ml-2 text-lg font-medium text-[#4B5563]">
                            /{plan.billingCycle.toLowerCase()}
                          </span>
                        )}
                      </div>
                      {isTrialActive &&
                        !isOnTrial &&
                        plan.name !== "Free Plan" && ( // Ensure Free Plan does not show trial
                          <div className="text-blue-600 font-medium">
                            7-day free trial available
                          </div>
                        )}

                      <p className="text-lg text-[#4B5563] font-light leading-snug">
                        {plan.description}
                      </p>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-8">
                  <ul className="space-y-4">
                    {plan.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-3"
                      >
                        <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-[#4B5563] font-normal leading-relaxed">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    onClick={() => handleUpgrade(plan._id, plan.name)}
                    className={`w-full ${isTrialActive && 'bg-red-700'} ${
                      isFreePlan
                        ? "bg-gray-200 text-gray-600 hover:bg-gray-300"
                        : userInfo.plan === plan.name || isOnTrial
                        ? "bg-gray-100 text-gray-600 hover:bg-gray-200 cursor-not-allowed"
                        : isTrialActive
                        ? "bg-red-700 hover:bg-red-600"
                        : "bg-[#1E3A8A] hover:bg-[#0F2D6B]"
                    }`}
                    disabled={userInfo.plan === plan.name || isOnTrial}
                  >
                    {getButtonText(plan)}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
