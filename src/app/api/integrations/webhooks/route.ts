import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Webhook {
  id: string;
  name: string;
  url: string;
  events: string[]; // ['changelog.created', 'changelog.published']
  secret: string;
  active: boolean;
  created_at: string;
}

export async function GET(request: NextRequest) {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({
        webhooks: [],
        message: "Demo mode - Supabase bağlantısı yok",
      });
    }

    // Webhook'ları ChangelogEvent tablosunda 'webhook' eventi olarak saklayalım
    const webhookEvents = await prisma.analytics.findMany({
      where: { event: "webhook_config" },
      orderBy: { created_at: "desc" },
      take: 100,
    });

    const webhooks = webhookEvents.map((e) => {
      const meta = e.metadata as any;
      return {
        id: e.id,
        name: meta?.name || "Unnamed",
        url: meta?.url || "",
        events: meta?.events || [],
        secret: meta?.secret || "",
        active: meta?.active !== false,
        created_at: e.created_at.toISOString(),
      };
    });

    return NextResponse.json({ webhooks });
  } catch (error) {
    console.error("Webhooks GET error:", error);
    return NextResponse.json(
      { error: "Webhooks yüklenemedi" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, url, events, secret } = body;

    if (!name || !url) {
      return NextResponse.json(
        { error: "name ve url gerekli" },
        { status: 400 }
      );
    }

    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: "Supabase bağlantısı gerekli" },
        { status: 400 }
      );
    }

    const webhook = await prisma.analytics.create({
      data: {
        event: "webhook_config",
        metadata: {
          name,
          url,
          events: events || ["changelog.created"],
          secret: secret || "",
          active: true,
        },
      },
    });

    return NextResponse.json({
      success: true,
      webhook: {
        id: webhook.id,
        name,
        url,
        events: events || ["changelog.created"],
        secret: secret || "",
        active: true,
        created_at: webhook.created_at.toISOString(),
      },
      message: "Webhook oluşturuldu",
    });
  } catch (error) {
    console.error("Webhooks POST error:", error);
    return NextResponse.json(
      { error: "Webhook oluşturulamadı" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const webhookId = searchParams.get("id");

    if (!webhookId) {
      return NextResponse.json(
        { error: "Webhook ID gerekli" },
        { status: 400 }
      );
    }

    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: "Supabase bağlantısı gerekli" },
        { status: 400 }
      );
    }

    await prisma.analytics.deleteMany({
      where: { id: webhookId, event: "webhook_config" },
    });

    return NextResponse.json({ success: true, message: "Webhook silindi" });
  } catch (error) {
    console.error("Webhooks DELETE error:", error);
    return NextResponse.json(
      { error: "Webhook silinemedi" },
      { status: 500 }
    );
  }
}
