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
      const response = await fetch(`/api/burndown?owner=${owner}&repo=${repo}&days=${days}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch burndown data");
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || "Failed to fetch burndown data");
      }

      setData(result.data || []);
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