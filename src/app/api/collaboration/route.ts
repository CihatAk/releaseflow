import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const repoId = searchParams.get("repoId");

    if (!process.env.DATABASE_URL) {
      return NextResponse.json({
        collaborators: [],
        message: "Demo mode - Supabase bağlantısı yok",
      });
    }

    if (!repoId) {
      return NextResponse.json(
        { error: "repoId gerekli" },
        { status: 400 }
      );
    }

    const repo = await prisma.repo.findUnique({
      where: { id: repoId },
    });

    if (!repo) {
      return NextResponse.json(
        { error: "Repo bulunamadı" },
        { status: 404 }
      );
    }

    const collaborators = (repo.collaborators as any[]) || [];

    return NextResponse.json({ collaborators });
  } catch (error) {
    console.error("Collaboration GET error:", error);
    return NextResponse.json(
      { error: "Collaborators yüklenemedi" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { repoId, userId, action } = body;

    if (!repoId || !userId) {
      return NextResponse.json(
        { error: "repoId ve userId gerekli" },
        { status: 400 }
      );
    }

    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: "Supabase bağlantısı gerekli" },
        { status: 400 }
      );
    }

    const repo = await prisma.repo.findUnique({
      where: { id: repoId },
    });

    if (!repo) {
      return NextResponse.json(
        { error: "Repo bulunamadı" },
        { status: 404 }
      );
    }

    let collaborators = (repo.collaborators as any[]) || [];

    if (action === "add") {
      // Kullanıcıyı bul
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return NextResponse.json(
          { error: "User bulunamadı" },
          { status: 404 }
        );
      }

      // Zaten ekli mi kontrol et
      if (collaborators.some((c: any) => c.userId === userId)) {
        return NextResponse.json(
          { error: "User zaten collaborator" },
          { status: 400 }
        );
      }

      collaborators.push({
        userId: user.id,
        username: user.username,
        addedAt: new Date().toISOString(),
      });

    } else if (action === "remove") {
      collaborators = collaborators.filter((c: any) => c.userId !== userId);
    } else {
      return NextResponse.json(
        { error: "Geçersiz action (add/remove)" },
        { status: 400 }
      );
    }

    await prisma.repo.update({
      where: { id: repoId },
      data: { collaborators: collaborators as any },
    });

    return NextResponse.json({
      success: true,
      collaborators,
      message: action === "add" ? "Collaborator eklendi" : "Collaborator silindi",
    });
  } catch (error) {
    console.error("Collaboration POST error:", error);
    return NextResponse.json(
      { error: "Collaborator işlemi başarısız" },
      { status: 500 }
    );
  }
}
