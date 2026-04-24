import { NextRequest, NextResponse } from "next/server";

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

const scheduledJobs: Map<string, ScheduledJob> = new Map();

const CRON_EXPRESSIONS: Record<string, string> = {
  daily: "0 0 * * *",
  weekly: "0 0 * * 1",
  monthly: "0 0 1 * *",
};

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
  const { searchParams } = new URL(request.url);
  const repoId = searchParams.get("repoId");
  
  if (repoId) {
    const job = Array.from(scheduledJobs.values()).find(j => j.repoId === repoId);
    if (job) {
      return NextResponse.json({ job });
    }
    return NextResponse.json({ job: null });
  }
  
  return NextResponse.json({
    jobs: Array.from(scheduledJobs.values()),
    schedules: [
      { id: "daily", label: "Daily", cron: CRON_EXPRESSIONS.daily },
      { id: "weekly", label: "Weekly", cron: CRON_EXPRESSIONS.weekly },
      { id: "monthly", label: "Monthly", cron: CRON_EXPRESSIONS.monthly },
    ],
  });
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
    
    const job: ScheduledJob = {
      id: `job_${Date.now()}`,
      repoId,
      repoName,
      schedule,
      format,
      enabled: true,
      lastRun: null,
      nextRun: calculateNextRun(schedule),
      createdAt: new Date().toISOString(),
    };
    
    scheduledJobs.set(job.id, job);
    
    return NextResponse.json({
      success: true,
      job,
      message: `Scheduled ${schedule} generation for ${repoName}`,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create scheduled job" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const jobId = searchParams.get("id");
  
  if (!jobId) {
    return NextResponse.json({ error: "Job ID is required" }, { status: 400 });
  }
  
  if (scheduledJobs.has(jobId)) {
    scheduledJobs.delete(jobId);
    return NextResponse.json({ success: true, message: "Job deleted" });
  }
  
  return NextResponse.json({ error: "Job not found" }, { status: 404 });
}