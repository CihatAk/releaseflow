"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeftIcon,
  Loader2Icon,
  CopyIcon,
  CheckIcon,
  GlobeIcon,
  MessageSquareIcon,
  ZapIcon,
  CodeIcon,
  KeyIcon,
  DownloadIcon,
} from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AI_PROVIDERS, type AIConfig, type ChatResult } from "@/lib/ai";
import {
  getActiveAIConfig,
  getAllConfiguredAIConfigs,
} from "@/lib/aiClient";

type Tab = "rewriter" | "translator" | "social" | "playground" | "release-notes" | "summary" | "grouping";

const TABS: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }>; desc: string }[] = [
  { id: "rewriter", label: "Rewriter", icon: ZapIcon, desc: "Transform commits into polished release notes" },
  { id: "release-notes", label: "Release Notes", icon: MessageSquareIcon, desc: "AI-generated release notes with tone/length control" },
  { id: "summary", label: "Smart Summary", icon: GlobeIcon, desc: "AI-powered summaries for changelogs" },
  { id: "translator", label: "Translator", icon: GlobeIcon, desc: "Translate release notes to multiple languages" },
  { id: "social", label: "Social Kit", icon: MessageSquareIcon, desc: "Generate posts for Twitter, LinkedIn, email, blog" },
  { id: "grouping", label: "Smart Grouping", icon: CodeIcon, desc: "AI-powered commit grouping and organization" },
  { id: "playground", label: "Playground", icon: CodeIcon, desc: "Compare providers side-by-side with one prompt" },
];

const SAMPLE_COMMITS = `feat(auth): add OAuth2 login with Google and GitHub
feat(dashboard): add dark mode toggle
fix(api): handle rate limit errors gracefully
perf(db): cache frequently accessed user data (30% faster)
refactor(utils): split monolithic utils file into modules
BREAKING CHANGE: drop Node 16 support, require Node 20+
chore(deps): bump next to 15.0.3
docs(readme): add self-hosting instructions`;

const LANGUAGES = [
  { code: "tr", label: "Türkçe" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "pt", label: "Português" },
  { code: "it", label: "Italiano" },
  { code: "ja", label: "日本語" },
  { code: "ko", label: "한국어" },
  { code: "zh", label: "中文" },
  { code: "ar", label: "العربية" },
  { code: "ru", label: "Русский" },
  { code: "hi", label: "हिन्दी" },
];

const SOCIAL_PLATFORMS = [
  { id: "twitter", label: "Twitter/X Thread" },
  { id: "linkedin", label: "LinkedIn Post" },
  { id: "blog-excerpt", label: "Blog Excerpt" },
  { id: "email-subject", label: "Email Subject Lines" },
  { id: "discord", label: "Discord Announcement" },
  { id: "hacker-news", label: "Hacker News Show HN" },
] as const;

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      size="sm"
      variant="outline"
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
    >
      {copied ? (
        <>
          <CheckIcon className="w-3 h-3 mr-1" />
          Copied
        </>
      ) : (
        <>
          <CopyIcon className="w-3 h-3 mr-1" />
          Copy
        </>
      )}
    </Button>
  );
}

function downloadText(filename: string, text: string) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function NoProviderBanner() {
  return (
    <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-lg p-4 flex items-start gap-3">
      <KeyIcon className="w-5 h-5 mt-0.5" />
      <div className="flex-1">
        <div className="font-medium">No AI provider configured</div>
        <div className="text-sm">
          Add your API key in{" "}
          <Link href="/settings" className="underline">
            Settings → AI Providers
          </Link>{" "}
          to use AI Studio. Your key stays in your browser.
        </div>
      </div>
    </div>
  );
}

/* ---------------- Rewriter ---------------- */

function Rewriter({ activeConfig }: { activeConfig: AIConfig | undefined }) {
  const [content, setContent] = useState(SAMPLE_COMMITS);
  const [tone, setTone] = useState("professional");
  const [audience, setAudience] = useState("mixed");
  const [length, setLength] = useState("standard");
  const [format, setFormat] = useState("markdown");
  const [output, setOutput] = useState<ChatResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    setLoading(true);
    setError(null);
    setOutput(null);
    try {
      const res = await fetch("/api/ai/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, tone, audience, length, format, aiConfig: activeConfig }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setOutput(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    }
    setLoading(false);
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Input</CardTitle>
          <CardDescription>Paste raw commits or an existing rough changelog</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={12}
            className="font-mono text-xs"
          />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Tone</label>
              <select value={tone} onChange={(e) => setTone(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white text-sm">
                <option value="professional">Professional</option>
                <option value="casual">Casual</option>
                <option value="enthusiastic">Enthusiastic</option>
                <option value="technical">Technical</option>
                <option value="playful">Playful</option>
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
                <option value="email">Email body</option>
              </select>
            </div>
          </div>
          <Button onClick={run} disabled={!activeConfig || loading || !content.trim()} className="w-full">
            {loading ? (
              <>
                <Loader2Icon className="w-4 h-4 mr-2 animate-spin" />
                Rewriting with {activeConfig?.provider}...
              </>
            ) : (
              <>
                <ZapIcon className="w-4 h-4 mr-2" />
                Rewrite
              </>
            )}
          </Button>
          {error && <div className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</div>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <div>
              <CardTitle>Output</CardTitle>
              {output && (
                <CardDescription>
                  {output.provider} · {output.model} · {output.latencyMs}ms
                  {output.totalTokens ? ` · ${output.totalTokens} tokens` : ""}
                </CardDescription>
              )}
            </div>
            {output?.content && (
              <div className="flex gap-2">
                <CopyButton text={output.content} />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => downloadText(`release-notes.${format === "html" ? "html" : format === "markdown" ? "md" : "txt"}`, output.content)}
                >
                  <DownloadIcon className="w-3 h-3 mr-1" />
                  Download
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {output?.content ? (
            <pre className="whitespace-pre-wrap text-sm font-mono bg-gray-50 p-4 rounded-lg max-h-[500px] overflow-auto">
              {output.content}
            </pre>
          ) : (
            <div className="text-sm text-gray-500 italic">Run the rewriter to see output here.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/* ---------------- Translator ---------------- */

function Translator({ activeConfig }: { activeConfig: AIConfig | undefined }) {
  const [content, setContent] = useState("");
  const [selected, setSelected] = useState<string[]>(["tr", "es", "de"]);
  const [results, setResults] = useState<Array<{ language: string; content: string; ok: boolean; error?: string; latencyMs: number }>>([]);
  const [loading, setLoading] = useState(false);

  const toggle = (code: string) => {
    setSelected((prev) => (prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]));
  };

  const run = async () => {
    setLoading(true);
    setResults([]);
    try {
      const res = await fetch("/api/ai/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          languages: selected.map((code) => LANGUAGES.find((l) => l.code === code)?.label || code),
          aiConfig: activeConfig,
        }),
      });
      const data = await res.json();
      setResults(data.results || []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Source release notes</CardTitle>
          <CardDescription>The content to translate into multiple languages simultaneously</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={8}
            placeholder="## What's new in v2.3.0..."
          />
          <div>
            <div className="text-sm font-medium text-gray-700 mb-2">Target languages</div>
            <div className="flex flex-wrap gap-2">
              {LANGUAGES.map((lang) => {
                const on = selected.includes(lang.code);
                return (
                  <button
                    key={lang.code}
                    onClick={() => toggle(lang.code)}
                    className={`px-3 py-1.5 rounded-full text-sm border transition ${
                      on
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-700 border-gray-300 hover:border-blue-400"
                    }`}
                  >
                    {lang.label}
                  </button>
                );
              })}
            </div>
          </div>
          <Button
            onClick={run}
            disabled={!activeConfig || loading || !content.trim() || selected.length === 0}
          >
            {loading ? (
              <>
                <Loader2Icon className="w-4 h-4 mr-2 animate-spin" />
                Translating to {selected.length} languages...
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

      {results.length > 0 && (
        <div className="grid md:grid-cols-2 gap-4">
          {results.map((r) => (
            <Card key={r.language}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{r.language}</CardTitle>
                  {r.ok && <CopyButton text={r.content} />}
                </div>
                {r.ok && <CardDescription>{r.latencyMs}ms</CardDescription>}
              </CardHeader>
              <CardContent>
                {r.ok ? (
                  <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-3 rounded max-h-80 overflow-auto">
                    {r.content}
                  </pre>
                ) : (
                  <div className="text-sm text-red-600">{r.error}</div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------- Social ---------------- */

function Social({ activeConfig }: { activeConfig: AIConfig | undefined }) {
  const [content, setContent] = useState("");
  const [productName, setProductName] = useState("ReleaseFlow");
  const [version, setVersion] = useState("v2.3.0");
  const [platforms, setPlatforms] = useState<string[]>(["twitter", "linkedin"]);
  const [results, setResults] = useState<Array<{ platform: string; content: string; ok: boolean; error?: string }>>([]);
  const [loading, setLoading] = useState(false);

  const toggle = (id: string) =>
    setPlatforms((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));

  const run = async () => {
    setLoading(true);
    setResults([]);
    try {
      const res = await fetch("/api/ai/social", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, platforms, productName, version, aiConfig: activeConfig }),
      });
      const data = await res.json();
      setResults(data.results || []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Release details</CardTitle>
          <CardDescription>Generate ready-to-post content for multiple channels</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Product name</label>
              <Input value={productName} onChange={(e) => setProductName(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Version</label>
              <Input value={version} onChange={(e) => setVersion(e.target.value)} />
            </div>
          </div>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            placeholder="Paste release notes here..."
          />
          <div>
            <div className="text-sm font-medium text-gray-700 mb-2">Platforms</div>
            <div className="flex flex-wrap gap-2">
              {SOCIAL_PLATFORMS.map((p) => {
                const on = platforms.includes(p.id);
                return (
                  <button
                    key={p.id}
                    onClick={() => toggle(p.id)}
                    className={`px-3 py-1.5 rounded-full text-sm border transition ${
                      on
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-700 border-gray-300 hover:border-blue-400"
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>
          <Button
            onClick={run}
            disabled={!activeConfig || loading || !content.trim() || platforms.length === 0}
          >
            {loading ? (
              <>
                <Loader2Icon className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <MessageSquareIcon className="w-4 h-4 mr-2" />
                Generate social kit
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <div className="space-y-4">
          {results.map((r) => {
            const meta = SOCIAL_PLATFORMS.find((p) => p.id === r.platform);
            return (
              <Card key={r.platform}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{meta?.label || r.platform}</CardTitle>
                    {r.ok && <CopyButton text={r.content} />}
                  </div>
                </CardHeader>
                <CardContent>
                  {r.ok ? (
                    <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-3 rounded max-h-96 overflow-auto">
                      {r.content}
                    </pre>
                  ) : (
                    <div className="text-sm text-red-600">{r.error}</div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ---------------- Playground ---------------- */

function Playground() {
  const [configs, setConfigs] = useState<AIConfig[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [system, setSystem] = useState("You are a helpful assistant for software release notes.");
  const [prompt, setPrompt] = useState("Summarize this in one sentence: feat(auth): add OAuth2 login with Google and GitHub");
  const [temperature, setTemperature] = useState(0.5);
  const [items, setItems] = useState<Array<{ provider: string; model: string; ok: boolean; result?: ChatResult; error?: string }>>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const all = getAllConfiguredAIConfigs();
    setConfigs(all);
    setSelected(all.map((c) => c.provider || "openai"));
  }, []);

  const toggle = (p: string) =>
    setSelected((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]));

  const run = async () => {
    setLoading(true);
    setItems([]);
    const chosen = configs.filter((c) => selected.includes(c.provider || "openai"));
    try {
      const res = await fetch("/api/ai/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, system, configs: chosen, temperature }),
      });
      const data = await res.json();
      setItems(data.items || []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  if (configs.length === 0) {
    return (
      <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-lg p-4">
        Playground requires at least one configured provider. Add keys in{" "}
        <Link href="/settings" className="underline">
          Settings
        </Link>
        .
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Provider comparison</CardTitle>
          <CardDescription>Run the same prompt against every configured provider in parallel</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="text-sm font-medium text-gray-700 mb-2">Providers to compare</div>
            <div className="flex flex-wrap gap-2">
              {configs.map((c) => {
                const p = c.provider || "openai";
                const meta = AI_PROVIDERS[p];
                const on = selected.includes(p);
                return (
                  <button
                    key={p}
                    onClick={() => toggle(p)}
                    className={`px-3 py-1.5 rounded-full text-sm border transition ${
                      on
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-700 border-gray-300 hover:border-blue-400"
                    }`}
                  >
                    {meta?.label || p}
                    <span className="opacity-70 ml-1 text-xs">({c.model || meta?.defaultModel})</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">System prompt</label>
            <Textarea value={system} onChange={(e) => setSystem(e.target.value)} rows={2} />
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">User prompt</label>
            <Textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={4} />
          </div>

          <div className="flex items-center gap-3">
            <label className="text-xs text-gray-600">Temperature</label>
            <input
              type="range"
              min={0}
              max={1}
              step={0.1}
              value={temperature}
              onChange={(e) => setTemperature(Number(e.target.value))}
              className="flex-1"
            />
            <span className="text-xs text-gray-700 w-8 text-right">{temperature}</span>
          </div>

          <Button onClick={run} disabled={loading || selected.length === 0 || !prompt.trim()}>
            {loading ? (
              <>
                <Loader2Icon className="w-4 h-4 mr-2 animate-spin" />
                Running {selected.length} providers...
              </>
            ) : (
              <>
                <ZapIcon className="w-4 h-4 mr-2" />
                Compare
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {items.length > 0 && (
        <div className="grid md:grid-cols-2 gap-4">
          {items.map((it) => {
            const meta = AI_PROVIDERS[it.provider];
            const winner = items
              .filter((x) => x.ok && x.result)
              .sort((a, b) => (a.result!.latencyMs - b.result!.latencyMs))[0];
            const isFastest = winner && winner.provider === it.provider;
            return (
              <Card key={it.provider} className={isFastest ? "ring-2 ring-green-400" : ""}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        {meta?.label || it.provider}
                        {isFastest && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                            Fastest
                          </span>
                        )}
                      </CardTitle>
                      <CardDescription>
                        {it.model}
                        {it.result ? ` · ${it.result.latencyMs}ms${it.result.totalTokens ? ` · ${it.result.totalTokens} tokens` : ""}` : ""}
                      </CardDescription>
                    </div>
                    {it.ok && it.result && <CopyButton text={it.result.content} />}
                  </div>
                </CardHeader>
                <CardContent>
                  {it.ok && it.result ? (
                    <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-3 rounded max-h-96 overflow-auto">
                      {it.result.content}
                    </pre>
                  ) : (
                    <div className="text-sm text-red-600">{it.error}</div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ---------------- Page shell ---------------- */

export default function AIStudioPage() {
  const [tab, setTab] = useState<Tab>("rewriter");
  const [activeConfig, setActiveConfig] = useState<AIConfig | undefined>(undefined);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setActiveConfig(getActiveAIConfig());
    setMounted(true);
  }, []);

  const activeProviderLabel = useMemo(() => {
    if (!activeConfig) return null;
    return AI_PROVIDERS[activeConfig.provider || "openai"]?.label || activeConfig.provider;
  }, [activeConfig]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="p-2 rounded-lg hover:bg-gray-100">
              <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <ZapIcon className="w-6 h-6 text-blue-600" />
                AI Studio
              </h1>
              <p className="text-gray-600">
                Rewrite, translate, promote and compare — powered by your own API keys.
              </p>
            </div>
          </div>
          {mounted && activeProviderLabel && (
            <div className="text-sm bg-white border rounded-lg px-3 py-2">
              Active:{" "}
              <span className="font-medium text-gray-900">{activeProviderLabel}</span>
              <span className="text-gray-500 ml-1">({activeConfig?.model || "default"})</span>
            </div>
          )}
        </div>

        {mounted && !activeConfig && (
          <div className="mb-6">
            <NoProviderBanner />
          </div>
        )}

        <div className="flex flex-wrap gap-2 mb-6 border-b">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 -mb-px transition ${
                  active
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                <Icon className="w-4 h-4" />
                {t.label}
              </button>
            );
          })}
        </div>

        <div className="text-sm text-gray-600 mb-4">
          {TABS.find((t) => t.id === tab)?.desc}
        </div>

        {tab === "rewriter" && <Rewriter activeConfig={activeConfig} />}
        {tab === "release-notes" && <ReleaseNotes activeConfig={activeConfig} />}
        {tab === "summary" && <SmartSummary activeConfig={activeConfig} />}
        {tab === "translator" && <Translator activeConfig={activeConfig} />}
        {tab === "social" && <Social activeConfig={activeConfig} />}
        {tab === "grouping" && <SmartGrouping activeConfig={activeConfig} />}
        {tab === "playground" && <Playground />}
      </div>
    </div>
  );
}

/* --------------- Release Notes --------------- */

function ReleaseNotes({ activeConfig }: { activeConfig: AIConfig | undefined }) {
  const [sections, setSections] = useState("");
  const [repoName, setRepoName] = useState("");
  const [version, setVersion] = useState("");
  const [tone, setTone] = useState("professional");
  const [length, setLength] = useState("standard");
  const [output, setOutput] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    setOutput(null);
    try {
      const res = await fetch("/api/ai/release-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sections: JSON.parse(sections || "[]"), repoName, version, tone, length, aiConfig: activeConfig }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setOutput(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Release Notes Generator</CardTitle>
        <CardDescription>Generate professional release notes from commits</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder='Paste sections JSON: [{"type":"feat","label":"Features","commits":[...]}]'
          value={sections}
          onChange={(e) => setSections(e.target.value)}
          rows={6}
          className="font-mono text-xs"
        />
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Repo Name</label>
            <Input value={repoName} onChange={(e) => setRepoName(e.target.value)} placeholder="ReleaseFlow" />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Version</label>
            <Input value={version} onChange={(e) => setVersion(e.target.value)} placeholder="v2.3.0" />
          </div>
        </div>
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
            <label className="block text-xs text-gray-600 mb-1">Length</label>
            <select value={length} onChange={(e) => setLength(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white text-sm">
              <option value="concise">Concise</option>
              <option value="standard">Standard</option>
              <option value="detailed">Detailed</option>
            </select>
          </div>
        </div>
        <Button onClick={run} disabled={!activeConfig || loading || !sections.trim()}>
          {loading ? <><Loader2Icon className="w-4 h-4 mr-2 animate-spin" />Generating...</> : <><MessageSquareIcon className="w-4 h-4 mr-2" />Generate Release Notes</>}
        </Button>
        {output && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-600">
                {output.model} · {output.latencyMs}ms
              </div>
              <CopyButton text={output.releaseNotes} />
            </div>
            <pre className="whitespace-pre-wrap text-sm font-mono">{output.releaseNotes}</pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* --------------- Smart Summary --------------- */

function SmartSummary({ activeConfig }: { activeConfig: AIConfig | undefined }) {
  const [sections, setSections] = useState("");
  const [style, setStyle] = useState("bullet");
  const [output, setOutput] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    setOutput(null);
    try {
      const res = await fetch("/api/ai/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sections: JSON.parse(sections || "[]"), style, aiConfig: activeConfig }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setOutput(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Smart Summary Generator</CardTitle>
        <CardDescription>AI-powered changelog summaries</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder='Paste sections JSON: [{"type":"feat","label":"Features","commits":[...]}]'
          value={sections}
          onChange={(e) => setSections(e.target.value)}
          rows={6}
          className="font-mono text-xs"
        />
        <div>
          <label className="block text-xs text-gray-600 mb-1">Style</label>
          <select value={style} onChange={(e) => setStyle(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white text-sm">
            <option value="bullet">Bullet Points</option>
            <option value="paragraph">Paragraph</option>
            <option value="executive">Executive</option>
            <option value="social">Social Media</option>
          </select>
        </div>
        <Button onClick={run} disabled={!activeConfig || loading || !sections.trim()}>
          {loading ? <><Loader2Icon className="w-4 h-4 mr-2 animate-spin" />Generating...</> : <><GlobeIcon className="w-4 h-4 mr-2" />Generate Summary</>}
        </Button>
        {output && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-600">
                {output.style} · {output.model} · {output.latencyMs}ms
              </div>
              <CopyButton text={output.summary} />
            </div>
            <p className="text-sm">{output.summary}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* --------------- Smart Grouping --------------- */

function SmartGrouping({ activeConfig }: { activeConfig: AIConfig | undefined }) {
  const [commits, setCommits] = useState("");
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const parsed = JSON.parse(commits || "[]");
      const res = await fetch("/api/ai/group", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commits: parsed, strategy: "smart", aiConfig: activeConfig }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setGroups(data.groups || []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Smart Commit Grouping</CardTitle>
        <CardDescription>AI-powered intelligent commit grouping</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder='Paste commits JSON: [{"message":"feat: add X","sha":"abc123","author":"user"},...]'
          value={commits}
          onChange={(e) => setCommits(e.target.value)}
          rows={8}
          className="font-mono text-xs"
        />
        <Button onClick={run} disabled={!activeConfig || loading || !commits.trim()}>
          {loading ? <><Loader2Icon className="w-4 h-4 mr-2 animate-spin" />Grouping...</> : <><CodeIcon className="w-4 h-4 mr-2" />Smart Group</>}
        </Button>
        {groups.length > 0 && (
          <div className="space-y-3">
            {groups.map((g, i) => (
              <div key={i} className="bg-gray-50 p-3 rounded-lg">
                <div className="font-medium text-sm mb-2">{g.title}</div>
                {g.reason && <div className="text-xs text-gray-500 mb-2">{g.reason}</div>}
                <div className="space-y-1">
                  {g.commits?.map((c: any, j: number) => (
                    <div key={j} className="text-xs text-gray-700">
                      · {c.message}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* --------------- AI Copy Button --------------- */

function AICopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      size="sm"
      variant="outline"
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
    >
      {copied ? <><CheckIcon className="w-3 h-3 mr-1" />Copied</> : <><CopyIcon className="w-3 h-3 mr-1" />Copy</>}
    </Button>
  );
}
