"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeftIcon,
  GithubIcon,
  Loader2Icon,
  CopyIcon,
  CheckIcon,
  FileTextIcon,
  RefreshIcon,
  ExternalLinkIcon,
  GlobeIcon,
  DownloadIcon,
  FilterIcon,
} from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ChangelogSection } from "@/lib/github/api";

interface RepoInfo {
  id: number;
  name: string;
  full_name: string;
  owner: string;
  private: boolean;
  description: string;
  html_url: string;
}

interface GeneratedChangelog {
  sections: ChangelogSection[];
  markdown: string;
  commitCount: number;
}

// Helper function to generate HTML export
function generateHTMLExport(changelog: GeneratedChangelog, repoName: string): string {
  const today = new Date().toISOString().split("T")[0];
  
  let html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${repoName} Changelog</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; background: #f5f5f5; padding: 2rem; }
    .container { max-width: 800px; margin: 0 auto; background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    h1 { font-size: 2rem; margin-bottom: 0.5rem; color: #1a1a1a; }
    .meta { color: #666; margin-bottom: 2rem; }
    .section { margin-bottom: 1.5rem; }
    .section-title { font-size: 1.25rem; font-weight: 600; margin-bottom: 0.75rem; display: flex; align-items: center; gap: 0.5rem; }
    .commit-list { list-style: none; }
    .commit { padding: 0.5rem 0; border-bottom: 1px solid #eee; display: flex; align-items: start; gap: 0.5rem; }
    .commit:last-child { border-bottom: none; }
    .bullet { width: 6px; height: 6px; background: #3b82f6; border-radius: 50%; margin-top: 0.5rem; }
    .commit-link { color: #666; font-size: 0.75rem; margin-left: 0.5rem; }
    .badge { background: #f0f0f0; padding: 2rem; text-align: center; border-radius: 8px; }
    .footer { margin-top: 2rem; padding-top: 1rem; border-top: 1px solid #eee; text-align: center; color: #666; font-size: 0.875rem; }
  </style>
</head>
<body>
  <div class="container">
    <h1>${repoName}</h1>
    <p class="meta">Changelog • ${today} • ${changelog.commitCount} commits</p>
    <p class="badge">Generated with <a href="https://releaseflow.dev">ReleaseFlow</a></p>
  </div>
</body>
</html>`;
  return html;
}

export default function RepoDetailPage({
  params,
}: {
  params: Promise<{ repoId: string }>;
}) {
  const { repoId } = use(params);
  const router = useRouter();
  const [repo, setRepo] = useState<RepoInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [changelog, setChangelog] = useState<GeneratedChangelog | null>(null);
  const [copied, setCopied] = useState(false);
  const [days, setDays] = useState(30);
  const [error, setError] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [publishedSlug, setPublishedSlug] = useState<string | null>(null);
  const [showEmbedCode, setShowEmbedCode] = useState(false);
  const [customSlug, setCustomSlug] = useState("");
  const [selectedTheme, setSelectedTheme] = useState<"light" | "dark">("light");
  const [slugError, setSlugError] = useState<string | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<"default" | "keepachangelog" | "standardversion" | "simple">("default");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchRepoInfo();
  }, [repoId]);

  const fetchRepoInfo = async () => {
    try {
      const response = await fetch("/api/github/repos");
      if (!response.ok) {
        router.push("/login");
        return;
      }

      const data = await response.json();
      const foundRepo = data.repos.find((r: any) => r.id.toString() === repoId);

      if (foundRepo) {
        setRepo({
          id: foundRepo.id,
          name: foundRepo.name,
          full_name: foundRepo.full_name,
          owner: foundRepo.owner.login,
          private: foundRepo.private,
          description: foundRepo.description || "No description",
          html_url: foundRepo.html_url,
        });
        
        generateChangelog(foundRepo.owner.login, foundRepo.name);
      } else {
        setError("Repository not found");
      }
    } catch (err) {
      setError("Failed to fetch repository info");
    } finally {
      setLoading(false);
    }
  };

  const generateChangelog = async (owner: string, repoName: string) => {
    setGenerating(true);
    setError(null);

    try {
      // Get token from localStorage or settings
      const settings = JSON.parse(localStorage.getItem("rf_settings") || "{}");
      const token = settings.githubToken || "";

      const response = await fetch("/api/changelog/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { "x-github-token": token }),
        },
        body: JSON.stringify({ 
          owner, 
          repo: repoName, 
          days,
          format: selectedFormat,
          types: selectedTypes.length > 0 ? selectedTypes : undefined,
          search: searchQuery || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Failed to generate changelog");
      }

      const data = await response.json();
      setChangelog(data);
    } catch (err: any) {
      setError(err.message || "Failed to generate changelog. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const handleFormatChange = (format: typeof selectedFormat) => {
    setSelectedFormat(format);
    if (repo) {
      generateChangelog(repo.owner, repo.name);
    }
  };

  const handleTypeToggle = (type: string) => {
    const newTypes = selectedTypes.includes(type)
      ? selectedTypes.filter(t => t !== type)
      : [...selectedTypes, type];
    setSelectedTypes(newTypes);
    if (repo) {
      generateChangelog(repo.owner, repo.name);
    }
  };

  const handleSearch = () => {
    if (repo) {
      generateChangelog(repo.owner, repo.name);
    }
  };

  const handleCopy = async () => {
    if (changelog?.markdown) {
      await navigator.clipboard.writeText(changelog.markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRegenerate = () => {
    if (repo) {
      generateChangelog(repo.owner, repo.name);
    }
  };

  const handleDaysChange = (newDays: number) => {
    setDays(newDays);
    if (repo) {
      generateChangelog(repo.owner, repo.name);
    }
  };

  const handlePublish = async () => {
    if (!changelog || !repo) return;
    
    setPublishing(true);
    setSlugError(null);
    
    try {
      // Use custom slug if provided, otherwise generate one
      let slug = customSlug.trim();
      
      if (!slug) {
        slug = `${repo.name}-${Date.now().toString(36)}`;
      } else {
        // Validate slug (only alphanumeric and hyphens)
        const slugRegex = /^[a-zA-Z0-9-]+$/;
        if (!slugRegex.test(slug)) {
          setSlugError("Slug can only contain letters, numbers, and hyphens");
          setPublishing(false);
          return;
        }
        // Add timestamp to ensure uniqueness
        slug = `${slug}-${Date.now().toString(36)}`;
      }
      
      const publishData = {
        repo: {
          name: repo.name,
          full_name: repo.full_name,
          owner: repo.owner,
          description: repo.description,
        },
        sections: changelog.sections,
        generatedAt: new Date().toISOString(),
        theme: selectedTheme,
      };
      
      // Save to localStorage for demo purposes
      localStorage.setItem(`changelog_${slug}`, JSON.stringify(publishData));
      
      setPublishedSlug(slug);
      setShowEmbedCode(true);
    } catch (err) {
      setError("Failed to publish changelog");
    } finally {
      setPublishing(false);
    }
  };

  const handleResetEmbed = () => {
    setShowEmbedCode(false);
    setPublishedSlug(null);
    setCustomSlug("");
    setSlugError(null);
  };

  const embedCode = publishedSlug 
    ? `<iframe src="${typeof window !== 'undefined' ? window.location.origin : ''}/embed/${publishedSlug}?theme=${selectedTheme}" width="100%" height="600" frameborder="0"></iframe>`
    : "";

  const shareUrl = publishedSlug 
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/embed/${publishedSlug}?theme=${selectedTheme}`
    : "";
  
  const readmeBadge = publishedSlug
    ? `[![Changelog](${typeof window !== 'undefined' ? window.location.origin : ''}/api/changelog/badge/${publishedSlug})](${typeof window !== 'undefined' ? window.location.origin : ''}/embed/${publishedSlug})`
    : "";

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2Icon className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !repo) {
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
        <div className="container mx-auto flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
          <Card className="max-w-md">
            <CardContent className="text-center py-12">
              <h2 className="mb-2 text-xl font-semibold">Repository Not Found</h2>
              <p className="text-muted-foreground">{error}</p>
              <Button onClick={() => router.push("/dashboard")} className="mt-4">
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <ArrowLeftIcon className="h-5 w-5" />
            <span>Back to Dashboard</span>
          </Link>
          <div className="flex items-center gap-2">
            <a
              href={repo.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <ExternalLinkIcon className="h-4 w-4" />
              View on GitHub
            </a>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <GithubIcon className="h-6 w-6" />
            <h1 className="text-2xl font-bold">{repo.name}</h1>
            {repo.private && (
              <span className="rounded bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                Private
              </span>
            )}
          </div>
          <p className="text-muted-foreground">{repo.description}</p>
        </div>

        <div className="mb-6 space-y-4">
          {/* Main Controls */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Show commits from:</span>
              <select
                value={days}
                onChange={(e) => handleDaysChange(Number(e.target.value))}
                className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
              >
                <option value={7}>Last 7 days</option>
                <option value={14}>Last 14 days</option>
                <option value={30}>Last 30 days</option>
                <option value={60}>Last 60 days</option>
                <option value={90}>Last 90 days</option>
              </select>
            </div>
            
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className={showFilters ? "bg-primary/10" : ""}
            >
              <FileTextIcon className="h-4 w-4" />
              Filters
              {selectedTypes.length > 0 && (
                <span className="ml-1 h-5 w-5 rounded-full bg-primary text-xs text-primary-foreground">
                  {selectedTypes.length}
                </span>
              )}
            </Button>
            
            <Button
              variant="outline"
              onClick={handleRegenerate}
              disabled={generating}
            >
              {generating ? (
                <Loader2Icon className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshIcon className="h-4 w-4" />
              )}
              Refresh
            </Button>
          </div>
          
          {/* Filter Panel */}
          {showFilters && (
            <Card>
              <CardContent className="space-y-4 py-4">
                {/* Search */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Search commits..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="flex-1"
                  />
                  <Button onClick={handleSearch} disabled={generating}>
                    Search
                  </Button>
                </div>
                
                {/* Format Selection */}
                <div>
                  <p className="mb-2 text-sm font-medium">Format:</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { value: "default", label: "Default" },
                      { value: "keepachangelog", label: "Keep a Changelog" },
                      { value: "standardversion", label: "Standard Version" },
                      { value: "simple", label: "Simple" },
                    ].map((fmt) => (
                      <Button
                        key={fmt.value}
                        size="sm"
                        variant={selectedFormat === fmt.value ? "default" : "outline"}
                        onClick={() => handleFormatChange(fmt.value as typeof selectedFormat)}
                      >
                        {fmt.label}
                      </Button>
                    ))}
                  </div>
                </div>
                
                {/* Type Filter */}
                <div>
                  <p className="mb-2 text-sm font-medium">Commit Types:</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { value: "feat", label: "🚀 Features", emoji: "feat" },
                      { value: "fix", label: "🐛 Fixes", emoji: "fix" },
                      { value: "docs", label: "📝 Docs", emoji: "docs" },
                      { value: "refactor", label: "♻️ Refactor", emoji: "refactor" },
                      { value: "perf", label: "⚡ Perf", emoji: "perf" },
                      { value: "test", label: "✅ Tests", emoji: "test" },
                      { value: "chore", label: "🔧 Chore", emoji: "chore" },
                    ].map((type) => (
                      <Button
                        key={type.value}
                        size="sm"
                        variant={selectedTypes.includes(type.value) ? "default" : "outline"}
                        onClick={() => handleTypeToggle(type.value)}
                      >
                        {type.label}
                      </Button>
                    ))}
                  </div>
                </div>
                
                {selectedTypes.length > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                      setSelectedTypes([]);
                      if (repo) generateChangelog(repo.owner, repo.name);
                    }}
                  >
                    Clear filters
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {generating && !changelog ? (
          <Card>
            <CardContent className="flex items-center justify-center py-16">
              <div className="text-center">
                <Loader2Icon className="mx-auto h-8 w-8 animate-spin text-primary" />
                <p className="mt-4 text-muted-foreground">Generating changelog...</p>
              </div>
            </CardContent>
          </Card>
        ) : changelog && changelog.sections.length > 0 ? (
          <div className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileTextIcon className="h-5 w-5" />
                    Changelog Preview
                  </CardTitle>
                  <CardDescription>
                    {changelog.commitCount} commits analyzed
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {changelog.sections.map((section, idx) => (
                      <div key={idx}>
                        <h3 className="mb-2 flex items-center gap-2 font-semibold">
                          <span className="text-xl">{section.icon}</span>
                          {section.label}
                        </h3>
                        <ul className="space-y-1">
                          {section.commits.slice(0, 10).map((commit, cIdx) => (
                            <li
                              key={cIdx}
                              className="flex items-start gap-2 text-sm"
                            >
                              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                              <div>
                                <span className="font-medium">
                                  {commit.scope && `${commit.scope}: `}
                                </span>
                                <span>{commit.message}</span>
                                <span className="ml-2 text-xs text-muted-foreground">
                                  {commit.sha.slice(0, 7)}
                                </span>
                              </div>
                            </li>
                          ))}
                          {section.commits.length > 10 && (
                            <li className="text-sm text-muted-foreground">
                              +{section.commits.length - 10} more...
                            </li>
                          )}
                        </ul>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Markdown Output</CardTitle>
                      <CardDescription>
                        Copy and paste into your changelog file
                      </CardDescription>
                    </div>
                    <Button onClick={handleCopy} size="sm">
                      {copied ? (
                        <>
                          <CheckIcon className="h-4 w-4" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <CopyIcon className="h-4 w-4" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <pre className="max-h-[500px] overflow-auto rounded-lg bg-muted p-4 text-sm">
                    <code>{changelog.markdown}</code>
                  </pre>
                </CardContent>
              </Card>
            </div>

            {/* Share & Embed Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GlobeIcon className="h-5 w-5" />
                  Share & Embed
                </CardTitle>
                <CardDescription>
                  Publish your changelog publicly or embed it on your website
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!showEmbedCode ? (
                  <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-medium">Custom URL Slug (optional)</label>
                        <Input
                          placeholder="my-awesome-changelog"
                          value={customSlug}
                          onChange={(e) => {
                            setCustomSlug(e.target.value);
                            setSlugError(null);
                          }}
                        />
                        <p className="mt-1 text-xs text-muted-foreground">
                          Leave empty for auto-generated URL
                        </p>
                        {slugError && (
                          <p className="mt-1 text-xs text-destructive">{slugError}</p>
                        )}
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium">Theme</label>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant={selectedTheme === "light" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSelectedTheme("light")}
                          >
                            ☀️ Light
                          </Button>
                          <Button
                            type="button"
                            variant={selectedTheme === "dark" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setSelectedTheme("dark")}
                          >
                            🌙 Dark
                          </Button>
                        </div>
                      </div>
                    </div>
                    <Button onClick={handlePublish} disabled={publishing}>
                      {publishing ? (
                        <Loader2Icon className="h-4 w-4 animate-spin" />
                      ) : (
                        <GlobeIcon className="h-4 w-4" />
                      )}
                      Publish Changelog
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">Published!</p>
                      <Button variant="ghost" size="sm" onClick={handleResetEmbed}>
                        Publish New
                      </Button>
                    </div>
                    
                    <div className="rounded-lg border bg-muted p-4">
                      <p className="mb-2 text-sm font-medium">Share URL:</p>
                      <div className="flex items-center gap-2">
                        <Input 
                          value={shareUrl} 
                          readOnly 
                          className="text-sm"
                        />
                        <Button 
                          size="sm" 
                          onClick={() => {
                            navigator.clipboard.writeText(shareUrl);
                          }}
                        >
                          <CopyIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="rounded-lg border bg-muted p-4">
                      <p className="mb-2 text-sm font-medium">Embed Code (for your website):</p>
                      <div className="relative">
                        <pre className="max-h-32 overflow-auto text-sm">
                          <code>{embedCode}</code>
                        </pre>
                        <Button 
                          size="sm" 
                          className="absolute right-2 top-2"
                          onClick={() => {
                            navigator.clipboard.writeText(embedCode);
                          }}
                        >
                          <CopyIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="rounded-lg border bg-muted p-4">
                      <p className="mb-2 text-sm font-medium">README Badge (Markdown):</p>
                      <div className="relative">
                        <pre className="max-h-20 overflow-auto text-sm">
                          <code>{readmeBadge}</code>
                        </pre>
                        <Button 
                          size="sm" 
                          className="absolute right-2 top-2"
                          onClick={() => {
                            navigator.clipboard.writeText(readmeBadge);
                          }}
                        >
                          <CopyIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="rounded-lg border bg-muted p-4">
                      <p className="mb-2 text-sm font-medium">Export Options:</p>
                      <div className="flex flex-wrap gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            if (changelog) {
                              const blob = new Blob([changelog.markdown], { type: "text/markdown" });
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement("a");
                              a.href = url;
                              a.download = `${repo.name}-changelog.md`;
                              a.click();
                              URL.revokeObjectURL(url);
                            }
                          }}
                        >
                          📄 Download Markdown
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            if (changelog) {
                              const html = generateHTMLExport(changelog, repo.name);
                              const blob = new Blob([html], { type: "text/html" });
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement("a");
                              a.href = url;
                              a.download = `${repo.name}-changelog.html`;
                              a.click();
                              URL.revokeObjectURL(url);
                            }
                          }}
                        >
                          🌐 Download HTML
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <FileTextIcon className="mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-semibold">No Commits Found</h3>
              <p className="mb-4 text-center text-muted-foreground">
                No commits were found in the selected time period.
                Try selecting a longer timeframe.
              </p>
              <div className="flex gap-2">
                {[30, 60, 90].map((d) => (
                  <Button
                    key={d}
                    variant={days === d ? "default" : "outline"}
                    onClick={() => handleDaysChange(d)}
                  >
                    {d} days
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {error && (
          <Card className="mt-6 border-destructive">
            <CardContent className="py-4">
              <p className="text-sm text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}