"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeftIcon,
  DownloadIcon,
  StarIcon,
  SearchIcon,
  FilterIcon,
  PlusIcon,
  ExternalLinkIcon,
  HeartIcon,
  CheckIcon,
} from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface Template {
  id: string;
  name: string;
  description: string;
  author: string;
  downloads: number;
  rating: number;
  tags: string[];
  format: string;
  preview: string;
}

const MARKETPLACE_TEMPLATES: Template[] = [
  {
    id: "1",
    name: "Keep a Changelog",
    description: "Standard Keep a Changelog format with added security and deprecated sections",
    author: "releaseflow",
    downloads: 12500,
    rating: 4.8,
    tags: ["standard", "popular"],
    format: "keepachangelog",
    preview: "## [1.0.0] - 2024-01-15\n\n### Added\n- New feature\n\n### Fixed\n- Bug fix",
  },
  {
    id: "2",
    name: "Conventional Commits",
    description: "Format following conventionalcommits.org specification",
    author: "conventionalcommits",
    downloads: 8900,
    rating: 4.9,
    tags: ["conventional", "semantic"],
    format: "conventional",
    preview: "feat(auth): add login\nfix(ui): hover state",
  },
  {
    id: "3",
    name: "Minimalist",
    description: "Clean, minimal format for simple projects",
    author: "minimalist",
    downloads: 5600,
    rating: 4.5,
    tags: ["simple", "minimal"],
    format: "simple",
    preview: "# Changes\n- Feature A\n- Fix B",
  },
  {
    id: "4",
    name: "Enterprise",
    description: "Detailed enterprise format with security and compliance sections",
    author: "enterprise",
    downloads: 3200,
    rating: 4.7,
    tags: ["enterprise", "security"],
    format: "enterprise",
    preview: "## [1.0.0] Release\n### Features\n### Security\n### Deprecations",
  },
  {
    id: "5",
    name: "Dev.to Ready",
    description: "Pre-formatted for Dev.to blog posts",
    author: "devcommunity",
    downloads: 7800,
    rating: 4.6,
    tags: ["devto", "blog"],
    format: "devto",
    preview: "title: Release v1.0\ntags: changelog",
  },
  {
    id: "6",
    name: "JSON Output",
    description: "Machine-readable JSON format for CI/CD pipelines",
    author: "cicd",
    downloads: 4500,
    rating: 4.4,
    tags: ["json", "api"],
    format: "json",
    preview: '{"version": "1.0.0", "changes": []}',
  },
];

export default function MarketplacePage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"downloads" | "rating">("downloads");
  const [installed, setInstalled] = useState<string[]>([]);

  const filteredTemplates = MARKETPLACE_TEMPLATES.filter((t) => {
    const matchesSearch = !search || 
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()));
    const matchesFilter = !filter || t.tags.includes(filter);
    return matchesSearch && matchesFilter;
  }).sort((a, b) => {
    if (sortBy === "downloads") return b.downloads - a.downloads;
    return b.rating - a.rating;
  });

  const installTemplate = (id: string) => {
    setInstalled([...installed, id]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/dashboard"
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Template Marketplace</h1>
            <p className="text-gray-600">Community-shared templates with ratings</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search templates..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={filter === null ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(null)}
            >
              All
            </Button>
            <Button
              variant={filter === "popular" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("popular")}
            >
              Popular
            </Button>
            <Button
              variant={filter === "standard" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("standard")}
            >
              Standard
            </Button>
            <Button
              variant={filter === "enterprise" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter("enterprise")}
            >
              Enterprise
            </Button>
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg"
          >
            <option value="downloads">Most Downloads</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <Card key={template.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between">
                  <span>{template.name}</span>
                  {installed.includes(template.id) && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                      Installed
                    </span>
                  )}
                </CardTitle>
                <CardDescription>{template.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-gray-900 text-gray-100 p-3 rounded-lg font-mono text-xs h-24 overflow-hidden">
                    {template.preview}
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {template.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <DownloadIcon className="w-4 h-4" />
                        {template.downloads.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <StarIcon className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        {template.rating}
                      </span>
                    </div>
                    <span>by {template.author}</span>
                  </div>

                  <Button
                    onClick={() => installTemplate(template.id)}
                    disabled={installed.includes(template.id)}
                    className="w-full"
                  >
                    {installed.includes(template.id) ? (
                      <>
                        <CheckIcon className="w-4 h-4 mr-2" />
                        Installed
                      </>
                    ) : (
                      <>
                      <DownloadIcon className="w-4 h-4 mr-2" />
                      Install
                    </>
                  )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredTemplates.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <SearchIcon className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No templates found</p>
              <Button variant="outline" className="mt-4" onClick={() => setSearch("")}>
                Clear Search
              </Button>
            </CardContent>
          </Card>
        )}

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Submit Your Template</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Have a custom template? Share it with the community!
            </p>
            <div className="flex gap-2">
              <Button variant="outline">
                <PlusIcon className="w-4 h-4 mr-2" />
                Submit Template
              </Button>
              <Button variant="outline">
                <ExternalLinkIcon className="w-4 h-4 mr-2" />
                View Docs
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}