import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "Token missing" }, { status: 401 });
    }

    try {
      const decoded = Buffer.from(token, "base64").toString("utf-8");
      const [email, timestamp] = decoded.split(":");

      if (!email || !timestamp) {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 });
      }

      const tokenAge = Date.now() - parseInt(timestamp);
      if (tokenAge > 7 * 24 * 60 * 60 * 1000) {
        return NextResponse.json({ error: "Token expired" }, { status: 401 });
      }

      return NextResponse.json({
        valid: true,
        user: { email, role: "super_admin" },
      });
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
  } catch (error) {
    console.error("Verify error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}