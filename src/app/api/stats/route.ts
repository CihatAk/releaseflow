import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

const DEMO_USERS = 127;
const DEMO_COMMITS = 15420;

export async function GET(request: NextRequest) {
  const baseUsers = DEMO_USERS + Math.floor(Math.random() * 20);
  const baseCommits = DEMO_COMMITS + Math.floor(Math.random() * 100);
  
  const now = new Date();
  const hour = now.getUTCHours();
  const dayMultiplier = hour >= 9 && hour <= 22 ? 1.5 : 0.8;
  const liveUsers = Math.floor(baseUsers * dayMultiplier);

  return NextResponse.json({
    users: liveUsers,
    commits: baseCommits,
    changelogs: Math.floor(baseCommits / 3),
    repos: Math.floor(baseUsers * 2.3),
    updatedAt: now.toISOString(),
    messages: [
      `${Math.floor(Math.random() * 50) + 10} users generating changelogs right now`,
      `${Math.floor(Math.random() * 500) + 100} changelogs generated today`,
      "ReleaseFlow helps teams ship better software",
    ],
  });
}