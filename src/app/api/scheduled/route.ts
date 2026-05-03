import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    const where = userId ? { user_id: userId } : {};

    const reports = await prisma.scheduledReport.findMany({
      where,
      orderBy: { created_at: "desc" },
    });

    return NextResponse.json({ reports });
  } catch (error: any) {
    console.error("Error fetching scheduled reports:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch scheduled reports" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { repo, frequency, day, time, email, userId } = body;

    if (!repo || !email) {
      return NextResponse.json(
        { error: "repo and email are required" },
        { status: 400 }
      );
    }

    const report = await prisma.scheduledReport.create({
      data: {
        repo,
        frequency: frequency || "weekly",
        day: day || 1,
        time: time || "09:00",
        email,
        user_id: userId,
        active: true,
      },
    });

    return NextResponse.json({ success: true, report });
  } catch (error: any) {
    console.error("Error creating scheduled report:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create scheduled report" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, active } = body;

    if (!id) {
      return NextResponse.json(
        { error: "id is required" },
        { status: 400 }
      );
    }

    const report = await prisma.scheduledReport.update({
      where: { id },
      data: { active },
    });

    return NextResponse.json({ success: true, report });
  } catch (error: any) {
    console.error("Error updating scheduled report:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update scheduled report" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "id is required" },
        { status: 400 }
      );
    }

    await prisma.scheduledReport.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting scheduled report:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete scheduled report" },
      { status: 500 }
    );
  }
}
