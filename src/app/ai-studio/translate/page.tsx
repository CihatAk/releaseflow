"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeftIcon, GlobeIcon, Loader2Icon, CheckIcon, CopyIcon } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { getActiveProviderConfig } from "@/lib/ai-providers";

interface Language {
  code: string;
  label: string;
}

const LANGUAGES: Language[] = [
  { code: "tr", label: "Turkish" },
  { code: "es", label: "Spanish" },
  { code: "de", label: "German" },
  { code: "fr", label: "French" },
  { code: "it", label: "Italian" },
  { code: "pt", label: "Portuguese" },
  { code: "ru", label: "Russian" },
  { code: "ja", label: "Japanese" },
  { code: "ko", label: "Korean" },
  { code: "zh", label: "Chinese" },
];

export default function TranslatePage() {
  const [content, setContent] = useState("");
  const [selected, setSelected] = useState<string[]>(["tr", "es", "de"]);
  const [results, setResults] = useState<Array<{ language: string; content: string; ok: boolean; error?: string }>>([]);
  const [loading, setLoading] = useState(false);

  const toggle = (code: string) => {
    setSelected((prev) => (prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]));
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

      const res = await fetch("/api/ai/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          languages: selected.map((code) => LANGUAGES.find((l) => l.code === code)?.label || code),
          aiConfig: { provider: config.provider.id, apiKey: config.apiKey, model: config.model }
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Translation failed");
      setResults(data.results || []);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Translation failed");
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
            <h1 className="text-2xl font-bold text-gray-900">Translate</h1>
            <p className="text-gray-600">Translate changelog to multiple languages</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Source Content</CardTitle>
              <CardDescription>Enter changelog to translate</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={8}
                className="font-mono text-xs bg-white text-gray-900"
                placeholder="## [2.1.0] - 2026-04-23..."
              />

              <div>
                <div className="text-sm font-medium text-gray-700 mb-2">Target Languages</div>
                <div className="flex flex-wrap gap-2">
                  {LANGUAGES.map((lang) => {
                    const on = selected.includes(lang.code);
                    return (
                      <button
                        key={lang.code}
                        onClick={() => toggle(lang.code)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                          on ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                      >
                        {lang.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <Button onClick={run} disabled={!content.trim() || loading || selected.length === 0} className="w-full">
                {loading ? (
                  <>
                    <Loader2Icon className="w-4 h-4 mr-2 animate-spin" />
                    Translating...
                  </>
                ) : (
                  <>
                    <GlobeIcon className="w-4 h-4 mr-2" />
                    Translate
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
                    <CardTitle className="text-base">{r.language}</CardTitle>
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

            {results.length === 0 && !loading && (
              <div className="text-center py-12 text-gray-400">
                <GlobeIcon className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>Translations will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
