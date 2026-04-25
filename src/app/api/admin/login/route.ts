import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Email ve şifre gerekli" }, { status: 400 });
    }

    // Use environment variables for credentials
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    // If env vars not set, deny access
    if (!adminEmail || !adminPassword) {
      console.error("Admin credentials not configured");
      return NextResponse.json({ error: "Sunucu yapılandırma hatası" }, { status: 500 });
    }

    if (email === adminEmail && password === adminPassword) {
      const token = Buffer.from(`${email}:${Date.now()}`).toString("base64");
      
      return NextResponse.json({
        success: true,
        token,
        user: {
          email,
          role: "super_admin",
        },
      });
    }

    return NextResponse.json({ error: "Geçersiz email veya şifre" }, { status: 401 });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}