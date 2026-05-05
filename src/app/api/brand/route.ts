import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface BrandConfig {
  logo?: string;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  customCSS?: string;
}

export async function GET(request: NextRequest) {
  try {
    // Brand config'ı public ayar olarak döndür
    const defaultConfig: BrandConfig = {
      primaryColor: "#3B82F6", // Blue
      secondaryColor: "#1E40AF",
      fontFamily: "Inter, sans-serif",
    };

    return NextResponse.json({
      config: defaultConfig,
      message: "Brand config loaded",
    });
  } catch (error) {
    console.error("Brand GET error:", error);
    return NextResponse.json(
      { error: "Brand config yüklenemedi" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { logo, primaryColor, secondaryColor, fontFamily, customCSS } = body;

    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: "Supabase bağlantısı gerekli" },
        { status: 400 }
      );
    }

    // Brand config'ı Analytics tablosuna kaydet (event: brand_config)
    const config = await prisma.analytics.create({
      data: {
        event: "brand_config",
        metadata: {
          logo,
          primaryColor: primaryColor || "#3B82F6",
          secondaryColor: secondaryColor || "#1E40AF",
          fontFamily: fontFamily || "Inter, sans-serif",
          customCSS: customCSS || "",
        },
      },
    });

    return NextResponse.json({
      success: true,
      config: {
        logo,
        primaryColor: primaryColor || "#3B82F6",
        secondaryColor: secondaryColor || "#1E40AF",
        fontFamily: fontFamily || "Inter, sans-serif",
        customCSS,
      },
      message: "Brand config kaydedildi",
    });
  } catch (error) {
    console.error("Brand POST error:", error);
    return NextResponse.json(
      { error: "Brand config kaydedilemedi" },
      { status: 500 }
    );
  }
}
