import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Email ve şifre gerekli" }, { status: 400 });
    }

    // Hardcoded fallback - works in both local and Vercel
    const validEmail = "admin@releaseflow.app";
    const validPassword = "admin123";

    if (email === validEmail && password === validPassword) {
      // Create a simple token
      const token = Buffer.from(`${email}:${Date.now()}:secret`).toString("base64");
      
      return NextResponse.json({
        success: true,
        token: token,
      }, {
        headers: {
          "Set-Cookie": `admin_token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60*60*24*7}`
        }
      });
    }

    return NextResponse.json({ error: "Geçersiz email veya şifre" }, { status: 401 });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}