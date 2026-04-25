import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [totalUsers, totalRepos, totalChangelogs, newUsersThisMonth] = await Promise.all([
      prisma.user.count(),
      prisma.repo.count(),
      prisma.changelog.count(),
      prisma.user.count({
        where: { created_at: { gte: startOfMonth } },
      }),
    ]);

    return NextResponse.json({
      totalUsers,
      totalRepos,
      totalChangelogs,
      totalRevenue: 0,
      newUsersThisMonth,
      activeUsers: totalUsers,
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}