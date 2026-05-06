"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  ArrowLeftIcon,
  SettingsIcon,
  CrownIcon,
  LogOutIcon,
  GithubIcon,
  DownloadIcon,
  SearchIcon,
  LayoutGridIcon,
  ListIcon,
  SunIcon,
  MoonIcon,
  BarChart3Icon,
  FileTextIcon,
  FilterIcon,
  ArrowUpDownIcon,
  ClockIcon,
  TrashIcon,
  CheckIcon,
  UploadIcon,
  LinkIcon,
  ZapIcon,
  ChevronDownIcon,
  FileCodeIcon,
  RefreshIcon,
  StarIcon,
  PlusIcon,
} from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton, CardSkeleton, RepoListSkeleton, ChangelogSkeleton, DashboardSkeleton } from "@/components/ui/skeleton";
import { OnboardingTour, useOnboarding } from "@/components/onboarding";
import FeedbackButton from "@/components/feedback-button";

interface Repo {
  id: number;
  name: string;
  full_name: string;
  owner: { login: string };
  private: boolean;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
  html_url: string;
}

type ViewMode = "grid" | "list";
type SortBy = "name" | "updated" | "stars";

export default function DashboardPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [filter, setFilter] = useState("");
  const [user, setUser] = useState<{ login: string; avatar_url: string } | null>(null);
  const { hasCompletedOnboarding, completeOnboarding } = useOnboarding();
  const [showOnboarding, setShowOnboarding] = useState(false);
  
  // New features state
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortBy, setSortBy] = useState<SortBy>("updated");
  const [showPrivate, setShowPrivate] = useState(true);
  const [showPublic, setShowPublic] = useState(true);
  const [selectedRepos, setSelectedRepos] = useState<number[]>([]);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [recentActivity, setRecentActivity] = useState<{ repo: string; time: string }[]>([]);
  const [sidebarSearch, setSidebarSearch] = useState("");
  
  // Collapsible menu state
  const [openMenus, setOpenMenus] = useState<string[]>(["generate"]);

  useEffect(() => {
    checkAuth();
    loadFavorites();
    loadRecentActivity();
    loadTheme();
  }, []);

  const loadFavorites = () => {
    const stored = localStorage.getItem("rf_favorites");
    if (stored) setFavorites(JSON.parse(stored));
  };

  const loadRecentActivity = () => {
    const stored = localStorage.getItem("rf_recent_activity");
    if (stored) setRecentActivity(JSON.parse(stored));
  };

  const loadTheme = () => {
    const stored = localStorage.getItem("rf_dark_mode");
    if (stored === "true") setDarkMode(true);
  };

  const toggleMenu = (menu: string) => {
    setOpenMenus(prev => 
      prev.includes(menu) 
        ? prev.filter(m => m !== menu)
        : [...prev, menu]
    );
  };

  const isMenuOpen = (menu: string) => openMenus.includes(menu);

  const toggleFavorite = (repoId: number) => {
    const newFavorites = favorites.includes(repoId)
      ? favorites.filter(id => id !== repoId)
      : [...favorites, repoId];
    setFavorites(newFavorites);
    localStorage.setItem("rf_favorites", JSON.stringify(newFavorites));
  };

  const toggleSelect = (repoId: number) => {
    setSelectedRepos(prev =>
      prev.includes(repoId)
        ? prev.filter(id => id !== repoId)
        : [...prev, repoId]
    );
  };

  const selectAll = () => {
    if (selectedRepos.length === filteredRepos.length) {
      setSelectedRepos([]);
    } else {
      setSelectedRepos(filteredRepos.map(r => r.id));
    }
  };

  const bulkGenerate = () => {
    if (selectedRepos.length > 0) {
      router.push(`/batch?repos=${selectedRepos.join(",")}`);
    }
  };

  const addToRecent = (repoName: string) => {
    const newActivity = [
      { repo: repoName, time: new Date().toISOString() },
      ...recentActivity.filter(a => a.repo !== repoName)
    ].slice(0, 5);
    setRecentActivity(newActivity);
    localStorage.setItem("rf_recent_activity", JSON.stringify(newActivity));
  };

  const toggleTheme = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem("rf_dark_mode", String(newMode));
    document.documentElement.classList.toggle("dark", newMode);
  };

  useEffect(() => {
    if (!hasCompletedOnboarding && repos.length >= 0 && !loading) {
      const timer = setTimeout(() => setShowOnboarding(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [hasCompletedOnboarding, loading]);

  const checkAuth = async () => {
    const token = document.cookie.split("; ").find(r => r.startsWith("github_token="))?.split("=")[1];
    if (!token) { router.push("/login"); return; }
    
    try {
      const response = await fetch("/api/github/repos");
      if (response.ok) {
        const data = await response.json();
        setRepos(data.repos);
        setUser(data.user);
      } else { router.push("/login"); }
    } catch (error) {
      console.error("Failed to fetch repos:", error);
    } finally { setLoading(false); }
  };

  const handleRefresh = async () => { setLoading(true); await checkAuth(); };

  const handleConnectRepo = async (repo: Repo) => {
    setConnecting(true);
    try {
      const response = await fetch("/api/repos/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoId: repo.id, name: repo.name, fullName: repo.full_name, owner: repo.owner.login, isPrivate: repo.private, description: repo.description }),
      });
      if (response.ok) {
        addToRecent(repo.full_name);
        router.push(`/dashboard/${repo.id}`);
      }
    } catch (error) { console.error("Failed to connect repo:", error); }
    finally { setConnecting(false); }
  };

  const filteredRepos = useMemo(() => {
    let result = repos.filter(repo => {
      const matchesSearch = repo.name.toLowerCase().includes(filter.toLowerCase()) || repo.full_name.toLowerCase().includes(filter.toLowerCase());
      const matchesPrivate = repo.private ? showPrivate : true;
      const matchesPublic = !repo.private ? showPublic : true;
      return matchesSearch && matchesPrivate && matchesPublic;
    });

    result.sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "stars") return b.stargazers_count - a.stargazers_count;
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });

    return result;
  }, [repos, filter, showPrivate, showPublic, sortBy]);

  const favoriteRepos = filteredRepos.filter(r => favorites.includes(r.id));
  const publicRepos = filteredRepos.filter(r => !r.private);
  const privateRepos = filteredRepos.filter(r => r.private);

  const handleLogout = () => {
    document.cookie = "github_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    router.push("/");
  };

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center p-8"><DashboardSkeleton /></div>;
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r bg-card transition-transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:relative`}>
        <div className="flex h-16 items-center justify-between border-b px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <svg className="h-5 w-5 text-primary-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="text-lg font-bold">ReleaseFlow</span>
          </Link>
        </div>

        <nav className="space-y-1 p-4">
          {/* Sidebar Search */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search menu..."
              value={sidebarSearch}
              onChange={(e) => setSidebarSearch(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-background text-foreground placeholder:text-muted-foreground"
            />
          </div>

          {/* Main Dashboard */}
          <Link href="/dashboard" className="flex items-center gap-3 rounded-lg bg-primary/10 px-3 py-2 text-sm font-medium">
            <LayoutGridIcon className="h-4 w-4" /> Dashboard
          </Link>

          {/* Analytics Section - Collapsible */}
          {(sidebarSearch === "" || "analytics github trends burndown contributors".includes(sidebarSearch.toLowerCase())) && (
          <div>
            <button 
              onClick={() => toggleMenu("analytics")}
              className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted"
            >
              <span className="flex items-center gap-3">
                <BarChart3Icon className="h-4 w-4" /> Analytics
              </span>
              <ChevronDownIcon className={`h-4 w-4 transition-transform ${isMenuOpen("analytics") ? "rotate-180" : ""}`} />
            </button>
            {isMenuOpen("analytics") && (
              <div className="ml-4 mt-1 space-y-1">
                <Link href="/analytics" className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${pathname === "/analytics" ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted"}`}>
                   GitHub Analytics
                 </Link>
                 {(sidebarSearch === "" || "trends".includes(sidebarSearch.toLowerCase())) && (
                 <Link href="/trends" className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${pathname === "/trends" ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted"}`}>
                    Trends
                  </Link>
                 )}
                  {(sidebarSearch === "" || "burndown".includes(sidebarSearch.toLowerCase())) && (
                  <Link href="/burndown" className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${pathname === "/burndown" ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted"}`}>
                    Burndown
                  </Link>
                  )}
                  {(sidebarSearch === "" || "contributors".includes(sidebarSearch.toLowerCase())) && (
                  <Link href="/contributors" className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${pathname === "/contributors" ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted"}`}>
                    Contributors
                  </Link>
                  )}
               </div>
            )}
          </div>
          )}

          {/* Generate Section - Collapsible */}
          {(sidebarSearch === "" || "generate batch quick version history auto tag".includes(sidebarSearch.toLowerCase())) && (
          <div>
            <button 
              onClick={() => toggleMenu("generate")}
              className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted"
            >
              <span className="flex items-center gap-3">
                <DownloadIcon className="h-4 w-4" /> Generate
              </span>
              <ChevronDownIcon className={`h-4 w-4 transition-transform ${isMenuOpen("generate") ? "rotate-180" : ""}`} />
            </button>
            {isMenuOpen("generate") && (
              <div className="ml-4 mt-1 space-y-1">
                {(sidebarSearch === "" || "batch".includes(sidebarSearch.toLowerCase())) && (
                <Link href="/batch" className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${pathname === "/batch" ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted"}`}>
                   Batch Generate
                 </Link>
                 )}
                 {(sidebarSearch === "" || "quick".includes(sidebarSearch.toLowerCase())) && (
                 <Link href="/quick" className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${pathname === "/quick" ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted"}`}>
                   Quick Generate
                 </Link>
                 )}
                 {(sidebarSearch === "" || "version".includes(sidebarSearch.toLowerCase())) && (
                 <Link href="/version" className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${pathname === "/version" ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted"}`}>
                   Version Detect
                 </Link>
                 )}
                 {(sidebarSearch === "" || "history".includes(sidebarSearch.toLowerCase())) && (
                 <Link href="/changelog-history" className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${pathname === "/changelog-history" ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted"}`}>
                   History
                 </Link>
                 )}
                 {(sidebarSearch === "" || "auto tag".includes(sidebarSearch.toLowerCase())) && (
                 <Link href="/auto-tag" className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${pathname === "/auto-tag" ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted"}`}>
                    Auto Tag
                  </Link>
                 )}
               </div>
            )}
          </div>
          )}

          {/* AI Studio Section - Collapsible */}
          {(sidebarSearch === "" || "ai studio rewrite translate social compare".includes(sidebarSearch.toLowerCase())) && (
          <div>
            <button 
              onClick={() => toggleMenu("ai")}
              className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted"
            >
              <span className="flex items-center gap-3">
                <ZapIcon className="h-4 w-4" /> AI Studio
              </span>
              <ChevronDownIcon className={`h-4 w-4 transition-transform ${isMenuOpen("ai") ? "rotate-180" : ""}`} />
            </button>
            {isMenuOpen("ai") && (
              <div className="ml-4 mt-1 space-y-1">
                {(sidebarSearch === "" || "ai studio".includes(sidebarSearch.toLowerCase())) && (
                <Link href="/ai-studio" className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${pathname === "/ai-studio" ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted"}`}>
                   AI Studio
                 </Link>
                 )}
                 {(sidebarSearch === "" || "rewrite".includes(sidebarSearch.toLowerCase())) && (
                 <Link href="/ai-studio/rewrite" className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${pathname === "/ai-studio/rewrite" ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted"}`}>
                   Rewrite
                 </Link>
                 )}
                 {(sidebarSearch === "" || "translate".includes(sidebarSearch.toLowerCase())) && (
                 <Link href="/ai-studio/translate" className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${pathname === "/ai-studio/translate" ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted"}`}>
                   Translate
                 </Link>
                 )}
                 {(sidebarSearch === "" || "social".includes(sidebarSearch.toLowerCase())) && (
                 <Link href="/ai-studio/social" className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${pathname === "/ai-studio/social" ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted"}`}>
                   Social Kit
                 </Link>
                 )}
                 {(sidebarSearch === "" || "compare".includes(sidebarSearch.toLowerCase())) && (
                 <Link href="/ai-studio/compare" className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${pathname === "/ai-studio/compare" ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted"}`}>
                   Compare
                 </Link>
                 )}
               </div>
            )}
          </div>
          )}

          {/* Compare Section - Collapsible */}
          {(sidebarSearch === "" || "compare preview".includes(sidebarSearch.toLowerCase())) && (
          <div>
            <button 
              onClick={() => toggleMenu("compare")}
              className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted"
            >
              <span className="flex items-center gap-3">
                <ArrowUpDownIcon className="h-4 w-4" /> Compare
              </span>
              <ChevronDownIcon className={`h-4 w-4 transition-transform ${isMenuOpen("compare") ? "rotate-180" : ""}`} />
            </button>
            {isMenuOpen("compare") && (
              <div className="ml-4 mt-1 space-y-1">
                {(sidebarSearch === "" || "compare".includes(sidebarSearch.toLowerCase())) && (
                <Link href="/compare" className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${pathname === "/compare" ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted"}`}>
                  Version Compare
                </Link>
                )}
                {(sidebarSearch === "" || "preview".includes(sidebarSearch.toLowerCase())) && (
                <Link href="/preview" className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${pathname === "/preview" ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted"}`}>
                  Preview
                </Link>
                )}
              </div>
            )}
          </div>
          )}

          {/* Publish Section - Collapsible */}
          {(sidebarSearch === "" || "publish channels email short embed".includes(sidebarSearch.toLowerCase())) && (
          <div>
            <button 
              onClick={() => toggleMenu("publish")}
              className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted"
            >
              <span className="flex items-center gap-3">
                <UploadIcon className="h-4 w-4" /> Publish
              </span>
              <ChevronDownIcon className={`h-4 w-4 transition-transform ${isMenuOpen("publish") ? "rotate-180" : ""}`} />
            </button>
            {isMenuOpen("publish") && (
              <div className="ml-4 mt-1 space-y-1">
                {(sidebarSearch === "" || "publish".includes(sidebarSearch.toLowerCase())) && (
                <Link href="/publish" className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${pathname === "/publish" ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted"}`}>
                  GitHub Release
                </Link>
                )}
                {(sidebarSearch === "" || "channels".includes(sidebarSearch.toLowerCase())) && (
                <Link href="/publish-channels" className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${pathname === "/publish-channels" ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted"}`}>
                  Channels
                </Link>
                )}
                {(sidebarSearch === "" || "email".includes(sidebarSearch.toLowerCase())) && (
                <Link href="/email-digest" className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${pathname === "/email-digest" ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted"}`}>
                   Email Digest
                 </Link>
                )}
                {(sidebarSearch === "" || "short".includes(sidebarSearch.toLowerCase())) && (
                <Link href="/short-url" className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${pathname === "/short-url" ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted"}`}>
                   Short URL
                 </Link>
                )}
                {(sidebarSearch === "" || "embed".includes(sidebarSearch.toLowerCase())) && (
                <Link href="/embed" className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${pathname === "/embed" ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted"}`}>
                   Embed Widget
                 </Link>
                )}
             </div>
            )}
          </div>
          )}

          {/* Automate Section - Collapsible */}
          {(sidebarSearch === "" || "automate watch scheduled github action pr template waitlist".includes(sidebarSearch.toLowerCase())) && (
          <div>
            <button 
              onClick={() => toggleMenu("automate")}
              className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted"
            >
              <span className="flex items-center gap-3">
                <ClockIcon className="h-4 w-4" /> Automate
              </span>
              <ChevronDownIcon className={`h-4 w-4 transition-transform ${isMenuOpen("automate") ? "rotate-180" : ""}`} />
            </button>
            {isMenuOpen("automate") && (
              <div className="ml-4 mt-1 space-y-1">
                {(sidebarSearch === "" || "watch".includes(sidebarSearch.toLowerCase())) && (
                 <Link href="/watch" className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${pathname === "/watch" ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted"}`}>
                    Watch Repos
                  </Link>
                )}
                {(sidebarSearch === "" || "scheduled".includes(sidebarSearch.toLowerCase())) && (
                  <Link href="/scheduled" className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${pathname === "/scheduled" ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted"}`}>
                    Scheduled
                  </Link>
                )}
                {(sidebarSearch === "" || "github action".includes(sidebarSearch.toLowerCase())) && (
                  <Link href="/github-action" className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${pathname === "/github-action" ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted"}`}>
                    GitHub Action
                  </Link>
                )}
                {(sidebarSearch === "" || "pr template".includes(sidebarSearch.toLowerCase())) && (
                  <Link href="/pr-template" className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${pathname === "/pr-template" ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted"}`}>
                    PR Template
                  </Link>
                )}
                {(sidebarSearch === "" || "waitlist".includes(sidebarSearch.toLowerCase())) && (
                  <Link href="/waitlist" className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${pathname === "/waitlist" ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted"}`}>
                    Waitlist
                  </Link>
                )}
              </div>
            )}
          </div>
          )}

          {/* Integrations Section - Collapsible */}
          {(sidebarSearch === "" || "integrations webhooks branding team collaborate".includes(sidebarSearch.toLowerCase())) && (
          <div>
            <button 
              onClick={() => toggleMenu("integrations")}
              className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted"
            >
              <span className="flex items-center gap-3">
                <LinkIcon className="h-4 w-4" /> Integrations
              </span>
              <ChevronDownIcon className={`h-4 w-4 transition-transform ${isMenuOpen("integrations") ? "rotate-180" : ""}`} />
            </button>
            {isMenuOpen("integrations") && (
              <div className="ml-4 mt-1 space-y-1">
                {(sidebarSearch === "" || "integrations".includes(sidebarSearch.toLowerCase())) && (
                <Link href="/integrations" className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${pathname === "/integrations" ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted"}`}>
                   All Integrations
                 </Link>
                )}
                {(sidebarSearch === "" || "webhooks".includes(sidebarSearch.toLowerCase())) && (
                 <Link href="/webhooks" className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${pathname === "/webhooks" ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted"}`}>
                   Webhooks
                 </Link>
                )}
                {(sidebarSearch === "" || "branding".includes(sidebarSearch.toLowerCase())) && (
                 <Link href="/brand" className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${pathname === "/brand" ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted"}`}>
                   Branding
                 </Link>
                )}
                {(sidebarSearch === "" || "team".includes(sidebarSearch.toLowerCase())) && (
                 <Link href="/team" className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${pathname === "/team" ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted"}`}>
                   Team
                 </Link>
                )}
                {(sidebarSearch === "" || "collaborate".includes(sidebarSearch.toLowerCase())) && (
                 <Link href="/collaborate" className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${pathname === "/collaborate" ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted"}`}>
                   Collaborate
                 </Link>
                )}
              </div>
            )}
          </div>
          )}

          {/* Advanced Section - Collapsible */}
          {(sidebarSearch === "" || "advanced github webhooks language privacy drag templates import".includes(sidebarSearch.toLowerCase())) && (
          <div>
            <button 
              onClick={() => toggleMenu("advanced")}
              className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted"
            >
              <span className="flex items-center gap-3">
                <FileCodeIcon className="h-4 w-4" /> Advanced
              </span>
              <ChevronDownIcon className={`h-4 w-4 transition-transform ${isMenuOpen("advanced") ? "rotate-180" : ""}`} />
            </button>
            {isMenuOpen("advanced") && (
              <div className="ml-4 mt-1 space-y-1">
                {(sidebarSearch === "" || "github action".includes(sidebarSearch.toLowerCase())) && (
                <Link href="/github-action" className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${pathname === "/github-action" ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted"}`}>
                  GitHub Action
                </Link>
                )}
                {(sidebarSearch === "" || "webhooks".includes(sidebarSearch.toLowerCase())) && (
                <Link href="/webhooks" className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${pathname === "/webhooks" ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted"}`}>
                  Webhooks
                </Link>
                )}
                {(sidebarSearch === "" || "language".includes(sidebarSearch.toLowerCase())) && (
                <Link href="/language" className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${pathname === "/language" ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted"}`}>
                  Languages
                </Link>
                )}
                {(sidebarSearch === "" || "privacy".includes(sidebarSearch.toLowerCase())) && (
                <Link href="/privacy" className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${pathname === "/privacy" ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted"}`}>
                  Privacy
                </Link>
                )}
                {(sidebarSearch === "" || "drag".includes(sidebarSearch.toLowerCase())) && (
                <Link href="/drag-drop" className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${pathname === "/drag-drop" ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted"}`}>
                  Drag & Drop
                </Link>
                )}
                {(sidebarSearch === "" || "templates".includes(sidebarSearch.toLowerCase())) && (
                <Link href="/templates" className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${pathname === "/templates" ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted"}`}>
                  Templates
                </Link>
                )}
                {(sidebarSearch === "" || "import".includes(sidebarSearch.toLowerCase())) && (
                <Link href="/import" className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${pathname === "/import" ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted"}`}>
                  Import
                </Link>
                )}
              </div>
            )}
          </div>
          )}

          {/* Settings */}
          <Link href="/settings" className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${pathname === "/settings" ? "bg-primary/10 text-primary font-medium" : "text-muted-foreground hover:bg-muted"}`}>
            <SettingsIcon className="h-4 w-4" /> Settings
          </Link>

          {/* Pricing */}
          <Link href="/pricing" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-muted">
            <CrownIcon className="h-4 w-4" /> Pricing
          </Link>
        </nav>

        {/* Stats */}
        <div className="border-t p-4">
          <div className="grid grid-cols-2 gap-2 text-center text-sm mb-4">
            <div><p className="text-2xl font-bold">{repos.length}</p><p className="text-xs text-muted-foreground">Total</p></div>
            <div><p className="text-2xl font-bold">{favorites.length}</p><p className="text-xs text-muted-foreground">Stars</p></div>
          </div>

          {/* Recent Activity */}
          {recentActivity.length > 0 && (
            <div>
              <h3 className="mb-3 text-xs font-semibold text-muted-foreground">RECENT</h3>
              <div className="space-y-2">
                {recentActivity.map((item, idx) => (
                  <Link key={idx} href={`/dashboard/${item.repo}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                    <ClockIcon className="h-3 w-3" /> {item.repo.split("/")[1]}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1">
        <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur">
          <div className="container flex h-16 items-center justify-between px-4">
            <div className="flex items-center gap-4">
              <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden">
                <LayoutGridIcon className="h-5 w-5" />
              </button>
              <h1 className="text-xl font-bold hidden lg:block">Dashboard</h1>
            </div>
            
            <div className="flex items-center gap-2">
              <Link href="/pricing">
                <Button variant="ghost" size="sm" className="text-yellow-500">
                  <CrownIcon className="h-4 w-4 mr-1" /> Upgrade
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={toggleTheme}>
                {darkMode ? <SunIcon className="h-4 w-4" /> : <MoonIcon className="h-4 w-4" />}
              </Button>
              {user && <img src={user.avatar_url} alt={user.login} className="h-8 w-8 rounded-full" />}
              <Button variant="ghost" size="sm" onClick={handleLogout}><LogOutIcon className="h-4 w-4" /></Button>
            </div>
          </div>
        </header>

        <div className="container px-4 py-6">
          {/* Quick Stats */}
          <div className="mb-6 grid gap-4 md:grid-cols-4">
            <Card><CardContent className="py-4"><p className="text-2xl font-bold">{repos.length}</p><p className="text-sm text-muted-foreground">Repositories</p></CardContent></Card>
            <Card><CardContent className="py-4"><p className="text-2xl font-bold">{publicRepos.length}</p><p className="text-sm text-muted-foreground">Public</p></CardContent></Card>
            <Card><CardContent className="py-4"><p className="text-2xl font-bold">{privateRepos.length}</p><p className="text-sm text-muted-foreground">Private</p></CardContent></Card>
            <Card><CardContent className="py-4"><p className="text-2xl font-bold">{favoriteRepos.length}</p><p className="text-sm text-muted-foreground">Favorited</p></CardContent></Card>
          </div>

          {/* Search & Filter Bar */}
          <div className="mb-6 space-y-4">
            <div className="flex flex-wrap gap-2">
              <Input placeholder="Search repos..." value={filter} onChange={e => setFilter(e.target.value)} className="max-w-xs" />
              
              <div className="flex items-center gap-1 rounded-lg border bg-background">
                <button onClick={() => setViewMode("grid")} className={`p-2 ${viewMode === "grid" ? "bg-muted" : ""}`}><LayoutGridIcon className="h-4 w-4" /></button>
                <button onClick={() => setViewMode("list")} className={`p-2 ${viewMode === "list" ? "bg-muted" : ""}`}><ListIcon className="h-4 w-4" /></button>
              </div>

              <select value={sortBy} onChange={e => setSortBy(e.target.value as SortBy)} className="rounded-lg border border-gray-300 bg-white text-gray-900 px-3 py-2">
                <option value="updated">Recently Updated</option>
                <option value="name">Alphabetical</option>
                <option value="stars">Most Stars</option>
              </select>

              <button onClick={() => { setShowPrivate(!showPrivate); setShowPublic(!showPublic); }} className={`flex items-center gap-2 rounded-lg border px-3 py-2 ${showPrivate && showPublic ? "bg-primary/10" : ""}`}>
                <FilterIcon className="h-4 w-4" /> {showPrivate && showPublic ? "All" : "Filtered"}
              </button>

              <Button variant="outline" size="sm" onClick={handleRefresh}><RefreshIcon className="h-4 w-4" /></Button>
            </div>

            {/* Bulk Actions */}
            {selectedRepos.length > 0 && (
              <div className="flex items-center gap-2 rounded-lg bg-primary/10 p-2">
                <span className="text-sm">{selectedRepos.length} selected</span>
                <Button size="sm" onClick={bulkGenerate}><DownloadIcon className="h-4 w-4" /> Generate All</Button>
                <Button size="sm" variant="ghost" onClick={() => setSelectedRepos([])}><TrashIcon className="h-4 w-4" /></Button>
              </div>
            )}
          </div>

          {/* Repos Grid/List */}
          {repos.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <GithubIcon className="mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="mb-2 text-lg font-semibold">No repositories found</h3>
                <p className="mb-4 text-center text-muted-foreground">Connect your GitHub account to see your repositories</p>
                <Button onClick={() => router.push("/login")}>Connect GitHub</Button>
              </CardContent>
            </Card>
          ) : (
            <div className={`${viewMode === "grid" ? "grid gap-4 md:grid-cols-2 lg:grid-cols-3" : "space-y-2"}`}>
              {filteredRepos.map(repo => (
                <div key={repo.id} className={`group relative rounded-lg border bg-card p-4 transition-colors hover:border-primary/50 ${viewMode === "list" ? "flex items-center gap-4" : ""}`}>
                  {/* Selection Checkbox */}
                  <button onClick={() => toggleSelect(repo.id)} className={`absolute left-2 top-2 h-5 w-5 rounded border ${selectedRepos.includes(repo.id) ? "bg-primary" : "border-input"}`}>
                    {selectedRepos.includes(repo.id) && <CheckIcon className="h-4 w-4 text-primary-foreground" />}
                  </button>

                  {/* Favorite Button */}
                  <button onClick={() => toggleFavorite(repo.id)} className="absolute right-2 top-2">
                    <StarIcon className={`h-5 w-5 ${favorites.includes(repo.id) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground opacity-0 group-hover:opacity-100"}`} />
                  </button>

                  <div className="mt-6">
                    <h3 className="flex items-center gap-2 font-semibold">
                      <GithubIcon className="h-4 w-4 text-muted-foreground" />
                      {repo.name}
                      {repo.private && <span className="rounded bg-yellow-100 px-1.5 py-0.5 text-xs font-medium text-yellow-800">Private</span>}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">{repo.description || "No description"}</p>
                    
                    {viewMode === "grid" && (
                      <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><StarIcon className="h-3 w-3" /> {repo.stargazers_count}</span>
                        <span>Updated {new Date(repo.updated_at).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  <div className={`${viewMode === "grid" ? "mt-4" : "ml-auto"}`}>
                    <Button size="sm" onClick={() => handleConnectRepo(repo)} disabled={connecting}>
                      <PlusIcon className="h-4 w-4" /> Generate
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty Search Results */}
          {filteredRepos.length === 0 && repos.length > 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <SearchIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No repositories match your search.</p>
                <Button variant="outline" className="mt-4" onClick={() => setFilter("")}>Clear Search</Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {/* Onboarding */}
      {showOnboarding && <OnboardingTour onComplete={completeOnboarding} />}

      <FeedbackButton />
    </div>
  );
}
