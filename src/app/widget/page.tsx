"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeftIcon, CodeIcon, CopyIcon, CheckIcon, ExternalLinkIcon } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function WidgetDashboardPage() {
  const [repo, setRepo] = useState("owner/repo");
  const [customTheme, setCustomTheme] = useState("#3B82F6");
  const [copied, setCopied] = useState(false);
  const [previewMode, setPreviewMode] = useState("full");

  const getModeParams = () => {
    switch (previewMode) {
      case "minimal": return "header=false&footer=false";
      case "compact": return "header=false&footer=false&toggle=false";
      default: return "";
    }
  };

  const widgetCode = `<iframe
  src="https://releaseflow.dev/embed/${repo.replace("/", "-")}?theme=dark&accent=${customTheme.replace("#", "")}&${getModeParams()}"
  width="400"
  height="${previewMode === "compact" ? "200" : "300"}"
  frameborder="0"
></iframe>`;

  const scriptCode = `<script src="https://releaseflow.dev/widget.js" data-repo="${repo}" data-theme="dark" data-accent="${customTheme.replace("#", "")}"></script>`;

  const handleCopy = async (code: string) => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard" className="p-2 rounded-lg hover:bg-gray-100">
            <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Widget Dashboard</h1>
            <p className="text-gray-600">Embeddable changelog widgets</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Widget Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Repository</label>
                <Input
                  placeholder="owner/repo"
                  value={repo}
                  onChange={(e) => setRepo(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Accent Color</label>
                <input
                  type="color"
                  value={customTheme}
                  onChange={(e) => setCustomTheme(e.target.value)}
                  className="w-full h-10 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Preview Mode</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setPreviewMode("full")}
                    className={`p-3 rounded-lg border text-center ${
                      previewMode === "full" ? "border-blue-500 bg-blue-50" : "border-gray-200"
                    }`}
                  >
                    <p className="font-medium text-sm">Full</p>
                    <p className="text-xs text-gray-500">Header + Footer</p>
                  </button>
                  <button
                    onClick={() => setPreviewMode("minimal")}
                    className={`p-3 rounded-lg border text-center ${
                      previewMode === "minimal" ? "border-blue-500 bg-blue-50" : "border-gray-200"
                    }`}
                  >
                    <p className="font-medium text-sm">Minimal</p>
                    <p className="text-xs text-gray-500">No Header/Footer</p>
                  </button>
                  <button
                    onClick={() => setPreviewMode("compact")}
                    className={`p-3 rounded-lg border text-center ${
                      previewMode === "compact" ? "border-blue-500 bg-blue-50" : "border-gray-200"
                    }`}
                  >
                    <p className="font-medium text-sm">Compact</p>
                    <p className="text-xs text-gray-500">No toggle</p>
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-100 p-4 rounded-lg">
                <div className="bg-white rounded-lg shadow p-4 max-w-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded bg-gray-200" />
                    <div>
                      <p className="font-medium">{repo}</p>
                      <p className="text-xs text-gray-500">Changelog</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-green-500">✨</span>
                      <span>Add new feature</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-green-500">✨</span>
                      <span>Add OAuth</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-blue-500">🐛</span>
                      <span>Fix bug</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-3 text-center">Powered by ReleaseFlow</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Iframe Code</CardTitle>
              <Button size="sm" variant="outline" onClick={() => handleCopy(widgetCode)}>
                {copied ? <CheckIcon className="w-4 h-4" /> : <CopyIcon className="w-4 h-4" />}
              </Button>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto whitespace-pre-wrap">
                {widgetCode}
              </pre>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>JavaScript Widget</CardTitle>
              <Button size="sm" variant="outline" onClick={() => handleCopy(scriptCode)}>
                {copied ? <CheckIcon className="w-4 h-4" /> : <CopyIcon className="w-4 h-4" />}
              </Button>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto whitespace-pre-wrap">
                {scriptCode}
              </pre>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Supported Platforms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {["Notion", "Linear", "Confluence", "ReadMe.io", "GitBook", "Docusaurus", "Storybook", "Custom Website"].map((platform) => (
                <div key={platform} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <CodeIcon className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">{platform}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}