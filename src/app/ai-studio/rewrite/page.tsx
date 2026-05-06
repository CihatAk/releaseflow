"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeftIcon, ZapIcon, Loader2Icon, CheckIcon } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { getActiveProviderConfig } from "@/lib/ai-providers";

export default function RewritePage() {
  const [content, setContent] = useState("");
  const [tone, setTone] = useState("professional");
  const [audience, setAudience] = useState("mixed");
  const [length, setLength] = useState("standard");
  const [format, setFormat] = useState("markdown");
  const [output, setOutput] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    setLoading(true);
    setError(null);
    setOutput(null);

    try {
      const config = getActiveProviderConfig();
      if (!config) {
        throw new Error("Please configure an AI provider in Settings first");
      }

      const res = await fetch("/api/ai/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          content, 
          tone, 
          audience, 
          length, 
          format, 
          aiConfig: { provider: config.provider.id, apiKey: config.apiKey, model: config.model }
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to rewrite");
      setOutput(data.rewrittenContent || data.releaseNotes || "No output generated");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to rewrite content");
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
            <h1 className="text-2xl font-bold text-gray-900">Rewrite Content</h1>
            <p className="text-gray-600">Rewrite and improve your changelog content</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Input</CardTitle>
              <CardDescription>Paste your changelog content to rewrite</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={12}
                className="font-mono text-xs bg-white text-gray-900"
                placeholder="Paste your changelog content here..."
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Tone</label>
                  <select value={tone} onChange={(e) => setTone(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white text-sm">
                    <option value="professional">Professional</option>
                    <option value="casual">Casual</option>
                    <option value="enthusiastic">Enthusiastic</option>
                    <option value="technical">Technical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Audience</label>
                  <select value={audience} onChange={(e) => setAudience(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white text-sm">
                    <option value="mixed">Mixed</option>
                    <option value="developers">Developers</option>
                    <option value="end-users">End Users</option>
                    <option value="business">Business</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Length</label>
                  <select value={length} onChange={(e) => setLength(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white text-sm">
                    <option value="concise">Concise</option>
                    <option value="standard">Standard</option>
                    <option value="detailed">Detailed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Format</label>
                  <select value={format} onChange={(e) => setFormat(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white text-sm">
                    <option value="markdown">Markdown</option>
                    <option value="html">HTML</option>
                    <option value="plain">Plain text</option>
                  </select>
                </div>
              </div>

              <Button onClick={run} disabled={!content.trim() || loading} className="w-full">
                {loading ? (
                  <>
                    <Loader2Icon className="w-4 h-4 mr-2 animate-spin" />
                    Rewriting...
                  </>
                ) : (
                  <>
                    <ZapIcon className="w-4 h-4 mr-2" />
                    Rewrite Content
                  </>
                )}
              </Button>

              {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded">{error}</div>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <CardTitle>Output</CardTitle>
                  <CardDescription>Rewritten content</CardDescription>
                </div>
                {output && (
                  <Button size="sm" variant="outline" onClick={() => { navigator.clipboard.writeText(output); }}>
                    <CheckIcon className="w-3 h-3 mr-1" /> Copied!
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {output ? (
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm whitespace-pre-wrap overflow-auto max-h-[600px]">
                  {output}
                </pre>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <ZapIcon className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p>Rewritten content will appear here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
