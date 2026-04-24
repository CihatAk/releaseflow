"use client";

import { useEffect } from "react";

/**
 * Analytics component that supports multiple options:
 * 
 * 1. Umami Analytics (recommended for production)
 *    - Set NEXT_PUBLIC_UMAMI_URL and NEXT_PUBLIC_UMAMI_WEBSITE_ID in .env.local
 *    - Self-host or use umami.is cloud
 * 
 * 2. Built-in local tracking (for development/demo)
 *    - Tracks page views in localStorage
 *    - No external service needed
 */
export function Analytics() {
  useEffect(() => {
    // Check for Umami configuration
    const umamiUrl = process.env.NEXT_PUBLIC_UMAMI_URL;
    const umamiWebsiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;

    if (umamiUrl && umamiWebsiteId) {
      // Use Umami
      loadUmamiScript(umamiUrl, umamiWebsiteId);
    } else {
      // Use built-in local analytics
      trackLocalAnalytics();
    }
  }, []);

  return null;
}

function loadUmamiScript(url: string, websiteId: string) {
  // Umami script loader
  const script = document.createElement("script");
  script.async = true;
  script.defer = true;
  script.src = `${url}/script.js`;
  script.setAttribute("data-website-id", websiteId);
  document.head.appendChild(script);
}

function trackLocalAnalytics() {
  // Simple local analytics for demo/development
  // In production, replace with Umami or another analytics service
  const track = () => {
    try {
      const analytics = JSON.parse(localStorage.getItem("rf_analytics") || "{}");
      const today = new Date().toISOString().split("T")[0];
      const page = window.location.pathname;

      // Initialize data if not exists
      if (!analytics.data) {
        analytics.data = { pages: {}, referrers: {} };
        analytics.firstVisit = today;
      }

      // Track page views
      analytics.data.pages[page] = (analytics.data.pages[page] || 0) + 1;
      analytics.totalViews = (analytics.totalViews || 0) + 1;

      // Track referrer
      const referrer = document.referrer;
      if (referrer) {
        try {
          const refDomain = new URL(referrer).hostname;
          analytics.data.referrers[refDomain] = (analytics.data.referrers[refDomain] || 0) + 1;
        } catch {
          // Invalid referrer URL
        }
      }

      // Track last visit
      analytics.lastVisit = today;

      localStorage.setItem("rf_analytics", JSON.stringify(analytics));
    } catch {
      // Silently fail if localStorage is not available
    }
  };

  // Track on page load
  track();

  // Track on route change (for SPAs)
  const observer = new MutationObserver(() => {
    track();
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

// Export for debugging in development
export function getLocalAnalytics() {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(localStorage.getItem("rf_analytics") || "null");
  } catch {
    return null;
  }
}