import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { event, userId, repoId, metadata } = body;

    if (!event) {
      return NextResponse.json(
        { error: "Event gereklidir" },
        { status: 400 }
      );
    }

    // Supabase bağlı mı kontrol et
    if (!process.env.DATABASE_URL) {
      // Supabase yoksa dummy response dön
      return NextResponse.json({ success: true, message: "Analytics (demo mode)" });
    }

    const analytics = await prisma.analytics.create({
      data: {
        event,
        userId: userId || null,
        repoId: repoId || null,
        metadata: metadata || null,
      },
    });

    return NextResponse.json({ success: true, data: analytics });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json(
      { error: "Analytics kaydedilemedi" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const event = searchParams.get("event");
    const userId = searchParams.get("userId");
    const limit = parseInt(searchParams.get("limit") || "100");

    if (!process.env.DATABASE_URL) {
      // Demo mode - dummy data dön
      return NextResponse.json({
        events: [],
        message: "Demo mode - Supabase bağlantısı yok",
      });
    }

    const where: any = {};
    if (event) where.event = event;
    if (userId) where.userId = userId;

    const events = await prisma.analytics.findMany({
      where,
      orderBy: { created_at: "desc" },
      take: limit,
    });

    // Event istatistiklerini hesapla
    const stats = await prisma.analytics.groupBy({
      by: ["event"],
      _count: {
        event: true,
      },
      orderBy: {
        _count: {
          event: "desc",
        },
      },
    });

    return NextResponse.json({
      events,
      stats: stats.map((s) => ({
        event: s.event,
        count: s._count.event,
      })),
    });
  } catch (error) {
    console.error("Analytics GET error:", error);
    return NextResponse.json(
      { error: "Analytics yüklenemedi" },
      { status: 500 }
    );
  }
}
