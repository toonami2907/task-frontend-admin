import React, { useState } from "react";
import {
  Check,
  Zap,
  BarChart,
  Shield,
  Users,
  Globe,
  Clock,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const PricingDetailsPage = () => {
  const [isAnnual, setIsAnnual] = useState(true);

  const basePlans = [
    {
      name: "Essential",
      monthlyPrice: "Free",
      annualPrice: "Free",
      description:
        "Perfect for individuals and small teams exploring our platform",
      features: [
        {
          icon: <Mail className="w-5 h-5" />,
          text: "Basic email support",
        },
        {
          icon: <BarChart className="w-5 h-5" />,
          text: "Core analytics dashboard",
        },
        {
          icon: <Users className="w-5 h-5" />,
          text: "Up to 3 team members",
        },
        {
          icon: <Globe className="w-5 h-5" />,
          text: "Single project workspace",
        },
      ],
      cta: "Start Free",
    },
    {
      name: "Business",
      monthlyPrice: 49,
      annualPrice: 39,
      description:
        "Ideal for growing businesses requiring advanced features",
      features: [
        {
          icon: <Zap className="w-5 h-5" />,
          text: "Priority support with 4h response time",
        },
        {
          icon: <BarChart className="w-5 h-5" />,
          text: "Advanced analytics & reporting",
        },
        {
          icon: <Users className="w-5 h-5" />,
          text: "Up to 15 team members",
        },
        {
          icon: <Globe className="w-5 h-5" />,
          text: "10 project workspaces",
        },
        {
          icon: <Shield className="w-5 h-5" />,
          text: "Enhanced security protocols",
        },
        {
          icon: <Clock className="w-5 h-5" />,
          text: "Comprehensive time tracking",
        },
      ],
      popular: true,
      cta: "Start 14-Day Trial",
    },
    {
      name: "Enterprise",
      monthlyPrice: "Custom",
      annualPrice: "Custom",
      description: "Tailored solutions for large-scale organizations",
      features: [
        {
          icon: <Zap className="w-5 h-5" />,
          text: "24/7 dedicated support",
        },
        {
          icon: <BarChart className="w-5 h-5" />,
          text: "Custom analytics suite",
        },
        {
          icon: <Users className="w-5 h-5" />,
          text: "Unlimited team members",
        },
        {
          icon: <Globe className="w-5 h-5" />,
          text: "Unlimited project workspaces",
        },
        {
          icon: <Shield className="w-5 h-5" />,
          text: "Enterprise-grade security",
        },
        {
          icon: <Clock className="w-5 h-5" />,
          text: "Advanced resource management",
        },
        { text: "Custom SLA guarantees" },
        { text: "Dedicated success manager" },
      ],
      cta: "Contact Sales",
    },
  ];

  const getDisplayPrice = (plan) => {
    const price = isAnnual ? plan.annualPrice : plan.monthlyPrice;
    if (typeof price === "number") {
      return `$${price}`;
    }
    return price;
  };

  const plans = basePlans.map((plan) => ({
    ...plan,
    price: getDisplayPrice(plan),
    interval:
      typeof plan.monthlyPrice === "number"
        ? isAnnual
          ? "/mo, billed annually"
          : "/month"
        : "",
  }));

  const testimonials = [
    {
      text: "The Business plan provided exactly what we needed to scale our operations efficiently. The advanced analytics have been invaluable for our decision-making process.",
      author: "Sarah Johnson",
      title: "CTO at TechFlow",
    },
    {
      text: "Moving to this platform has transformed our team's productivity. The interface is sophisticated yet intuitive, perfect for our enterprise needs.",
      author: "Michael Chen",
      title: "Head of Product, InnovateCorp",
    },
    {
      text: "The enterprise features exceeded our expectations. The dedicated support team has been exceptional in helping us optimize our workflows.",
      author: "Emma Wilson",
      title: "Director of Operations, GlobalTech",
    },
  ];

  const faqs = [
    {
      question: "How flexible are your pricing plans?",
      answer:
        "Our plans are designed to scale with your needs. You can upgrade, downgrade, or cancel at any time with no hidden fees or long-term commitments.",
    },
    {
      question:
        "Do you offer special pricing for non-profit organizations?",
      answer:
        "Yes, we provide significant discounts for registered non-profit organizations. Contact our sales team for detailed information about our non-profit program.",
    },
    {
      question: "What payment methods do you support?",
      answer:
        "We accept all major credit cards, ACH bank transfers, and wire transfers for enterprise clients. All payments are processed securely through our PCI-compliant payment system.",
    },
    {
      question: "Can I try the platform before committing?",
      answer:
        "Absolutely. Our Business plan includes a comprehensive 14-day trial with full access to all features. No credit card required to start.",
    },
  ];

  return (
    <div className="bg-gradient-to-b from-slate-50 to-white min-h-screen">
      <div className="container mx-auto px-4 py-24 max-w-7xl">
        {/* Hero Section */}
        <div className="text-center mb-24">
          <h1 className="text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">
            Enterprise-Grade Solutions
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-12 leading-relaxed">
            Scale confidently with transparent pricing and flexible
            plans designed for modern teams.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16 px-4">
            <Button
              variant={isAnnual ? "outline" : "default"}
              className={`rounded-full px-4 sm:px-8 py-4 sm:py-6 text-base sm:text-lg w-full sm:w-auto ${
                isAnnual
                  ? "border-slate-300"
                  : "bg-indigo-600 hover:bg-indigo-700"
              }`}
              onClick={() => setIsAnnual(false)}
            >
              <span className="flex items-center justify-center">
                Monthly Billing
              </span>
            </Button>
            <Button
              variant={!isAnnual ? "outline" : "default"}
              className={`rounded-full px-4 sm:px-8 py-4 sm:py-6 text-base sm:text-lg w-full sm:w-auto ${
                !isAnnual
                  ? "border-slate-300"
                  : "bg-indigo-600 hover:bg-indigo-700"
              }`}
              onClick={() => setIsAnnual(true)}
            >
              <span className="flex items-center justify-center whitespace-nowrap">
                Annual Billing
                <span className="hidden sm:inline ml-1">
                  (Save 20%)
                </span>
                <span className="sm:hidden ml-1">(-20%)</span>
              </span>
            </Button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-32">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative transition-all hover:shadow-2xl rounded-2xl ${
                plan.popular
                  ? "border-2 border-indigo-500 bg-gradient-to-b from-indigo-50/50 to-white"
                  : "border-slate-200"
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <span className="inline-flex items-center px-4 py-2 rounded-full bg-indigo-600 text-white text-sm font-semibold shadow-lg">
                    <Zap className="w-4 h-4 mr-2 fill-current" />
                    Most Popular
                  </span>
                </div>
              )}
              <CardHeader className="pb-0">
                <CardTitle>
                  <div className="space-y-6">
                    <h3 className="text-3xl font-bold text-slate-900">
                      {plan.name}
                    </h3>
                    <div className="flex items-baseline">
                      <span className="text-5xl font-extrabold text-slate-900">
                        {plan.price}
                      </span>
                      {plan.interval && (
                        <span className="ml-2 text-lg text-slate-500 font-medium">
                          {plan.interval}
                        </span>
                      )}
                    </div>
                    <p className="text-slate-600 text-lg leading-relaxed">
                      {plan.description}
                    </p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="py-8">
                <ul className="space-y-4">
                  {plan.features.map((feature, index) => (
                    <li
                      key={index}
                      className="flex items-start space-x-3"
                    >
                      <span className="shrink-0 text-indigo-600">
                        {feature.icon || (
                          <Check className="w-6 h-6 mt-1" />
                        )}
                      </span>
                      <span className="text-slate-700 text-base leading-snug">
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  size="lg"
                  className={`w-full text-lg py-7 rounded-xl ${
                    plan.popular
                      ? "bg-indigo-600 hover:bg-indigo-700 shadow-lg"
                      : "bg-slate-900 hover:bg-slate-800 shadow-lg"
                  }`}
                >
                  {plan.cta}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Feature Comparison Table */}
        <div className="mb-32">
          <h2 className="text-3xl font-bold text-center mb-16 text-slate-900">
            Feature Comparison
          </h2>
          <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left p-6 text-slate-700 font-semibold">
                    Features
                  </th>
                  {plans.map((plan) => (
                    <th
                      key={plan.name}
                      className="text-center p-6 text-slate-700 font-semibold"
                    >
                      {plan.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ["Team members", "3", "15", "Unlimited"],
                  ["Projects", "1", "10", "Unlimited"],
                  ["Storage", "5GB", "50GB", "1TB+"],
                  ["Support", "Email", "Priority", "24/7 Priority"],
                  ["Security", "Basic", "Advanced", "Enterprise"],
                  ["Analytics", "Basic", "Advanced", "Custom"],
                ].map(([feature, ...values], index) => (
                  <tr key={index} className="even:bg-slate-50">
                    <td className="p-6 font-medium text-slate-900">
                      {feature}
                    </td>
                    {values.map((value, i) => (
                      <td key={i} className="text-center p-6">
                        <span className="text-slate-700 font-medium">
                          {value === "✓" ? (
                            <Check className="w-6 h-6 text-indigo-600 mx-auto" />
                          ) : (
                            value
                          )}
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Testimonials */}
        <div className="text-center mb-32">
          <h2 className="text-3xl font-bold mb-16 text-slate-900">
            Trusted by Teams Worldwide
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card
                key={index}
                className="p-8 text-left border-0 shadow-xl rounded-2xl"
              >
                <p className="text-slate-600 text-lg mb-6 leading-relaxed italic">
                  "{testimonial.text}"
                </p>
                <div>
                  <div className="font-semibold text-slate-900 text-base">
                    {testimonial.author}
                  </div>
                  <div className="text-slate-500 text-sm mt-1">
                    {testimonial.title}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* FAQ with Accordion */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-16 text-slate-900">
            Frequently Asked Questions
          </h2>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-lg font-semibold text-slate-900 hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-slate-600 text-base leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </div>
  );
};

export default PricingDetailsPage;
