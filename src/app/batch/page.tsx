"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeftIcon,
  Loader2Icon,
  CheckIcon,
  GithubIcon,
  DownloadIcon,
  CopyIcon,
  PlusIcon,
} from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface BatchResult {
  repo: string;
  success: boolean;
  error?: string;
  markdown?: string;
  commitCount?: number;
}

export default function BatchPage() {
  const [selectedRepos, setSelectedRepos] = useState<string[]>([]);
  const [repoInput, setRepoInput] = useState("");
  const [days, setDays] = useState(30);
  const [format, setFormat] = useState("default");
  const [generating, setGenerating] = useState(false);
  const [results, setResults] = useState<BatchResult[]>([]);
  const [generatedAll, setGeneratedAll] = useState(false);

  const handleAddRepo = () => {
    if (repoInput && !selectedRepos.includes(repoInput) && selectedRepos.length < 10) {
      setSelectedRepos([...selectedRepos, repoInput]);
      setRepoInput("");
    }
  };

  const handleRemoveRepo = (repo: string) => {
    setSelectedRepos(selectedRepos.filter((r) => r !== repo));
  };

  const handleGenerate = async () => {
    if (selectedRepos.length === 0) return;

    setGenerating(true);
    setGeneratedAll(false);

    try {
      const response = await fetch("/api/changelog/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repos: selectedRepos,
          days,
          format,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setResults(data.results || []);
        setGeneratedAll(true);
      }
    } catch (error) {
      console.error("Batch generation error:", error);
    } finally {
      setGenerating(false);
    }
  };

  const handleDownloadAll = () => {
    results.forEach((result) => {
      if (result.success && result.markdown) {
        const blob = new Blob([result.markdown], { type: "text/markdown" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${result.repo}-changelog.md`;
        a.click();
        URL.revokeObjectURL(url);
      }
    });
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
          <h1 className="mb-2 text-3xl font-bold">Batch Generation</h1>
          <p className="text-muted-foreground">
            Generate changelogs for multiple repositories at once
          </p>
        </div>

        {/* Repo Selection */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Select Repositories</CardTitle>
            <CardDescription>
              Add up to 10 repositories (format: owner/repo)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="owner/repo (e.g., facebook/react)"
                value={repoInput}
                onChange={(e) => setRepoInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddRepo()}
                disabled={selectedRepos.length >= 10}
              />
              <Button onClick={handleAddRepo} disabled={selectedRepos.length >= 10 || !repoInput}>
                <PlusIcon className="h-4 w-4" />
                Add
              </Button>
            </div>

            {selectedRepos.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedRepos.map((repo) => (
                  <div
                    key={repo}
                    className="flex items-center gap-2 rounded-lg border bg-muted px-3 py-1"
                  >
                    <GithubIcon className="h-4 w-4" />
                    <span className="text-sm">{repo}</span>
                    <button
                      onClick={() => handleRemoveRepo(repo)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            <p className="text-sm text-muted-foreground">
              {selectedRepos.length}/10 repositories selected
            </p>
          </CardContent>
        </Card>

        {/* Options */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Options</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">Time Range</label>
                <select
                  value={days}
                  onChange={(e) => setDays(Number(e.target.value))}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2"
                >
                  <option value={7}>Last 7 days</option>
                  <option value={14}>Last 14 days</option>
                  <option value={30}>Last 30 days</option>
                  <option value={60}>Last 60 days</option>
                  <option value={90}>Last 90 days</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Format</label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2"
                >
                  <option value="default">Default</option>
                  <option value="keepachangelog">Keep a Changelog</option>
                  <option value="standardversion">Standard Version</option>
                  <option value="simple">Simple</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Generate Button */}
        <div className="mb-6">
          <Button
            onClick={handleGenerate}
            disabled={generating || selectedRepos.length === 0}
            className="w-full"
            size="lg"
          >
            {generating ? (
              <Loader2Icon className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <DownloadIcon className="h-5 w-5" />
                Generate {selectedRepos.length} Changelog{selectedRepos.length !== 1 ? "s" : ""}
              </>
            )}
          </Button>
        </div>

        {/* Results */}
        {generatedAll && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Results</h2>
              <Button onClick={handleDownloadAll} variant="outline">
                <DownloadIcon className="h-4 w-4" />
                Download All
              </Button>
            </div>

            {results.map((result) => (
              <Card
                key={result.repo}
                className={result.success ? "" : "border-destructive"}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-base">
                      {result.success ? (
                        <CheckIcon className="h-5 w-5 text-green-500" />
                      ) : (
                        <span className="text-red-500">×</span>
                      )}
                      {result.repo}
                    </CardTitle>
                    {result.success && (
                      <span className="text-sm text-muted-foreground">
                        {result.commitCount} commits
                      </span>
                    )}
                  </div>
                </CardHeader>
                {result.success ? (
                  <CardContent>
                    <pre className="max-h-32 overflow-auto rounded-lg bg-muted p-3 text-xs">
                      {result.markdown?.slice(0, 500)}...
                    </pre>
                  </CardContent>
                ) : (
                  <CardContent>
                    <p className="text-sm text-destructive">{result.error}</p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}