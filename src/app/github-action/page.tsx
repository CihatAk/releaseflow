"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeftIcon,
  GithubIcon,
  DownloadIcon,
  CopyIcon,
  CheckIcon,
  FileCodeIcon,
  SettingsIcon,
  Loader2Icon,
} from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface ActionConfig {
  repo: string;
  trigger: "push" | "tag" | "schedule" | "manual";
  schedule: string;
  format: string;
  days: number;
  createPR: boolean;
  branch: string;
}

const TRIGGER_OPTIONS = [
  { value: "push", label: "On Push", description: "Run on every push to main branch" },
  { value: "tag", label: "On Tag", description: "Run when a new tag is pushed" },
  { value: "schedule", label: "Scheduled", description: "Run on a schedule (cron)" },
  { value: "manual", label: "Manual", description: "Manual trigger only" },
];

const SCHEDULE_OPTIONS = [
  { value: "daily", label: "Daily", cron: "0 0 * * *" },
  { value: "weekly", label: "Weekly (Monday)", cron: "0 0 * * 1" },
  { value: "monthly", label: "Monthly (1st)", cron: "0 0 1 * *" },
];

export default function GitHubActionPage() {
  const [config, setConfig] = useState<ActionConfig>({
    repo: "",
    trigger: "tag",
    schedule: "weekly",
    format: "keepachangelog",
    days: 30,
    createPR: true,
    branch: "main",
  });
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);

  const generateWorkflow = () => {
    const scheduleCron = SCHEDULE_OPTIONS.find(s => s.value === config.schedule)?.cron || "0 0 * * 1";
    
    const triggerSection = {
      push: `push:\n    branches: [${config.branch}]`,
      tag: `push:\n    tags: ['v*']`,
      schedule: `schedule:\n    cron: '${scheduleCron}'`,
      manual: `workflow_dispatch:`,
    };

    return `# ReleaseFlow Changelog Generator
name: Update Changelog

on:
  ${triggerSection[config.trigger]}
  workflow_dispatch:
    inputs:
      days:
        description: 'Days to look back'
        required: false
        default: '${config.days}'

jobs:
  changelog:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
      - uses: actions/checkout@v4
        with:
          ref: ${config.branch}
          fetch-depth: 0

      - name: Generate Changelog
        id: changelog
        uses: releaseflow/changelog-action@v1
        with:
          repo: \${{ github.repository }}
          format: ${config.format}
          days: \${{ github.event.inputs.days || '${config.days}' }}

      - name: Create Pull Request
        if: \${{ hashFiles('CHANGELOG.md') != '' && '${config.createPR}' == 'true' }}
        uses: peter-evans/create-pull-request@v6
        with:
          commit-message: "docs: update changelog"
          title: "Changelog Update"
          body: "Automated changelog update"
          branch: changelog-update
          delete-branch: true
          token: \${{ secrets.GITHUB_TOKEN }}

      - name: Commit Changelog
        if: ${config.createPR} == 'false'
        run: |
          git config --local user.email "github-action[bot]@users.noreply.github.com"
          git config --local user.name "github-action[bot]"
          git add CHANGELOG.md
          git commit -m "docs: update changelog" || true
          git push`;
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generateWorkflow());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard" className="p-2 rounded-lg hover:bg-gray-100">
            <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">GitHub Action</h1>
            <p className="text-gray-600">Auto-generate changelog with GitHub Actions</p>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GithubIcon className="w-5 h-5" />
              Action Configuration
            </CardTitle>
            <CardDescription>
              Configure your GitHub Action workflow
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Repository
              </label>
              <Input
                placeholder="owner/repo (optional - uses GITHUB_REPO if empty)"
                value={config.repo}
                onChange={(e) => setConfig({ ...config, repo: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trigger
              </label>
              <div className="grid grid-cols-2 gap-2">
                {TRIGGER_OPTIONS.map((trigger) => (
                  <button
                    key={trigger.value}
                    onClick={() => setConfig({ ...config, trigger: trigger.value as any })}
                    className={`p-3 rounded-lg border text-left ${
                      config.trigger === trigger.value
                        ? "border-primary bg-primary/10"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="font-medium">{trigger.label}</div>
                    <div className="text-xs text-gray-500">{trigger.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {config.trigger === "schedule" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Schedule
                </label>
                <select
                  value={config.schedule}
                  onChange={(e) => setConfig({ ...config, schedule: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  {SCHEDULE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Format
                </label>
                <select
                  value={config.format}
                  onChange={(e) => setConfig({ ...config, format: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="default">Default</option>
                  <option value="keepachangelog">Keep a Changelog</option>
                  <option value="simple">Simple</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Days
                </label>
                <Input
                  type="number"
                  value={config.days}
                  onChange={(e) => setConfig({ ...config, days: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Branch
                </label>
                <Input
                  value={config.branch}
                  onChange={(e) => setConfig({ ...config, branch: e.target.value })}
                />
              </div>
              <div className="flex items-center pt-6">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={config.createPR}
                    onChange={(e) => setConfig({ ...config, createPR: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span>Create PR automatically</span>
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Generated Workflow</CardTitle>
              <CardDescription>
                Copy this to .github/workflows/changelog.yml
              </CardDescription>
            </div>
            <Button onClick={handleCopy}>
              {copied ? (
                <>
                  <CheckIcon className="w-4 h-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <CopyIcon className="w-4 h-4 mr-2" />
                  Copy
                </>
              )}
            </Button>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
              {generateWorkflow()}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}