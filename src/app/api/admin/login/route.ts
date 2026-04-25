import { NextRequest, NextResponse } from "next/server";

// Admin secret key - MUST be set in Vercel env vars for production
const ADMIN_SECRET = process.env.ADMIN_SECRET_TOKEN || "releaseflow-admin-2026";

export async function POST(request: NextRequest) {
  try {
    console.log("Admin login attempt");
    
    const body = await request.json();
    const { token } = body;

    if (!token) {
      console.log("No token provided");
      return NextResponse.json({ error: "Token gerekli" }, { status: 400 });
    }

    console.log("Checking token:", token, "Expected:", ADMIN_SECRET);

    if (token !== ADMIN_SECRET) {
      console.log("Invalid token");
      return NextResponse.json({ error: "Geçersiz token" }, { status: 401 });
    }

    console.log("Login successful!");
    
    // Create session
    const sessionToken = `admin_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    return NextResponse.json(
      { success: true, token: sessionToken },
      {
        status: 200,
        headers: {
          "Set-Cookie": `admin_session=${sessionToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60*60*24*7}`,
        },
      }
    );
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}