import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Token gerekli" },
        { status: 400 }
      );
    }

    const response = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "ReleaseFlow",
      },
    });

    if (response.ok) {
      const user = await response.json();
      return NextResponse.json({
        success: true,
        message: `@${user.login} olarak bağlandı`,
        user: {
          login: user.login,
          name: user.name,
          avatar_url: user.avatar_url,
        },
      });
    } else {
      const error = await response.json().catch(() => null);
      return NextResponse.json(
        {
          success: false,
          message: `Geçersiz token: ${error?.message || response.statusText}`,
        },
        { status: 401 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Bağlantı hatası. Lütfen tekrar deneyin.",
      },
      { status: 500 }
    );
  }
}
