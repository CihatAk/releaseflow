import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface ScheduledJob {
  id: string;
  repoId: string;
  repoName: string;
  schedule: string;
  format: string;
  enabled: boolean;
  lastRun: string | null;
  nextRun: string;
  createdAt: string;
}

function calculateNextRun(schedule: string): string {
  const now = new Date();
  if (schedule === "daily") {
    const next = new Date(now);
    next.setDate(next.getDate() + 1);
    next.setHours(0, 0, 0, 0);
    return next.toISOString();
  }
  if (schedule === "weekly") {
    const next = new Date(now);
    const daysUntilMonday = (8 - now.getDay()) % 7 || 7;
    next.setDate(next.getDate() + daysUntilMonday);
    next.setHours(0, 0, 0, 0);
    return next.toISOString();
  }
  return new Date(now.getTime() + 86400000).toISOString();
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const repoId = searchParams.get("repoId");

    // Supabase bağlı mı kontrol et
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({
        jobs: [],
        schedules: [
          { id: "daily", label: "Daily", cron: "0 0 * * *" },
          { id: "weekly", label: "Weekly", cron: "0 0 * * 1" },
          { id: "monthly", label: "Monthly", cron: "0 0 1 * *" },
        ],
        message: "Demo mode - Supabase bağlantısı yok",
      });
    }

    if (repoId) {
      const job = await prisma.changelog.findFirst({
        where: { repo_id: repoId, published: false },
        orderBy: { created_at: "desc" },
      });
      return NextResponse.json({ job });
    }

    // Tüm scheduled changelog'ları getir (published=false)
    const changelogs = await prisma.changelog.findMany({
      where: { published: false },
      orderBy: { created_at: "desc" },
      take: 100,
    });

    const jobs = changelogs.map((c) => ({
      id: c.id,
      repoId: c.repo_id,
      repoName: c.title || c.version || "Untitled",
      schedule: "manual",
      format: c.format || "markdown",
      enabled: true,
      lastRun: c.published ? c.updated_at.toISOString() : null,
      nextRun: c.created_at.toISOString(),
      createdAt: c.created_at.toISOString(),
    }));

    return NextResponse.json({
      jobs,
      schedules: [
        { id: "daily", label: "Daily", cron: "0 0 * * *" },
        { id: "weekly", label: "Weekly", cron: "0 0 * * 1" },
        { id: "monthly", label: "Monthly", cron: "0 0 1 * *" },
      ],
    });
  } catch (error) {
    console.error("Scheduled GET error:", error);
    return NextResponse.json(
      { error: "Scheduled jobs yüklenemedi" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { repoId, repoName, schedule, format } = body;

    if (!repoId || !schedule || !format) {
      return NextResponse.json(
        { error: "repoId, schedule, and format are required" },
        { status: 400 }
      );
    }

    // Supabase yoksa hata dön
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: "Supabase bağlantısı gerekli" },
        { status: 400 }
      );
    }

    // Repo'yu kontrol et
    const repo = await prisma.repo.findUnique({
      where: { id: repoId },
    });

    if (!repo) {
      return NextResponse.json(
        { error: "Repository bulunamadı" },
        { status: 404 }
      );
    }

    // Scheduled changelog oluştur
    const changelog = await prisma.changelog.create({
      data: {
        title: `${repoName} - Scheduled`,
        version: "0.0.0", // Default version
        content: "",
        format,
        published: false,
        repo_id: repoId,
        user_id: repo.user_id,
      },
    });

    return NextResponse.json({
      success: true,
      job: {
        id: changelog.id,
        repoId,
        repoName,
        schedule,
        format,
        enabled: true,
        lastRun: null,
        nextRun: calculateNextRun(schedule),
        createdAt: changelog.created_at.toISOString(),
      },
      message: `Scheduled ${schedule} generation for ${repoName}`,
    });
  } catch (error) {
    console.error("Scheduled POST error:", error);
    return NextResponse.json(
      { error: "Failed to create scheduled job" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get("id");

    if (!jobId) {
      return NextResponse.json({ error: "Job ID is required" }, { status: 400 });
    }

    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: "Supabase bağlantısı gerekli" },
        { status: 400 }
      );
    }

    // Changelog'u sil (published=false olanları)
    await prisma.changelog.deleteMany({
      where: { id: jobId, published: false },
    });

    return NextResponse.json({ success: true, message: "Job deleted" });
  } catch (error) {
    console.error("Scheduled DELETE error:", error);
    return NextResponse.json(
      { error: "Job not found" },
      { status: 404 }
    );
  }
}