import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface Template {
  id: string;
  name: string;
  description: string;
  content: string; // Markdown template
  type: string; // 'changelog', 'release-notes', 'email'
  isPublic: boolean;
  userId: string | null;
  created_at: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const userId = searchParams.get("userId");

    if (!process.env.DATABASE_URL) {
      // Demo mode - return default templates
      return NextResponse.json({
        templates: [
          {
            id: "default",
            name: "Default Changelog",
            description: "Standard changelog format",
            content: "# Changelog\n\n## Features\n{{features}}\n\n## Bug Fixes\n{{fixes}}",
            type: "changelog",
            isPublic: true,
          },
          {
            id: "keepachangelog",
            name: "Keep a Changelog",
            description: "Keep a Changelog format",
            content: "# Changelog\n\nAll notable changes to this project will be documented in this file.",
            type: "changelog",
            isPublic: true,
          },
        ],
        message: "Demo mode - Supabase bağlantısı yok",
      });
    }

    const where: any = { isPublic: true };
    if (type) where.type = type;
    if (userId) {
      where.OR = [{ isPublic: true }, { userId }];
    }

    // For now, store templates in Analytics table with event: "template"
    const templateEvents = await prisma.analytics.findMany({
      where: { event: "template", ...where },
      orderBy: { created_at: "desc" },
      take: 100,
    });

    const templates = templateEvents.map((e) => ({
      id: e.id,
      name: (e.metadata as any)?.name || "Unnamed",
      description: (e.metadata as any)?.description || "",
      content: (e.metadata as any)?.content || "",
      type: (e.metadata as any)?.type || "changelog",
      isPublic: (e.metadata as any)?.isPublic !== false,
      userId: e.userId,
      created_at: e.created_at.toISOString(),
    }));

    return NextResponse.json({ templates });
  } catch (error) {
    console.error("Templates GET error:", error);
    return NextResponse.json(
      { error: "Templates yüklenemedi" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, content, type = "changelog", isPublic = true, userId } = body;

    if (!name || !content) {
      return NextResponse.json(
        { error: "name ve content gerekli" },
        { status: 400 }
      );
    }

    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: "Supabase bağlantısı gerekli" },
        { status: 400 }
      );
    }

    const template = await prisma.analytics.create({
      data: {
        event: "template",
        userId: userId || null,
        metadata: {
          name,
          description,
          content,
          type,
          isPublic,
        },
      },
    });

    return NextResponse.json({
      success: true,
      template: {
        id: template.id,
        name,
        description,
        content,
        type,
        isPublic,
        userId,
        created_at: template.created_at.toISOString(),
      },
      message: "Template oluşturuldu",
    });
  } catch (error) {
    console.error("Templates POST error:", error);
    return NextResponse.json(
      { error: "Template oluşturulamadı" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const templateId = searchParams.get("id");

    if (!templateId) {
      return NextResponse.json(
        { error: "Template ID gerekli" },
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
      where: { id: templateId, event: "template" },
    });

    return NextResponse.json({ success: true, message: "Template silindi" });
  } catch (error) {
    console.error("Templates DELETE error:", error);
    return NextResponse.json(
      { error: "Template silinemedi" },
      { status: 500 }
    );
  }
}
