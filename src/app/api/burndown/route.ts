import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const repoId = searchParams.get("repoId");
    const days = parseInt(searchParams.get("days") || "30");

    if (!repoId) {
      return NextResponse.json(
        { error: "repoId gerekli" },
        { status: 400 }
      );
    }

    if (!process.env.DATABASE_URL) {
      // Demo mode - generate fake data
      const fakeData = Array.from({ length: days }, (_, i) => ({
        date: new Date(Date.now() - (days - i) * 86400000).toISOString().split("T")[0],
        commits: Math.floor(Math.random() * 10),
        remaining: Math.floor(Math.random() * 100),
      }));
      return NextResponse.json({
        data: fakeData,
        message: "Demo mode - Supabase bağlantısı yok",
      });
    }

    // Supabase'dan changelog eventlerini çek
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const events = await prisma.analytics.findMany({
      where: {
        repoId,
        event: "changelog_generate",
        created_at: { gte: startDate },
      },
      orderBy: { created_at: "asc" },
    });

    // Günlük commit sayılarını hesapla
    const data = Array.from({ length: days }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (days - i));
      const dateStr = date.toISOString().split("T")[0];

      const dayEvents = events.filter(
        (e) => e.created_at.toISOString().split("T")[0] === dateStr
      );

      return {
        date: dateStr,
        commits: dayEvents.length,
        remaining: 100 - dayEvents.length * 10, // Basit hesaplama
      };
    });

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Burndown error:", error);
    return NextResponse.json(
      { error: "Burndown verisi yüklenemedi" },
      { status: 500 }
    );
  }
}
