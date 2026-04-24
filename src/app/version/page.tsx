"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeftIcon,
  GitCompareIcon,
  CheckIcon,
  ExternalLinkIcon,
  Loader2Icon,
  ArrowRightIcon,
} from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChangelogSection, detectVersionBump, getNextVersion, VersionBump } from "@/lib/github/api";

interface ParsedCommitWithIssue {
  sha: string;
  message: string;
  issue?: string;
  type: string;
  scope?: string;
  breaking: boolean;
  shaShort: string;
  date: string;
  author: string;
}

export default function VersionDetectPage() {
  const [repoInput, setRepoInput] = useState("");
  const [currentVersion, setCurrentVersion] = useState("v1.0.0");
  const [detecting, setDetecting] = useState(false);
  const [result, setResult] = useState<{
    bump: VersionBump;
    nextVersion: string;
    commits: ParsedCommitWithIssue[];
    hasBreaking: boolean;
    hasFeatures: boolean;
    hasFixes: boolean;
  } | null>(null);

  const handleDetect = async () => {
    setDetecting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const mockCommits: ParsedCommitWithIssue[] = [
      { sha: "abc1234", message: "feat(auth): add OAuth2 login", type: "feat", scope: "auth", breaking: false, shaShort: "abc1234", date: new Date().toISOString(), author: "dev" },
      { sha: "def5678", message: "fix(ui): button hover state", type: "fix", scope: "ui", breaking: false, shaShort: "def5678", date: new Date().toISOString(), author: "dev" },
      { sha: "ghi9012", message: "feat(api): add rate limiting", type: "feat", scope: "api", breaking: false, shaShort: "ghi9012", date: new Date().toISOString(), author: "dev" },
      { sha: "jkl3456", message: "fix!: remove deprecated API", type: "fix", breaking: true, shaShort: "jkl3456", date: new Date().toISOString(), author: "dev" },
    ];

    const bump = detectVersionBump(mockCommits as any);
    setResult({
      bump,
      nextVersion: getNextVersion(currentVersion, bump),
      commits: mockCommits,
      hasBreaking: mockCommits.some(c => c.breaking),
      hasFeatures: mockCommits.some(c => c.type === "feat"),
      hasFixes: mockCommits.some(c => c.type === "fix"),
    });
    setDetecting(false);
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
            <h1 className="text-2xl font-bold text-gray-900">Smart Version Detection</h1>
            <p className="text-gray-600">Auto-detect semver bump type from commits</p>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitCompareIcon className="w-5 h-5" />
              Detect Version Bump
            </CardTitle>
            <CardDescription>
              Analyze commits to determine if this is a major, minor, or patch release
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Repository
                  </label>
                  <input
                    type="text"
                    placeholder="owner/repo"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    value={repoInput}
                    onChange={(e) => setRepoInput(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Version
                  </label>
                  <input
                    type="text"
                    placeholder="v1.0.0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    value={currentVersion}
                    onChange={(e) => setCurrentVersion(e.target.value)}
                  />
                </div>
              </div>

              <Button onClick={handleDetect} disabled={detecting || !repoInput}>
                {detecting ? (
                  <>
                    <Loader2Icon className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <GitCompareIcon className="w-4 h-4 mr-2" />
                    Detect Version Bump
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {result && (
          <>
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-blue-100 mb-4">
                    <span className={`text-4xl font-bold ${
                      result.bump === "major" ? "text-red-500" :
                      result.bump === "minor" ? "text-blue-500" :
                      result.bump === "patch" ? "text-green-500" :
                      "text-gray-400"
                    }`}>
                      {result.bump === "major" ? "M" : result.bump === "minor" ? "m" : result.bump === "patch" ? "p" : "—"}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold mb-2">
                    {result.bump.toUpperCase()} Release
                  </h2>
                  <p className="text-gray-600 mb-4">
                    Current: {currentVersion} → Next: {result.nextVersion}
                  </p>

                  <div className="flex justify-center gap-4 text-sm">
                    {result.hasBreaking && (
                      <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full">
                        ⚠️ Breaking Changes
                      </span>
                    )}
                    {result.hasFeatures && (
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full">
                        ✨ New Features
                      </span>
                    )}
                    {result.hasFixes && (
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
                        🐛 Bug Fixes
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Commit Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {result.commits.map((commit) => (
                    <div
                      key={commit.sha}
                      className={`flex items-center gap-3 p-3 rounded-lg ${
                        commit.breaking ? "bg-red-50 border border-red-200" : "bg-gray-50"
                      }`}
                    >
                      <code className="text-sm text-gray-500 font-mono">
                        {commit.shaShort}
                      </code>
                      <span className="flex-1">{commit.message}</span>
                      {commit.breaking && (
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                          BREAKING
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}