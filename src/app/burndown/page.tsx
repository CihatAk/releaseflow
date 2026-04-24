"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeftIcon, TrendingDownIcon, Loader2Icon, TargetIcon } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface BurndownPoint {
  date: string;
  commits: number;
  cumulative: number;
}

export default function BurndownPage() {
  const [owner, setOwner] = useState("");
  const [repo, setRepo] = useState("");
  const [days, setDays] = useState(14);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<BurndownPoint[]>([]);
  const [error, setError] = useState("");

  const fetchBurndown = async () => {
    if (!owner || !repo) {
      setError("Please enter owner and repo");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const token = document.cookie.split("; ").find(r => r.startsWith("github_token="))?.split("=")[1];
      
      if (!token) {
        setError("Please log in first");
        return;
      }

      const response = await fetch("/api/github/repos", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch");
      }

      const result = await response.json();
      const targetRepo = result.repos?.find((r: any) => r.full_name === `${owner}/${repo}`);

      if (!targetRepo) {
        setError("Repository not found. Make sure you have access.");
        return;
      }

      const commitResponse = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/commits?since=${new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()}&per_page=100`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/vnd.github.v3+json",
          },
        }
      );

      if (!commitResponse.ok) {
        throw new Error("Failed to fetch commits");
      }

      const commits = await commitResponse.json();
      
      const commitByDate = new Map<string, number>();
      let cumulative = 0;
      
      for (const commit of commits) {
        const date = new Date(commit.commit.author.date).toISOString().split("T")[0];
        commitByDate.set(date, (commitByDate.get(date) || 0) + 1);
      }

      const sortedDates = Array.from(commitByDate.keys()).sort();
      const burndown: BurndownPoint[] = sortedDates.map(date => {
        cumulative += commitByDate.get(date) || 0;
        return {
          date,
          commits: commitByDate.get(date) || 0,
          cumulative,
        };
      });

      setData(burndown);
    } catch (err: any) {
      setError(err.message || "Failed to fetch burndown data");
    } finally {
      setLoading(false);
    }
  };

  const maxCommits = data.length > 0 ? Math.max(...data.map(d => d.commits)) : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard" className="p-2 rounded-lg hover:bg-gray-100">
            <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Burndown Chart</h1>
            <p className="text-gray-600">Track work remaining for release</p>
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
            <Button onClick={fetchBurndown} disabled={loading}>
              {loading ? <Loader2Icon className="h-4 w-4 animate-spin" /> : "Load"}
            </Button>
          </div>

          <div className="flex gap-2">
            {[7, 14, 21, 30].map((d) => (
              <Button
                key={d}
                variant={days === d ? "default" : "outline"}
                size="sm"
                onClick={() => setDays(d)}
              >
                {d} days
              </Button>
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {data.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Commit Activity</CardTitle>
              <CardDescription>{owner}/{repo}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.map((point, idx) => (
                  <div key={idx} className="flex items-center gap-4">
                    <span className="w-24 text-sm text-gray-500">{point.date}</span>
                    <div className="flex-1 h-6 bg-gray-100 rounded overflow-hidden">
                      <div
                        className="h-full bg-blue-500"
                        style={{ width: maxCommits > 0 ? `${(point.commits / maxCommits) * 100}%` : "0%" }}
                      />
                    </div>
                    <span className="w-12 text-right text-sm">{point.commits}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {data.length === 0 && !error && !loading && (
          <div className="text-center py-12 text-gray-500">
            Enter owner and repo to see burndown chart
          </div>
        )}
      </div>
    </div>
  );
}