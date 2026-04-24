import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createCheckout, isLemonConfigured } from "@/lib/payment";

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const plan = searchParams.get("plan") as "pro" | "team";

  if (!plan || !["pro", "team"].includes(plan)) {
    return NextResponse.json(
      { error: "Invalid plan. Use plan=pro or plan=team" },
      { status: 400 }
    );
  }

  if (!isLemonConfigured()) {
    return NextResponse.json(
      { error: "Payment system not configured" },
      { status: 500 }
    );
  }

  const cookieStore = await cookies();
  const session = cookieStore.get("session");

  if (!session?.value) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://releaseflow.dev";
  const successUrl = `${baseUrl}/settings?success=true&plan=${plan}`;
  const cancelUrl = `${baseUrl}/pricing?canceled=true`;

  const result = await createCheckout(
    session.value,
    session.value,
    plan,
    successUrl,
    cancelUrl
  );

  if (result.error) {
    return NextResponse.json(
      { error: result.error },
      { status: 500 }
    );
  }

  return NextResponse.redirect(result.url!, {
    status: 302,
    headers: {
      Location: result.url!,
    },
  });
}

export async function GET() {
  return NextResponse.json({
    configured: isLemonConfigured(),
  });
}