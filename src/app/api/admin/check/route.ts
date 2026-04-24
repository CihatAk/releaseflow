import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    is_admin: true,
    role: "super_admin",
  });
}