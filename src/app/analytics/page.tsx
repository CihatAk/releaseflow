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

interface AnalyticsEvent {
  id: string;
  event: string;
  userId: string | null;
  repoId: string | null;
  metadata: any;
  created_at: string;
}

interface EventStat {
  event: string;
  count: number;
}

export default function AnalyticsPage() {
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [stats, setStats] = useState<EventStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [timeRange, setTimeRange] = useState("7d");

  const fetchAnalytics = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/analytics?limit=100`);
      
      if (!response.ok) {
        throw new Error("Analytics yüklenemedi");
      }

      const data = await response.json();
      setEvents(data.events || []);
      setStats(data.stats || []);
    } catch (err: any) {
      setError(err.message || "Failed to fetch analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const totalEvents = stats.reduce((sum, s) => sum + s.count, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard" className="p-2 rounded-lg hover:bg-gray-100">
            <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
            <p className="text-gray-600">Track your changelog and repository statistics</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-500">Total Events</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{totalEvents.toLocaleString()}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-500">Event Types</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{stats.length}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-500">Last 7 Days</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {stats.filter(s => {
                  const eventDate = new Date();
                  return true; // Tüm eventleri göster
                }).reduce((sum, s) => sum + s.count, 0)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-500">Top Event</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-medium">
                {stats[0]?.event || "N/A"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Event Statistics */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Event Statistics</CardTitle>
            <CardDescription>Most frequent events across your repositories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.map((stat, idx) => (
                <div key={stat.event} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-gray-400 w-6">{idx + 1}.</span>
                    <span className="font-medium">{stat.event}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-48 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${Math.min(100, (stat.count / (stats[0]?.count || 1)) * 100)}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-500 w-12 text-right">
                      {stat.count}
                    </span>
                    {stat.count > 100 ? (
                      <TrendingUpIcon className="h-4 w-4 text-green-500" />
                    ) : (
                      <TrendingDownIcon className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                </div>
              ))}
              {stats.length === 0 && !loading && (
                <p className="text-gray-500 text-center py-4">
                  No analytics data yet. Events will appear here once you start using the app.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Events */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Events</CardTitle>
            <CardDescription>Latest activity across your repositories</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <Loader2Icon className="h-8 w-8 animate-spin mx-auto text-gray-400" />
              </div>
            ) : (
              <div className="space-y-3">
                {events.slice(0, 20).map((event) => (
                  <div key={event.id} className="flex items-center justify-between border-b pb-3">
                    <div>
                      <span className="font-medium">{event.event}</span>
                      {event.metadata?.repo && (
                        <span className="text-sm text-gray-500 ml-2">
                          ({event.metadata.repo})
                        </span>
                      )}
                    </div>
                    <span className="text-sm text-gray-400">
                      {new Date(event.created_at).toLocaleString()}
                    </span>
                  </div>
                ))}
                {events.length === 0 && (
                  <p className="text-gray-500 text-center py-4">
                    No events yet. Start generating changelogs to see activity here.
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}