import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

    // Secret admin URL token from environment or default
    const adminToken = process.env.ADMIN_SECRET_TOKEN || "releaseflow-admin-2026";
    const validToken = process.env.ADMIN_SECRET_TOKEN || "releaseflow-admin-2026";

    if (token === validToken) {
      const sessionToken = Buffer.from(`admin:${Date.now()}:${Math.random()}`).toString("base64");
      
      return NextResponse.json({
        success: true,
        token: sessionToken,
      }, {
        headers: {
          "Set-Cookie": `admin_session=${sessionToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60*60*24*7}`
        }
      });
    }

    return NextResponse.json({ error: "Geçersiz token" }, { status: 401 });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}