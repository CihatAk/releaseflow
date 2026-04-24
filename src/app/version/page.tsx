"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeftIcon,
  GitCompareIcon,
  CheckIcon,
  Loader2Icon,
} from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface ParsedCommitWithIssue {
  sha: string;
  message: string;
  type: string;
  scope?: string;
  breaking: boolean;
  shaShort: string;
  date: string;
  author: string;
}

type VersionBump = "major" | "minor" | "patch" | "none";

function detectVersionBump(commits: ParsedCommitWithIssue[]): VersionBump {
  const hasBreaking = commits.some(c => c.breaking);
  const hasMajor = commits.some(c => c.type === "feat" && c.message.toLowerCase().includes("breaking"));
  
  if (hasBreaking || hasMajor) return "major";
  
  const hasFeatures = commits.some(c => c.type === "feat");
  if (hasFeatures) return "minor";
  
  const hasFixes = commits.some(c => c.type === "fix" || c.type === "perf" || c.type === "refactor");
  if (hasFixes) return "patch";
  
  return "none";
}

function getNextVersion(current: string, bump: VersionBump): string {
  const [major, minor, patch] = current.replace(/^v/, "").split(".").map(Number);
  
  if (bump === "major") return `v${major + 1}.0.0`;
  if (bump === "minor") return `v${major}.${minor + 1}.0`;
  if (bump === "patch") return `v${major}.${minor}.${patch + 1}`;
  return current;
}

function getBumpColor(bump: VersionBump): string {
  if (bump === "major") return "text-red-600 bg-red-50";
  if (bump === "minor") return "text-blue-600 bg-blue-50";
  if (bump === "patch") return "text-green-600 bg-green-50";
  return "text-gray-600 bg-gray-50";
}

export default function VersionDetectPage() {
  const [owner, setOwner] = useState("");
  const [repo, setRepo] = useState("");
  const [currentVersion, setCurrentVersion] = useState("1.0.0");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    bump: VersionBump;
    nextVersion: string;
    commits: ParsedCommitWithIssue[];
    hasBreaking: boolean;
    hasFeatures: boolean;
    hasFixes: boolean;
  } | null>(null);
  const [error, setError] = useState("");

  const analyzeVersion = async () => {
    if (!owner || !repo) {
      setError("Please enter owner and repo");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const token = document.cookie.split("; ").find(r => r.startsWith("github_token="))?.split("=")[1];
      
      if (!token) {
        setError("Please log in first");
        setLoading(false);
        return;
      }

      const response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/commits?per_page=50`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/vnd.github.v3+json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch commits");
      }

      const commits = await response.json();
      
      if (!commits.length) {
        setError("No commits found");
        setLoading(false);
        return;
      }

      const parsedCommits: ParsedCommitWithIssue[] = commits.map((commit: any) => {
        const msg = commit.commit.message;
        const typeMatch = msg.match(/^(\w+)(\([^)]+\))?:/);
        const breaking = msg.includes("BREAKING") || msg.includes("! :");
        
        return {
          sha: commit.sha,
          message: msg,
          type: typeMatch?.[1] || "other",
          scope: typeMatch?.[2]?.replace(/[()]/g, ""),
          breaking,
          shaShort: commit.sha.substring(0, 7),
          date: commit.commit.author.date,
          author: commit.commit.author.name,
        };
      });

      const bump = detectVersionBump(parsedCommits);
      
      setResult({
        bump,
        nextVersion: getNextVersion(currentVersion, bump),
        commits: parsedCommits.slice(0, 10),
        hasBreaking: parsedCommits.some(c => c.breaking),
        hasFeatures: parsedCommits.some(c => c.type === "feat"),
        hasFixes: parsedCommits.some(c => c.type === "fix"),
      });
    } catch (err: any) {
      setError(err.message || "Failed to analyze");
    } finally {
      setLoading(false);
    }
  };

  const bumpLabels = {
    major: "MAJOR (breaking changes)",
    minor: "MINOR (new features)",
    patch: "PATCH (bug fixes)",
    none: "NONE (no version bump needed)",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard" className="p-2 rounded-lg hover:bg-gray-100">
            <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Version Detection</h1>
            <p className="text-gray-600">Detect semantic version bump from commits</p>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Repository</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="owner"
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
              />
              <Input
                placeholder="repo"
                value={repo}
                onChange={(e) => setRepo(e.target.value)}
              />
            </div>
            <Input
              placeholder="current version (e.g., 1.0.0)"
              value={currentVersion}
              onChange={(e) => setCurrentVersion(e.target.value)}
            />
            <Button onClick={analyzeVersion} disabled={loading}>
              {loading ? <Loader2Icon className="h-4 w-4 animate-spin mr-2" /> : <GitCompareIcon className="h-4 w-4 mr-2" />}
              Analyze
            </Button>
          </CardContent>
        </Card>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {result && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Version Bump Result</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Current</p>
                    <p className="text-2xl font-bold">v{currentVersion}</p>
                  </div>
                  <GitCompareIcon className="h-8 w-8 text-gray-400" />
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Next Version</p>
                    <p className="text-2xl font-bold text-green-600">v{result.nextVersion}</p>
                  </div>
                </div>
                <div className={`inline-flex items-center px-4 py-2 rounded-lg ${getBumpColor(result.bump)}`}>
                  <span className="font-bold uppercase">{result.bump}</span>
                  <span className="ml-2 text-sm">- {bumpLabels[result.bump]}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Commits Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-4 bg-red-50 rounded-lg">
                    <p className="text-2xl font-bold text-red-600">
                      {result.commits.filter(c => c.breaking).length}
                    </p>
                    <p className="text-sm">Breaking</p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">
                      {result.commits.filter(c => c.type === "feat").length}
                    </p>
                    <p className="text-sm">Features</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">
                      {result.commits.filter(c => c.type === "fix").length}
                    </p>
                    <p className="text-sm">Fixes</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Commits</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {result.commits.map((commit) => (
                    <div key={commit.sha} className="flex items-start gap-3 text-sm">
                      <span className="font-mono text-xs text-gray-400 w-16">{commit.shaShort}</span>
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        commit.type === "feat" ? "bg-blue-100 text-blue-700" :
                        commit.type === "fix" ? "bg-green-100 text-green-700" :
                        commit.breaking ? "bg-red-100 text-red-700" :
                        "bg-gray-100 text-gray-700"
                      }`}>
                        {commit.type}
                      </span>
                      <span className="flex-1">{commit.message}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}