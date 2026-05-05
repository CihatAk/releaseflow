import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, repoIds, frequency = "weekly" } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email gerekli" },
        { status: 400 }
      );
    }

    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: "Supabase bağlantısı gerekli" },
        { status: 400 }
      );
    }

    // Email digest subscription'ı kaydet (Changelog tablosuna scheduled olarak)
    const subscriptions = [];
    
    for (const repoId of repoIds || []) {
      const repo = await prisma.repo.findUnique({
        where: { id: repoId },
      });

      if (!repo) continue;

      const subscription = await prisma.changelog.create({
        data: {
          title: `Digest: ${repo.name}`,
          version: "digest",
          content: "",
          format: "email",
          published: false,
          repo_id: repoId,
          user_id: repo.user_id,
        },
      });

      subscriptions.push(subscription);
    }

    return NextResponse.json({
      success: true,
      subscriptions,
      message: `${subscriptions.length} repo için email digests oluşturuldu`,
    });
  } catch (error) {
    console.error("Email digest error:", error);
    return NextResponse.json(
      { error: "Email digest oluşturulamadı" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!process.env.DATABASE_URL) {
      return NextResponse.json({
        subscriptions: [],
        message: "Demo mode - Supabase bağlantısı yok",
      });
    }

    const where: any = { format: "email", published: false };
    
    if (email) {
      // Email'e göre user bul
      const user = await prisma.user.findFirst({
        where: { email },
      });
      if (user) {
        where.user_id = user.id;
      }
    }

    const subscriptions = await prisma.changelog.findMany({
      where,
      orderBy: { created_at: "desc" },
      take: 100,
    });

    return NextResponse.json({
      subscriptions: subscriptions.map((s) => ({
        id: s.id,
        repoName: s.title,
        email,
        frequency: "weekly",
        active: true,
        createdAt: s.created_at.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Email digest GET error:", error);
    return NextResponse.json(
      { error: "Subscriptions yüklenemedi" },
      { status: 500 }
    );
  }
}
