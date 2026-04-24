"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeftIcon,
  GitPullRequestIcon,
  MessageSquareIcon,
  LinkIcon,
  CheckIcon,
  ExternalLinkIcon,
  Loader2Icon,
  PlusIcon,
  RefreshIcon,
} from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface PullRequest {
  number: number;
  title: string;
  state: "open" | "closed" | "merged";
  url: string;
  mergedAt?: string;
  commits: string[];
}

interface Issue {
  number: number;
  title: string;
  state: "open" | "closed";
  labels: string[];
  url: string;
}

const SAMPLE_PRS: PullRequest[] = [
  { number: 123, title: "feat(auth): add OAuth2 login", state: "merged", url: "#123", mergedAt: "2024-01-15", commits: ["abc123", "def456"] },
  { number: 124, title: "fix(ui): button hover state", state: "merged", url: "#124", mergedAt: "2024-01-16", commits: ["ghi789"] },
  { number: 125, title: "feat(api): add rate limiting", state: "open", url: "#125", commits: [] },
];

const SAMPLE_ISSUES: Issue[] = [
  { number: 50, title: "Add dark mode support", state: "open", labels: ["enhancement"], url: "#50" },
  { number: 51, title: "Fix login redirect bug", state: "open", labels: ["bug"], url: "#51" },
  { number: 52, title: "Update documentation", state: "closed", labels: ["docs"], url: "#52" },
];

export default function PRAggregatorPage() {
  const [repo, setRepo] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    prs: PullRequest[];
    issues: Issue[];
    linked: { pr: number; issue: number }[];
  } | null>(null);

  const findLinkedIssue = (pr: PullRequest, issues: Issue[]): Issue | null => {
    const prWords = pr.title.toLowerCase().split(/\s+/);
    
    for (const issue of issues) {
      const issueWords = issue.title.toLowerCase().split(/\s+/);
      const match = prWords.some((word) => 
        word.length > 3 && issueWords.some(iw => iw.includes(word) || word.includes(iw))
      );
      if (match) return issue;
    }
    return null;
  };

  const aggregate = async () => {
    if (!repo) return;
    
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const linked = SAMPLE_PRS.filter(pr => pr.state === "merged").map(pr => {
      const issue = findLinkedIssue(pr, SAMPLE_ISSUES);
      return { pr: pr.number, issue: issue?.number || 0 };
    }).filter(l => l.issue > 0);

    setResult({
      prs: SAMPLE_PRS,
      issues: SAMPLE_ISSUES,
      linked,
    });
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/dashboard"
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">PR/Issue Aggregator</h1>
            <p className="text-gray-600">Auto-link PRs and issues to commits</p>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LinkIcon className="w-5 h-5" />
              Aggregate
            </CardTitle>
            <CardDescription>
              Connect PRs, issues, and commits automatically
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Input
                placeholder="owner/repo"
                value={repo}
                onChange={(e) => setRepo(e.target.value)}
                className="flex-1"
              />
              <Button onClick={aggregate} disabled={loading || !repo}>
                {loading ? (
                  <>
                    <Loader2Icon className="w-4 h-4 mr-2 animate-spin" />
                    Aggregating...
                  </>
                ) : (
                  <>
                    <RefreshIcon className="w-4 h-4 mr-2" />
                    Aggregate
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {result && (
          <>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Linked PRs & Issues ({result.linked.length})</CardTitle>
                <CardDescription>
                  Automatically linked pull requests with issues
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {result.linked.map((link) => {
                    const pr = result.prs.find(p => p.number === link.pr);
                    const issue = result.issues.find(i => i.number === link.issue);
                    return (
                      <div key={link.pr} className="flex items-center gap-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <GitPullRequestIcon className="w-5 h-5 text-green-600" />
                        <span className="font-mono">#{pr?.number}</span>
                        <span className="flex-1 truncate">{pr?.title}</span>
                        <LinkIcon className="w-4 h-4 text-gray-400" />
                        <span className="font-mono">#{issue?.number}</span>
                        <span className="flex-1 truncate">{issue?.title}</span>
                        <CheckIcon className="w-5 h-5 text-green-600" />
                      </div>
                    );
                  })}
                  {result.linked.length === 0 && (
                    <p className="text-gray-500 text-center py-4">
                      No linked PRs and issues found
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Pull Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {result.prs.map((pr) => (
                      <div
                        key={pr.number}
                        className="flex items-center gap-2 p-2 bg-gray-50 rounded"
                      >
                        <GitPullRequestIcon
                          className={`w-4 h-4 ${
                            pr.state === "merged"
                              ? "text-purple-500"
                              : pr.state === "closed"
                              ? "text-red-500"
                              : "text-green-500"
                          }`}
                        />
                        <span className="font-mono text-sm">#{pr.number}</span>
                        <span className="flex-1 truncate text-sm">{pr.title}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Issues</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {result.issues.map((issue) => (
                      <div
                        key={issue.number}
                        className="flex items-center gap-2 p-2 bg-gray-50 rounded"
                      >
                        <MessageSquareIcon
                          className={`w-4 h-4 ${
                            issue.state === "closed"
                              ? "text-purple-500"
                              : "text-green-500"
                          }`}
                        />
                        <span className="font-mono text-sm">#{issue.number}</span>
                        <span className="flex-1 truncate text-sm">{issue.title}</span>
                        <div className="flex gap-1">
                          {issue.labels.map((label) => (
                            <span
                              key={label}
                              className="text-xs bg-gray-200 px-1.5 py-0.5 rounded"
                            >
                              {label}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {!result && !loading && (
          <Card>
            <CardHeader>
              <CardTitle>How It Works</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-gray-600">
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                    1
                  </div>
                  <div>
                    <p className="font-medium">Fetch merged PRs</p>
                    <p className="text-sm">
                      Get all recently merged pull requests
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                    2
                  </div>
                  <div>
                    <p className="font-medium">Match issues</p>
                    <p className="text-sm">
                      Link PRs to issues based on title similarity
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                    3
                  </div>
                  <div>
                    <p className="font-medium">Generate report</p>
                    <p className="text-sm">
                      Create changelog with linked issues
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm">
                <p className="text-gray-400"># Result</p>
                <p>PR #123 → Issue #50</p>
                <p>  "feat(auth): add OAuth2 login"</p>
                <p>  → "Add dark mode support"</p>
                <p />
                <p>PR #124 → Issue #51</p>
                <p>  "fix(ui): button hover state"</p>
                <p>  → "Fix login redirect bug"</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}