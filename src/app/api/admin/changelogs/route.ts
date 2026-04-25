import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const changelogs = await prisma.changelog.findMany({
      orderBy: { created_at: "desc" },
      include: { repo: true },
    });
    return NextResponse.json(changelogs);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch changelogs" }, { status: 500 });
  }
}