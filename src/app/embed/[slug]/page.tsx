"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { GithubIcon, Loader2Icon, ExternalLinkIcon } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChangelogSection } from "@/lib/github/api";

interface EmbedConfig {
  theme?: "light" | "dark";
  accentColor?: string;
  showHeader?: boolean;
  showFooter?: boolean;
  showToggle?: boolean;
}

interface PublicChangelog {
  repo: {
    name: string;
    full_name: string;
    owner: string;
    description: string;
  };
  sections: ChangelogSection[];
  generatedAt: string;
  theme?: "light" | "dark";
}

function parseEmbedConfig(): EmbedConfig {
  if (typeof window === "undefined") return {};
  
  const params = new URLSearchParams(window.location.search);
  return {
    theme: params.get("theme") as "light" | "dark" | undefined,
    accentColor: params.get("accent") || undefined,
    showHeader: params.get("header") !== "false",
    showFooter: params.get("footer") !== "false",
    showToggle: params.get("toggle") !== "false",
  };
}

function getAccentClasses(color?: string) {
  if (!color) return {};
  
  return {
    button: `hover:opacity-90`,
    cardDot: "",
  };
}

function EmbedContent({ slug }: { slug: string }) {
  const [changelog, setChangelog] = useState<PublicChangelog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDark, setIsDark] = useState(false);
  const [config, setConfig] = useState<EmbedConfig>({});

  useEffect(() => {
    const embedConfig = parseEmbedConfig();
    setConfig(embedConfig);
    
    if (embedConfig.theme === "dark") {
      setIsDark(true);
    } else if (embedConfig.theme === "light") {
      setIsDark(false);
    }
    
    fetchChangelog();
  }, [slug]);

  const fetchChangelog = async () => {
    try {
      const response = await fetch(`/api/changelog/public/${slug}`);
      if (!response.ok) {
        throw new Error("Changelog not found");
      }
      const data = await response.json();
      setChangelog(data);
    } catch (err) {
      setError("Changelog not found");
    } finally {
      setLoading(false);
    }
  };

  const toggleTheme = () => setIsDark(!isDark);

  const accentColor = config.accentColor;
  const bgColor = accentColor ? { backgroundColor: accentColor } : {};

  if (loading) {
    return (
      <div className={`flex min-h-screen items-center justify-center ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
        <Loader2Icon className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !changelog) {
    return (
      <div className={`flex min-h-screen items-center justify-center ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
        <Card className={`max-w-md ${isDark ? "bg-gray-800 border-gray-700" : ""}`}>
          <CardContent className="text-center py-12">
            <h2 className={`mb-2 text-xl font-semibold ${isDark ? "text-white" : ""}`}>Changelog Not Found</h2>
            <p className={`mb-4 ${isDark ? "text-gray-400" : "text-muted-foreground"}`}>
              This changelog doesn't exist or has been removed.
            </p>
            <Link href="/">
              <Button className={isDark ? "bg-blue-600 hover:bg-blue-700" : ""}>Go to ReleaseFlow</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? "bg-gray-900" : "bg-gray-50"}`}>
      {config.showHeader !== false && (
        <header className={`border-b ${isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
          <div className="container mx-auto flex h-16 items-center justify-between px-4">
            <Link href="/" className="flex items-center gap-2">
              <div 
                className={`flex h-8 w-8 items-center justify-center rounded-lg ${isDark ? "bg-blue-600" : "bg-blue-500"}`}
                style={bgColor}
              >
                <svg
                  className="h-5 w-5 text-white"
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
              <span className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>ReleaseFlow</span>
            </Link>
            
            <div className="flex items-center gap-3">
              {config.showToggle !== false && (
                <button
                  onClick={toggleTheme}
                  className={`p-2 rounded-lg transition-colors ${isDark ? "hover:bg-gray-700 text-yellow-400" : "hover:bg-gray-100 text-gray-600"}`}
                  title="Toggle theme"
                >
                  {isDark ? (
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="5"/>
                      <line x1="12" y1="1" x2="12" y2="3"/>
                      <line x1="12" y1="21" x2="12" y2="23"/>
                      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                      <line x1="1" y1="12" x2="3" y2="12"/>
                      <line x1="21" y1="12" x2="23" y2="12"/>
                      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                    </svg>
                  )}
                </button>
              )}
              <a
                href={`https://github.com/${changelog.repo.full_name}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-2 text-sm ${isDark ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-gray-900"}`}
              >
                <GithubIcon className="h-4 w-4" />
                {changelog.repo.full_name}
                <ExternalLinkIcon className="h-3 w-3" />
              </a>
            </div>
          </div>
        </header>
      )}

      <main className={`container mx-auto max-w-3xl px-4 py-12 ${isDark ? "text-gray-100" : "text-gray-900"}`}>
        <div className="mb-8">
          <h1 className={`mb-2 text-3xl font-bold ${isDark ? "text-white" : ""}`}>
            {changelog.repo.name} Changelog
          </h1>
          <p className={isDark ? "text-gray-400" : "text-gray-600"}>
            {changelog.repo.description || "Release notes and updates"}
          </p>
          <p className={`mt-2 text-sm ${isDark ? "text-gray-500" : "text-gray-400"}`}>
            Generated on {new Date(changelog.generatedAt).toLocaleDateString()}
          </p>
        </div>

        <div className="space-y-6">
          {changelog.sections.map((section, idx) => (
            <Card key={idx} className={isDark ? "bg-gray-800 border-gray-700" : ""}>
              <CardHeader className={`py-4 ${isDark ? "bg-gray-750 border-b border-gray-700" : ""}`}>
                <CardTitle className={`flex items-center gap-2 ${isDark ? "text-white" : ""}`}>
                  <span className="text-2xl">{section.icon}</span>
                  {section.label}
                  <span className={`ml-2 text-sm font-normal ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                    ({section.commits.length})
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <ul className="space-y-2">
                  {section.commits.map((commit, cIdx) => (
                    <li key={cIdx} className="flex items-start gap-3">
                      <span 
                        className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${isDark ? "bg-blue-400" : "bg-blue-500"}`}
                        style={accentColor ? { backgroundColor: accentColor } : {}}
                      />
                      <div>
                        <span className="font-medium">
                          {commit.scope && <span className={isDark ? "text-blue-400" : "text-blue-600"}>{commit.scope}: </span>}
                        </span>
                        <span>{commit.message}</span>
                        <span className={`ml-2 text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>
                          {commit.sha.slice(0, 7)}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}

          {changelog.sections.length === 0 && (
            <Card className={isDark ? "bg-gray-800 border-gray-700" : ""}>
              <CardContent className={`py-12 text-center ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                No changelog entries found.
              </CardContent>
            </Card>
          )}
        </div>

        {config.showFooter !== false && (
          <div className="mt-12 text-center">
            <p className={`mb-4 text-sm ${isDark ? "text-gray-500" : "text-gray-400"}`}>
              Generated with ReleaseFlow
            </p>
            <Link href="/">
              <Button variant="outline" className={isDark ? "border-gray-600 hover:bg-gray-800 text-white" : ""}>
                Create Your Own Changelog
              </Button>
            </Link>
          </div>
        )}
      </main>

      {config.showFooter !== false && (
        <footer className={`border-t ${isDark ? "border-gray-700" : "border-gray-200"}`}>
          <div className="container mx-auto flex h-16 items-center justify-center px-4">
            <p className={`text-sm ${isDark ? "text-gray-500" : "text-gray-400"}`}>
              © {new Date().getFullYear()} {changelog.repo.owner}. All rights reserved.
            </p>
          </div>
        </footer>
      )}
    </div>
  );
}

export default function EmbedPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = React.use(params);
  
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Loader2Icon className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    }>
      <EmbedContent slug={slug} />
    </Suspense>
  );
}