"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeftIcon, ZapIcon, Loader2Icon, CopyIcon, DownloadIcon } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { getActiveProviderConfig } from "@/lib/ai-providers";

interface SocialResult {
  platform: string;
  content: string;
  ok: boolean;
  error?: string;
}

export default function SocialPage() {
  const [content, setContent] = useState("");
  const [platforms, setPlatforms] = useState<string[]>(["twitter", "linkedin", "facebook"]);
  const [results, setResults] = useState<SocialResult[]>([]);
  const [loading, setLoading] = useState(false);

  const togglePlatform = (platform: string) => {
    setPlatforms((prev) => 
      prev.includes(platform) ? prev.filter((p) => p !== platform) : [...prev, platform]
    );
  };

  const run = async () => {
    if (!content.trim()) return;
    setLoading(true);
    setResults([]);

    try {
      const config = getActiveProviderConfig();
      if (!config) {
        throw new Error("Please configure an AI provider in Settings first");
      }

      const res = await fetch("/api/ai/social", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          content, 
          platforms,
          aiConfig: { provider: config.provider.id, apiKey: config.apiKey, model: config.model }
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Social kit generation failed");
      setResults(data.results || []);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Social kit generation failed");
    }
    setLoading(false);
  };

  const downloadAll = () => {
    const text = results.map(r => `=== ${r.platform.toUpperCase()} ===\n\n${r.content}\n\n`).join("");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "social-kit.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/ai-studio" className="p-2 rounded-lg hover:bg-gray-100">
            <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Social Kit</h1>
            <p className="text-gray-600">Generate social media posts from changelog</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Source Content</CardTitle>
              <CardDescription>Enter changelog to convert to social posts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={10}
                className="font-mono text-xs bg-white text-gray-900"
                placeholder="## [2.1.0] - 2026-04-23..."
              />

              <div>
                <div className="text-sm font-medium text-gray-700 mb-2">Platforms</div>
                <div className="flex flex-wrap gap-2">
                  {["twitter", "linkedin", "facebook", "instagram", "reddit"].map((platform) => {
                    const on = platforms.includes(platform);
                    return (
                      <button
                        key={platform}
                        onClick={() => togglePlatform(platform)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                          on ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                      >
                        {platform.charAt(0).toUpperCase() + platform.slice(1)}
                      </button>
                    );
                  })}
                </div>
              </div>

              <Button onClick={run} disabled={!content.trim() || loading || platforms.length === 0} className="w-full">
                {loading ? (
                  <>
                    <Loader2Icon className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <ZapIcon className="w-4 h-4 mr-2" />
                    Generate Social Kit
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {results.map((r, idx) => (
              <Card key={idx}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{r.platform.charAt(0).toUpperCase() + r.platform.slice(1)}</CardTitle>
                    {r.ok && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigator.clipboard.writeText(r.content)}
                      >
                        <CopyIcon className="w-3 h-3 mr-1" />
                        Copy
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {r.ok ? (
                    <pre className="whitespace-pre-wrap text-sm bg-gray-900 text-gray-100 p-4 rounded-lg overflow-auto max-h-96">
                      {r.content}
                    </pre>
                  ) : (
                    <div className="text-sm text-red-600 bg-red-50 p-3 rounded">{r.error}</div>
                  )}
                </CardContent>
              </Card>
            ))}

            {results.length > 0 && (
              <Button onClick={downloadAll} variant="outline" className="w-full">
                <DownloadIcon className="w-4 h-4 mr-2" />
                Download All
              </Button>
            )}

            {results.length === 0 && !loading && (
              <div className="text-center py-12 text-gray-400">
                <ZapIcon className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>Social media posts will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
