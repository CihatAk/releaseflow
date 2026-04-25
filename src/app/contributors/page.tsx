"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeftIcon, UsersIcon, Loader2Icon } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface Contributor {
  login: string;
  avatar_url: string;
  contributions: number;
  html_url: string;
}

export default function ContributorsPage() {
  const [repo, setRepo] = useState("");
  const [loading, setLoading] = useState(false);
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [error, setError] = useState("");

  const fetchContributors = async () => {
    if (!repo) return;
    
    const token = document.cookie.split("; ").find(r => r.startsWith("github_token="))?.split("=")[1];
    if (!token) {
      setError("Please login first");
      return;
    }

    const [owner, repoName] = repo.split("/");
    if (!owner || !repoName) {
      setError("Please enter owner/repo format");
      return;
    }

    setLoading(true);
    setError("");
    setContributors([]);

    try {
      const res = await fetch(`https://api.github.com/repos/${owner}/${repoName}/contributors?per_page=50`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github.v3+json",
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch contributors");
      }

      const data = await res.json();
      setContributors(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard" className="p-2 rounded-lg hover:bg-gray-100">
            <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Contributors</h1>
            <p className="text-gray-600">Track and analyze contributor activity</p>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Select Repository</CardTitle>
            <CardDescription>Enter a repo to see contributors</CardDescription>
          </CardHeader>
          <CardContent className="flex gap-4">
            <input
              type="text"
              placeholder="owner/repo"
              value={repo}
              onChange={(e) => setRepo(e.target.value)}
              className="flex-1 px-4 py-2 border rounded-lg"
            />
            <Button onClick={fetchContributors} disabled={loading || !repo}>
              {loading ? <Loader2Icon className="w-4 h-4 animate-spin" /> : <UsersIcon className="w-4 h-4" />}
              {loading ? "Loading..." : "Fetch"}
            </Button>
          </CardContent>
        </Card>

        {error && (
          <Card className="mb-6">
            <CardContent className="py-4 text-red-500">{error}</CardContent>
          </Card>
        )}

        {contributors.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Contributors ({contributors.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {contributors.map((contributor) => (
                  <a
                    key={contributor.login}
                    href={contributor.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-col items-center p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <img
                      src={contributor.avatar_url}
                      alt={contributor.login}
                      className="w-12 h-12 rounded-full mb-2"
                    />
                    <p className="text-sm font-medium text-center truncate w-full">{contributor.login}</p>
                    <p className="text-xs text-gray-500">{contributor.contributions} commits</p>
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}