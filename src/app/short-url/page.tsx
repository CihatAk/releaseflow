"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CopyIcon, LinkIcon, CheckIcon, ArrowRightIcon } from "@/components/ui/icons";

interface ShortUrl {
  short: string;
  full: string;
  clicks: number;
  created: string;
}

export default function ShortUrlPage() {
  const [url, setUrl] = useState("");
  const [slug, setSlug] = useState("");
  const [shortUrls, setShortUrls] = useState<ShortUrl[]>([
    { short: "rf/v1", full: "/changelog/owner/repo", clicks: 142, created: "2024-01-15" },
    { short: "rf/v2", full: "/changelog/owner/repo2", clicks: 89, created: "2024-01-18" },
    { short: "rf/demo", full: "/embed/abc123", clicks: 234, created: "2024-01-20" },
  ]);
  const [copied, setCopied] = useState("");
  const [generated, setGenerated] = useState("");

  const createShortUrl = () => {
    if (!url) return;
    const newSlug = slug || Math.random().toString(36).substring(2, 8);
    const newUrl: ShortUrl = {
      short: `releaseflow.dev/${newSlug}`,
      full: url,
      clicks: 0,
      created: new Date().toISOString().split("T")[0],
    };
    setShortUrls([newUrl, ...shortUrls]);
    setGenerated(newUrl.short);
    setUrl("");
    setSlug("");
  };

  const copyUrl = (short: string) => {
    navigator.clipboard.writeText(`https://${short}`);
    setCopied(short);
    setTimeout(() => setCopied(""), 2000);
  };

  return (
    <div className="container mx-auto min-h-screen max-w-4xl px-4 py-12">
      <Link href="/dashboard">
        <Button variant="ghost" size="sm" className="mb-4">
          ← Back to Dashboard
        </Button>
      </Link>

      <h1 className="text-3xl font-bold">Short URLs</h1>
      <p className="mt-2 text-muted-foreground">
        Create short, memorable links for your changelogs
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Create New Link</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Changelog URL</label>
                <Input
                  placeholder="https://releaseflow.dev/changelog/owner/repo"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Custom Slug (optional)</label>
                <Input
                  placeholder="my-release"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                />
              </div>
              <Button onClick={createShortUrl} disabled={!url} className="w-full">
                <LinkIcon className="mr-2 h-4 w-4" />
                Generate Short Link
              </Button>

              {generated && (
                <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 text-green-700">
                  <CheckIcon className="h-4 w-4" />
                  <span className="text-sm font-medium">https://{generated}</span>
                  <button
                    onClick={() => copyUrl(generated)}
                    className="ml-auto text-xs underline"
                  >
                    {copied === generated ? "Copied!" : "Copy"}
                  </button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Links</CardTitle>
              <CardDescription>Pre-made short links</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { slug: "latest", desc: "Latest changelog" },
                { slug: "v", desc: "Version list" },
                { slug: "docs", desc: "Documentation" },
              ].map((item) => (
                <div
                  key={item.slug}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="font-medium">releaseflow.dev/{item.slug}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyUrl(item.slug)}
                  >
                    {copied === item.slug ? (
                      <CheckIcon className="h-4 w-4" />
                    ) : (
                      <CopyIcon className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Links</CardTitle>
              <CardDescription>{shortUrls.length} active links</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {shortUrls.map((item) => (
                  <div
                    key={item.short}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{item.short}</p>
                      <p className="truncate text-xs text-muted-foreground">{item.full}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-primary/10 px-2 py-1 text-xs">
                        {item.clicks} clicks
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyUrl(item.short)}
                      >
                        {copied === item.short ? (
                          <CheckIcon className="h-4 w-4" />
                        ) : (
                          <CopyIcon className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <p className="text-4xl font-bold">
                  {shortUrls.reduce((sum, u) => sum + u.clicks, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Total clicks</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}