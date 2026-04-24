import { NextResponse } from "next/server";

const mockUsers = [
  { id: "1", username: "cihat", avatar_url: "https://avatars.githubusercontent.com/u/1?v=4", created_at: "2026-01-15", last_login: "2026-01-25" },
  { id: "2", username: "johndev", avatar_url: "https://avatars.githubusercontent.com/u/2?v=4", created_at: "2026-01-18", last_login: "2026-01-24" },
  { id: "3", username: "codeMaster", avatar_url: "https://avatars.githubusercontent.com/u/3?v=4", created_at: "2026-01-20", last_login: "2026-01-23" },
  { id: "4", username: "bugHunter", avatar_url: "https://avatars.githubusercontent.com/u/4?v=4", created_at: "2026-01-21", last_login: "2026-01-22" },
  { id: "5", username: "openSourceFan", avatar_url: "https://avatars.githubusercontent.com/u/5?v=4", created_at: "2026-01-22", last_login: "2026-01-25" },
];

export async function GET() {
  return NextResponse.json(mockUsers);
}