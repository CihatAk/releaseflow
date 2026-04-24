"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeftIcon,
  SettingsIcon,
  KeyIcon,
  SaveIcon,
  EyeIcon,
  EyeOffIcon,
  CheckIcon,
  BellIcon,
  PaletteIcon,
  GlobeIcon,
  LinkIcon,
  TrashIcon,
  Loader2Icon,
} from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface Settings {
  githubToken: string;
  defaultRepo: string;
  defaultFormat: string;
  defaultDays: number;
  autoPublish: boolean;
  notifyEmail: string;
  slackWebhook: string;
  discordWebhook: string;
}

const DEFAULT_SETTINGS: Settings = {
  githubToken: "",
  defaultRepo: "",
  defaultFormat: "default",
  defaultDays: 30,
  autoPublish: false,
  notifyEmail: "",
  slackWebhook: "",
  discordWebhook: "",
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [showToken, setShowToken] = useState(false);
  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const loadSettings = () => {
    const stored = localStorage.getItem("rf_settings");
    if (stored) {
      const parsed = JSON.parse(stored);
      setSettings({ ...DEFAULT_SETTINGS, ...parsed, githubToken: parsed.githubToken || "" });
    }
  };

  const saveSettings = () => {
    localStorage.setItem("rf_settings", JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const testGitHubToken = async () => {
    if (!settings.githubToken) return;
    
    setTesting(true);
    setTestResult(null);

    try {
      const response = await fetch("https://api.github.com/user", {
        headers: {
          Authorization: `Bearer ${settings.githubToken}`,
          Accept: "application/vnd.github.v3+json",
        },
      });

      if (response.ok) {
        const user = await response.json();
        setTestResult({
          success: true,
          message: `Connected as @${user.login}`,
        });
      } else {
        setTestResult({
          success: false,
          message: "Invalid token. Please check and try again.",
        });
      }
    } catch {
      setTestResult({
        success: false,
        message: "Connection failed. Please try again.",
      });
    }

    setTesting(false);
  };

  const clearAllData = () => {
    if (confirm("Are you sure you want to clear all settings and data?")) {
      localStorage.removeItem("rf_settings");
      localStorage.removeItem("rf_favorites");
      localStorage.removeItem("rf_custom_types");
      localStorage.removeItem("rf_watched_repos");
      localStorage.removeItem("rf_recent_activity");
      localStorage.removeItem("rf_publish_channels");
      localStorage.removeItem("rf_integrations");
      setSettings(DEFAULT_SETTINGS);
      window.location.reload();
    }
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
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600">Configure your ReleaseFlow preferences</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* GitHub Token */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <KeyIcon className="w-5 h-5" />
                GitHub Authentication
              </CardTitle>
              <CardDescription>
                Add your GitHub token to access private repos and create releases
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Input
                  type={showToken ? "text" : "password"}
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                  value={settings.githubToken}
                  onChange={(e) => updateSetting("githubToken", e.target.value)}
                  className="pr-12"
                />
                <button
                  onClick={() => setShowToken(!showToken)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showToken ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                </button>
              </div>

              <div className="flex gap-2">
                <Button onClick={testGitHubToken} disabled={!settings.githubToken || testing}>
                  {testing ? (
                    <>
                      <Loader2Icon className="w-4 h-4 mr-2 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    "Test Connection"
                  )}
                </Button>
                <Button variant="outline" onClick={saveSettings}>
                  <SaveIcon className="w-4 h-4 mr-2" />
                  {saved ? "Saved!" : "Save"}
                </Button>
              </div>

              {testResult && (
                <div
                  className={`p-3 rounded-lg ${
                    testResult.success ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                  }`}
                >
                  {testResult.success ? <CheckIcon className="w-4 h-4 inline mr-2" /> : null}
                  {testResult.message}
                </div>
              )}

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-700 mb-2">How to get a GitHub token:</h4>
                <ol className="text-sm text-blue-600 list-decimal list-inside space-y-1">
                  <li>Go to GitHub Settings → Developer settings → Personal access tokens</li>
                  <li>Generate new token (classic)</li>
                  <li>Select scopes: <code>repo</code>, <code>workflow</code></li>
                  <li>Copy the token and paste above</li>
                </ol>
              </div>
            </CardContent>
          </Card>

          {/* Default Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GlobeIcon className="w-5 h-5" />
                Default Settings
              </CardTitle>
              <CardDescription>
                Set default values for new changelog generations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Default Format
                  </label>
                  <select
                    value={settings.defaultFormat}
                    onChange={(e) => updateSetting("defaultFormat", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="default">Default</option>
                    <option value="keepachangelog">Keep a Changelog</option>
                    <option value="standardversion">Standard Version</option>
                    <option value="simple">Simple</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Default Days
                  </label>
                  <Input
                    type="number"
                    min={1}
                    max={365}
                    value={settings.defaultDays}
                    onChange={(e) => updateSetting("defaultDays", Number(e.target.value))}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Repository
                </label>
                <Input
                  placeholder="owner/repo"
                  value={settings.defaultRepo}
                  onChange={(e) => updateSetting("defaultRepo", e.target.value)}
                />
              </div>

              <Button onClick={saveSettings}>
                <SaveIcon className="w-4 h-4 mr-2" />
                {saved ? "Saved!" : "Save Defaults"}
              </Button>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BellIcon className="w-5 h-5" />
                Notifications
              </CardTitle>
              <CardDescription>
                Configure where to receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email (optional)
                </label>
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={settings.notifyEmail}
                  onChange={(e) => updateSetting("notifyEmail", e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Slack Webhook URL
                </label>
                <Input
                  placeholder="https://hooks.slack.com/services/..."
                  value={settings.slackWebhook}
                  onChange={(e) => updateSetting("slackWebhook", e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Discord Webhook URL
                </label>
                <Input
                  placeholder="https://discord.com/api/webhooks/..."
                  value={settings.discordWebhook}
                  onChange={(e) => updateSetting("discordWebhook", e.target.value)}
                />
              </div>

              <Button onClick={saveSettings}>
                <SaveIcon className="w-4 h-4 mr-2" />
                {saved ? "Saved!" : "Save Notifications"}
              </Button>
            </CardContent>
          </Card>

          {/* Auto Publish */}
          <Card>
            <CardHeader>
              <CardTitle>Auto Publish</CardTitle>
              <CardDescription>
                Automatically publish changelogs when generating
              </CardDescription>
            </CardHeader>
            <CardContent>
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={settings.autoPublish}
                  onChange={(e) => updateSetting("autoPublish", e.target.checked)}
                  className="w-5 h-5 rounded"
                />
                <span>Enable automatic publishing to configured channels</span>
              </label>
            </CardContent>
          </Card>

          {/* Clear Data */}
          <Card>
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="destructive" onClick={clearAllData}>
                <TrashIcon className="w-4 h-4 mr-2" />
                Clear All Data
              </Button>
              <p className="text-sm text-gray-500 mt-2">
                This will clear all settings, favorites, and cached data.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}