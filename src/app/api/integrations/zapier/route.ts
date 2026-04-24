import { NextRequest, NextResponse } from "next/server";

interface ZapierWebhook {
  id: string;
  userId: string;
  name: string;
  zapierUrl: string;
  events: string[];
  enabled: boolean;
  createdAt: string;
}

const zapierWebhooks: Map<string, ZapierWebhook> = new Map();

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (userId) {
    const userWebhooks = Array.from(zapierWebhooks.values()).filter(w => w.userId === userId);
    return NextResponse.json({ webhooks: userWebhooks });
  }

  return NextResponse.json({
    events: [
      "changelog.generated",
      "changelog.published",
      "release.created",
      "repo.connected",
    ],
    documentation: "https://zapier.com/help/create/webhooks",
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, name, zapierUrl, events } = body;

    if (!userId || !name || !zapierUrl) {
      return NextResponse.json({ error: "userId, name, zapierUrl required" }, { status: 400 });
    }

    if (!zapierUrl.includes("zapier.com") && !zapierUrl.startsWith("https://")) {
      return NextResponse.json({ error: "Invalid Zapier webhook URL" }, { status: 400 });
    }

    const webhook: ZapierWebhook = {
      id: `zap_${Date.now()}`,
      userId,
      name,
      zapierUrl,
      events: events || ["changelog.generated"],
      enabled: true,
      createdAt: new Date().toISOString(),
    };

    zapierWebhooks.set(webhook.id, webhook);

    return NextResponse.json({
      success: true,
      webhook,
      message: "Zapier webhook configured",
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to setup Zapier" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const webhookId = searchParams.get("id");

  if (!webhookId) {
    return NextResponse.json({ error: "Webhook ID required" }, { status: 400 });
  }

  if (zapierWebhooks.has(webhookId)) {
    zapierWebhooks.delete(webhookId);
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Webhook not found" }, { status: 404 });
}