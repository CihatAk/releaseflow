import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!process.env.DATABASE_URL) {
      // Demo mode - return static pricing
      return NextResponse.json({
        plans: [
          {
            id: "free",
            name: "Free",
            price: 0,
            features: ["3 repos", "Basic analytics", "Community support"],
          },
          {
            id: "pro",
            name: "Pro",
            price: 9.99,
            features: ["Unlimited repos", "Advanced analytics", "Priority support", "Team collaboration"],
          },
          {
            id: "team",
            name: "Team",
            price: 29.99,
            features: ["Everything in Pro", "Unlimited team members", "Custom branding", "API access"],
          },
        ],
        currentPlan: "free",
        message: "Demo mode - Supabase bağlantısı yok",
      });
    }

    // Gerçek plan bilgisini User tablosundan al
    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      return NextResponse.json({
        plans: [
          {
            id: "free",
            name: "Free",
            price: 0,
            features: ["3 repos", "Basic analytics", "Community support"],
          },
          {
            id: "pro",
            name: "Pro",
            price: 9.99,
            features: ["Unlimited repos", "Advanced analytics", "Priority support", "Team collaboration"],
          },
          {
            id: "team",
            name: "Team",
            price: 29.99,
            features: ["Everything in Pro", "Unlimited team members", "Custom branding", "API access"],
          },
        ],
        currentPlan: user?.plan || "free",
      });
    }

    return NextResponse.json({
      plans: [
        {
          id: "free",
          name: "Free",
          price: 0,
          features: ["3 repos", "Basic analytics", "Community support"],
        },
        {
          id: "pro",
          name: "Pro",
          price: 9.99,
          features: ["Unlimited repos", "Advanced analytics", "Priority support", "Team collaboration"],
        },
        {
          id: "team",
          name: "Team",
          price: 29.99,
          features: ["Everything in Pro", "Unlimited team members", "Custom branding", "API access"],
        },
      ],
    });
  } catch (error) {
    console.error("Pricing GET error:", error);
    return NextResponse.json(
      { error: "Pricing yüklenemedi" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, plan } = body;

    if (!userId || !plan) {
      return NextResponse.json(
        { error: "userId ve plan gerekli" },
        { status: 400 }
      );
    }

    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: "Supabase bağlantısı gerekli" },
        { status: 400 }
      );
    }

    await prisma.user.update({
      where: { id: userId },
      data: { plan },
    });

    return NextResponse.json({
      success: true,
      plan,
      message: `Plan güncellendi: ${plan}`,
    });
  } catch (error) {
    console.error("Pricing POST error:", error);
    return NextResponse.json(
      { error: "Plan güncellenemedi" },
      { status: 500 }
    );
  }
}
