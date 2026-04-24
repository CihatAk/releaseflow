"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeftIcon,
  PlusIcon,
  TrashIcon,
  BellIcon,
  ClockIcon,
  GithubIcon,
  CheckIcon,
  EyeIcon,
} from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface WatchedRepo {
  owner: string;
  repo: string;
  schedule: "daily" | "weekly" | "monthly";
  enabled: boolean;
  lastGenerated?: string;
  createdAt: string;
}

export default function WatchPage() {
  const [watchedRepos, setWatchedRepos] = useState<WatchedRepo[]>([]);
  const [newRepo, setNewRepo] = useState("");
  const [schedule, setSchedule] = useState<"daily" | "weekly" | "monthly">("weekly");
  const [saved, setSaved] = useState(false);

  const loadWatched = () => {
    const stored = localStorage.getItem("rf_watched_repos");
    if (stored) {
      setWatchedRepos(JSON.parse(stored));
    }
  };

  const saveWatched = () => {
    localStorage.setItem("rf_watched_repos", JSON.stringify(watchedRepos));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const parseRepo = (input: string): { owner: string; repo: string } | null => {
    const patterns = [
      /github\.com\/([^\/]+)\/([^\/]+)/,
      /^([^\/]+)\/([^\/]+)$/,
    ];
    
    for (const pattern of patterns) {
      const match = input.trim().match(pattern);
      if (match) {
        return { owner: match[1], repo: match[2].replace(/\.git$/, "") };
      }
    }
    return null;
  };

  const addRepo = () => {
    const parsed = parseRepo(newRepo);
    if (!parsed) return;

    const exists = watchedRepos.some(
      (r) => r.owner === parsed.owner && r.repo === parsed.repo
    );
    if (exists) return;

    setWatchedRepos([
      ...watchedRepos,
      {
        owner: parsed.owner,
        repo: parsed.repo,
        schedule,
        enabled: true,
        createdAt: new Date().toISOString(),
      },
    ]);
    setNewRepo("");
  };

  const removeRepo = (owner: string, repo: string) => {
    setWatchedRepos(
      watchedRepos.filter((r) => !(r.owner === owner && r.repo === repo))
    );
  };

  const toggleEnabled = (owner: string, repo: string) => {
    setWatchedRepos(
      watchedRepos.map((r) =>
        r.owner === owner && r.repo === repo ? { ...r, enabled: !r.enabled } : r
      )
    );
  };

  const updateSchedule = (owner: string, repo: string, newSchedule: "daily" | "weekly" | "monthly") => {
    setWatchedRepos(
      watchedRepos.map((r) =>
        r.owner === owner && r.repo === repo ? { ...r, schedule: newSchedule } : r
      )
    );
  };

  const generateNow = async (owner: string, repo: string) => {
    try {
      const response = await fetch("/api/changelog/quick", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ owner, repo, days: 30, format: "default" }),
      });

      if (response.ok) {
        setWatchedRepos(
          watchedRepos.map((r) =>
            r.owner === owner && r.repo === repo
              ? { ...r, lastGenerated: new Date().toISOString() }
              : r
          )
        );
      }
    } catch (error) {
      console.error("Generation failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/dashboard"
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Repo Watch</h1>
            <p className="text-gray-600">Monitor repos and auto-generate changelogs</p>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <EyeIcon className="w-5 h-5" />
              Add Repository to Watch
            </CardTitle>
            <CardDescription>
              Automatically generate changelogs on a schedule
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="owner/repo or GitHub URL"
                  value={newRepo}
                  onChange={(e) => setNewRepo(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addRepo()}
                />
              </div>
              <select
                value={schedule}
                onChange={(e) => setSchedule(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
              <Button onClick={addRepo} disabled={!newRepo}>
                <PlusIcon className="w-4 h-4 mr-2" />
                Add
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Watched Repositories</CardTitle>
              <CardDescription>
                {watchedRepos.filter(r => r.enabled).length} active • {watchedRepos.length} total
              </CardDescription>
            </div>
            <Button onClick={saveWatched} disabled={watchedRepos.length === 0}>
              <BellIcon className="w-4 h-4 mr-2" />
              {saved ? "Saved!" : "Save Changes"}
            </Button>
          </CardHeader>
          <CardContent>
            {watchedRepos.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No repositories being watched. Add one above to get started.
              </p>
            ) : (
              <div className="space-y-3">
                {watchedRepos.map((r) => (
                  <div
                    key={`${r.owner}/${r.repo}`}
                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
                  >
                    <button
                      onClick={() => toggleEnabled(r.owner, r.repo)}
                      className={`w-10 h-6 rounded-full transition-colors ${
                        r.enabled ? "bg-green-500" : "bg-gray-300"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                          r.enabled ? "translate-x-4" : "translate-x-0.5"
                        }`}
                      />
                    </button>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <GithubIcon className="w-4 h-4 text-gray-600" />
                        <span className="font-medium">
                          {r.owner}/{r.repo}
                        </span>
                      </div>
                      {r.lastGenerated && (
                        <p className="text-sm text-gray-500">
                          Last generated: {new Date(r.lastGenerated).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <select
                      value={r.schedule}
                      onChange={(e) =>
                        updateSchedule(r.owner, r.repo, e.target.value as any)
                      }
                      className="px-2 py-1 border border-gray-300 rounded text-sm"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => generateNow(r.owner, r.repo)}
                    >
                      <ClockIcon className="w-4 h-4 mr-1" />
                      Generate
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeRepo(r.owner, r.repo)}
                    >
                      <TrashIcon className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-gray-600">
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                  1
                </div>
                <div>
                  <p className="font-medium">Add repositories</p>
                  <p className="text-sm">Connect any public or private GitHub repository</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                  2
                </div>
                <div>
                  <p className="font-medium">Set schedule</p>
                  <p className="text-sm">Choose daily, weekly, or monthly generation</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                  3
                </div>
                <div>
                  <p className="font-medium">Get notified</p>
                  <p className="text-sm">
                    In production: receive notifications when new changelogs are ready
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}