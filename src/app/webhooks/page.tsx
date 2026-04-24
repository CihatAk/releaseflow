"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeftIcon,
  PlusIcon,
  TrashIcon,
  Loader2Icon,
  SendIcon,
  CheckIcon,
} from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface Webhook {
  id: string;
  name: string;
  url: string;
  type: "slack" | "discord" | "notion" | "webhook";
  events: string[];
  enabled: boolean;
  createdAt: string;
}

export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [form, setForm] = useState({
    name: "",
    url: "",
    type: "webhook" as "slack" | "discord" | "notion" | "webhook",
  });

  const loadWebhooks = async () => {
    try {
      const response = await fetch("/api/integrations/webhooks");
      const data = await response.json();
      if (data.webhooks) {
        setWebhooks(data.webhooks);
      }
    } catch (e) {
      console.error("Failed to load webhooks");
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem("rf_webhooks");
    if (stored) {
      setWebhooks(JSON.parse(stored));
    }
  }, []);

  const saveWebhook = () => {
    if (!form.name || !form.url) return;

    const newWebhook: Webhook = {
      id: `wh_${Date.now()}`,
      ...form,
      events: [form.type === "slack" ? "changelog.generated" : "changelog.published"],
      enabled: true,
      createdAt: new Date().toISOString(),
    };

    const updated = [...webhooks, newWebhook];
    setWebhooks(updated);
    localStorage.setItem("rf_webhooks", JSON.stringify(updated));
    setForm({ name: "", url: "", type: "webhook" });
    setShowForm(false);
  };

  const deleteWebhook = (id: string) => {
    const updated = webhooks.filter(w => w.id !== id);
    setWebhooks(updated);
    localStorage.setItem("rf_webhooks", JSON.stringify(updated));
  };

  const testWebhook = async (webhook: Webhook) => {
    setTesting(webhook.id);
    setTestResult(null);

    try {
      const payload = {
        event: "changelog.generated",
        timestamp: new Date().toISOString(),
        data: {
          repo: "owner/repo",
          version: "1.0.0",
          commits: 5,
        },
      };

      const response = await fetch(webhook.url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      setTestResult({
        success: response.ok,
        message: response.ok ? "Webhook delivered!" : "Failed to deliver",
      });
    } catch (error: any) {
      setTestResult({
        success: false,
        message: error.message || "Network error",
      });
    } finally {
      setTesting(null);
    }
  };

  const typeIcons: Record<string, string> = {
    slack: "💬",
    discord: "🎮",
    notion: "📝",
    webhook: "🔗",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard" className="p-2 rounded-lg hover:bg-gray-100">
            <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Webhook Manager</h1>
            <p className="text-gray-600">Configure outgoing webhooks</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 mb-6">
          {Object.entries(typeIcons).map(([type, icon]) => (
            <Card key={type} className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => { setForm({ ...form, type: type as any, name: type === "slack" ? "Slack" : type === "discord" ? "Discord" : "" }); setShowForm(true); }}>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{icon}</span>
                  <CardTitle className="text-lg capitalize">{type}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
                  {type === "slack" && "Send changelogs to Slack channels"}
                  {type === "discord" && "Post to Discord Webhook"}
                  {type === "notion" && "Sync to Notion pages"}
                  {type === "webhook" && "Send to any HTTP endpoint"}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {showForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Add {form.type} Webhook</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Webhook name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <Input
                placeholder={form.type === "slack" ? "Slack webhook URL" : "Discord webhook URL or custom URL"}
                value={form.url}
                onChange={(e) => setForm({ ...form, url: e.target.value })}
              />
              <div className="flex gap-2">
                <Button onClick={saveWebhook} disabled={!form.name || !form.url}>
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Webhook
                </Button>
                <Button variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Active Webhooks ({webhooks.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {webhooks.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No webhooks configured. Add one above to get started.
              </p>
            ) : (
              <div className="space-y-3">
                {webhooks.map((webhook) => (
                  <div key={webhook.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{typeIcons[webhook.type]}</span>
                      <div>
                        <p className="font-medium">{webhook.name}</p>
                        <p className="text-xs text-gray-500 font-mono">{webhook.url}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => testWebhook(webhook)}
                        disabled={testing === webhook.id}
                      >
                        {testing === webhook.id ? (
                          <Loader2Icon className="h-4 w-4 animate-spin" />
                        ) : (
                          <SendIcon className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteWebhook(webhook.id)}
                      >
                        <TrashIcon className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}