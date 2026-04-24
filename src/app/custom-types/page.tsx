"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeftIcon,
  PlusIcon,
  TrashIcon,
  SaveIcon,
  RefreshIcon,
} from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface CustomType {
  type: string;
  label: string;
  icon: string;
}

const DEFAULT_TYPES: CustomType[] = [
  { type: "feat", label: "Features", icon: "✨" },
  { type: "fix", label: "Bug Fixes", icon: "🐛" },
  { type: "docs", label: "Documentation", icon: "📝" },
  { type: "style", label: "Styles", icon: "💄" },
  { type: "refactor", label: "Refactoring", icon: "♻️" },
  { type: "perf", label: "Performance", icon: "⚡️" },
  { type: "test", label: "Tests", icon: "✅" },
  { type: "build", label: "Build System", icon: "📦" },
  { type: "ci", label: "CI/CD", icon: "🔧" },
  { type: "chore", label: "Maintenance", icon: "🔨" },
  { type: "revert", label: "Reverts", icon: "⏪" },
  { type: "other", label: "Other", icon: "📌" },
];

export default function CustomTypesPage() {
  const [types, setTypes] = useState<CustomType[]>([]);
  const [saved, setSaved] = useState(false);
  const [newType, setNewType] = useState({ type: "", label: "", icon: "" });

  const loadTypes = () => {
    const stored = localStorage.getItem("rf_custom_types");
    if (stored) {
      setTypes(JSON.parse(stored));
    } else {
      setTypes(DEFAULT_TYPES);
    }
  };

  const saveTypes = () => {
    localStorage.setItem("rf_custom_types", JSON.stringify(types));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const addType = () => {
    if (newType.type && newType.label) {
      setTypes([...types, { ...newType, type: newType.type.toLowerCase() }]);
      setNewType({ type: "", label: "", icon: "" });
    }
  };

  const removeType = (type: string) => {
    setTypes(types.filter((t) => t.type !== type));
  };

  const updateType = (oldType: string, field: keyof CustomType, value: string) => {
    setTypes(
      types.map((t) =>
        t.type === oldType ? { ...t, [field]: value } : t
      )
    );
  };

  const resetToDefault = () => {
    setTypes(DEFAULT_TYPES);
    localStorage.removeItem("rf_custom_types");
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
            <h1 className="text-2xl font-bold text-gray-900">Custom Commit Types</h1>
            <p className="text-gray-600">Define custom prefixes and emoji mappings</p>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Add Custom Type</CardTitle>
            <CardDescription>
              Add a new commit type with custom label and emoji
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <Input
                placeholder="Type (e.g., security)"
                value={newType.type}
                onChange={(e) => setNewType({ ...newType, type: e.target.value })}
                className="w-full md:w-40"
              />
              <Input
                placeholder="Label (e.g., Security Fixes)"
                value={newType.label}
                onChange={(e) => setNewType({ ...newType, label: e.target.value })}
                className="flex-1"
              />
              <Input
                placeholder="Emoji (e.g., 🔐)"
                value={newType.icon}
                onChange={(e) => setNewType({ ...newType, icon: e.target.value })}
                className="w-24"
              />
              <Button onClick={addType} disabled={!newType.type || !newType.label}>
                <PlusIcon className="w-4 h-4 mr-2" />
                Add
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Your Custom Types</CardTitle>
              <CardDescription>
                {types.length} custom types defined
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={resetToDefault}>
                <RefreshIcon className="w-4 h-4 mr-2" />
                Reset
              </Button>
              <Button onClick={saveTypes}>
                <SaveIcon className="w-4 h-4 mr-2" />
                {saved ? "Saved!" : "Save"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {types.map((type) => (
                <div
                  key={type.type}
                  className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
                >
                  <Input
                    value={type.icon}
                    onChange={(e) => updateType(type.type, "icon", e.target.value)}
                    className="w-16 text-center"
                  />
                  <Input
                    value={type.type}
                    onChange={(e) => updateType(type.type, "type", e.target.value)}
                    className="w-32"
                  />
                  <Input
                    value={type.label}
                    onChange={(e) => updateType(type.type, "label", e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeType(type.type)}
                  >
                    <TrashIcon className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Usage</CardTitle>
            <CardDescription>
              How to use custom commit types in your commits
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm">
              <p className="text-gray-400"># Example commits</p>
              <p>security: add CSRF protection</p>
              <p>security(api): implement JWT validation</p>
              <p>analytics: add tracking events</p>
              <p className="mt-4 text-gray-400"># Result in changelog</p>
              <p className="text-yellow-400">🔐 Security Fixes</p>
              <p>- add CSRF protection</p>
              <p>- implement JWT validation</p>
              <p className="text-green-400">📊 Analytics</p>
              <p>- add tracking events</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}