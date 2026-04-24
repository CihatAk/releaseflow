import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { PLANS } from "@/lib/subscription";

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const session = cookieStore.get("session");

  if (!session?.value) {
    return NextResponse.json({
      plan: "free",
      isTrial: false,
      trialEndsAt: null,
      limits: PLANS.free.features,
    });
  }

  // Demo mode - return free plan limits
  return NextResponse.json({
    plan: "free",
    isTrial: false,
    trialEndsAt: null,
    limits: PLANS.free.features,
  });
}