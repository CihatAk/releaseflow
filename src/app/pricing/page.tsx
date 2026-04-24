"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckIcon, Loader2Icon, GithubIcon } from "@/components/ui/icons";

const PLANS = [
  {
    name: "Free",
    price: 0,
    priceId: "free",
    features: [
      "3 repositories",
      "Basic changelog generation",
      "Markdown export",
      "Community support",
    ],
  },
  {
    name: "Pro",
    price: 9,
    popular: true,
    priceId: "pro",
    features: [
      "Unlimited repositories",
      "Scheduled generation",
      "Embeddable widget",
      "Custom subdomain",
      "Priority support",
      "API access",
    ],
  },
  {
    name: "Team",
    price: 29,
    priceId: "team",
    features: [
      "Everything in Pro",
      "Up to 25 team members",
      "Custom domain",
      "Advanced analytics",
      "SSO authentication",
      "Dedicated support",
    ],
  },
];

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (plan: string) => {
    if (plan === "free") return;
    
    setLoading(plan);
    try {
      const response = await fetch(`/api/payment/checkout?plan=${plan}`, {
        method: "POST",
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Failed to start checkout");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Something went wrong");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <svg className="h-5 w-5 text-primary-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="text-xl font-bold">ReleaseFlow</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/login"><Button variant="ghost" size="sm">Sign In</Button></Link>
            <Link href="/login"><Button size="sm"><GithubIcon className="h-4 w-4" />Get Started</Button></Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="mb-4 text-4xl font-bold">Simple, transparent pricing</h1>
          <p className="mb-4 text-xl text-muted-foreground">
            14-day free trial on all paid plans. No credit card required.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto mt-12">
          {PLANS.map((plan) => (
            <Card key={plan.name} className={plan.popular ? "border-primary" : ""}>
              <CardHeader>
                {plan.popular && (
                  <span className="w-fit rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                    Most Popular
                  </span>
                )}
                <CardTitle>{plan.name}</CardTitle>
                <p className="text-3xl font-bold">
                  ${plan.price}
                  {plan.price > 0 && <span className="text-sm font-normal text-muted-foreground">/month</span>}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <CheckIcon className="h-4 w-4 text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full"
                  onClick={() => handleSubscribe(plan.priceId)}
                  disabled={loading === plan.priceId || plan.priceId === "free"}
                  variant={plan.popular ? "default" : "outline"}
                >
                  {loading === plan.priceId ? (
                    <Loader2Icon className="h-4 w-4 animate-spin" />
                  ) : plan.priceId === "free" ? (
                    "Current Plan"
                  ) : (
                    `Start Free Trial - $${plan.price}/mo`
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center text-muted-foreground">
          <p>All plans include full access during 14-day trial.</p>
          <p className="mt-2">Cancel anytime. No questions asked.</p>
        </div>

        <div className="mt-16 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Compare Plans</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3">Feature</th>
                  <th className="text-center py-3">Free</th>
                  <th className="text-center py-3">Pro</th>
                  <th className="text-center py-3">Team</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-3">Repositories</td>
                  <td className="text-center py-3">3</td>
                  <td className="text-center py-3">Unlimited</td>
                  <td className="text-center py-3">Unlimited</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3">API Access</td>
                  <td className="text-center py-3"><CheckIcon className="h-4 w-4 mx-auto text-gray-300" /></td>
                  <td className="text-center py-3"><CheckIcon className="h-4 w-4 mx-auto text-green-500" /></td>
                  <td className="text-center py-3"><CheckIcon className="h-4 w-4 mx-auto text-green-500" /></td>
                </tr>
                <tr className="border-b">
                  <td className="py-3">Custom Domain</td>
                  <td className="text-center py-3"><CheckIcon className="h-4 w-4 mx-auto text-gray-300" /></td>
                  <td className="text-center py-3"><CheckIcon className="h-4 w-4 mx-auto text-gray-300" /></td>
                  <td className="text-center py-3"><CheckIcon className="h-4 w-4 mx-auto text-green-500" /></td>
                </tr>
                <tr className="border-b">
                  <td className="py-3">Team Members</td>
                  <td className="text-center py-3">1</td>
                  <td className="text-center py-3">3</td>
                  <td className="text-center py-3">25</td>
                </tr>
                <tr>
                  <td className="py-3">Priority Support</td>
                  <td className="text-center py-3"><CheckIcon className="h-4 w-4 mx-auto text-gray-300" /></td>
                  <td className="text-center py-3"><CheckIcon className="h-4 w-4 mx-auto text-green-500" /></td>
                  <td className="text-center py-3"><CheckIcon className="h-4 w-4 mx-auto text-green-500" /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}