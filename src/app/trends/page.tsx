"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeftIcon, TrendingUpIcon, TrendingDownIcon, Loader2Icon } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface CommitData {
  type: string;
  label: string;
  count: number;
  percentage: number;
  trend: "up" | "down" | "stable";
}

const TYPE_COLORS: Record<string, string> = {
  feat: "bg-green-500",
  fix: "bg-red-500",
  docs: "bg-blue-500",
  style: "bg-gray-400",
  refactor: "bg-purple-500",
  test: "bg-cyan-500",
  chore: "bg-yellow-500",
  perf: "bg-pink-500",
  ci: "bg-orange-500",
  revert: "bg-red-700",
};

export default function TrendsPage() {
  const [owner, setOwner] = useState("");
  const [repo, setRepo] = useState("");
  const [timeRange, setTimeRange] = useState("30");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<CommitData[] | null>(null);
  const [error, setError] = useState("");

  const analyzeTrends = async () => {
    if (!owner || !repo) {
      setError("Please enter owner and repo");
      return;
    }

    setLoading(true);
    setError("");
    setData(null);

    try {
      const token = document.cookie.split("; ").find(r => r.startsWith("github_token="))?.split("=")[1];
      
      if (!token) {
        setError("Please log in first");
        setLoading(false);
        return;
      }

      const response = await fetch(
        `/api/changelog/generate?owner=${owner}&repo=${repo}&days=${timeRange}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ owner, repo, days: parseInt(timeRange) }),
        }
      );

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to fetch");
      }

      const result = await response.json();
      const total = result.commitCount || 0;
      
      if (total === 0) {
        setError("No commits found. Make sure commits follow conventional commits format.");
        setLoading(false);
        return;
      }

      const processedData: CommitData[] = result.sections.map((section: any) => ({
        type: section.type,
        label: section.label,
        count: section.commits.length,
        percentage: total > 0 ? Math.round((section.commits.length / total) * 100) : 0,
        trend: section.commits.length > 5 ? "up" : section.commits.length > 0 ? "stable" : "down",
      }));

      setData(processedData);
    } catch (err: any) {
      setError(err.message || "Failed to analyze");
    } finally {
      setLoading(false);
    }
  };

  const totalCommits = data?.reduce((sum, d) => sum + d.count, 0) || 0;
  const maxCount = data ? Math.max(...data.map(d => d.count)) : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard" className="p-2 rounded-lg hover:bg-gray-100">
            <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Trend Analysis</h1>
            <p className="text-gray-600">Commit type distribution and trends</p>
          </div>
        </div>

        <div className="bg-white rounded-lg border p-4 mb-6">
          <div className="flex gap-2 mb-4">
            <Input
              placeholder="owner"
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
              className="max-w-[150px]"
            />
            <Input
              placeholder="repo"
              value={repo}
              onChange={(e) => setRepo(e.target.value)}
              className="max-w-[150px]"
            />
            <Button onClick={analyzeTrends} disabled={loading}>
              {loading ? <Loader2Icon className="h-4 w-4 animate-spin" /> : "Analyze"}
            </Button>
          </div>

          <div className="flex gap-2">
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
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {data && data.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Type Distribution</CardTitle>
                <CardDescription>Last {timeRange} days</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {data.map((item) => (
                  <div key={item.type} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{item.label}</span>
                      <span className="text-gray-500">
                        {item.count} ({item.percentage}%)
                      </span>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${TYPE_COLORS[item.type] || "bg-gray-500"}`}
                        style={{ width: `${maxCount > 0 ? (item.count / maxCount) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-4xl font-bold">{totalCommits}</p>
                  <p className="text-gray-500">total commits</p>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {data.filter(d => d.trend === "up").length}
                    </p>
                    <p className="text-xs text-gray-500">Rising</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-600">
                      {data.filter(d => d.trend === "stable").length}
                    </p>
                    <p className="text-xs text-gray-500">Stable</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-600">
                      {data.filter(d => d.trend === "down").length}
                    </p>
                    <p className="text-xs text-gray-500">Declining</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {!data && !error && !loading && (
          <div className="text-center py-12 text-gray-500">
            Enter owner and repo to analyze trends
          </div>
        )}
      </div>
    </div>
  );
}