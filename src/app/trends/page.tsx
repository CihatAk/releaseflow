"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeftIcon, TrendingUpIcon, TrendingDownIcon, MinusIcon } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface CommitData {
  type: string;
  count: number;
  percentage: number;
  trend: "up" | "down" | "stable";
}

const TYPE_COLORS: { [key: string]: string } = {
  feat: "bg-green-500",
  fix: "bg-blue-500",
  docs: "bg-yellow-500",
  refactor: "bg-purple-500",
  perf: "bg-red-500",
  test: "bg-cyan-500",
  build: "bg-orange-500",
  ci: "bg-pink-500",
  chore: "bg-gray-500",
};

export default function TrendAnalysisPage() {
  const [timeRange, setTimeRange] = useState("30");

  const mockData: CommitData[] = [
    { type: "feat", count: 45, percentage: 35, trend: "up" },
    { type: "fix", count: 32, percentage: 25, trend: "up" },
    { type: "docs", count: 18, percentage: 14, trend: "down" },
    { type: "refactor", count: 15, percentage: 12, trend: "stable" },
    { type: "perf", count: 10, percentage: 8, trend: "up" },
    { type: "test", count: 8, percentage: 6, trend: "down" },
  ];

  const totalCommits = mockData.reduce((sum, d) => sum + d.count, 0);

  const maxCount = Math.max(...mockData.map(d => d.count));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard" className="p-2 rounded-lg hover:bg-gray-100">
            <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Trend Analysis</h1>
            <p className="text-gray-600">Commit type distribution and trends</p>
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Distribution Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Type Distribution</CardTitle>
              <CardDescription>Last {timeRange} days</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockData.map((data) => (
                <div key={data.type} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="capitalize font-medium">{data.type}</span>
                    <span className="text-gray-500">
                      {data.count} ({data.percentage}%)
                    </span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${TYPE_COLORS[data.type] || "bg-gray-500"}`}
                      style={{ width: `${(data.count / maxCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Donut Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center">
                <div className="relative w-48 h-48">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    {mockData.map((data, idx) => {
                      const slice = (data.count / totalCommits) * 251;
                      const offset = mockData.slice(0, idx).reduce((sum, d) => sum + (d.count / totalCommits) * 251, 0);
                      return (
                        <circle
                          key={data.type}
                          cx="50"
                          cy="50"
                          r="40"
                          fill="transparent"
                          strokeWidth="20"
                          strokeDasharray={`${slice} ${251 - slice}`}
                          strokeDashoffset={-offset}
                          className={TYPE_COLORS[data.type]}
                        />
                      );
                    })}
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-3xl font-bold">{totalCommits}</p>
                      <p className="text-xs text-gray-500">commits</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">+{mockData.filter(d => d.trend === "up").length}</p>
                  <p className="text-xs text-gray-500">Trending up</p>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <p className="text-2xl font-bold text-red-600">-{mockData.filter(d => d.trend === "down").length}</p>
                  <p className="text-xs text-gray-500">Trending down</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Trends Table */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Detailed Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Type</th>
                      <th className="text-right py-3 px-4">Count</th>
                      <th className="text-right py-3 px-4">%</th>
                      <th className="text-right py-3 px-4">Trend</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockData.map((data) => (
                      <tr key={data.type} className="border-b">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${TYPE_COLORS[data.type]}`} />
                            <span className="capitalize">{data.type}</span>
                          </div>
                        </td>
                        <td className="text-right py-3 px-4 font-mono">{data.count}</td>
                        <td className="text-right py-3 px-4">{data.percentage}%</td>
                        <td className="text-right py-3 px-4">
                          {data.trend === "up" && <TrendingUpIcon className="w-5 h-5 text-green-500 ml-auto" />}
                          {data.trend === "down" && <TrendingDownIcon className="w-5 h-5 text-red-500 ml-auto" />}
                          {data.trend === "stable" && <MinusIcon className="w-5 h-5 text-gray-400 ml-auto" />}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}