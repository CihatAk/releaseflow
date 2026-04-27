import { NextRequest, NextResponse } from "next/server";
import { constructWebhookEvent, getPlanFromVariantId } from "@/lib/payment";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("x-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing signature header" },
      { status: 400 }
    );
  }

  const event = await constructWebhookEvent(body, signature);

  if (!event) {
    return NextResponse.json(
      { error: "Invalid webhook signature" },
      { status: 400 }
    );
  }

  try {
    switch (event.event_name) {
      case "subscription_created":
      case "subscription_updated": {
        const { data } = event.meta;
        const variantId = data.variant_id;
        const plan = getPlanFromVariantId(variantId);
        
        console.log(`[Lemon] Subscription ${event.event_name}: ${data.id}, plan: ${plan}`);
        break;
      }

      case "subscription_cancelled":
      case "subscription_expired": {
        const { data } = event.meta;
        console.log(`[Lemon] Subscription cancelled: ${data.id}`);
        break;
      }

      case "subscription_resumed": {
        const { data } = event.meta;
        console.log(`[Lemon] Subscription resumed: ${data.id}`);
        break;
      }

      case "payment_failed": {
        const { data } = event.meta;
        console.log(`[Lemon] Payment failed: ${data.id}`);
        break;
      }

      default:
        console.log(`[Lemon] Unhandled event: ${event.event_name}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[Lemon] Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Lemon Squeezy webhook endpoint",
    status: "active",
    events: [
      "subscription_created",
      "subscription_updated",
      "subscription_cancelled",
      "subscription_expired",
      "subscription_resumed",
      "payment_failed",
    ],
  });
}