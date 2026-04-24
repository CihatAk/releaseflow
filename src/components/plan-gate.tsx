import Link from "next/link";
import { Button } from "@/components/ui/button";

interface PlanGateProps {
  feature: string;
  requiredPlan: "pro" | "team";
  children: React.ReactNode;
}

export function PlanGate({ feature, requiredPlan, children }: PlanGateProps) {
  return (
    <div className="relative">
      {children}
    </div>
  );
}

interface PlanBadgeProps {
  plan: "free" | "pro" | "team";
  isTrial?: boolean;
}

export function PlanBadge({ plan, isTrial }: PlanBadgeProps) {
  if (isTrial) {
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-500 text-white text-xs font-medium">
        Trial
      </span>
    );
  }

  const colors = {
    free: "bg-gray-500",
    pro: "bg-purple-500",
    team: "bg-blue-500",
  };

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full ${colors[plan]} text-white text-xs font-medium`}>
      {plan.charAt(0).toUpperCase() + plan.slice(1)}
    </span>
  );
}

interface PricingCardProps {
  name: string;
  price: number;
  features: string[];
  popular?: boolean;
  currentPlan?: boolean;
  onSelect: () => void;
}

export function PricingCard({
  name,
  price,
  features,
  popular,
  currentPlan,
  onSelect,
}: PricingCardProps) {
  return null;
}

export function FreeTrialBanner({ daysLeft }: { daysLeft?: number }) {
  return (
    <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg p-4 mb-4">
      <div className="flex items-center gap-3">
        <span className="text-xl">🎉</span>
        <div className="flex-1">
          <p className="font-semibold">
            {daysLeft ? `${daysLeft}-day Free Trial Active!` : "Free Trial Available"}
          </p>
          <p className="text-sm opacity-90">
            Try all Pro features for free
          </p>
        </div>
        <Link href="/pricing">
          <Button variant="secondary" size="sm">
            Start Trial
          </Button>
        </Link>
      </div>
    </div>
  );
}