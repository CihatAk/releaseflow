import { PLANS } from "./payment";
import type { PlanType } from "./payment";

export interface UserPlan {
  plan: PlanType;
  isTrial: boolean;
  trialEndsAt: string | null;
  subscriptionStatus: "active" | "past_due" | "canceled" | "none";
  limits: typeof PLANS.free.features;
  usage: {
    repos: number;
    templates: number;
    changelogs: number;
  };
}

export async function getUserPlan(userId: string): Promise<UserPlan> {
  return getDefaultPlan();
}

export function getDefaultPlan(): UserPlan {
  return {
    plan: "free",
    isTrial: false,
    trialEndsAt: null,
    subscriptionStatus: "none",
    limits: PLANS.free.features,
    usage: { repos: 0, templates: 0, changelogs: 0 },
  };
}

export async function checkFeatureAccess(
  userId: string,
  feature: keyof UserPlan["limits"]
): Promise<{ allowed: boolean; reason?: string }> {
  const userPlan = await getUserPlan(userId);

  if (userPlan.limits[feature]) {
    return { allowed: true };
  }

  const featureNames: Record<string, string> = {
    apiAccess: "API access",
    customDomain: "Custom domain",
    prioritySupport: "Priority support",
  };

  return {
    allowed: false,
    reason: `${featureNames[feature] || feature} is available on Pro/Team plans`,
  };
}

export async function checkRepoLimit(userId: string): Promise<{
  allowed: boolean;
  reason?: string;
  current: number;
  limit: number;
}> {
  const userPlan = await getUserPlan(userId);
  const currentRepoCount = userPlan.usage.repos;
  const limit = userPlan.limits.repos || 3;

  if (currentRepoCount < limit) {
    return {
      allowed: true,
      current: currentRepoCount,
      limit,
    };
  }

  return {
    allowed: false,
    reason: `You've reached your ${limit} repo limit. Upgrade to create more.`,
    current: currentRepoCount,
    limit,
  };
}

export function canStartTrial(plan: PlanType): boolean {
  return plan === "free";
}

export function getPlanBadge(plan: UserPlan): {
  text: string;
  color: string;
} {
  if (plan.isTrial) {
    return { text: "Trial", color: "bg-green-500" };
  }
  if (plan.plan === "pro") {
    return { text: "Pro", color: "bg-purple-500" };
  }
  if (plan.plan === "team") {
    return { text: "Team", color: "bg-blue-500" };
  }
  return { text: "Free", color: "bg-gray-500" };
}

export { PLANS };
export type { PlanType };