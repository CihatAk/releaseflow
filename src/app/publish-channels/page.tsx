"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeftIcon,
  SendIcon,
  PlusIcon,
  TrashIcon,
  CheckIcon,
  Loader2Icon,
  LinkIcon,
  MailIcon,
  MessageSquareIcon,
} from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface Channel {
  id: string;
  type: "slack" | "discord" | "email" | "webhook";
  name: string;
  url: string;
  enabled: boolean;
  createdAt: string;
}

export default function PublishChannelsPage() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newChannel, setNewChannel] = useState({
    type: "slack" as "slack" | "discord" | "email" | "webhook",
    name: "",
    url: "",
  });
  const [publishing, setPublishing] = useState(false);
  const [publishStatus, setPublishStatus] = useState<{
    [key: string]: { success: boolean; message: string };
  } | null>(null);

  const loadChannels = () => {
    const stored = localStorage.getItem("rf_publish_channels");
    if (stored) {
      setChannels(JSON.parse(stored));
    }
  };

  const saveChannels = () => {
    localStorage.setItem("rf_publish_channels", JSON.stringify(channels));
  };

  const addChannel = () => {
    if (!newChannel.name || !newChannel.url) return;

    setChannels([
      ...channels,
      {
        ...newChannel,
        id: Date.now().toString(),
        enabled: true,
        createdAt: new Date().toISOString(),
      },
    ]);
    setNewChannel({
      type: "slack",
      name: "",
      url: "",
    });
    setShowAddForm(false);
  };

  const removeChannel = (id: string) => {
    setChannels(channels.filter((c) => c.id !== id));
  };

  const toggleEnabled = (id: string) => {
    setChannels(
      channels.map((c) =>
        c.id === id ? { ...c, enabled: !c.enabled } : c
      )
    );
  };

  const publishToAll = async () => {
    const enabledChannels = channels.filter((c) => c.enabled);
    setPublishing(true);
    setPublishStatus({});

    for (const channel of enabledChannels) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setPublishStatus((prev) => ({
        ...prev,
        [channel.id]: { success: true, message: "Published!" },
      }));
    }

    setPublishing(false);
  };

  const getChannelIcon = (type: string) => {
    switch (type) {
      case "slack":
        return <MessageSquareIcon className="w-5 h-5" />;
      case "discord":
        return <MessageSquareIcon className="w-5 h-5" />;
      case "email":
        return <MailIcon className="w-5 h-5" />;
      default:
        return <LinkIcon className="w-5 h-5" />;
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
            <h1 className="text-2xl font-bold text-gray-900">Publish Channels</h1>
            <p className="text-gray-600">Push changelogs to Slack, Discord, Email</p>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PlusIcon className="w-5 h-5" />
              Add Channel
            </CardTitle>
            <CardDescription>
              Configure where to publish your changelogs
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!showAddForm ? (
              <Button onClick={() => setShowAddForm(true)}>
                <PlusIcon className="w-4 h-4 mr-2" />
                Add Channel
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="flex gap-2">
                  {(["slack", "discord", "email", "webhook"] as const).map((type) => (
                    <Button
                      key={type}
                      variant={newChannel.type === type ? "default" : "outline"}
                      size="sm"
                      onClick={() => setNewChannel({ ...newChannel, type })}
                    >
                      {getChannelIcon(type)}
                      <span className="ml-2 capitalize">{type}</span>
                    </Button>
                  ))}
                </div>

                <Input
                  placeholder="Channel name"
                  value={newChannel.name}
                  onChange={(e) =>
                    setNewChannel({ ...newChannel, name: e.target.value })
                  }
                />
                <Input
                  placeholder={
                    newChannel.type === "slack"
                      ? "Slack webhook URL"
                      : newChannel.type === "discord"
                      ? "Discord webhook URL"
                      : newChannel.type === "email"
                      ? "Email addresses (comma separated)"
                      : "Webhook URL"
                  }
                  value={newChannel.url}
                  onChange={(e) =>
                    setNewChannel({ ...newChannel, url: e.target.value })
                  }
                />

                <div className="flex gap-2">
                  <Button onClick={addChannel}>
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
              <CardTitle>Connected Channels</CardTitle>
              <CardDescription>
                {channels.filter((c) => c.enabled).length} active •{" "}
                {channels.length} total
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={saveChannels}
                disabled={channels.length === 0}
              >
                Save
              </Button>
              <Button
                onClick={publishToAll}
                disabled={publishing || channels.filter((c) => c.enabled).length === 0}
              >
                {publishing ? (
                  <>
                    <Loader2Icon className="w-4 h-4 mr-2 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <SendIcon className="w-4 h-4 mr-2" />
                    Publish All
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {channels.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No channels configured. Add one above to get started.
              </p>
            ) : (
              <div className="space-y-3">
                {channels.map((channel) => (
                  <div
                    key={channel.id}
                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
                  >
                    <button
                      onClick={() => toggleEnabled(channel.id)}
                      className={`w-10 h-6 rounded-full transition-colors ${
                        channel.enabled ? "bg-green-500" : "bg-gray-300"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                          channel.enabled
                            ? "translate-x-4"
                            : "translate-x-0.5"
                        }`}
                      />
                    </button>

                    <div className="text-gray-400">
                      {getChannelIcon(channel.type)}
                    </div>

                    <div className="flex-1">
                      <div className="font-medium">{channel.name}</div>
                      <div className="text-sm text-gray-500">{channel.url}</div>
                    </div>

                    {publishStatus?.[channel.id] && (
                      <span
                        className={`text-sm ${
                          publishStatus[channel.id].success
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {publishStatus[channel.id].message}
                      </span>
                    )}

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeChannel(channel.id)}
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
            <CardTitle>Preview Message</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm">
              <p className="text-gray-400"># Slack/Discord Format</p>
              <p>🚀 <strong>New Release v1.2.0</strong></p>
              <p />
              <p>✨ <strong>Features</strong></p>
              <p>• Add OAuth2 login (abc123)</p>
              <p>• New dashboard (def456)</p>
              <p />
              <p>🐛 <strong>Bug Fixes</strong></p>
              <p>• Fix button hover (ghi789)</p>
              <p />
              <p>---</p>
              <p className="text-gray-400">Generated with ReleaseFlow</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}