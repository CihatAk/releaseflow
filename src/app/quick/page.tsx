"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeftIcon,
  Loader2Icon,
  ExternalLinkIcon,
  CopyIcon,
  DownloadIcon,
  GithubIcon,
  LinkIcon,
  CalendarIcon,
} from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function QuickGeneratePage() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [days, setDays] = useState(30);
  const [format, setFormat] = useState("default");
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<{
    repo: string;
    commits: string;
    commitCount: number;
  } | null>(null);
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
        body: JSON.stringify({
          owner: parsed.owner,
          repo: parsed.repo,
          days,
          format,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to generate changelog");
      }

      const data = await response.json();
      setResult({
        repo: `${parsed.owner}/${parsed.repo}`,
        commits: data.markdown,
        commitCount: data.commitCount,
      });
    } catch (err: any) {
      setError(err.message || "Failed to generate changelog");
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (result) {
      await navigator.clipboard.writeText(result.commits);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (result) {
      const blob = new Blob([result.commits], { type: "text/markdown" });
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `CHANGELOG-${result.repo.replace("/", "-")}.md`;
      a.click();
      URL.revokeObjectURL(blobUrl);
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
            <h1 className="text-2xl font-bold text-gray-900">Quick Generate</h1>
            <p className="text-gray-600">Generate changelog from any public repo</p>
          </div>
        </div>

        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Repository URL or owner/repo
                  </label>
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      placeholder="facebook/react or https://github.com/facebook/react"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="w-full md:w-32">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Days
                  </label>
                  <Input
                    type="number"
                    min={1}
                    max={365}
                    value={days}
                    onChange={(e) => setDays(Number(e.target.value))}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Format
                </label>
                <div className="flex flex-wrap gap-2">
                  {["default", "keepachangelog", "standardversion", "simple"].map(
                    (f) => (
                      <Button
                        key={f}
                        variant={format === f ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFormat(f)}
                      >
                        {f === "default"
                          ? "Default"
                          : f === "keepachangelog"
                          ? "Keep a Changelog"
                          : f === "standardversion"
                          ? "Standard Version"
                          : "Simple"}
                      </Button>
                    )
                  )}
                </div>
              </div>

              <Button
                onClick={handleGenerate}
                disabled={generating || !url}
                className="w-full md:w-auto"
              >
                {generating ? (
                  <>
                    <Loader2Icon className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <GithubIcon className="w-4 h-4 mr-2" />
                    Generate Changelog
                  </>
                )}
              </Button>

              {error && (
                <p className="text-red-600 text-sm">{error}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {result && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <GithubIcon className="w-5 h-5" />
                  {result.repo}
                </CardTitle>
                <CardDescription>
                  {result.commitCount} commits parsed • Last {days} days
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleCopy}>
                  <CopyIcon className="w-4 h-4 mr-1" />
                  {copied ? "Copied!" : "Copy"}
                </Button>
                <Button variant="outline" size="sm" onClick={handleDownload}>
                  <DownloadIcon className="w-4 h-4 mr-1" />
                  Download
                </Button>
                <Button variant="outline" size="sm">
                  <Link href={`/dashboard/${result.repo}`} target="_blank">
                    <ExternalLinkIcon className="w-4 h-4 mr-1" />
                    Open in Dashboard
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm whitespace-pre-wrap max-h-[500px] overflow-y-auto">
                {result.commits}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}