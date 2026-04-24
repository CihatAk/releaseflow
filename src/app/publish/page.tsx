"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeftIcon,
  PlusIcon,
  UploadIcon,
  GithubIcon,
  CheckIcon,
  Loader2Icon,
  AlertCircleIcon,
} from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface ReleaseConfig {
  owner: string;
  repo: string;
  tag: string;
  title: string;
  body: string;
  targetCommitish: string;
}

interface Settings {
  githubToken: string;
  defaultRepo: string;
  defaultFormat: string;
  defaultDays: number;
  autoPublish: boolean;
  notifyEmail: string;
  slackWebhook: string;
  discordWebhook: string;
}

export default function PublishReleasePage() {
  const [config, setConfig] = useState<ReleaseConfig>({
    owner: "",
    repo: "",
    tag: "",
    title: "",
    body: "",
    targetCommitish: "main",
  });
  const [settings, setSettings] = useState<Settings | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [result, setResult] = useState<{ url: string; success: boolean } | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("rf_settings");
    if (stored) {
      setSettings(JSON.parse(stored));
    }
  }, []);

  const parseRepoUrl = (url: string) => {
    const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (match) {
      setConfig((c) => ({
        ...c,
        owner: match[1],
        repo: match[2].replace(/\.git$/, ""),
      }));
    }
  };

  const handlePublish = async () => {
    if (!config.owner || !config.repo || !config.tag) {
      setError("Missing required fields");
      return;
    }

    if (!settings?.githubToken) {
      setError("GitHub token not configured. Please add your token in Settings.");
      return;
    }

    setPublishing(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("/api/github/release", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-github-token": settings.githubToken,
        },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to publish release");
      }

      const data = await response.json();
      setResult({
        url: data.url,
        success: true,
      });
    } catch (err: any) {
      setError(err.message || "Failed to publish release");
    } finally {
      setPublishing(false);
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
            <h1 className="text-2xl font-bold text-gray-900">Publish Release</h1>
            <p className="text-gray-600">Create GitHub Release with changelog</p>
          </div>
        </div>

        <Card className="mb-6">
          {!settings?.githubToken && (
            <CardContent className="pt-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 text-yellow-700">
                  <AlertCircleIcon className="w-5 h-5" />
                  <span className="font-medium">GitHub token not configured</span>
                </div>
                <p className="text-sm text-yellow-600 mt-1">
                  Please configure your GitHub token in Settings to publish releases.
                </p>
                <Link href="/settings" className="text-sm text-blue-600 underline mt-2 inline-block">
                  Go to Settings →
                </Link>
              </div>
            </CardContent>
          )}
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GithubIcon className="w-5 h-5" />
              Release Configuration
            </CardTitle>
            <CardDescription>
              Create a new GitHub Release with your generated changelog
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Repository URL
                </label>
                <Input
                  placeholder="https://github.com/owner/repo"
                  onChange={(e) => parseRepoUrl(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Owner/Repo
                  </label>
                  <Input
                    placeholder="owner/repo"
                    value={config.owner && config.repo ? `${config.owner}/${config.repo}` : ""}
                    onChange={(e) => {
                      const [owner, repo] = e.target.value.split("/");
                      setConfig((c) => ({ ...c, owner, repo }));
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tag Name *
                  </label>
                  <Input
                    placeholder="v1.0.0"
                    value={config.tag}
                    onChange={(e) => setConfig((c) => ({ ...c, tag: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Release Title
                  </label>
                  <Input
                    placeholder="v1.0.0 Release"
                    value={config.title}
                    onChange={(e) => setConfig((c) => ({ ...c, title: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Branch/Commit
                  </label>
                  <Input
                    placeholder="main"
                    value={config.targetCommitish}
                    onChange={(e) => setConfig((c) => ({ ...c, targetCommitish: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Release Notes (Changelog)
                </label>
                <textarea
                  className="w-full h-64 p-3 border border-gray-300 rounded-lg font-mono text-sm"
                  placeholder="Paste your generated changelog here..."
                  value={config.body}
                  onChange={(e) => setConfig((c) => ({ ...c, body: e.target.value }))}
                />
              </div>

              <Button
                onClick={handlePublish}
                disabled={publishing || !config.tag || !config.owner || !config.repo}
                className="w-full"
              >
                {publishing ? (
                  <>
                    <Loader2Icon className="w-4 h-4 mr-2 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <UploadIcon className="w-4 h-4 mr-2" />
                    Publish Release
                  </>
                )}
              </Button>

              {error && (
                <p className="text-red-600 text-sm">{error}</p>
              )}

              {result && result.success && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckIcon className="w-5 h-5" />
                    <span>Release published successfully!</span>
                  </div>
                  <a
                    href={result.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline text-sm block mt-2"
                  >
                    {result.url}
                  </a>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-gray-600">
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold">
                  1
                </div>
                <div>
                  <p className="font-medium">Generate changelog</p>
                  <p className="text-sm">Create your changelog from the dashboard</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold">
                  2
                </div>
                <div>
                  <p className="font-medium">Add release details</p>
                  <p className="text-sm">Enter tag, title, and paste changelog as release notes</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold">
                  3
                </div>
                <div>
                  <p className="font-medium">Publish to GitHub</p>
                  <p className="text-sm">Create the release directly on GitHub</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}