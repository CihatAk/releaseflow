"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeftIcon,
  LinkIcon,
  PlusIcon,
  TrashIcon,
  CheckIcon,
  BellIcon,
  WebhookIcon,
} from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface WebhookTrigger {
  id: string;
  repo: string;
  events: string[];
  webhookUrl: string;
  enabled: boolean;
}

const EVENTS = [
  { value: "push", label: "Push to branch", description: "Trigger on every push" },
  { value: "tag", label: "New tag", description: "Trigger when a tag is created" },
  { value: "release", label: "New release", description: "Trigger on new release" },
  { value: "pull_request", label: "PR merged", description: "Trigger when PR is merged" },
];

export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState<WebhookTrigger[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    repo: "",
    events: [] as string[],
    webhookUrl: "",
  });
  const [saved, setSaved] = useState(false);

  const addWebhook = () => {
    if (!form.repo || !form.webhookUrl || form.events.length === 0) return;

    const newWebhook: WebhookTrigger = {
      id: Date.now().toString(),
      repo: form.repo,
      events: form.events,
      webhookUrl: form.webhookUrl,
      enabled: true,
    };

    setWebhooks([...webhooks, newWebhook]);
    localStorage.setItem("rf_webhooks", JSON.stringify([...webhooks, newWebhook]));
    setForm({ repo: "", events: [], webhookUrl: "" });
    setShowForm(false);
  };

  const deleteWebhook = (id: string) => {
    const updated = webhooks.filter(w => w.id !== id);
    setWebhooks(updated);
    localStorage.setItem("rf_webhooks", JSON.stringify(updated));
  };

  const toggleWebhook = (id: string) => {
    const updated = webhooks.map(w => w.id === id ? { ...w, enabled: !w.enabled } : w);
    setWebhooks(updated);
    localStorage.setItem("rf_webhooks", JSON.stringify(updated));
  };

  const toggleEvent = (event: string) => {
    setForm(prev => ({
      ...prev,
      events: prev.events.includes(event)
        ? prev.events.filter(e => e !== event)
        : [...prev.events, event],
    }));
  };

  const testWebhook = async (url: string) => {
    try {
      await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: "test",
          message: "ReleaseFlow webhook test",
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (e) {
      console.error("Webhook test failed:", e);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard" className="p-2 rounded-lg hover:bg-gray-100">
            <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Webhook Triggers</h1>
            <p className="text-gray-600">Trigger webhooks on repo events</p>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PlusIcon className="w-5 h-5" />
              Add Webhook Trigger
            </CardTitle>
            <CardDescription>
              Configure when to trigger external webhooks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Repository
              </label>
              <Input
                placeholder="owner/repo"
                value={form.repo}
                onChange={(e) => setForm({ ...form, repo: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Events to trigger
              </label>
              <div className="grid grid-cols-2 gap-2">
                {EVENTS.map((event) => (
                  <button
                    key={event.value}
                    onClick={() => toggleEvent(event.value)}
                    className={`p-3 rounded-lg border text-left ${
                      form.events.includes(event.value)
                        ? "border-primary bg-primary/10"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="font-medium">{event.label}</div>
                    <div className="text-xs text-gray-500">{event.description}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Webhook URL
              </label>
              <Input
                placeholder="https://your-webhook-url.com/endpoint"
                value={form.webhookUrl}
                onChange={(e) => setForm({ ...form, webhookUrl: e.target.value })}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={addWebhook} disabled={!form.repo || !form.webhookUrl || form.events.length === 0}>
                <PlusIcon className="w-4 h-4 mr-2" />
                Add
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Active Webhooks ({webhooks.length})</CardTitle>
              <CardDescription>
                Configure your webhook triggers
              </CardDescription>
            </div>
            <Button onClick={() => setShowForm(true)} variant="outline">
              <PlusIcon className="w-4 h-4 mr-2" />
              Add Webhook
            </Button>
          </CardHeader>
          <CardContent>
            {webhooks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <WebhookIcon className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <p>No webhooks configured.</p>
                <p className="text-sm">Add one to get started.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {webhooks.map((webhook) => (
                  <div
                    key={webhook.id}
                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
                  >
                    <button
                      onClick={() => toggleWebhook(webhook.id)}
                      className={`w-10 h-6 rounded-full transition-colors ${
                        webhook.enabled ? "bg-green-500" : "bg-gray-300"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                          webhook.enabled ? "translate-x-4" : "translate-x-0.5"
                        }`}
                      />
                    </button>

                    <div className="flex-1">
                      <div className="font-medium">{webhook.repo}</div>
                      <div className="flex gap-2 mt-1">
                        {webhook.events.map((e) => (
                          <span
                            key={e}
                            className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded"
                          >
                            {EVENTS.find(ev => ev.value === e)?.label}
                          </span>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {webhook.webhookUrl}
                      </p>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => testWebhook(webhook.webhookUrl)}
                    >
                      <BellIcon className="w-4 h-4" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteWebhook(webhook.id)}
                    >
                      <TrashIcon className="w-4 h-4 text-red-500" />
                    </Button>
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