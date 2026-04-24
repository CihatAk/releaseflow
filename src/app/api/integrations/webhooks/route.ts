import { NextRequest, NextResponse } from "next/server";

interface Webhook {
  id: string;
  name: string;
  url: string;
  type: "slack" | "discord" | "notion" | "webhook";
  events: string[];
  enabled: boolean;
  createdAt: string;
}

const webhooks = new Map<string, Webhook>();

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (userId) {
    const userWebhooks = Array.from(webhooks.values()).filter(w => w.enabled);
    return NextResponse.json({ webhooks: userWebhooks });
  }

  return NextResponse.json({
    types: [
      { id: "slack", name: "Slack", icon: "💬", color: "#4A154B" },
      { id: "discord", name: "Discord", icon: "🎮", color: "#5865F2" },
      { id: "notion", name: "Notion", icon: "📝", color: "#000000" },
      { id: "webhook", name: "Custom Webhook", icon: "🔗", color: "#10B981" },
    ],
    events: [
      "changelog.generated",
      "changelog.published",
      "release.created",
    ],
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, url, type, events, userId } = body;

    if (!name || !url) {
      return NextResponse.json({ error: "name and url are required" }, { status: 400 });
    }

    const webhook: Webhook = {
      id: `wh_${Date.now()}`,
      name,
      url,
      type: type || "webhook",
      events: events || ["changelog.generated"],
      enabled: true,
      createdAt: new Date().toISOString(),
    };

    webhooks.set(webhook.id, webhook);

    return NextResponse.json({ success: true, webhook });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create webhook" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const webhookId = searchParams.get("id");

  if (!webhookId) {
    return NextResponse.json({ error: "Webhook ID required" }, { status: 400 });
  }

  if (webhooks.has(webhookId)) {
    webhooks.delete(webhookId);
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Webhook not found" }, { status: 404 });
}