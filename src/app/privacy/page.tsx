"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeftIcon,
  EyeOffIcon,
  FilterIcon,
  PlusIcon,
  TrashIcon,
  SaveIcon,
  CheckIcon,
} from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface PrivacyRule {
  id: string;
  type: "exclude" | "include";
  pattern: string;
  enabled: boolean;
}

const DEFAULT_PATTERNS: PrivacyRule[] = [
  { id: "0", type: "exclude", pattern: "wip", enabled: true },
  { id: "1", type: "exclude", pattern: "wip:", enabled: true },
  { id: "2", type: "exclude", pattern: "skip ci", enabled: true },
  { id: "3", type: "exclude", pattern: "merge", enabled: true },
];

export default function PrivacyPage() {
  const [rules, setRules] = useState<PrivacyRule[]>(DEFAULT_PATTERNS);
  const [newPattern, setNewPattern] = useState("");
  const [newType, setNewType] = useState<"exclude" | "include">("exclude");
  const [saved, setSaved] = useState(false);

  const addRule = () => {
    if (!newPattern) return;
    setRules([...rules, { id: Date.now().toString(), type: newType, pattern: newPattern, enabled: true }]);
    setNewPattern("");
  };

  const removeRule = (id: string) => {
    setRules(rules.filter(r => r.id !== id));
  };

  const toggleRule = (id: string) => {
    setRules(rules.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
  };

  const saveRules = () => {
    localStorage.setItem("rf_privacy_rules", JSON.stringify(rules));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const applyPrivacyFilter = (commits: string[]): string[] => {
    const activeRules = rules.filter(r => r.enabled);
    return commits.filter(commit => {
      const shouldInclude = activeRules.every(rule => {
        if (rule.type === "exclude") {
          return !commit.toLowerCase().includes(rule.pattern.toLowerCase());
        } else {
          return commit.toLowerCase().includes(rule.pattern.toLowerCase());
        }
      });
      return shouldInclude;
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard" className="p-2 rounded-lg hover:bg-gray-100">
            <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Privacy Control</h1>
            <p className="text-gray-600">Control which commits appear in changelogs</p>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <EyeOffIcon className="w-5 h-5" />
              Excluded Keywords
            </CardTitle>
            <CardDescription>
              Commits containing these keywords will be hidden
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
              >
                <option value="exclude">Exclude</option>
                <option value="include">Include only</option>
              </select>
              <Input
                placeholder="Keyword (e.g., wip, merge, skip)"
                value={newPattern}
                onChange={(e) => setNewPattern(e.target.value)}
                className="flex-1"
              />
              <Button onClick={addRule}>
                <PlusIcon className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-2 mt-4">
              {rules.filter(r => r.type === "exclude").map((rule) => (
                <div key={rule.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <button
                    onClick={() => toggleRule(rule.id)}
                    className={`w-10 h-6 rounded-full transition-colors ${
                      rule.enabled ? "bg-green-500" : "bg-gray-300"
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      rule.enabled ? "translate-x-4" : "translate-x-0.5"
                    }`} />
                  </button>
                  <span className="flex-1 font-mono">{rule.pattern}</span>
                  <Button variant="ghost" size="icon" onClick={() => removeRule(rule.id)}>
                    <TrashIcon className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Include-Only Patterns</CardTitle>
            <CardDescription>
              Only include commits matching these patterns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {rules.filter(r => r.type === "include").map((rule) => (
                <div key={rule.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <button
                    onClick={() => toggleRule(rule.id)}
                    className={`w-10 h-6 rounded-full transition-colors ${
                      rule.enabled ? "bg-green-500" : "bg-gray-300"
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      rule.enabled ? "translate-x-4" : "translate-x-0.5"
                    }`} />
                  </button>
                  <span className="flex-1 font-mono">{rule.pattern}</span>
                  <Button variant="ghost" size="icon" onClick={() => removeRule(rule.id)}>
                    <TrashIcon className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              ))}
              {rules.filter(r => r.type === "include").length === 0 && (
                <p className="text-gray-500 text-center py-4">
                  No include-only patterns. All commits will be included by default.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Preview</CardTitle>
              <CardDescription>
                See how privacy filters affect your commits
              </CardDescription>
            </div>
            <Button onClick={saveRules}>
              <SaveIcon className="w-4 h-4 mr-2" />
              {saved ? "Saved!" : "Save Rules"}
            </Button>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm">
              <p className="text-gray-400"># Sample with filters</p>
              <p>✨ feat(auth): add login - <span className="text-green-400">included</span></p>
              <p>🚧 wip: adding payment - <span className="text-red-400">excluded</span></p>
              <p>🐛 fix(ui): button - <span className="text-green-400">included</span></p>
              <p>📝 docs: readme - <span className="text-green-400">included</span></p>
              <p>🔀 merge main into branch - <span className="text-red-400">excluded</span></p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}