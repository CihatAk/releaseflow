import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    totalUsers: 0,
    totalRepos: 0,
    totalChangelogs: 0,
    totalRevenue: 0,
    newUsersThisMonth: 0,
    activeUsers: 0,
  });
}