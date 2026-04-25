import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Email ve şifre gerekli" }, { status: 400 });
    }

    // Use environment variables - fallback to hardcoded for Vercel
    const adminEmail = process.env.ADMIN_EMAIL || "admin@releaseflow.app";
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

    if (email === adminEmail && password === adminPassword) {
      const token = Buffer.from(`${email}:${Date.now()}`).toString("base64");
      
      return NextResponse.json({
        success: true,
        token,
      });
    }

    return NextResponse.json({ error: "Geçersiz email veya şifre" }, { status: 401 });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}