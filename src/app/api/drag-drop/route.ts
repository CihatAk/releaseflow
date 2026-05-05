import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { changelogId, sections } = body;

    if (!changelogId || !sections) {
      return NextResponse.json(
        { error: "changelogId ve sections gerekli" },
        { status: 400 }
      );
    }

    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: "Supabase bağlantısı gerekli" },
        { status: 400 }
      );
    }

    // Sections'ı JSON olarak kaydet (Changelog.metadata veya content'e gömülü)
    const metadata = { sections, reorderedAt: new Date().toISOString() };

    await prisma.changelog.update({
      where: { id: changelogId },
      data: {
        stats: metadata as any,
        updated_at: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      sections,
      message: "Sections yeniden sıralandı",
    });
  } catch (error) {
    console.error("Drag-drop error:", error);
    return NextResponse.json(
      { error: "Sections güncellenemedi" },
      { status: 500 }
    );
  }
}
