"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeftIcon, LinkIcon, CopyIcon, CheckIcon, ExternalLinkIcon } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const APPS = [
  { name: "Slack", logo: "https://logo.clearbit.com/slack.com", category: "Communication" },
  { name: "Discord", logo: "https://logo.clearbit.com/discord.com", category: "Communication" },
  { name: "Notion", logo: "https://logo.clearbit.com/notion.so", category: "Productivity" },
  { name: "Linear", logo: "https://logo.clearbit.com/linear.app", category: "Project Management" },
  { name: "Trello", logo: "https://logo.clearbit.com/trello.com", category: "Project Management" },
  { name: "Asana", logo: "https://logo.clearbit.com/asana.com", category: "Project Management" },
  { name: "Jira", logo: "https://logo.clearbit.com/atlassian.com", category: "Project Management" },
  { name: "GitHub", logo: "https://logo.clearbit.com/github.com", category: "Development" },
  { name: "Google Sheets", logo: "https://logo.clearbit.com/googlesheets.com", category: "Spreadsheets" },
  { name: "Airtable", logo: "https://logo.clearbit.com/airtable.com", category: "Database" },
  { name: "HubSpot", logo: "https://logo.clearbit.com/hubspot.com", category: "CRM" },
  { name: "Salesforce", logo: "https://logo.clearbit.com/salesforce.com", category: "CRM" },
];

export default function ZapierPage() {
  const [webhookUrl, setWebhookUrl] = useState("");
  const [selectedApps, setSelectedApps] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const toggleApp = (appName: string) => {
    setSelectedApps(prev =>
      prev.includes(appName)
        ? prev.filter(a => a !== appName)
        : [...prev, appName]
    );
  };

  const generateZapierWebhook = () => {
    const payload = {
      events: ["changelog_generated", "release_created"],
      data: {
        repo: "owner/repo",
        commits: [],
        markdown: "",
      },
    };
    return JSON.stringify(payload, null, 2);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generateZapierWebhook());
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
            <h1 className="text-2xl font-bold text-gray-900">Zapier/Make Integration</h1>
            <p className="text-gray-600">Connect with 5000+ apps via webhooks</p>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Webhook URL</CardTitle>
            <CardDescription>
              Enter your Zapier webhook URL to send changelogs to any app
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="https://hooks.zapier.com/hooks/catch/..."
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
            />
            <p className="text-sm text-gray-500 mt-2">
              Create a Zap at Zapier.com with "Catch Hook" as the trigger
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Connect Apps</CardTitle>
            <CardDescription>
              Select apps to create quick integrations for
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {APPS.map((app) => (
                <button
                  key={app.name}
                  onClick={() => toggleApp(app.name)}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                    selectedApps.includes(app.name)
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <img src={app.logo} className="w-6 h-6 rounded" alt={app.name} />
                  <span className="text-sm font-medium">{app.name}</span>
                  {selectedApps.includes(app.name) && (
                    <CheckIcon className="w-4 h-4 text-blue-500 ml-auto" />
                  )}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Webhook Payload</CardTitle>
              <CardDescription>
                The JSON payload sent to your webhook
              </CardDescription>
            </div>
            <Button onClick={handleCopy} variant="outline">
              {copied ? <CheckIcon className="w-4 h-4 mr-2" /> : <CopyIcon className="w-4 h-4 mr-2" />}
              {copied ? "Copied!" : "Copy"}
            </Button>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
              {generateZapierWebhook()}
            </pre>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Start</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4 p-3 border rounded-lg">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">1</div>
              <div>
                <p className="font-medium">Create Zap at Zapier</p>
                <p className="text-sm text-gray-500">Go to Zapier.com and create a new Zap</p>
              </div>
            </div>
            <div className="flex gap-4 p-3 border rounded-lg">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">2</div>
              <div>
                <p className="font-medium">Choose "Catch Hook"</p>
                <p className="text-sm text-gray-500">Use as the trigger event</p>
              </div>
            </div>
            <div className="flex gap-4 p-3 border rounded-lg">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">3</div>
              <div>
                <p className="font-medium">Copy webhook URL</p>
                <p className="text-sm text-gray-500">Paste the URL above</p>
              </div>
            </div>
            <div className="flex gap-4 p-3 border rounded-lg">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">4</div>
              <div>
                <p className="font-medium">Send to Slack, Email, etc.</p>
                <p className="text-sm text-gray-500">Add any action you want</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}