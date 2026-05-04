"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeftIcon,
  ListIcon,
  GithubIcon,
  CalendarIcon,
  CopyIcon,
  DownloadIcon,
  TrashIcon,
  ExternalLinkIcon,
} from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface SavedChangelog {
  id: string;
  repo: string;
  version: string;
  date: string;
  markdown: string;
  commitCount: number;
  stats?: any;
}

export default function ChangelogHistoryPage() {
  const [history, setHistory] = useState<SavedChangelog[]>([]);
  const [selected, setSelected] = useState<SavedChangelog | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("rf_changelog_history");
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch {
        setHistory([]);
      }
    }
  }, []);

  const saveToHistory = (changelog: Omit<SavedChangelog, "id" | "date">) => {
    const entry: SavedChangelog = {
      ...changelog,
      id: Date.now().toString(),
      date: new Date().toISOString(),
    };
    const updated = [entry, ...history].slice(0, 50);
    setHistory(updated);
    localStorage.setItem("rf_changelog_history", JSON.stringify(updated));
  };

  const deleteEntry = (id: string) => {
    const updated = history.filter((h) => h.id !== id);
    setHistory(updated);
    localStorage.setItem("rf_changelog_history", JSON.stringify(updated));
    if (selected?.id === id) setSelected(null);
  };

  const clearHistory = () => {
    if (confirm("Clear all changelog history?")) {
      setHistory([]);
      setSelected(null);
      localStorage.removeItem("rf_changelog_history");
    }
  };

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (entry: SavedChangelog, ext = "md") => {
    const blob = new Blob([entry.markdown], { type: "text/markdown" });
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = `CHANGELOG-${entry.repo.replace("/", "-")}-${entry.version}.${ext}`;
    a.click();
    URL.revokeObjectURL(blobUrl);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard" className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <ListIcon className="w-6 h-6" />
              Changelog History
            </h1>
            <p className="text-gray-600">View and manage your generated changelogs</p>
          </div>
          {history.length > 0 && (
            <Button variant="outline" size="sm" onClick={clearHistory} className="ml-auto">
              <TrashIcon className="w-4 h-4 mr-1" />Clear All
            </Button>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            {history.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-gray-500">
                  <ListIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No changelog history yet</p>
                  <p className="text-sm mt-2">Generate changelogs to see them here</p>
                  <Link href="/quick">
                    <Button className="mt-4" variant="outline" size="sm">
                      Generate Changelog
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {history.map((entry) => (
                  <Card
                    key={entry.id}
                    className={`cursor-pointer transition hover:shadow-md ${selected?.id === entry.id ? "ring-2 ring-blue-500" : ""}`}
                    onClick={() => setSelected(entry)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-medium text-gray-900 flex items-center gap-1">
                            <GithubIcon className="w-4 h-4" />
                            {entry.repo}
                          </div>
                          <div className="text-sm text-blue-600 font-medium">{entry.version}</div>
                          <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                            <CalendarIcon className="w-3 h-3" />
                            {new Date(entry.date).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleCopy(entry.markdown); }}
                            className="p-1 hover:bg-gray-100 rounded"
                            title="Copy"
                          >
                            <CopyIcon className="w-3 h-3 text-gray-500" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); deleteEntry(entry.id); }}
                            className="p-1 hover:bg-red-50 rounded"
                            title="Delete"
                          >
                            <TrashIcon className="w-3 h-3 text-red-500" />
                          </button>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 mt-2">{entry.commitCount} commits</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div className="md:col-span-2">
            {selected ? (
              <>
                {selected.stats && (
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="bg-white rounded-lg p-3 text-center border">
                      <div className="text-lg font-bold text-blue-600">{selected.stats.totalCommits}</div>
                      <div className="text-xs text-gray-600">Commits</div>
                    </div>
                    <div className="bg-white rounded-lg p-3 text-center border">
                      <div className="text-lg font-bold text-green-600">{selected.stats.contributors}</div>
                      <div className="text-xs text-gray-600">Contributors</div>
                    </div>
                    <div className="bg-white rounded-lg p-3 text-center border">
                      <div className="text-lg font-bold text-red-600">{selected.stats.breakingChanges}</div>
                      <div className="text-xs text-gray-600">Breaking</div>
                    </div>
                  </div>
                )}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <GithubIcon className="w-5 h-5" />
                        {selected.repo}
                      </CardTitle>
                      <CardDescription>
                        {selected.version} • {selected.commitCount} commits • {new Date(selected.date).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleCopy(selected.markdown)}>
                        <CopyIcon className="w-4 h-4 mr-1" />{copied ? "Copied!" : "Copy"}
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDownload(selected, "md")}>
                        <DownloadIcon className="w-4 h-4 mr-1" />Download MD
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm whitespace-pre-wrap max-h-[700px] overflow-y-auto">
                      {selected.markdown}
                    </pre>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="p-12 text-center text-gray-500">
                  <p className="text-lg">Select a changelog from the history</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
