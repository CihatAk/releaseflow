"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeftIcon, GripIcon, CheckIcon, TrashIcon, ArrowUpIcon, ArrowDownIcon } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface CommitItem {
  id: string;
  message: string;
  type: string;
  sha: string;
}

export default function DragDropPage() {
  const [commits, setCommits] = useState<CommitItem[]>([
    { id: "1", message: "feat(auth): add OAuth2 login", type: "feat", sha: "abc123" },
    { id: "2", message: "fix(ui): button hover state", type: "fix", sha: "def456" },
    { id: "3", message: "feat(api): rate limiting", type: "feat", sha: "ghi789" },
    { id: "4", message: "docs: update README", type: "docs", sha: "jkl012" },
    { id: "5", message: "perf: optimize queries", type: "perf", sha: "mno345" },
    { id: "6", message: "refactor: clean up code", type: "refactor", sha: "pqr678" },
  ]);
  const [dragged, setDragged] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);

  const moveCommit = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    const newCommits = [...commits];
    const [moved] = newCommits.splice(fromIndex, 1);
    newCommits.splice(toIndex, 0, moved);
    setCommits(newCommits);
    setDragged(null);
    setDragOver(null);
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDragged(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOver(index);
  };

  const handleDragEnd = () => {
    setDragged(null);
    setDragOver(null);
  };

  const handleDrop = (e: React.DragEvent, toIndex: number) => {
    e.preventDefault();
    const fromIndex = parseInt(e.dataTransfer.getData("text/plain"));
    if (!isNaN(fromIndex)) {
      moveCommit(fromIndex, toIndex);
    }
  };

  const moveUp = (index: number) => {
    if (index > 0) moveCommit(index, index - 1);
  };

  const moveDown = (index: number) => {
    if (index < commits.length - 1) moveCommit(index, index + 1);
  };

  const removeCommit = (id: string) => {
    setCommits(commits.filter(c => c.id !== id));
  };

  const TYPE_COLORS: { [key: string]: string } = {
    feat: "bg-green-500",
    fix: "bg-blue-500",
    docs: "bg-yellow-500",
    refactor: "bg-purple-500",
    perf: "bg-red-500",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard" className="p-2 rounded-lg hover:bg-gray-100">
            <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Drag & Drop Editor</h1>
            <p className="text-gray-600">Reorder commits manually by dragging</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Commit Order</CardTitle>
            <CardDescription>
              Drag to reorder commits or use arrow buttons. Click generate to create final changelog.
            </CardDescription>
          </CardHeader>
          <CardContent>
              <div className="space-y-2">
                {commits.map((commit, index) => (
                  <div
                    key={commit.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                    onDrop={(e) => handleDrop(e, index)}
                    className={`flex items-center gap-3 p-3 bg-gray-50 rounded-lg transition-all ${
                      dragged === index ? "opacity-50 scale-95" : "hover:bg-gray-100"
                    } ${dragOver === index ? "border-2 border-blue-500 bg-blue-50" : ""}`}
                >
                  <div className="cursor-move text-gray-400">
                    <GripIcon className="w-5 h-5" />
                  </div>
                  
                  <span className="w-8 text-center font-mono text-xs text-gray-400">
                    {index + 1}
                  </span>

                  <div className={`w-3 h-3 rounded-full ${TYPE_COLORS[commit.type]}`} />

                  <span className="flex-1 font-mono text-sm truncate">
                    {commit.message}
                  </span>

                  <span className="text-xs text-gray-400 font-mono">
                    {commit.sha}
                  </span>

                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => moveUp(index)}
                      disabled={index === 0}
                    >
                      <ArrowUpIcon className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => moveDown(index)}
                      disabled={index === commits.length - 1}
                    >
                      <ArrowDownIcon className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCommit(commit.id)}
                    >
                      <TrashIcon className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {commits.length === 0 && (
              <p className="text-center py-8 text-gray-500">
                No commits to display. Add some commits to get started.
              </p>
            )}

            <div className="flex gap-2 mt-4 pt-4 border-t">
              <Button disabled={commits.length === 0}>
                <CheckIcon className="w-4 h-4 mr-2" />
                Generate Changelog
              </Button>
              <Button variant="outline" onClick={() => setCommits([])}>
                Clear All
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm whitespace-pre-wrap">
{`# Changelog

${commits.map(c => {
  const icon = c.type === "feat" ? "✨" : c.type === "fix" ? "🐛" : c.type === "perf" ? "⚡" : c.type === "refactor" ? "♻️" : "📝";
  return `- ${icon} **${c.type}:** ${c.message.replace(/^[^:]+:\s*/, "")} (\`${c.sha}\`)`;
}).join("\n")}

---
Generated with ReleaseFlow`}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}