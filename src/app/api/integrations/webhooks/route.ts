import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { webhookUrl, events, secret, name, type } = body;

    if (!webhookUrl || !name) {
      return NextResponse.json(
        { error: "webhookUrl and name are required" },
        { status: 400 }
      );
    }

    if (!webhookUrl.startsWith("http://") && !webhookUrl.startsWith("https://")) {
      return NextResponse.json(
        { error: "Invalid webhook URL" },
        { status: 400 }
      );
    }

    const webhook = {
      id: `wh_${Date.now()}`,
      name,
      type: type || "custom",
      url: webhookUrl,
      events: events || ["changelog Generated"],
      secret: secret || "",
      createdAt: new Date().toISOString(),
      enabled: true,
    };

    return NextResponse.json({
      success: true,
      webhook,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create webhook" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    types: [
      { id: "slack", name: "Slack", icon: "💬" },
      { id: "notion", name: "Notion", icon: "📝" },
      { id: "linear", name: "Linear", icon: "📏" },
      { id: "webhook", name: "Custom Webhook", icon: "🔗" },
      { id: "email", name: "Email", icon: "📧" },
      { id: "discord", name: "Discord", icon: "🎮" },
      { id: "zapier", name: "Zapier", icon: "⚡" },
    ],
    events: [
      "changelog.generated",
      "changelog.published",
      "release.created",
      "schedule.triggered",
      "repo.connected",
    ],
  });
}