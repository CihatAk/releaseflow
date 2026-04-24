import { NextRequest, NextResponse } from "next/server";

const ADMIN_EMAIL = "admin@releaseflow.app";
const ADMIN_PASSWORD = "admin123";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Email ve şifre gerekli" }, { status: 400 });
    }

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
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