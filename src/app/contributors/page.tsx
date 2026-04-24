"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeftIcon, UsersIcon, GitPullRequestIcon, MessageSquareIcon, Loader2Icon } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface Contributor {
  login: string;
  avatar_url: string;
  commits: number;
  features: number;
  fixes: number;
  docs: number;
  linesAdded: number;
  linesRemoved: number;
}

const mockContributors: Contributor[] = [
  { login: "johndev", avatar_url: "https://i.pravatar.cc/150?u=1", commits: 45, features: 15, fixes: 12, docs: 5, linesAdded: 2500, linesRemoved: 1200 },
  { login: "janedoe", avatar_url: "https://i.pravatar.cc/150?u=2", commits: 38, features: 10, fixes: 18, docs: 8, linesAdded: 1800, linesRemoved: 900 },
  { login: "mikecode", avatar_url: "https://i.pravatar.cc/150?u=3", commits: 22, features: 8, fixes: 10, docs: 2, linesAdded: 1200, linesRemoved: 600 },
  { login: "sarahdev", avatar_url: "https://i.pravatar.cc/150?u=4", commits: 18, features: 5, fixes: 8, docs: 3, linesAdded: 800, linesRemoved: 400 },
];

export default function ContributorsPage() {
  const [sortBy, setSortBy] = useState("commits");
  const [timeRange, setTimeRange] = useState("30");

  const sorted = [...mockContributors].sort((a, b) => {
    if (sortBy === "commits") return b.commits - a.commits;
    if (sortBy === "features") return b.features - a.features;
    if (sortBy === "fixes") return b.fixes - a.fixes;
    return 0;
  });

  const totalCommits = mockContributors.reduce((sum, c) => sum + c.commits, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard" className="p-2 rounded-lg hover:bg-gray-100">
            <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Contributor Analytics</h1>
            <p className="text-gray-600">Who contributed what to the project</p>
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          {["7", "30", "90", "365"].map((days) => (
            <Button
              key={days}
              variant={timeRange === days ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeRange(days)}
            >
              {days === "365" ? "All time" : `${days} days`}
            </Button>
          ))}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card><CardContent className="py-4"><p className="text-2xl font-bold">{mockContributors.length}</p><p className="text-sm text-gray-500">Contributors</p></CardContent></Card>
          <Card><CardContent className="py-4"><p className="text-2xl font-bold">{totalCommits}</p><p className="text-sm text-gray-500">Total Commits</p></CardContent></Card>
          <Card><CardContent className="py-4"><p className="text-2xl font-bold">{mockContributors.reduce((s, c) => s + c.features, 0)}</p><p className="text-sm text-gray-500">Features</p></CardContent></Card>
          <Card><CardContent className="py-4"><p className="text-2xl font-bold">{mockContributors.reduce((s, c) => s + c.fixes, 0)}</p><p className="text-sm text-gray-500">Bug Fixes</p></CardContent></Card>
        </div>

        {/* Leaderboard */}
        <Card>
          <CardHeader>
            <CardTitle>Leaderboard</CardTitle>
            <CardDescription>Top contributors by activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sorted.map((contributor, idx) => (
                <div key={contributor.login} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-full font-bold text-gray-600">
                    {idx + 1}
                  </div>
                  <img src={contributor.avatar_url} alt={contributor.login} className="w-10 h-10 rounded-full" />
                  <div className="flex-1">
                    <p className="font-medium">@{contributor.login}</p>
                    <div className="flex gap-4 mt-1 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><GitPullRequestIcon className="w-3 h-3" /> {contributor.commits}</span>
                      <span className="text-green-600">+{contributor.features} feat</span>
                      <span className="text-blue-600">+{contributor.fixes} fix</span>
                      <span className="text-orange-600">+{contributor.docs} docs</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">+{contributor.linesAdded.toLocaleString()} lines</p>
                    <p className="text-xs text-red-500">-{contributor.linesRemoved.toLocaleString()} lines</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}