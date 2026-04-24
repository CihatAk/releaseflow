"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeftIcon,
  TagIcon,
  GitPullRequestIcon,
  CheckIcon,
  Loader2Icon,
  ArrowRightIcon,
} from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { detectVersionBump, getNextVersion, VersionBump } from "@/lib/github/api";

interface AutoTagConfig {
  owner: string;
  repo: string;
  currentVersion: string;
  bumpType: VersionBump;
  autoPush: boolean;
  createRelease: boolean;
}

export default function AutoTagPage() {
  const [config, setConfig] = useState<AutoTagConfig>({
    owner: "",
    repo: "",
    currentVersion: "v1.0.0",
    bumpType: "minor",
    autoPush: true,
    createRelease: true,
  });
  const [preview, setPreview] = useState<{
    bump: VersionBump;
    nextVersion: string;
    commits: { message: string; type: string }[];
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const analyzeCommits = async () => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const sampleCommits = [
      { message: "feat(auth): add OAuth2 login", type: "feat" },
      { message: "fix(api): rate limiting", type: "fix" },
      { message: "perf(db): optimize queries", type: "perf" },
      { message: "docs: update readme", type: "docs" },
    ];

    const bump = detectVersionBump(sampleCommits as any);
    setPreview({
      bump,
      nextVersion: getNextVersion(config.currentVersion, bump),
      commits: sampleCommits,
    });
    setConfig({ ...config, bumpType: bump });
    setLoading(false);
  };

  const executeAutoTag = async () => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setLoading(false);
    alert(`Auto-tag created: v${preview?.nextVersion || config.currentVersion}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard" className="p-2 rounded-lg hover:bg-gray-100">
            <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Auto Version</h1>
            <p className="text-gray-600">Automatically detect and create version tags</p>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TagIcon className="w-5 h-5" />
              Configuration
            </CardTitle>
            <CardDescription>
              Configure auto-version detection
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Repository
              </label>
              <Input
                placeholder="owner/repo"
                value={config.owner && config.repo ? `${config.owner}/${config.repo}` : ""}
                onChange={(e) => {
                  const [owner, repo] = e.target.value.split("/");
                  setConfig({ ...config, owner, repo });
                }}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Version
                </label>
                <Input
                  placeholder="v1.0.0"
                  value={config.currentVersion}
                  onChange={(e) => setConfig({ ...config, currentVersion: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Detected Bump
                </label>
                <div className="px-3 py-2 border rounded-lg bg-gray-50">
                  {config.bumpType.toUpperCase()}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config.autoPush}
                  onChange={(e) => setConfig({ ...config, autoPush: e.target.checked })}
                  className="w-4 h-4"
                />
                <span>Auto-push tag to GitHub</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config.createRelease}
                  onChange={(e) => setConfig({ ...config, createRelease: e.target.checked })}
                  className="w-4 h-4"
                />
                <span>Create release on GitHub</span>
              </label>
            </div>

            <div className="flex gap-2">
              <Button onClick={analyzeCommits} disabled={loading || !config.owner || !config.repo}>
                {loading ? (
                  <Loader2Icon className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <TagIcon className="w-4 h-4 mr-2" />
                )}
                Analyze & Detect
              </Button>
            </div>
          </CardContent>
        </Card>

        {preview && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Analysis Result</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-100 mb-4">
                  <span className={`text-3xl font-bold ${
                    preview.bump === "major" ? "text-red-500" :
                    preview.bump === "minor" ? "text-blue-500" :
                    preview.bump === "patch" ? "text-green-500" :
                    "text-gray-400"
                  }`}>
                    {preview.bump[0].toUpperCase()}
                  </span>
                </div>
                <h2 className="text-xl font-bold">
                  {preview.bump === "none" ? "No Changes" : `${preview.bump.toUpperCase()} Release`}
                </h2>
                <p className="text-gray-600">
                  {config.currentVersion} → {preview.nextVersion}
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium mb-3">Commit Analysis</h3>
                {preview.commits.map((commit, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                    <span className={`w-2 h-2 rounded-full ${
                      commit.type === "feat" ? "bg-green-500" :
                      commit.type === "fix" ? "bg-blue-500" :
                      commit.type === "perf" ? "bg-yellow-500" :
                      "bg-gray-400"
                    }`} />
                    <span className="flex-1">{commit.message}</span>
                    <span className="text-xs text-gray-500">{commit.type}</span>
                  </div>
                ))}
              </div>

              <Button
                onClick={executeAutoTag}
                disabled={loading || preview.bump === "none"}
                className="w-full mt-4"
              >
                <GitPullRequestIcon className="w-4 h-4 mr-2" />
                Auto-Create Tag & Release
              </Button>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">1</div>
                <div>
                  <p className="font-medium">Analyze commits</p>
                  <p className="text-sm text-gray-500">Detects feat, fix, perf commits</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">2</div>
                <div>
                  <p className="font-medium">Detect bump type</p>
                  <p className="text-sm text-gray-500">Major/minor/patch detection</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">3</div>
                <div>
                  <p className="font-medium">Create tag & release</p>
                  <p className="text-sm text-gray-500">Auto-push to GitHub</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}