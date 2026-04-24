"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeftIcon,
  LinkIcon,
  PlusIcon,
  TrashIcon,
  CheckIcon,
  ExternalLinkIcon,
  RefreshIcon,
  SettingsIcon,
  Loader2Icon,
} from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface Integration {
  id: string;
  type: "jira" | "linear";
  name: string;
  url: string;
  apiKey?: string;
  projectKey?: string;
  enabled: boolean;
  autoUpdate: boolean;
  createdAt: string;
}

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newIntegration, setNewIntegration] = useState({
    type: "jira" as "jira" | "linear",
    name: "",
    url: "",
    apiKey: "",
    projectKey: "",
  });
  const [testing, setTesting] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const loadIntegrations = () => {
    const stored = localStorage.getItem("rf_integrations");
    if (stored) {
      setIntegrations(JSON.parse(stored));
    }
  };

  const saveIntegrations = () => {
    localStorage.setItem("rf_integrations", JSON.stringify(integrations));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const addIntegration = () => {
    if (!newIntegration.name || !newIntegration.url) return;

    setIntegrations([
      ...integrations,
      {
        ...newIntegration,
        id: Date.now().toString(),
        enabled: true,
        autoUpdate: false,
        createdAt: new Date().toISOString(),
      },
    ]);
    setNewIntegration({
      type: "jira",
      name: "",
      url: "",
      apiKey: "",
      projectKey: "",
    });
    setShowAddForm(false);
  };

  const removeIntegration = (id: string) => {
    setIntegrations(integrations.filter((i) => i.id !== id));
  };

  const toggleEnabled = (id: string) => {
    setIntegrations(
      integrations.map((i) =>
        i.id === id ? { ...i, enabled: !i.enabled } : i
      )
    );
  };

  const toggleAutoUpdate = (id: string) => {
    setIntegrations(
      integrations.map((i) =>
        i.id === id ? { ...i, autoUpdate: !i.autoUpdate } : i
      )
    );
  };

  const testConnection = async (id: string) => {
    setTesting(id);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setTesting(null);
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
            <h1 className="text-2xl font-bold text-gray-900">Integrations</h1>
            <p className="text-gray-600">Connect Jira, Linear, and other issue trackers</p>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LinkIcon className="w-5 h-5" />
              Add Integration
            </CardTitle>
            <CardDescription>
              Connect your issue tracker to link commits with issues
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!showAddForm ? (
              <Button onClick={() => setShowAddForm(true)}>
                <PlusIcon className="w-4 h-4 mr-2" />
                Add Integration
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Button
                    variant={newIntegration.type === "jira" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setNewIntegration({ ...newIntegration, type: "jira" })}
                  >
                    Jira
                  </Button>
                  <Button
                    variant={newIntegration.type === "linear" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setNewIntegration({ ...newIntegration, type: "linear" })}
                  >
                    Linear
                  </Button>
                </div>

                <Input
                  placeholder="Integration name"
                  value={newIntegration.name}
                  onChange={(e) =>
                    setNewIntegration({ ...newIntegration, name: e.target.value })
                  }
                />
                <Input
                  placeholder={`${newIntegration.type === "jira" ? "Jira" : "Linear"} URL`}
                  value={newIntegration.url}
                  onChange={(e) =>
                    setNewIntegration({ ...newIntegration, url: e.target.value })
                  }
                />
                <Input
                  placeholder="API Key (for Linear) or Personal Access Token (for Jira)"
                  type="password"
                  value={newIntegration.apiKey}
                  onChange={(e) =>
                    setNewIntegration({ ...newIntegration, apiKey: e.target.value })
                  }
                />
                {newIntegration.type === "jira" && (
                  <Input
                    placeholder="Project Key (e.g., PROJ)"
                    value={newIntegration.projectKey}
                    onChange={(e) =>
                      setNewIntegration({
                        ...newIntegration,
                        projectKey: e.target.value,
                      })
                    }
                  />
                )}

                <div className="flex gap-2">
                  <Button onClick={addIntegration}>
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Add
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowAddForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Connected Integrations</CardTitle>
              <CardDescription>
                {integrations.filter((i) => i.enabled).length} active •{" "}
                {integrations.length} total
              </CardDescription>
            </div>
            <Button
              onClick={saveIntegrations}
              disabled={integrations.length === 0}
            >
              {saved ? "Saved!" : "Save Changes"}
            </Button>
          </CardHeader>
          <CardContent>
            {integrations.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No integrations connected. Add one above to get started.
              </p>
            ) : (
              <div className="space-y-3">
                {integrations.map((integration) => (
                  <div
                    key={integration.id}
                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
                  >
                    <button
                      onClick={() => toggleEnabled(integration.id)}
                      className={`w-10 h-6 rounded-full transition-colors ${
                        integration.enabled ? "bg-green-500" : "bg-gray-300"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                          integration.enabled ? "translate-x-4" : "translate-x-0.5"
                        }`}
                      />
                    </button>

                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{integration.name}</span>
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                          {integration.type.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">{integration.url}</p>
                    </div>

                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={integration.autoUpdate}
                        onChange={() => toggleAutoUpdate(integration.id)}
                        className="rounded"
                      />
                      Auto-update
                    </label>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => testConnection(integration.id)}
                      disabled={testing === integration.id}
                    >
                      {testing === integration.id ? (
                        <Loader2Icon className="w-4 h-4 animate-spin" />
                      ) : (
                        <RefreshIcon className="w-4 h-4" />
                      )}
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeIntegration(integration.id)}
                    >
                      <TrashIcon className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

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
                  <p className="font-medium">Connect your tracker</p>
                  <p className="text-sm">
                    Add Jira or Linear API credentials
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                  2
                </div>
                <div>
                  <p className="font-medium">Generate changelog</p>
                  <p className="text-sm">
                    Commits are linked to issues automatically
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                  3
                </div>
                <div>
                  <p className="font-medium">Auto-update status</p>
                  <p className="text-sm">
                    Optionally update issue status when merged
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm">
              <p className="text-gray-400"># Commit message with issue reference</p>
              <p>feat(auth): add OAuth2 login (PROJ-123)</p>
              <p className="mt-2 text-gray-400"># Result</p>
              <p>- Add OAuth2 login (PROJ-123)</p>
              <p>  - Links to PROJ-123 in Jira</p>
              <p>  - Updates status: Done</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}