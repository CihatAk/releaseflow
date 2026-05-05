import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, reason } = body;

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

    // Waitlist'i Analytics tablosuna event: "waitlist_signup" olarak kaydet
    const entry = await prisma.analytics.create({
      data: {
        event: "waitlist_signup",
        metadata: {
          email,
          name: name || "Anonymous",
          reason: reason || "",
          signedUpAt: new Date().toISOString(),
        },
      },
    });

    return NextResponse.json({
      success: true,
      id: entry.id,
      message: "Waitlist'e başarıyla kaydoldunuz!",
    });
  } catch (error) {
    console.error("Waitlist error:", error);
    return NextResponse.json(
      { error: "Kayit başarısız" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({
        entries: [],
        count: 0,
        message: "Demo mode - Supabase bağlantısı yok",
      });
    }

    const entries = await prisma.analytics.findMany({
      where: { event: "waitlist_signup" },
      orderBy: { created_at: "desc" },
      take: 100,
    });

    return NextResponse.json({
      entries: entries.map((e) => ({
        id: e.id,
        email: (e.metadata as any)?.email || "",
        name: (e.metadata as any)?.name || "",
        reason: (e.metadata as any)?.reason || "",
        signedUpAt: (e.metadata as any)?.signedUpAt || e.created_at.toISOString(),
      })),
      count: entries.length,
    });
  } catch (error) {
    console.error("Waitlist GET error:", error);
    return NextResponse.json(
      { error: "Waitlist yüklenemedi" },
      { status: 500 }
    );
  }
}
