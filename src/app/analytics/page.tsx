"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeftIcon,
  BarChart3Icon,
  TrendingUpIcon,
  TrendingDownIcon,
  Loader2Icon,
  GithubIcon,
} from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface RepoStats {
  name: string;
  commits: number;
  lastPush: string;
}

export default function AnalyticsPage() {
  const [owner, setOwner] = useState("");
  const [repos, setRepos] = useState<RepoStats[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchAnalytics = async () => {
    if (!owner) {
      setError("Enter your GitHub username");
      return;
    }

    setLoading(true);
    setError("");
    setRepos([]);

    try {
      const token = document.cookie.split("; ").find(r => r.startsWith("github_token="))?.split("=")[1];
      
      if (!token) {
        setError("Please log in first");
        setLoading(false);
        return;
      }

      const response = await fetch(
        `https://api.github.com/users/${owner}/repos?per_page=30&sort=pushed`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/vnd.github.v3+json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch repositories");
      }

      const data = await response.json();
      
      const repoStats: RepoStats[] = data.map((repo: any) => ({
        name: repo.name,
        commits: repo.size,
        lastPush: repo.pushed_at,
      }));

      setRepos(repoStats.slice(0, 10));
    } catch (err: any) {
      setError(err.message || "Failed to fetch");
    } finally {
      setLoading(false);
    }
  };

  const totalCommits = repos.reduce((sum, r) => sum + r.commits, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard" className="p-2 rounded-lg hover:bg-gray-100">
            <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
            <p className="text-gray-600">Track your repository statistics</p>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>GitHub Analytics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="GitHub username"
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
            />
            <Button onClick={fetchAnalytics} disabled={loading}>
              {loading ? <Loader2Icon className="h-4 w-4 animate-spin mr-2" /> : <GithubIcon className="h-4 w-4 mr-2" />}
              Fetch Analytics
            </Button>
          </CardContent>
        </Card>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {repos.length > 0 && (
          <>
            <div className="grid gap-4 md:grid-cols-3 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-gray-500">Total Repos</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{repos.length}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-gray-500">Total Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{totalCommits.toLocaleString()}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-gray-500">Last Push</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-medium">
                    {repos[0]?.lastPush 
                      ? new Date(repos[0].lastPush).toLocaleDateString()
                      : "N/A"}
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Repository Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {repos.map((repo, idx) => (
                    <div key={repo.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-gray-400 w-6">{idx + 1}.</span>
                        <span className="font-medium">{repo.name}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-500">
                          {new Date(repo.lastPush).toLocaleDateString()}
                        </span>
                        {repo.commits > 1000 ? (
                          <TrendingUpIcon className="h-4 w-4 text-green-500" />
                        ) : (
                          <TrendingDownIcon className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {repos.length === 0 && !loading && !error && (
          <Card>
            <CardContent className="py-12 text-center">
              <BarChart3Icon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500">Enter your username to see analytics</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}