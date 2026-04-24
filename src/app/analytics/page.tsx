"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeftIcon, BarChart3Icon, TrendingUpIcon } from "@/components/ui/icons";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface AnalyticsData {
  totalGenerations: number;
  totalRepos: number;
  lastGenerated: string | null;
  popularRepos: { name: string; count: number }[];
  dailyStats: { date: string; count: number }[];
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load from localStorage (demo mode)
    const stored = localStorage.getItem("rf_analytics");
    if (stored) {
      const parsed = JSON.parse(stored);
      setData({
        totalGenerations: parsed.totalViews || 0,
        totalRepos: parsed.data?.pages ? Object.keys(parsed.data.pages).length : 0,
        lastGenerated: parsed.lastVisit,
        popularRepos: Object.entries(parsed.data?.pages || {}).map(([k, v]) => ({ name: k, count: v as number })).sort((a, b) => b.count - a.count).slice(0, 5),
        dailyStats: [],
      });
    } else {
      setData({
        totalGenerations: 0,
        totalRepos: 0,
        lastGenerated: null,
        popularRepos: [],
        dailyStats: [],
      });
    }
    setLoading(false);
  }, []);

  if (loading) return <div className="flex min-h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center px-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <ArrowLeftIcon className="h-5 w-5" />
            <span>Back to Dashboard</span>
          </Link>
        </div>
      </header>

      <main className="container mx-auto max-w-4xl px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">Track your changelog generation usage</p>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <BarChart3Icon className="h-4 w-4" /> Total Generations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{data?.totalGenerations || 0}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <TrendingUpIcon className="h-4 w-4" /> Popular Repos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{data?.totalRepos || 0}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <TrendingUpIcon className="h-4 w-4" /> Last Used
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-medium">{data?.lastGenerated ? new Date(data.lastGenerated).toLocaleDateString() : "Never"}</p>
            </CardContent>
          </Card>
        </div>

        {/* Popular Repos */}
        {data?.popularRepos && data.popularRepos.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Most Generated Repos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.popularRepos.map((repo, idx) => (
                  <div key={repo.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-muted-foreground">{idx + 1}.</span>
                      <span>{repo.name}</span>
                    </div>
                    <span className="font-medium">{repo.count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Placeholder for future data */}
        {(!data?.totalGenerations || data.totalGenerations === 0) && (
          <Card>
            <CardContent className="py-12 text-center">
              <BarChart3Icon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No analytics data yet. Generate some changelogs!</p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}