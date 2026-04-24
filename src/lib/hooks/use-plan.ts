"use client";

import { useState, useEffect } from "react";

interface PlanLimits {
  repos: number;
  templates: number;
}

interface UserPlanState {
  plan: "free" | "pro" | "team";
  isTrial: boolean;
  trialEndsAt: string | null;
  limits: PlanLimits;
  loading: boolean;
}

const defaultPlan: UserPlanState = {
  plan: "free",
  isTrial: false,
  trialEndsAt: null,
  limits: {
    repos: 3,
    templates: 5,
  },
  loading: true,
};

export function useUserPlan() {
  const [state, setState] = useState<UserPlanState>(defaultPlan);

  useEffect(() => {
    async function fetchPlan() {
      try {
        const response = await fetch("/api/user/plan");
        if (response.ok) {
          const data = await response.json();
          setState({
            ...data,
            loading: false,
          });
        } else {
          setState(prev => ({ ...prev, loading: false }));
        }
      } catch (error) {
        setState(prev => ({ ...prev, loading: false }));
      }
    }

    fetchPlan();
  }, []);

  const canCreateRepo = state.limits.repos > 0;
  const canUseApi = state.plan === "pro" || state.plan === "team";
  const canUseCustomDomain = state.plan === "team";
  const canInviteTeam = state.plan === "team";

  return {
    ...state,
    canCreateRepo,
    canUseApi,
    canUseCustomDomain,
    canInviteTeam,
    isPro: state.plan === "pro" || state.plan === "team",
    isTeam: state.plan === "team",
  };
}

export function useFeatureGate() {
  const { plan, isPro, isTeam, loading } = useUserPlan();

  const hasFeature = (feature: "api" | "customDomain" | "team" | "analytics") => {
    if (loading) return false;
    
    switch (feature) {
      case "api":
        return isPro;
      case "customDomain":
        return isTeam;
      case "team":
        return isTeam;
      case "analytics":
        return isPro;
      default:
        return false;
    }
  };

  return { hasFeature, isLoading: loading };
}