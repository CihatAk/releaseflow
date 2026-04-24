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
  Loader2Icon,
  SendIcon,
  MailIcon,
} from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface Integration {
  id: string;
  type: "slack" | "notion" | "linear" | "email" | "webhook";
  name: string;
  url: string;
  webhookUrl?: string;
  email?: string;
  apiKey?: string;
  enabled: boolean;
  autoUpdate: boolean;
  createdAt: string;
}

const INTEGRATIONS = [
  { id: "slack", name: "Slack", icon: "💬", color: "bg-[#4A154B]", desc: "Post changelogs to Slack channels" },
  { id: "notion", name: "Notion", icon: "📝", color: "bg-gray-900", desc: "Sync changelogs to Notion pages" },
  { id: "linear", name: "Linear", icon: "📏", color: "bg-[#5E6AD2]", desc: "Link issues and track progress" },
  { id: "email", name: "Email Digest", icon: "📧", color: "bg-blue-500", desc: "Weekly email subscriptions" },
  { id: "webhook", name: "Custom Webhook", icon: "🔗", color: "bg-green-500", desc: "Send to any HTTP endpoint" },
];

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedType, setSelectedType] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    url: "",
    webhookUrl: "",
    email: "",
    apiKey: "",
  });
  const [testing, setTesting] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadIntegrations = () => {
    const stored = localStorage.getItem("rf_integrations");
    if (stored) {
      setIntegrations(JSON.parse(stored));
    }
  };

  const saveIntegrations = async () => {
    setSaving(true);
    localStorage.setItem("rf_integrations", JSON.stringify(integrations));
    setSaved(true);
    setSaving(false);
    setTimeout(() => setSaved(false), 2000);
  };

  const addIntegration = () => {
    if (!formData.name) return;
    const newInt: Integration = {
      id: Date.now().toString(),
      type: selectedType as any,
      name: formData.name,
      url: formData.url || formData.webhookUrl,
      webhookUrl: formData.webhookUrl,
      email: formData.email,
      apiKey: formData.apiKey,
      enabled: true,
      autoUpdate: false,
      createdAt: new Date().toISOString(),
    };
    setIntegrations([...integrations, newInt]);
    setFormData({ name: "", url: "", webhookUrl: "", email: "", apiKey: "" });
    setShowAddForm(false);
    setSelectedType("");
  };

  const removeIntegration = (id: string) => {
    setIntegrations(integrations.filter((i) => i.id !== id));
  };

  const toggleEnabled = (id: string) => {
    setIntegrations(integrations.map((i) => (i.id === id ? { ...i, enabled: !i.enabled } : i)));
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
          <Link href="/dashboard" className="p-2 rounded-lg hover:bg-gray-100">
            <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Integrations</h1>
            <p className="text-gray-600">Connect Slack, Notion, Email, Webhooks and more</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3 mb-6">
          {(showAddForm ? INTEGRATIONS : INTEGRATIONS.filter(i => !integrations.find(e => e.type === i.id))).map((type) => (
            <Card key={type.id} className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => {
                setSelectedType(type.id);
                setShowAddForm(true);
              }}>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{type.icon}</span>
                  <CardTitle className="text-lg">{type.name}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">{type.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {showAddForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LinkIcon className="w-5 h-5" /> Add {INTEGRATIONS.find(i => i.id === selectedType)?.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Input
                  placeholder="Integration name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
                {selectedType === "email" ? (
                  <Input
                    placeholder="Subscriber email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                ) : (
                  <Input
                    placeholder="Webhook URL"
                    value={formData.url || formData.webhookUrl}
                    onChange={(e) => setFormData({ ...formData, webhookUrl: e.target.value })}
                  />
                )}
                {(selectedType === "linear" || selectedType === "notion") && (
                  <Input placeholder="API Key" type="password" value={formData.apiKey} onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })} />
                )}
                <div className="flex gap-2">
                  <Button onClick={addIntegration}><PlusIcon className="w-4 h-4 mr-2" />Add</Button>
                  <Button variant="outline" onClick={() => { setShowAddForm(false); setFormData({ name: "", url: "", webhookUrl: "", email: "", apiKey: "" }); }}>Cancel</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Connected Integrations</CardTitle>
              <CardDescription>{integrations.filter((i) => i.enabled).length} active</CardDescription>
            </div>
            <Button onClick={saveIntegrations} disabled={integrations.length === 0 || saving}>
              {saved ? <CheckIcon className="w-4 h-4 mr-2" /> : null}
              {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
            </Button>
          </CardHeader>
          <CardContent>
            {integrations.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No integrations connected. Add one above to get started.</p>
            ) : (
              <div className="space-y-3">
                {integrations.map((integration) => (
                  <div key={integration.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <input type="checkbox" checked={integration.enabled} onChange={() => toggleEnabled(integration.id)} className="h-4 w-4" />
                      <span className="font-medium">{integration.name}</span>
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">{integration.type}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => testConnection(integration.id)} disabled={testing === integration.id}>
                        {testing === integration.id ? <Loader2Icon className="h-4 w-4 animate-spin" /> : "Test"}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => removeIntegration(integration.id)}><TrashIcon className="h-4 w-4 text-red-500" /></Button>
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