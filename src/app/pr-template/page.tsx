"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CopyIcon, DownloadIcon, CheckIcon } from "@/components/ui/icons";

const TEMPLATES = {
  conventional: `## Type
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Description
<!-- Describe your changes -->

## Related Issues
<!-- Closes #123 -->

## Testing
- [ ] Unit tests added
- [ ] Manual testing done

## Checklist
- [ ] Code follows project conventions
- [ ] Self-reviewed before commit`,

  simple: `# Description

## Changes

## Testing

## Checklist
- [ ] Tested locally
- [ ] No console errors`,

  detailed: `# Pull Request Template

## Summary
<!-- Brief summary of changes -->

## Type of Change
- [ ] Feature
- [ ] Bug Fix
- [ ] Refactor
- [ ] Documentation
- [ ] Chore

## How Has This Been Tested?
<!-- Describe testing performed -->

## Screenshots (if applicable)

## Checklist
- [ ] My code follows the style guidelines
- [ ] I have performed a self-review
- [ ] I have commented my code where necessary
- [ ] I have updated documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective
- [ ] New and existing unit tests pass`,
};

export default function PRTemplatePage() {
  const [template, setTemplate] = useState("conventional");
  const [customTemplate, setCustomTemplate] = useState("");
  const [repo, setRepo] = useState("");
  const [copied, setCopied] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const activeTemplate = customTemplate || TEMPLATES[template as keyof typeof TEMPLATES];

  const copyToClipboard = () => {
    navigator.clipboard.writeText(activeTemplate);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadFile = async () => {
    const blob = new Blob([activeTemplate], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "PULL_REQUEST_TEMPLATE.md";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2000);
  };

  const createInRepo = async () => {
    if (!repo) return;
    alert(`Configure your repo at ${repo} to use this template. Add .github/pull_request_template.md`);
  };

  return (
    <div className="container mx-auto min-h-screen max-w-4xl px-4 py-12">
      <Link href="/dashboard">
        <Button variant="ghost" size="sm" className="mb-4">
          ← Back to Dashboard
        </Button>
      </Link>

      <h1 className="text-3xl font-bold">PR Template Generator</h1>
      <p className="mt-2 text-muted-foreground">
        Generate pull request templates for your repository
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Choose Template</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.keys(TEMPLATES).map((key) => (
                <label key={key} className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50">
                  <input
                    type="radio"
                    name="template"
                    value={key}
                    checked={template === key && !customTemplate}
                    onChange={() => {
                      setTemplate(key);
                      setCustomTemplate("");
                    }}
                    className="h-4 w-4"
                  />
                  <span className="capitalize">{key}</span>
                </label>
              ))}
              <label className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50">
                <input
                  type="radio"
                  name="template"
                  value="custom"
                  checked={!!customTemplate}
                  onChange={() => setTemplate("custom")}
                  className="h-4 w-4"
                />
                <span>Custom</span>
              </label>
            </CardContent>
          </Card>

          {template === "custom" && (
            <Card>
              <CardHeader>
                <CardTitle>Custom Template</CardTitle>
              </CardHeader>
              <CardContent>
                <textarea
                  value={customTemplate}
                  onChange={(e) => setCustomTemplate(e.target.value)}
                  placeholder="Write your custom PR template..."
                  className="min-h-[200px] w-full rounded-lg border bg-background p-3 text-sm"
                />
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Add to Repository</CardTitle>
              <CardDescription>GitHub username/repository</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                placeholder="e.g., username/my-repo"
                value={repo}
                onChange={(e) => setRepo(e.target.value)}
              />
              <Button onClick={createInRepo} disabled={!repo}>
                <DownloadIcon className="mr-2 h-4 w-4" />
                Save to GitHub
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="max-h-[400px] overflow-auto rounded-lg bg-muted p-4 text-xs">
                {activeTemplate}
              </pre>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button onClick={copyToClipboard} className="flex-1">
              {copied ? (
                <>
                  <CheckIcon className="mr-2 h-4 w-4" />
                  Copied!
                </>
              ) : (
                <>
                  <CopyIcon className="mr-2 h-4 w-4" />
                  Copy Template
                </>
              )}
            </Button>
            <Button variant="outline" onClick={downloadFile}>
              {downloadSuccess ? (
                <CheckIcon className="h-4 w-4" />
              ) : (
                <DownloadIcon className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}