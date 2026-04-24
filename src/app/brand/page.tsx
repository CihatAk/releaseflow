"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeftIcon, PaletteIcon, SaveIcon, DownloadIcon, CopyIcon, CheckIcon, EyeIcon } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface BrandTheme {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  companyName: string;
  logo: string;
  customFont: string;
  fontFamily: string;
}

const defaultTheme: BrandTheme = {
  primaryColor: "#3b82f6",
  secondaryColor: "#8b5cf6",
  accentColor: "#10b981",
  companyName: "",
  logo: "",
  customFont: "",
  fontFamily: "Inter, system-ui, sans-serif",
};

const PREVIEW_URL = "https://releaseflow-fawn.vercel.app";

export default function BrandingPage() {
  const [theme, setTheme] = useState<BrandTheme>(defaultTheme);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("rf_brand_theme");
    if (stored) {
      setTheme({ ...defaultTheme, ...JSON.parse(stored) });
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem("rf_brand_theme", JSON.stringify(theme));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handlePreview = () => {
    localStorage.setItem("rf_brand_theme", JSON.stringify(theme));
    window.open("/embed/demo", "_blank");
  };

  const getEmbedCode = () => {
    const params = new URLSearchParams({
      accent: theme.primaryColor.replace("#", ""),
      header: "true",
      footer: "true",
      toggle: "true",
    });
    return `<iframe src="${PREVIEW_URL}/embed/demo?${params}" width="400" height="300" frameborder="0"></iframe>`;
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(getEmbedCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const fontOptions = [
    "Inter, system-ui, sans-serif",
    "Georgia, serif",
    "Monaco, monospace",
    "Arial, Helvetica, sans-serif",
    "Times New Roman, serif",
  ];

  const exportHTML = async (template: string) => {
    try {
      const response = await fetch("/api/changelog/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sections: [{ type: "feat", label: "Features", icon: "🚀", commits: [{ message: "Sample feature", sha: "abc123" }] }],
          repo: { name: theme.companyName || "my-project" },
          template,
          theme,
        }),
      });
      const data = await response.json();
      
      const blob = new Blob([data.html], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${theme.companyName}-changelog-${template}.html`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <ArrowLeftIcon className="h-5 w-5" />
            <span>Back to Dashboard</span>
          </Link>
          <Button onClick={handleSave} variant={saved ? "default" : "outline"}>
            {saved ? "✅ Saved!" : <><SaveIcon className="h-4 w-4" /> Save</>}
          </Button>
        </div>
      </header>

      <main className="container mx-auto max-w-4xl px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">Brand Customization</h1>
          <p className="text-muted-foreground">Personalize your exported changelogs with your brand</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Settings */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Brand Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium">Company/Project Name</label>
                  <Input
                    placeholder="Acme Corp"
                    value={theme.companyName}
                    onChange={(e) => setTheme({ ...theme, companyName: e.target.value })}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Primary Color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={theme.primaryColor}
                      onChange={(e) => setTheme({ ...theme, primaryColor: e.target.value })}
                      className="h-10 w-16 rounded-lg cursor-pointer"
                    />
                    <Input
                      value={theme.primaryColor}
                      onChange={(e) => setTheme({ ...theme, primaryColor: e.target.value })}
                      className="flex-1"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Secondary Color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={theme.secondaryColor}
                      onChange={(e) => setTheme({ ...theme, secondaryColor: e.target.value })}
                      className="h-10 w-16 rounded-lg cursor-pointer"
                    />
                    <Input
                      value={theme.secondaryColor}
                      onChange={(e) => setTheme({ ...theme, secondaryColor: e.target.value })}
                      className="flex-1"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Accent Color</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={theme.accentColor}
                      onChange={(e) => setTheme({ ...theme, accentColor: e.target.value })}
                      className="h-10 w-16 rounded-lg cursor-pointer"
                    />
                    <Input
                      value={theme.accentColor}
                      onChange={(e) => setTheme({ ...theme, accentColor: e.target.value })}
                      className="flex-1"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Logo URL (optional)</label>
                  <Input
                    placeholder="https://example.com/logo.png"
                    value={theme.logo}
                    onChange={(e) => setTheme({ ...theme, logo: e.target.value })}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Save Actions */}
            <Card>
              <CardContent className="space-y-2 py-4">
                <Button onClick={handlePreview} variant="outline" className="w-full">
                  <EyeIcon className="h-4 w-4" /> Preview Changes
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Templates */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Export Templates</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { id: "default", name: "Default", desc: "Clean and professional", icon: "📄" },
                  { id: "modern", name: "Modern", desc: "Card-based with gradients", icon: "✨" },
                  { id: "minimal", name: "Minimal", desc: "Monospace terminal style", icon: "📝" },
                  { id: "enterprise", name: "Enterprise", desc: "Corporate confidential", icon: "🏢" },
                  { id: "creative", name: "Creative", desc: "Colorful and playful", icon: "🎨" },
                ].map((t) => (
                  <div key={t.id} className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{t.icon}</span>
                      <div>
                        <p className="font-medium">{t.name}</p>
                        <p className="text-sm text-muted-foreground">{t.desc}</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => exportHTML(t.id)}>
                      <DownloadIcon className="h-4 w-4" /> Export
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Preview Colors */}
            <Card>
              <CardHeader>
                <CardTitle>Color Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <div className="text-center">
                    <div className="h-12 w-12 rounded-lg" style={{ background: theme.primaryColor }} />
                    <p className="mt-1 text-xs">Primary</p>
                  </div>
                  <div className="text-center">
                    <div className="h-12 w-12 rounded-lg" style={{ background: theme.secondaryColor }} />
                    <p className="mt-1 text-xs">Secondary</p>
                  </div>
                  <div className="text-center">
                    <div className="h-12 w-12 rounded-lg" style={{ background: theme.accentColor }} />
                    <p className="mt-1 text-xs">Accent</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}