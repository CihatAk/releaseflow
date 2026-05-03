import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (userId) {
      const webhooks = await prisma.webhook.findMany({
        where: { user_id: userId, enabled: true },
        orderBy: { created_at: "desc" },
      });
      return NextResponse.json({ webhooks });
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
  } catch (error: any) {
    console.error("Error fetching webhooks:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch webhooks" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, url, type, events, userId } = body;

    if (!name || !url) {
      return NextResponse.json({ error: "name and url are required" }, { status: 400 });
    }

    const webhook = await prisma.webhook.create({
      data: {
        name,
        url,
        type: type || "webhook",
        events: events || ["changelog.generated"],
        enabled: true,
        user_id: userId,
      },
    });

    return NextResponse.json({ success: true, webhook });
  } catch (error: any) {
    console.error("Error creating webhook:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create webhook" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, enabled } = body;

    if (!id) {
      return NextResponse.json({ error: "Webhook ID required" }, { status: 400 });
    }

    const webhook = await prisma.webhook.update({
      where: { id },
      data: { enabled },
    });

    return NextResponse.json({ success: true, webhook });
  } catch (error: any) {
    console.error("Error updating webhook:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update webhook" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const webhookId = searchParams.get("id");

    if (!webhookId) {
      return NextResponse.json({ error: "Webhook ID required" }, { status: 400 });
    }

    await prisma.webhook.delete({
      where: { id: webhookId },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting webhook:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete webhook" },
      { status: 500 }
    );
  }
}