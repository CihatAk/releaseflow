"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeftIcon,
  Loader2Icon,
  GitCompareIcon,
} from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ChangelogSection } from "@/lib/github/api";

interface CompareResult {
  from: string;
  to: string;
  totalCommits: number;
  added: ChangelogSection[];
  removed: ChangelogSection[];
  aheadBy?: number;
  behindBy?: number;
}

export default function ComparePage() {
  const [owner, setOwner] = useState("");
  const [repo, setRepo] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("main");
  const [comparing, setComparing] = useState(false);
  const [result, setResult] = useState<CompareResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCompare = async () => {
    if (!owner || !repo || !from) return;

    setComparing(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/changelog/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ owner, repo, from, to }),
      });

      if (response.ok) {
        const data = await response.json();
        setResult(data);
      } else {
        const data = await response.json();
        setError(data.error || "Failed to compare");
      }
    } catch (err) {
      setError("Failed to compare versions");
    } finally {
      setComparing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center px-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <ArrowLeftIcon className="h-5 w-5" />
            <span>Back to Dashboard</span>
          </Link>
        </div>
      </header>

      <main className="container mx-auto max-w-4xl px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">Version Compare</h1>
          <p className="text-muted-foreground">
            Compare changelogs between two versions or branches
          </p>
        </div>

        {/* Input Form */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Compare Two Versions</CardTitle>
            <CardDescription>
              Enter tags, branches, or commit SHAs to compare
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">Owner</label>
                <Input
                  placeholder="owner (e.g., facebook)"
                  value={owner}
                  onChange={(e) => setOwner(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Repository</label>
                <Input
                  placeholder="repo (e.g., react)"
                  value={repo}
                  onChange={(e) => setRepo(e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">From (older)</label>
                <Input
                  placeholder="v1.0.0 or main"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">To (newer)</label>
                <Input
                  placeholder="v2.0.0 or HEAD"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                />
              </div>
            </div>

            <Button
              onClick={handleCompare}
              disabled={comparing || !owner || !repo || !from}
              className="w-full"
            >
              {comparing ? (
                <Loader2Icon className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <GitCompareIcon className="h-5 w-5" />
                  Compare Versions
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Error */}
        {error && (
          <Card className="mb-6 border-destructive">
            <CardContent className="py-4">
              <p className="text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-6">
            {/* Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Comparison Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-green-500">
                      +{result.totalCommits}
                    </p>
                    <p className="text-sm text-muted-foreground">Total Changes</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-blue-500">
                      {result.added.length > 0 ? result.added.reduce((a, s) => a + s.commits.length, 0) : 0}
                    </p>
                    <p className="text-sm text-muted-foreground">Sections</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold">
                      {result.from}
                      <span className="text-sm"> → </span>
                      {result.to}
                    </p>
                    <p className="text-sm text-muted-foreground">Range</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                      {result.from.slice(0, 7)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Compare URL
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Added Changes */}
            <Card>
              <CardHeader>
                <CardTitle className="text-green-600">
                  + Added Changes
                </CardTitle>
                <CardDescription>
                  Changes since {result.from}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {result.added.length > 0 ? (
                  <div className="space-y-4">
                    {result.added.map((section) => (
                      <div key={section.type}>
                        <h4 className="mb-2 font-semibold flex items-center gap-2">
                          <span>{section.icon}</span>
                          {section.label}
                          <span className="text-xs text-muted-foreground">
                            ({section.commits.length})
                          </span>
                        </h4>
                        <ul className="space-y-1">
                          {section.commits.slice(0, 5).map((commit, idx) => (
                            <li
                              key={idx}
                              className="flex items-start gap-2 text-sm"
                            >
                              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-green-500" />
                              <span>{commit.message}</span>
                              <span className="text-xs text-muted-foreground">
                                {commit.sha.slice(0, 7)}
                              </span>
                            </li>
                          ))}
                          {section.commits.length > 5 && (
                            <li className="text-sm text-muted-foreground">
                              +{section.commits.length - 5} more
                            </li>
                          )}
                        </ul>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">
                    No changes found
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Export Comparison */}
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  const markdown = generateCompareMarkdown(result);
                  const blob = new Blob([markdown], { type: "text/markdown" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `${repo}-comparison.md`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
              >
                Export Comparison
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function generateCompareMarkdown(result: CompareResult): string {
  const lines: string[] = [];
  lines.push(`# Version Comparison`);
  lines.push(``);
  lines.push(`**From:** ${result.from}`);
  lines.push(`**To:** ${result.to}`);
  lines.push(`**Total Changes:** ${result.totalCommits}`);
  lines.push(``);

  for (const section of result.added) {
    lines.push(`### ${section.icon} ${section.label}`);
    lines.push(``);
    for (const commit of section.commits) {
      lines.push(`- ${commit.message} (${commit.sha.slice(0, 7)})`);
    }
    lines.push(``);
  }

  return lines.join("\n");
}