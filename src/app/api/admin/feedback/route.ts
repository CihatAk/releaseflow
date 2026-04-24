import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json([]);
}

export async function POST(request: NextRequest) {
  return NextResponse.json({ success: true });
}