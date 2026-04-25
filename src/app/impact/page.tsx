"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeftIcon, TrendingUpIcon, ZapIcon, StarIcon, Loader2Icon } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface CommitImpact {
  sha: string;
  message: string;
  type: string;
  score: number;
  scope: string;
}

const analyzeImpact = (message: string, type: string, hasBreaking: boolean): number => {
  let baseScore = 0;
  
  switch (type) {
    case "feat": baseScore = 10; break;
    case "fix": baseScore = 8; break;
    case "perf": baseScore = 15; break;
    case "refactor": baseScore = 5; break;
    case "docs": baseScore = 3; break;
    case "test": baseScore = 2; break;
    default: baseScore = 1;
  }

  if (hasBreaking) baseScore *= 2;
  if (message.toLowerCase().includes("security")) baseScore *= 3;
  if (message.toLowerCase().includes("api")) baseScore += 3;
  if (message.toLowerCase().includes("database") || message.toLowerCase().includes("db")) baseScore += 5;

  return Math.min(baseScore, 100);
};

export default function ImpactScorePage() {
  const [repo, setRepo] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<CommitImpact[]>([]);
  const [error, setError] = useState("");

  const fetchCommits = async () => {
    if (!repo) return;
    
    const token = document.cookie.split("; ").find(r => r.startsWith("github_token="))?.split("=")[1];
    if (!token) {
      setError("Please login first");
      return;
    }

    const [owner, repoName] = repo.split("/");
    if (!owner || !repoName) {
      setError("Please enter owner/repo format");
      return;
    }

    setLoading(true);
    setError("");
    setResults([]);

    try {
      const res = await fetch(`https://api.github.com/repos/${owner}/${repoName}/commits?per_page=20`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github.v3+json",
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch commits");
      }

      const commits = await res.json();
      
      const analyzed = commits.map((c: any) => {
        const message = c.commit.message;
        const type = message.match(/^(feat|fix|perf|refactor|docs|test|chore|style|ci|build)(\([^)]*\))?:/)?.[1] || "other";
        const breaking = message.includes("BREAKING CHANGE");
        
        return {
          sha: c.sha.substring(0, 7),
          message: message.split("\n")[0],
          type,
          score: analyzeImpact(message, type, breaking),
          scope: message.match(/\(([^)]+)\)/)?.[1] || "general",
        };
      }).sort((a: CommitImpact, b: CommitImpact) => b.score - a.score);

      setResults(analyzed);
    } catch (err: any) {
      setError(err.message || "Failed to analyze");
    } finally {
      setLoading(false);
    }
  };

  const totalScore = results.reduce((sum, r) => sum + r.score, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard" className="p-2 rounded-lg hover:bg-gray-100">
            <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Impact Score</h1>
            <p className="text-gray-600">Calculate each commit's impact level</p>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Select Repository</CardTitle>
            <CardDescription>Enter a repo to analyze commit impact</CardDescription>
          </CardHeader>
          <CardContent className="flex gap-4">
            <input
              type="text"
              placeholder="owner/repo"
              value={repo}
              onChange={(e) => setRepo(e.target.value)}
              className="flex-1 px-4 py-2 border rounded-lg"
            />
            <Button onClick={fetchCommits} disabled={loading || !repo}>
              {loading ? <Loader2Icon className="w-4 h-4 animate-spin" /> : <ZapIcon className="w-4 h-4" />}
              {loading ? "Analyzing..." : "Analyze"}
            </Button>
          </CardContent>
        </Card>

        {error && (
          <Card className="mb-6">
            <CardContent className="py-4 text-red-500">{error}</CardContent>
          </Card>
        )}

        {results.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardContent className="py-4 text-center">
                  <ZapIcon className="w-8 h-8 mx-auto text-yellow-500 mb-2" />
                  <p className="text-2xl font-bold">{totalScore}</p>
                  <p className="text-sm text-gray-500">Total Impact</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="py-4 text-center">
                  <TrendingUpIcon className="w-8 h-8 mx-auto text-green-500 mb-2" />
                  <p className="text-2xl font-bold">{(totalScore / results.length).toFixed(1)}</p>
                  <p className="text-sm text-gray-500">Avg per Commit</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="py-4 text-center">
                  <StarIcon className="w-8 h-8 mx-auto text-purple-500 mb-2" />
                  <p className="text-2xl font-bold">{results.filter(r => r.type === "feat").length}</p>
                  <p className="text-sm text-gray-500">Features</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Commit Impact Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {results.map((commit) => (
                    <div key={commit.sha} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                      <div className="w-16 text-center">
                        <span className={`text-lg font-bold ${
                          commit.score >= 20 ? "text-red-500" :
                          commit.score >= 10 ? "text-yellow-500" :
                          "text-green-500"
                        }`}>
                          {commit.score}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="font-mono text-sm">{commit.sha}</p>
                        <p>{commit.message}</p>
                        <div className="flex gap-2 mt-1">
                          <span className="text-xs bg-gray-200 px-2 py-0.5 rounded">{commit.type}</span>
                          {commit.scope !== "general" && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">{commit.scope}</span>}
                        </div>
                      </div>
                      <div className="w-24">
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              commit.score >= 20 ? "bg-red-500" :
                              commit.score >= 10 ? "bg-yellow-500" :
                              "bg-green-500"
                            }`}
                            style={{ width: `${commit.score}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}