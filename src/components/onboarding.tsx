"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GithubIcon } from "@/components/ui/icons";

interface OnboardingProps {
  onComplete: () => void;
}

const steps = [
  {
    id: 1,
    title: "Welcome to ReleaseFlow!",
    description: "Let's get you started with automated changelog generation.",
    icon: "👋",
    content: "ReleaseFlow converts your GitHub commits into beautiful, formatted changelogs automatically.",
  },
  {
    id: 2,
    title: "Connect GitHub",
    description: "We need access to your repositories to read commits.",
    icon: "🔐",
    content: "Click 'Connect GitHub' to authorize. We only read your commit history - we never modify your code.",
    action: "github",
  },
  {
    id: 3,
    title: "Select a Repository",
    description: "Choose which repo you want to generate changelogs for.",
    icon: "📦",
    content: "Pick any public or private repository. You can generate changelogs for unlimited repos with Pro.",
  },
  {
    id: 4,
    title: "Customize Your Changelog",
    description: "Filter and format your changelog.",
    icon: "🎨",
    content: "Filter by date range, commit type (features, fixes, docs), or search specific commits. Choose your favorite format.",
  },
  {
    id: 5,
    title: "Publish & Share",
    description: "Share your changelog with the world.",
    icon: "🌐",
    content: "Get a shareable URL, embed code for your website, or download as Markdown. Add a badge to your README!",
  },
  {
    id: 6,
    title: "You're All Set!",
    description: "Start generating changelogs.",
    icon: "🚀",
    content: "That's it! No more manual changelog writing. Let us handle it while you focus on building.",
  },
];

export function OnboardingTour({ onComplete }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [showTour, setShowTour] = useState(true);

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (!isFirstStep) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  if (!showTour) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className="mx-4 w-full max-w-lg">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Step {currentStep + 1} of {steps.length}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              className="text-xs"
            >
              Skip tour
            </Button>
          </div>
          {/* Progress bar */}
          <div className="mt-2 h-1 w-full rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6 pt-4">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-4xl">
              {step.icon}
            </div>
          </div>
          
          {/* Content */}
          <div className="text-center">
            <CardTitle className="mb-2 text-xl">{step.title}</CardTitle>
            <p className="mb-4 text-sm text-muted-foreground">{step.description}</p>
            <p className="text-sm">{step.content}</p>
          </div>
          
          {/* Action button for GitHub step */}
          {step.action === "github" && (
            <div className="flex justify-center">
              <Button onClick={handleNext}>
                <GithubIcon className="mr-2 h-4 w-4" />
                Connect GitHub
              </Button>
            </div>
          )}
          
          {/* Navigation */}
          <div className="flex items-center justify-between pt-4">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={isFirstStep}
            >
              Back
            </Button>
            
            <div className="flex gap-1">
              {steps.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-2 w-2 rounded-full transition-colors ${
                    idx === currentStep ? "bg-primary" : "bg-muted"
                  }`}
                />
              ))}
            </div>
            
            {!step.action && (
              <Button onClick={handleNext}>
                {isLastStep ? "Get Started" : "Next"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Hook for managing onboarding state
export function useOnboarding() {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  
  useState(() => {
    if (typeof window !== "undefined") {
      const completed = localStorage.getItem("rf_onboarding_completed");
      setHasCompletedOnboarding(completed === "true");
    }
  });

  const completeOnboarding = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("rf_onboarding_completed", "true");
    }
    setHasCompletedOnboarding(true);
  };

  const resetOnboarding = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("rf_onboarding_completed");
    }
    setHasCompletedOnboarding(false);
  };

  return {
    hasCompletedOnboarding,
    completeOnboarding,
    resetOnboarding,
  };
}