"use client";

import { useState, useEffect } from "react";
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
import {
  AIProvider,
  AI_PROVIDERS,
  AISettings,
  getAISettings,
  saveAISettings,
} from "@/lib/ai-providers";

interface AIProviderConfig {
  apiKey: string;
  model?: string;
  baseURL?: string;
}

interface Settings {
  githubToken: string;
  defaultRepo: string;
  defaultFormat: string;
  defaultDays: number;
  autoPublish: boolean;
  notifyEmail: string;
  slackWebhook: string;
  discordWebhook: string;
  aiActiveProvider: string;
  aiProviders: Record<string, AIProviderConfig>;
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
  aiActiveProvider: "openai",
  aiProviders: {},
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [showToken, setShowToken] = useState(false);
  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  
  // AI Settings
  const [aiSettings, setAiSettings] = useState<AISettings>({
    activeProvider: 'openai',
    providers: {},
  });
  const [showApiKeys, setShowApiKeys] = useState<Record<string, boolean>>({});
  const [aiTestResult, setAiTestResult] = useState<{ provider: string; success: boolean; message: string } | null>(null);
  const [testingAi, setTestingAi] = useState<string | null>(null);
  const [visibleAIKeys, setVisibleAIKeys] = useState<Record<string, boolean>>({});
  const [aiTesting, setAiTesting] = useState<string | null>(null);
  const [aiTestResults, setAiTestResults] = useState<Record<string, { success: boolean; message: string }>>({});

  useEffect(() => {
    loadSettings();
    loadAISettings();
  }, []);

  const loadSettings = () => {
    const stored = localStorage.getItem("rf_settings");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setSettings({
          ...DEFAULT_SETTINGS,
          ...parsed,
          githubToken: parsed.githubToken || "",
          aiActiveProvider: parsed.aiActiveProvider || "openai",
          aiProviders: parsed.aiProviders || {},
        });
      } catch {
        // ignore corrupt settings
      }
    }
  };

  const loadAISettings = () => {
    const stored = getAISettings();
    setAiSettings(stored);
  };

  const saveSettings = () => {
    localStorage.setItem("rf_settings", JSON.stringify(settings));
    saveAISettings(aiSettings);
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

  const updateAIProvider = (providerId: string, patch: Partial<AIProviderConfig>) => {
    setSettings((prev) => ({
      ...prev,
      aiProviders: {
        ...prev.aiProviders,
        [providerId]: { ...(prev.aiProviders[providerId] || { apiKey: "" }), ...patch },
      },
    }));
  };

  const removeAIProvider = (providerId: string) => {
    setSettings((prev) => {
      const next = { ...prev.aiProviders };
      delete next[providerId];
      return { ...prev, aiProviders: next };
    });
    setAiTestResults((prev) => {
      const next = { ...prev };
      delete next[providerId];
      return next;
    });
  };

  const testAIProvider = async (providerId: string) => {
    const cfg = settings.aiProviders[providerId];
    const meta = AI_PROVIDERS[providerId as AIProvider];
    if (!cfg?.apiKey) return;

    setAiTesting(providerId);
    setAiTestResults((prev) => ({ ...prev, [providerId]: { success: false, message: "" } }));

    try {
      const baseURL = cfg.baseURL || meta?.baseUrl;
      if (!baseURL) throw new Error("Base URL required");
      const res = await fetch(`${baseURL.replace(/\/$/, "")}/models`, {
        headers: { Authorization: `Bearer ${cfg.apiKey}` },
      });
      if (res.ok) {
        setAiTestResults((prev) => ({
          ...prev,
          [providerId]: { success: true, message: "API key is valid" },
        }));
      } else {
        setAiTestResults((prev) => ({
          ...prev,
          [providerId]: { success: false, message: `Invalid key (HTTP ${res.status})` },
        }));
      }
    } catch (err) {
      setAiTestResults((prev) => ({
        ...prev,
        [providerId]: {
          success: false,
          message: err instanceof Error ? err.message : "Request failed",
        },
      }));
    }

    setAiTesting(null);
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
      localStorage.removeItem("rf_ai_settings");
      setSettings(DEFAULT_SETTINGS);
      setAiSettings({ activeProvider: 'openai', providers: {} });
      window.location.reload();
    }
  };

  const updateAIProviderSetting = (provider: AIProvider, apiKey: string) => {
    setAiSettings((prev) => ({
      ...prev,
      providers: {
        ...prev.providers,
        [provider]: {
          ...prev.providers[provider],
          apiKey,
        },
      },
    }));
  };

  const updateAIModel = (provider: AIProvider, model: string) => {
    setAiSettings((prev) => ({
      ...prev,
      providers: {
        ...prev.providers,
        [provider]: {
          ...prev.providers[provider],
          model,
        },
      },
    }));
  };

  const setActiveProvider = (provider: AIProvider) => {
    setAiSettings((prev) => ({
      ...prev,
      activeProvider: provider,
    }));
  };

  const testAIProviderApi = async (provider: AIProvider) => {
    const providerSettings = aiSettings.providers[provider];
    if (!providerSettings?.apiKey) return;

    setTestingAi(provider);
    setAiTestResult(null);

    try {
      const config = AI_PROVIDERS[provider];
      const response = await fetch('/api/ai/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          apiKey: providerSettings.apiKey,
          model: providerSettings.model || config.defaultModel,
        }),
      });

      const result = await response.json();
      setAiTestResult({
        provider,
        success: result.success,
        message: result.message,
      });
    } catch {
      setAiTestResult({
        provider,
        success: false,
        message: 'Connection failed. Please try again.',
      });
    }

    setTestingAi(null);
  };

  const toggleApiKeyVisibility = (provider: string) => {
    setShowApiKeys((prev) => ({
      ...prev,
      [provider]: !prev[provider],
    }));
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

          {/* AI API Keys */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SettingsIcon className="w-5 h-5" />
                AI Provider Settings
              </CardTitle>
              <CardDescription>
                Configure your AI provider API keys for changelog generation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Active Provider Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Active Provider
                </label>
                <select
                  value={aiSettings.activeProvider}
                  onChange={(e) => setActiveProvider(e.target.value as AIProvider)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  {Object.values(AI_PROVIDERS).map((provider) => (
                    <option key={provider.id} value={provider.id}>
                      {provider.name} - {provider.description}
                    </option>
                  ))}
                </select>
              </div>

              {/* Provider API Keys */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">API Keys</h4>
                {Object.values(AI_PROVIDERS).map((provider) => {
                  const providerSettings = aiSettings.providers[provider.id];
                  const isActive = aiSettings.activeProvider === provider.id;
                  
                  return (
                    <div 
                      key={provider.id} 
                      className={`p-4 rounded-lg border ${isActive ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{provider.name}</span>
                          {isActive && (
                            <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded">Active</span>
                          )}
                        </div>
                        {providerSettings?.apiKey && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => testAIProviderApi(provider.id)}
                            disabled={testingAi === provider.id}
                          >
                            {testingAi === provider.id ? (
                              <>
                                <Loader2Icon className="w-3 h-3 mr-1 animate-spin" />
                                Testing...
                              </>
                            ) : (
                              'Test'
                            )}
                          </Button>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mb-3">{provider.description}</p>
                      
                      <div className="space-y-3">
                        <div className="relative">
                          <Input
                            type={showApiKeys[provider.id] ? "text" : "password"}
                            placeholder={provider.placeholder}
                            value={providerSettings?.apiKey || ''}
                            onChange={(e) => updateAIProviderSetting(provider.id, e.target.value)}
                            className="pr-12"
                          />
                          <button
                            onClick={() => toggleApiKeyVisibility(provider.id)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                          >
                            {showApiKeys[provider.id] ? (
                              <EyeOffIcon className="w-4 h-4" />
                            ) : (
                              <EyeIcon className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                        
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Model</label>
                          <select
                            value={providerSettings?.model || provider.defaultModel}
                            onChange={(e) => updateAIModel(provider.id, e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                          >
                            {provider.models.map((model) => (
                              <option key={model} value={model}>
                                {model}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {aiTestResult && aiTestResult.provider === provider.id && (
                        <div
                          className={`mt-3 p-2 rounded text-sm ${
                            aiTestResult.success ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                          }`}
                        >
                          {aiTestResult.success ? <CheckIcon className="w-3 h-3 inline mr-1" /> : null}
                          {aiTestResult.message}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <Button onClick={saveSettings}>
                <SaveIcon className="w-4 h-4 mr-2" />
                {saved ? "Saved!" : "Save AI Settings"}
              </Button>

              <div className="bg-amber-50 p-4 rounded-lg">
                <h4 className="font-medium text-amber-700 mb-2">Important:</h4>
                <ul className="text-sm text-amber-600 list-disc list-inside space-y-1">
                  <li>API keys are stored locally in your browser</li>
                  <li>Keys are sent securely to our server only when making AI requests</li>
                  <li>We never store your API keys on our servers</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* AI Providers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <KeyIcon className="w-5 h-5" />
                AI Providers
              </CardTitle>
              <CardDescription>
                Add your own API keys for any OpenAI-compatible provider (OpenAI, Groq, DeepSeek, OpenRouter, Together, Mistral, xAI, Cerebras, Fireworks, or a custom endpoint). Keys are stored only in your browser.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Active Provider
                </label>
                <select
                  value={settings.aiActiveProvider}
                  onChange={(e) => updateSetting("aiActiveProvider", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  {Object.values(AI_PROVIDERS).map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                      {settings.aiProviders[p.id]?.apiKey ? " ✓" : ""}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  The selected provider will be used for AI features (commit analysis, version suggestions, etc.).
                </p>
              </div>

              <div className="space-y-4">
                {Object.values(AI_PROVIDERS).map((provider) => {
                  const cfg = settings.aiProviders[provider.id] || { apiKey: "" };
                  const isActive = settings.aiActiveProvider === provider.id;
                  const show = visibleAIKeys[provider.id];
                  const result = aiTestResults[provider.id];
                  return (
                    <div
                      key={provider.id}
                      className={`border rounded-lg p-4 space-y-3 ${
                        isActive ? "border-blue-400 bg-blue-50/30" : "border-gray-200"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">{provider.name}</span>
                          {isActive && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                              Active
                            </span>
                          )}
                          {cfg.apiKey && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                              Configured
                            </span>
                          )}
                        </div>
                          {provider.baseUrl && (
                          <a
                            href={provider.baseUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline"
                          >
                            API Docs →
                          </a>
                        )}
                      </div>

                      <div className="relative">
                        <Input
                          type={show ? "text" : "password"}
                          placeholder={`${provider.name} API key`}
                          value={cfg.apiKey}
                          onChange={(e) => updateAIProvider(provider.id, { apiKey: e.target.value })}
                          className="pr-12"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setVisibleAIKeys((prev) => ({ ...prev, [provider.id]: !prev[provider.id] }))
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                        >
                          {show ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Model</label>
                          {provider.models ? (
                            <select
                              value={cfg.model || provider.defaultModel}
                              onChange={(e) => updateAIProvider(provider.id, { model: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            >
                              {provider.models.map((m) => (
                                <option key={m} value={m}>
                                  {m}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <Input
                              placeholder={provider.defaultModel || "model-name"}
                              value={cfg.model || ""}
                              onChange={(e) => updateAIProvider(provider.id, { model: e.target.value })}
                            />
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => testAIProvider(provider.id)}
                          disabled={!cfg.apiKey || aiTesting === provider.id}
                        >
                          {aiTesting === provider.id ? (
                            <>
                              <Loader2Icon className="w-3 h-3 mr-2 animate-spin" />
                              Testing...
                            </>
                          ) : (
                            "Test"
                          )}
                        </Button>
                        {!isActive && cfg.apiKey && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateSetting("aiActiveProvider", provider.id)}
                          >
                            Set as active
                          </Button>
                        )}
                        {cfg.apiKey && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeAIProvider(provider.id)}
                          >
                            <TrashIcon className="w-3 h-3 mr-1" />
                            Remove
                          </Button>
                        )}
                      </div>

                      {result && result.message && (
                        <div
                          className={`text-xs p-2 rounded ${
                            result.success
                              ? "bg-green-50 text-green-700"
                              : "bg-red-50 text-red-700"
                          }`}
                        >
                          {result.success ? <CheckIcon className="w-3 h-3 inline mr-1" /> : null}
                          {result.message}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <Button onClick={saveSettings}>
                <SaveIcon className="w-4 h-4 mr-2" />
                {saved ? "Saved!" : "Save AI Providers"}
              </Button>
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
