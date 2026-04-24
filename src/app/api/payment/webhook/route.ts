import { NextRequest, NextResponse } from "next/server";
import { constructWebhookEvent, getPlanFromVariantId } from "@/lib/payment";
import { createServerClient } from "@/lib/supabase/client";

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

  const supabase = createServerClient();

  try {
    switch (event.event_name) {
      case "subscription_created":
      case "subscription_updated": {
        const { data } = event.meta;
        const userId = data.custom_attributes?.user_id;
        const variantId = data.variant_id;
        const customerEmail = data.customer_email || data.email;
        const plan = getPlanFromVariantId(variantId);

        if (supabase && userId && plan) {
          await supabase.from("subscriptions").insert({
            owner_id: userId,
            stripe_customer_id: data.customer_id,
            stripe_subscription_id: data.id,
            status: "active",
            plan,
            current_period_start: data.created_at,
            current_period_end: data.renews_at,
          });

          await supabase
            .from("profiles")
            .update({ plan, plan_expires_at: data.renews_at })
            .eq("id", userId);
        }
        break;
      }

      case "subscription_cancelled":
      case "subscription_expired": {
        const { data } = event.meta;
        const userId = data.custom_attributes?.user_id;

        if (supabase && userId) {
          await supabase
            .from("subscriptions")
            .update({ status: "canceled" })
            .eq("stripe_subscription_id", data.id);

          await supabase
            .from("profiles")
            .update({ plan: "free", plan_expires_at: data.ends_at })
            .eq("id", userId);
        }
        break;
      }

      case "subscription_resumed": {
        const { data } = event.meta;
        const userId = data.custom_attributes?.user_id;

        if (supabase && userId) {
          const plan = getPlanFromVariantId(data.variant_id);
          await supabase
            .from("subscriptions")
            .update({ status: "active" })
            .eq("stripe_subscription_id", data.id);

          await supabase
            .from("profiles")
            .update({ plan, plan_expires_at: null })
            .eq("id", userId);
        }
        break;
      }

      case "payment_failed": {
        const { data } = event.meta;
        const userId = data.custom_attributes?.user_id;

        if (supabase && userId) {
          await supabase
            .from("subscriptions")
            .update({ status: "past_due" })
            .eq("stripe_customer_id", data.customer_id);
        }
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