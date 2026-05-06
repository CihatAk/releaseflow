"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { GithubIcon } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";

interface Stats {
  users: number;
  commits: number;
  changelogs: number;
  repos: number;
}

export default function Home() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/stats")
      .then((res) => res.json())
      .then(setStats)
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <svg
                className="h-5 w-5 text-primary-foreground"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="text-xl font-bold">ReleaseFlow</span>
          </div>
          <nav className="flex items-center gap-2 sm:gap-4">
            <ThemeToggle />
            <Link href="/login">
              <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
                Sign In
              </Button>
            </Link>
            <Link href="/login">
              <Button size="sm" className="text-xs sm:text-sm">
                <GithubIcon className="h-4 w-4" />
                <span className="hidden sm:inline ml-2">Connect GitHub</span>
                <span className="sm:hidden ml-2">Connect</span>
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
            </span>
            <span className="text-muted-foreground">
              {stats ? `${stats.users}+ developers using` : "Now in beta"}
            </span>
          </div>

          <h1 className="mb-6 text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
            Stop Writing <span className="text-primary">Changelogs</span> Manually
          </h1>

          {!stats ? null : (
            <div className="mb-8 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
              <div>
                <span className="text-2xl font-bold text-foreground">{stats.commits.toLocaleString()}</span> commits parsed
              </div>
              <div>
                <span className="text-2xl font-bold text-foreground">{stats.changelogs.toLocaleString()}</span> changelogs
              </div>
              <div>
                <span className="text-2xl font-bold text-foreground">{stats.repos.toLocaleString()}</span> repos
              </div>
            </div>
          )}

          <p className="mb-8 text-lg text-muted-foreground md:text-xl">
            Connect your GitHub repo and generate beautiful, auto-formatted changelogs in seconds. 
            Parses conventional commits automatically.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/login">
              <Button size="lg" className="h-12 px-8">
                <GithubIcon className="h-5 w-5" />
                Start for Free
              </Button>
            </Link>
            <Link href="#features">
              <Button variant="outline" size="lg" className="h-12 px-8">
                See How It Works
              </Button>
            </Link>
          </div>

          <p className="mt-4 text-sm text-muted-foreground">
            Free for 3 repos • No credit card required
          </p>
        </div>
      </section>

      {/* Demo Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-xl border bg-card shadow-2xl overflow-hidden">
            <div className="flex items-center gap-1.5 border-b bg-muted/50 px-4 py-3">
              <div className="h-3 w-3 rounded-full bg-red-500" />
              <div className="h-3 w-3 rounded-full bg-yellow-500" />
              <div className="h-3 w-3 rounded-full bg-green-500" />
              <span className="ml-3 text-sm text-muted-foreground">ReleaseFlow Demo</span>
            </div>
            <div className="bg-[#0d1117] p-6 text-sm">
              <pre className="text-green-400 font-mono">{`$ Connect Repository: my-awesome-project
✓ Authenticated as @developer
✓ Fetching commits...
✓ Found 47 commits since last release

📦 Generating changelog...`}</pre>
              <div className="mt-4 rounded-lg bg-[#161b22] p-4 text-gray-300 font-mono">
                <p className="text-gray-500 text-xs mb-2"># CHANGELOG.md</p>
                <p className="text-purple-400 font-semibold mb-2">## [2.1.0] - 2026-04-23</p>
                <p className="text-purple-400 mb-2">### 🚀 Features</p>
                <p className="ml-4 text-gray-400">• <span className="text-blue-400">auth:</span> Add OAuth2 login with GitHub</p>
                <p className="ml-4 text-gray-400">• <span className="text-blue-400">dashboard:</span> Create repository list view</p>
                <p className="text-purple-400 mt-3 mb-2">### 🐛 Bug Fixes</p>
                <p className="ml-4 text-gray-400">• <span className="text-red-400">Fix:</span> Cookie authentication issue</p>
              </div>
              <pre className="mt-4 text-green-400">{`✓ Changelog generated in 2.3s
✓ Published at: https://releaseflow.dev/embed/my-awesome-2k26x`}</pre>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-12 text-3xl font-bold">Why Developers Love ReleaseFlow</h2>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-blue-500/10">
                <svg className="h-7 w-7 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-semibold">Save 2+ Hours/Week</h3>
              <p className="text-muted-foreground">Stop copying commit messages. Auto-generate changelogs in seconds instead of hours.</p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-green-500/10">
                <svg className="h-7 w-7 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-semibold">Consistent Format</h3>
              <p className="text-muted-foreground">Follow industry standards like Keep a Changelog automatically.</p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-purple-500/10">
                <svg className="h-7 w-7 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-semibold">Easy to Share</h3>
              <p className="text-muted-foreground">Embed on your website or share a link. One click to publish.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="container mx-auto px-4 py-16 bg-muted/30">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-4 text-center text-3xl font-bold">Everything You Need</h2>
          <p className="mb-12 text-center text-muted-foreground">Powerful features that make changelog management effortless</p>
          
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl border bg-card p-6">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="mb-2 font-semibold">Lightning Fast</h3>
              <p className="text-sm text-muted-foreground">Generate changelogs in under 3 seconds. No waiting around.</p>
            </div>
            
            <div className="rounded-xl border bg-card p-6">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <h3 className="mb-2 font-semibold">Smart Parsing</h3>
              <p className="text-sm text-muted-foreground">Automatically detects features, fixes, and breaking changes from conventional commits.</p>
            </div>
            
            <div className="rounded-xl border bg-card p-6">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </div>
              <h3 className="mb-2 font-semibold">Share Anywhere</h3>
              <p className="text-sm text-muted-foreground">Embed on your website, share via URL, or export to markdown, HTML, PDF.</p>
            </div>
            
            <div className="rounded-xl border bg-card p-6">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="mb-2 font-semibold">Private Repos</h3>
              <p className="text-sm text-muted-foreground">Access your private repositories securely via GitHub OAuth.</p>
            </div>
            
            <div className="rounded-xl border bg-card p-6">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                </svg>
              </div>
              <h3 className="mb-2 font-semibold">Multiple Formats</h3>
              <p className="text-sm text-muted-foreground">Keep a Changelog, Standard Version, or custom format. Your choice.</p>
            </div>
            
            <div className="rounded-xl border bg-card p-6">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="mb-2 font-semibold">Smart Filters</h3>
              <p className="text-sm text-muted-foreground">Filter by date, commit type, or search specific commits.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-4 text-center text-3xl font-bold">What Developers Say</h2>
          <p className="mb-12 text-center text-muted-foreground">Join hundreds of developers who save hours every release</p>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl border bg-card p-6">
              <div className="mb-4 flex items-center gap-1">
                {[1,2,3,4,5].map((i) => (
                  <svg key={i} className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="mb-4 text-muted-foreground">"This saved me at least 3 hours per release. I used to dread writing changelogs, now it's completely automated."</p>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500" />
                <div>
                  <p className="font-medium">musteri-adam-2847</p>
                  <p className="text-sm text-muted-foreground">Indie Developer</p>
                </div>
              </div>
            </div>
            
            <div className="rounded-xl border bg-card p-6">
              <div className="mb-4 flex items-center gap-1">
                {[1,2,3,4,5].map((i) => (
                  <svg key={i} className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="mb-4 text-muted-foreground">"Our team uses conventional commits but never had time to update the changelog. ReleaseFlow handles it perfectly."</p>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-400 to-teal-500" />
                <div>
                  <p className="font-medium">musteri-adam-9182</p>
                  <p className="text-sm text-muted-foreground">Tech Startup CTO</p>
                </div>
              </div>
            </div>
            
            <div className="rounded-xl border bg-card p-6">
              <div className="mb-4 flex items-center gap-1">
                {[1,2,3,4,5].map((i) => (
                  <svg key={i} className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="mb-4 text-muted-foreground">"The embed feature is genius. Our users can see updates directly on our website without any effort from us."</p>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-orange-400 to-red-500" />
                <div>
                  <p className="font-medium">musteri-adam-4521</p>
                  <p className="text-sm text-muted-foreground">Open Source Maintainer</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="container mx-auto px-4 py-16 bg-muted/30">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-12 text-center text-3xl font-bold">Frequently Asked Questions</h2>
          
          <div className="space-y-4">
            <details className="rounded-xl border bg-card overflow-hidden">
              <summary className="cursor-pointer p-4 font-medium hover:bg-muted/50">How does it work?</summary>
              <div className="px-4 pb-4 text-muted-foreground">
                ReleaseFlow connects to your GitHub account via OAuth, reads your commit history, and automatically parses commits following the conventional commits specification. It generates formatted changelogs based on your commits.
              </div>
            </details>
            
            <details className="rounded-xl border bg-card overflow-hidden">
              <summary className="cursor-pointer p-4 font-medium hover:bg-muted/50">Is it free?</summary>
              <div className="px-4 pb-4 text-muted-foreground">
                Yes! Free for up to 3 repositories. Pro plan ($9/month) for unlimited repos, Team plan ($29/month) for organizations.
              </div>
            </details>
            
            <details className="rounded-xl border bg-card overflow-hidden">
              <summary className="cursor-pointer p-4 font-medium hover:bg-muted/50">What are conventional commits?</summary>
              <div className="px-4 pb-4 text-muted-foreground">
                Conventional commits are a lightweight convention on top of commit messages. They follow the format: <code className="bg-muted px-1 rounded">type(scope): description</code>. Examples: <code className="bg-muted px-1 rounded">feat: add login</code>, <code className="bg-muted px-1 rounded">fix(auth): resolve redirect</code>.
              </div>
            </details>
            
            <details className="rounded-xl border bg-card overflow-hidden">
              <summary className="cursor-pointer p-4 font-medium hover:bg-muted/50">Can I use private repositories?</summary>
              <div className="px-4 pb-4 text-muted-foreground">
                Yes! ReleaseFlow uses GitHub OAuth and has access to both your public and private repositories. Your code is never stored on our servers.
              </div>
            </details>
            
            <details className="rounded-xl border bg-card overflow-hidden">
              <summary className="cursor-pointer p-4 font-medium hover:bg-muted/50">How do I embed on my website?</summary>
              <div className="px-4 pb-4 text-muted-foreground">
                After generating a changelog, click "Publish" to get an embed code. Just copy the iframe code and paste it into your website HTML.
              </div>
            </details>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-bold">Ready to Automate Your Changelogs?</h2>
          <p className="mb-8 text-muted-foreground">
            Join 500+ developers who save hours every release. Get started in 30 seconds.
          </p>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href="/login">
              <Button size="lg" className="h-12 px-8">
                <GithubIcon className="h-5 w-5" />
                Connect GitHub Free
              </Button>
            </Link>
            <Link href="/pricing">
              <Button variant="outline" size="lg" className="h-12 px-8">
                View Pricing
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <p className="text-sm text-muted-foreground">
            © 2026 ReleaseFlow. Built for developers.
          </p>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <Link href="/privacy" className="hover:text-foreground">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-foreground">
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}