import { NextResponse } from "next/server";

const mockChangelogs = [
  { id: "1", repo_name: "cihat/app", version: "v1.2.0", created_at: "2026-01-25" },
  { id: "2", repo_name: "johndev/ecommerce", version: "v2.0.1", created_at: "2026-01-24" },
  { id: "3", repo_name: "codeMaster/api", version: "v1.0.0", created_at: "2026-01-23" },
  { id: "4", repo_name: "bugHunter/parser", version: "v0.9.5", created_at: "2026-01-22" },
  { id: "5", repo_name: "releaseflow/core", version: "v1.1.2", created_at: "2026-01-21" },
];

export async function GET() {
  return NextResponse.json(mockChangelogs);
}