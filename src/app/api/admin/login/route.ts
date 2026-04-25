import { NextRequest, NextResponse } from "next/server";

// Simple hardcoded for Vercel - no leak risk when compiled
const VALID_TOKEN = "rf_admin_2026_secr3t";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token || token !== VALID_TOKEN) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    return NextResponse.json({ success: true, redirect: "/admin" });
    
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}