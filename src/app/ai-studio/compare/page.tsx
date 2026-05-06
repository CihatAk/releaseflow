"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeftIcon, ZapIcon, Loader2Icon, CopyIcon } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { getActiveProviderConfig } from "@/lib/ai-providers";

interface CompareResult {
  provider: string;
  model: string;
  content: string;
  ok: boolean;
  error?: string;
  latencyMs?: number;
}

export default function ComparePage() {
  const [content, setContent] = useState("");
  const [providers, setProviders] = useState<string[]>(["openai", "groq", "anthropic"]);
  const [results, setResults] = useState<CompareResult[]>([]);
  const [loading, setLoading] = useState(false);

  const toggleProvider = (provider: string) => {
    setProviders((prev) => 
      prev.includes(provider) ? prev.filter((p) => p !== provider) : [...prev, provider]
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

      const res = await fetch("/api/ai/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          content, 
          providers,
          aiConfig: { provider: config.provider.id, apiKey: config.apiKey, model: config.model }
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Compare failed");
      setResults(data.results || []);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Compare failed");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/ai-studio" className="p-2 rounded-lg hover:bg-gray-100">
            <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Compare AI Outputs</h1>
            <p className="text-gray-600">Compare results from different AI providers</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Input Content</CardTitle>
              <CardDescription>Content to process with different AI providers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={12}
                className="font-mono text-xs bg-white text-gray-900"
                placeholder="Enter your changelog or content here..."
              />

              <div>
                <div className="text-sm font-medium text-gray-700 mb-2">AI Providers to Compare</div>
                <div className="flex flex-wrap gap-2">
                  {["openai", "groq", "anthropic", "mistral", "together"].map((provider) => {
                    const on = providers.includes(provider);
                    return (
                      <button
                        key={provider}
                        onClick={() => toggleProvider(provider)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                          on ? "bg-purple-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                      >
                        {provider.charAt(0).toUpperCase() + provider.slice(1)}
                      </button>
                    );
                  })}
                </div>
              </div>

              <Button onClick={run} disabled={!content.trim() || loading || providers.length === 0} className="w-full">
                {loading ? (
                  <>
                    <Loader2Icon className="w-4 h-4 mr-2 animate-spin" />
                    Comparing...
                  </>
                ) : (
                  <>
                    <ZapIcon className="w-4 h-4 mr-2" />
                    Compare Providers
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
                    <CardTitle className="text-base">{r.provider} - {r.model}</CardTitle>
                    <div className="flex items-center gap-2">
                      {r.latencyMs && (
                        <span className="text-xs text-gray-500">{r.latencyMs}ms</span>
                      )}
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

            {results.length === 0 && !loading && (
              <div className="text-center py-12 text-gray-400">
                <ZapIcon className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>Comparison results will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
