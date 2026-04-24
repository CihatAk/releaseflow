import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    totalUsers: 127,
    totalRepos: 342,
    totalChangelogs: 1847,
    totalRevenue: 299,
    newUsersThisMonth: 23,
    activeUsers: 45,
  });
}