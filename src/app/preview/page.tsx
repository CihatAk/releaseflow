"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeftIcon,
  GlobeIcon,
  FileTextIcon,
  MailIcon,
  CopyIcon,
  CheckIcon,
  MessageSquareIcon,
} from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

type PreviewFormat = "github" | "devto" | "twitter" | "newsletter" | "slack";

interface ChangelogSection {
  type: string;
  label: string;
  icon: string;
  commits: { message: string; sha: string; scope?: string }[];
}

const SAMPLE_SECTIONS: ChangelogSection[] = [
  {
    type: "feat",
    label: "Features",
    icon: "✨",
    commits: [
      { message: "Add OAuth2 login support", sha: "abc123", scope: "auth" },
      { message: "New dashboard with analytics", sha: "def456", scope: "ui" },
    ],
  },
  {
    type: "fix",
    label: "Bug Fixes",
    icon: "🐛",
    commits: [
      { message: "Fix button hover state", sha: "ghi789", scope: "ui" },
      { message: "Resolve rate limit handling", sha: "jkl012", scope: "api" },
    ],
  },
  {
    type: "perf",
    label: "Performance",
    icon: "⚡️",
    commits: [
      { message: "Optimize database queries", sha: "mno345", scope: "db" },
    ],
  },
];

export default function PreviewPage() {
  const [format, setFormat] = useState<PreviewFormat>("github");
  const [repo, setRepo] = useState("owner/repo");
  const [copied, setCopied] = useState(false);

  const generatePreview = (fmt: PreviewFormat): string => {
    const sections = SAMPLE_SECTIONS;

    switch (fmt) {
      case "github":
        return generateGitHubPreview(sections, repo);
      case "devto":
        return generateDevToPreview(sections, repo);
      case "twitter":
        return generateTwitterPreview(sections, repo);
      case "newsletter":
        return generateNewsletterPreview(sections, repo);
      case "slack":
        return generateSlackPreview(sections, repo);
      default:
        return "";
    }
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(generatePreview(format));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
            <h1 className="text-2xl font-bold text-gray-900">Changelog Preview</h1>
            <p className="text-gray-600">Live preview for different platforms</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Preview</CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={copyToClipboard}>
                      <CopyIcon className="w-4 h-4 mr-1" />
                      {copied ? "Copied!" : "Copy"}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm whitespace-pre-wrap overflow-x-auto">
                  {generatePreview(format)}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Repository
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    value={repo}
                    onChange={(e) => setRepo(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Platform
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(
                      [
                        { id: "github", label: "GitHub", icon: GlobeIcon },
                        { id: "devto", label: "Dev.to", icon: FileTextIcon },
                        { id: "twitter", label: "Twitter", icon: GlobeIcon },
                        { id: "newsletter", label: "Newsletter", icon: MailIcon },
                        { id: "slack", label: "Slack", icon: MessageSquareIcon },
                      ] as const
                    ).map((f) => (
                      <Button
                        key={f.id}
                        variant={format === f.id ? "default" : "outline"}
                        size="sm"
                        onClick={() => setFormat(f.id)}
                        className="justify-start"
                      >
                        {f.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Platform Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-gray-600">
                  {format === "github" && (
                    <p>Full release notes format with commit links and authors.</p>
                  )}
                  {format === "devto" && (
                    <p>Optimized for Dev.to articles with markdown formatting.</p>
                  )}
                  {format === "twitter" && (
                    <p>Short format suitable for Twitter threads.</p>
                  )}
                  {format === "newsletter" && (
                    <p>Newsletter style with emojis and spacing.</p>
                  )}
                  {format === "slack" && (
                    <p>Slack block format with rich formatting.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function generateGitHubPreview(sections: ChangelogSection[], repo: string): string {
  const today = new Date().toISOString().split("T")[0];
  return `# Changelog

## [Unreleased] - ${today}

${sections
  .map(
    (s) =>
      `### ${s.icon} ${s.label}

${s.commits
  .map((c) => `- **${c.scope || ""}**: ${c.message} (${c.sha})`)
  .join("\n")}`
  )
  .join("\n\n")}
---
*Generated with ReleaseFlow*`;
}

function generateDevToPreview(sections: ChangelogSection[], repo: string): string {
  return `---
title: ${repo} - Release Update
published: true
tags: changelog, release
---

# ${repo} Release Update

Welcome to the latest update of ${repo}!

${sections
  .map(
    (s) =>
      `## ${s.icon} ${s.label}

${s.commits.map((c) => `- ${c.message}`).join("\n")}`
  )
  .join("\n\n")}

---
*Generated with ReleaseFlow*`;
}

function generateTwitterPreview(sections: ChangelogSection[], repo: string): string {
  let tweet = `🚀 ${repo} Update!\n\n`;

  for (const section of sections.slice(0, 2)) {
    tweet += `${section.icon} ${section.label}:\n`;
    for (const commit of section.commits.slice(0, 3)) {
      tweet += `• ${commit.message.slice(0, 50)}${commit.message.length > 50 ? "..." : ""}\n`;
    }
    tweet += "\n";
  }

  tweet += "🛠️ Full changelog below #coding";
  return tweet;
}

function generateNewsletterPreview(
  sections: ChangelogSection[],
  repo: string
): string {
  const today = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return `📢 *${repo} Release Update*

Hey there! Here's what's new in ${repo}:

━━━━━━━━━━━━━━━━━━━━━━━━

${sections
  .map(
    (s) =>
      `${s.icon} **${s.label.toUpperCase()}**
${s.commits.map((c) => `• ${c.message}`).join("\n")}`
  )
  .join("\n\n")}

━━━━━━━━━━━━━━━━━━━━━━━━

That's all for this release!

Happy coding! 🚀

— The ${repo} Team
*Generated with ReleaseFlow*`;
}

function generateSlackPreview(sections: ChangelogSection[], repo: string): string {
  let blocks: any[] = [
    {
      type: "header",
      text: { type: "plain_text", text: `🚀 New Release - ${repo}` },
    },
    { type: "divider" },
  ];

  for (const section of sections) {
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*${section.icon} ${section.label}*`,
      },
    });

    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: section.commits
          .map((c) => `• ${c.message} (\`${c.sha}\`)`)
          .join("\n"),
      },
    });
  }

  blocks.push({ type: "divider" });
  blocks.push({
    type: "context",
    elements: [
      { type: "mrkdwn", text: "*Generated with ReleaseFlow*" },
    ],
  });

  return JSON.stringify(blocks, null, 2);
}