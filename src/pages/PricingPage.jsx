
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, ArrowLeft } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useGlobalContext } from '@/functions/features/StateProvider';
import { Link } from 'react-router-dom';


const PricingPage = () => {
  const { toast } = useToast();
  const { userInfo } = useGlobalContext();

  const plans = [
    {
      name: "Basic",
      price: "Free",
      description: "Perfect for getting started",
      features: [
        "1 Facebook Ad Account",
        "Basic Analytics",
        "Email Support",
        "Standard Reports",
        "Community Access"
      ],
      current: !userInfo?.subscription
    },
    {
      name: "Pro",
      price: "$29",
      interval: "month",
      description: "Best for growing businesses",
      features: [
        "5 Facebook Ad Accounts",
        "Advanced Analytics",
        "Priority Support",
        "Custom Reports",
        "API Access",
        "Team Collaboration",
        "Advanced Integrations"
      ],
      popular: true,
      current: userInfo?.subscription?.plan === "pro"
    },
    {
      name: "Enterprise",
      price: "$99",
      interval: "month",
      description: "For large scale operations",
      features: [
        "Unlimited Ad Accounts",
        "Enterprise Analytics",
        "24/7 Priority Support",
        "Custom Solutions",
        "Dedicated Account Manager",
        "Advanced API Access",
        "Team Management",
        "Custom Integrations",
        "SLA Agreement"
      ],
      current: userInfo?.subscription?.plan === "enterprise"
    }
  ];

  const handleUpgrade = (planName) => {
    if (planName.toLowerCase() === 'basic') {
      toast({
        title: "Already on Basic Plan",
        description: "You're currently using the Basic plan. Please choose an upgrade option.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Redirecting to Checkout",
      description: `Preparing upgrade to ${planName} plan...`,
      className: "border-l-4 border-[#0F766E]"
    });

    setTimeout(() => {
      console.log(`Initiating upgrade to ${planName} plan`);
    }, 1500);
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
            <span className="text-sm font-medium">Back to Settings</span>
          </Button>
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h1 className="text-5xl font-extrabold text-[#111827] mb-6 leading-tight tracking-tight">
              Find Your Perfect Plan
            </h1>
            <p className="text-xl text-[#4B5563] font-light leading-relaxed">
              Tailored solutions for every business size. 
              <span className="block">Flexible options that grow with your needs.</span>
            </p>
            <span className="text-md text-[#4B5563] leading-relaxed">Visit our <Link to={"/pricing"} className='underline text-purple-700'> pricing page</Link> to learn more</span>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative transition-all hover:transform hover:scale-[1.02] ${
                plan.popular ? 'border-2 border-blue-500' : 'border-[#E5E7EB]'
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <span className="inline-block bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}
              {plan.current && (
                <div className="absolute top-0 right-0 m-4">
                  <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                    Current Plan
                  </span>
                </div>
              )}
              <CardHeader>
                <CardTitle>
                  <div className="space-y-4">
                    <h3 className="text-3xl font-bold text-[#111827] tracking-tight">
                      {plan.name}
                    </h3>
                    <div className="flex items-baseline">
                      <span className="text-4xl font-extrabold text-[#111827]">
                        {plan.price}
                      </span>
                      {plan.interval && (
                        <span className="ml-2 text-lg font-medium text-[#4B5563]">/{plan.interval}</span>
                      )}
                    </div>
                    <p className="text-lg text-[#4B5563] font-light leading-snug">
                      {plan.description}
                    </p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                <ul className="space-y-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-[#4B5563] font-normal leading-relaxed">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
                <Button
                  onClick={() => handleUpgrade(plan.name)}
                  className={`w-full ${
                    plan.current
                      ? 'bg-gray-100 text-gray-600 hover:bg-gray-200 cursor-not-allowed'
                      : plan.popular
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-[#1E3A8A] hover:bg-[#0F2D6B]'
                  }`}
                  disabled={plan.current}
                >
                  {plan.current
                    ? 'Current Plan'
                    : `Upgrade to ${plan.name}`}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

      </div>
    </div>
  );
};

export default PricingPage;