import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { changelogId, slug } = body;

    if (!changelogId) {
      return NextResponse.json(
        { error: "changelogId gerekli" },
        { status: 400 }
      );
    }

    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: "Supabase bağlantısı gerekli" },
        { status: 400 }
      );
    }

    const changelog = await prisma.changelog.findUnique({
      where: { id: changelogId },
    });

    if (!changelog) {
      return NextResponse.json(
        { error: "Changelog bulunamadı" },
        { status: 404 }
      );
    }

    // Slug oluştur veya güncelle
    const finalSlug = slug || `${changelog.repo_id}-${Date.now()}`;

    await prisma.changelog.update({
      where: { id: changelogId },
      data: { slug: finalSlug },
    });

    const shortUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "https://releaseflow.dev"}/embed/${finalSlug}`;

    return NextResponse.json({
      success: true,
      slug: finalSlug,
      shortUrl,
      message: "Short URL oluşturuldu",
    });
  } catch (error) {
    console.error("Short URL error:", error);
    return NextResponse.json(
      { error: "Short URL oluşturulamadı" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug");

    if (!slug) {
      return NextResponse.json(
        { error: "slug gerekli" },
        { status: 400 }
      );
    }

    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: "Supabase bağlantısı gerekli" },
        { status: 400 }
      );
    }

    const changelog = await prisma.changelog.findFirst({
      where: { slug },
    });

    if (!changelog) {
      return NextResponse.json(
        { error: "Changelog bulunamadı" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: changelog.id,
      title: changelog.title,
      content: changelog.content,
      version: changelog.version,
      format: changelog.format,
    });
  } catch (error) {
    console.error("Short URL GET error:", error);
    return NextResponse.json(
      { error: "Changelog yüklenemedi" },
      { status: 500 }
    );
  }
}
