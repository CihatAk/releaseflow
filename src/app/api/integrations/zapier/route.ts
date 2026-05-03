import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (userId) {
      const integrations = await prisma.integration.findMany({
        where: { user_id: userId, provider: "zapier", enabled: true },
        orderBy: { created_at: "desc" },
      });
      return NextResponse.json({ integrations });
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
  } catch (error: any) {
    console.error("Error fetching Zapier integrations:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch Zapier integrations" },
      { status: 500 }
    );
  }
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

    const integration = await prisma.integration.create({
      data: {
        name,
        provider: "zapier",
        config: {
          zapierUrl,
          events: events || ["changelog.generated"],
        },
        enabled: true,
        user_id: userId,
      },
    });

    return NextResponse.json({
      success: true,
      integration,
      message: "Zapier webhook configured",
    });
  } catch (error: any) {
    console.error("Error creating Zapier integration:", error);
    return NextResponse.json(
      { error: error.message || "Failed to setup Zapier" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, enabled } = body;

    if (!id) {
      return NextResponse.json({ error: "Integration ID required" }, { status: 400 });
    }

    const integration = await prisma.integration.update({
      where: { id },
      data: { enabled },
    });

    return NextResponse.json({ success: true, integration });
  } catch (error: any) {
    console.error("Error updating Zapier integration:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update Zapier integration" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const integrationId = searchParams.get("id");

    if (!integrationId) {
      return NextResponse.json({ error: "Integration ID required" }, { status: 400 });
    }

    await prisma.integration.delete({
      where: { id: integrationId },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting Zapier integration:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete Zapier integration" },
      { status: 500 }
    );
  }
}