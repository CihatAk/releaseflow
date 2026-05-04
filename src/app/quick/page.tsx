"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeftIcon,
  Loader2Icon,
  CopyIcon,
  DownloadIcon,
  GithubIcon,
  LinkIcon,
  ZapIcon,
  UsersIcon,
  AlertCircleIcon,
} from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function QuickGeneratePage() {
  const [url, setUrl] = useState("");
  const [days, setDays] = useState(30);
  const [format, setFormat] = useState("default");
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const parseRepoUrl = (input: string): { owner: string; repo: string } | null => {
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

  const handleGenerate = async () => {
    const parsed = parseRepoUrl(url);
    if (!parsed) {
      setError("Invalid repository URL or owner/repo format");
      return;
    }

    setGenerating(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("/api/changelog/quick", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ owner: parsed.owner, repo: parsed.repo, days, format }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to generate changelog");
      }

      const data = await response.json();
      setResult({ repo: `${parsed.owner}/${parsed.repo}`, ...data });
    } catch (err: any) {
      setError(err.message || "Failed to generate changelog");
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (result?.markdown) {
      await navigator.clipboard.writeText(result.markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = (ext = "md") => {
    if (result?.markdown) {
      const blob = new Blob([result.markdown], { type: "text/markdown" });
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `CHANGELOG-${result.repo.replace("/", "-")}.${ext}`;
      a.click();
      URL.revokeObjectURL(blobUrl);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard" className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quick Generate</h1>
            <p className="text-gray-600">Generate changelog from any public repo with stats and auto-versioning</p>
          </div>
        </div>

        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Repository URL or owner/repo</label>
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input placeholder="facebook/react or https://github.com/facebook/react" value={url} onChange={(e) => setUrl(e.target.value)} className="pl-10" />
                  </div>
                </div>
                <div className="w-full md:w-32">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Days</label>
                  <Input type="number" min={1} max={365} value={days} onChange={(e) => setDays(Number(e.target.value))} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Format</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: "default", label: "Default" },
                    { id: "keepachangelog", label: "Keep a Changelog" },
                    { id: "standardversion", label: "Standard Version" },
                    { id: "github-release", label: "GitHub Release" },
                    { id: "simple", label: "Simple" },
                    { id: "telegram", label: "Telegram" },
                    { id: "email", label: "Email" },
                  ].map((f) => (
                    <Button key={f.id} variant={format === f.id ? "default" : "outline"} size="sm" onClick={() => setFormat(f.id)}>
                      {f.label}
                    </Button>
                  ))}
                </div>
              </div>

              <Button onClick={handleGenerate} disabled={generating || !url} className="w-full md:w-auto">
                {generating ? (
                  <><Loader2Icon className="w-4 h-4 mr-2 animate-spin" />Generating...</>
                ) : (
                  <><GithubIcon className="w-4 h-4 mr-2" />Generate Changelog</>
                )}
              </Button>

              {error && <p className="text-red-600 text-sm">{error}</p>}
            </div>
          </CardContent>
        </Card>

        {result && (
          <>
            {result.stats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">{result.stats.totalCommits}</div>
                    <div className="text-sm text-gray-600">Commits</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">{result.stats.contributors}</div>
                    <div className="text-sm text-gray-600"><UsersIcon className="w-4 h-4 inline mr-1" />Contributors</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600">{result.stats.sectionsCount}</div>
                    <div className="text-sm text-gray-600">Sections</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className={`text-2xl font-bold ${result.stats.breakingChanges > 0 ? "text-red-600" : "text-gray-400"}`}>
                      <AlertCircleIcon className="w-6 h-6 inline" />
                      {result.stats.breakingChanges}
                    </div>
                    <div className="text-sm text-gray-600">Breaking</div>
                  </CardContent>
                </Card>
              </div>
            )}

            {result.version && (
              <Card className="mb-6 border-blue-200 bg-blue-50">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <div className="font-medium text-blue-900">Suggested Version</div>
                    <div className="text-2xl font-bold text-blue-700">{result.version.suggested}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-blue-600">Bump Type</div>
                    <div className="font-medium capitalize text-blue-800">{result.version.bump}</div>
                  </div>
                  <ZapIcon className="w-8 h-8 text-blue-500" />
                </CardContent>
              </Card>
            )}

            {result.summary && (
              <Card className="mb-6">
                <CardContent className="p-4">
                  <div className="text-sm text-gray-600 mb-1">Summary</div>
                  <p className="text-gray-800">{result.summary}</p>
                </CardContent>
              </Card>
            )}

            {result.stats?.topScopes && result.stats.topScopes.length > 0 && (
              <Card className="mb-6">
                <CardContent className="p-4">
                  <div className="text-sm text-gray-600 mb-2">Top Scopes</div>
                  <div className="flex flex-wrap gap-2">
                    {result.stats.topScopes.map((s: any) => (
                      <span key={s.scope} className="px-3 py-1 bg-gray-100 rounded-full text-sm">
                        {s.scope} <span className="text-gray-500">({s.count})</span>
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <GithubIcon className="w-5 h-5" />
                    {result.repo}
                  </CardTitle>
                  <CardDescription>{result.commitCount} commits • Last {days} days</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleCopy}>
                    <CopyIcon className="w-4 h-4 mr-1" />{copied ? "Copied!" : "Copy"}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDownload("md")}>
                    <DownloadIcon className="w-4 h-4 mr-1" />MD
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm whitespace-pre-wrap max-h-[600px] overflow-y-auto">
                  {result.markdown}
                </pre>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
