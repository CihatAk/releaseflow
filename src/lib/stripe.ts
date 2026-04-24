import Stripe from "stripe";

const STRIPE_KEY = process.env.STRIPE_SECRET_KEY || "";

const stripe = STRIPE_KEY ? new Stripe(STRIPE_KEY) : null;

export const stripeClient = stripe;

export const PLANS = {
  free: {
    name: "Free",
    price: 0,
    priceId: null,
    features: {
      repos: 3,
      templates: 5,
      changelogs: 10,
      apiAccess: false,
      customDomain: false,
      prioritySupport: false,
      teamMembers: 1,
    },
  },
  pro: {
    name: "Pro",
    price: 9,
    priceId: process.env.STRIPE_PRO_PRICE_ID || "price_pro_monthly",
    features: {
      repos: 100,
      templates: 50,
      changelogs: 500,
      apiAccess: true,
      customDomain: false,
      prioritySupport: false,
      teamMembers: 3,
    },
  },
  team: {
    name: "Team",
    price: 29,
    priceId: process.env.STRIPE_TEAM_PRICE_ID || "price_team_monthly",
    features: {
      repos: 1000,
      templates: 500,
      changelogs: 10000,
      apiAccess: true,
      customDomain: true,
      prioritySupport: true,
      teamMembers: 25,
    },
  },
};

export type PlanType = keyof typeof PLANS;

export async function createCheckoutSession(
  userId: string,
  userEmail: string,
  plan: PlanType,
  successUrl: string,
  cancelUrl: string
) {
  const planConfig = PLANS[plan];
  
  if (!planConfig.priceId) {
    return { error: "Invalid plan" };
  }

  if (!stripe) {
    return { error: "Stripe not configured" };
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer_email: userEmail,
      line_items: [
        {
          price: planConfig.priceId,
          quantity: 1,
        },
      ],
      metadata: {
        userId,
        plan,
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
      allow_promotion_codes: true,
      subscription_data: {
        metadata: {
          userId,
          plan,
        },
      },
    });

    return { sessionId: session.id, url: session.url };
  } catch (error) {
    console.error("[Stripe] Create checkout error:", error);
    return { error: "Failed to create checkout session" };
  }
}

export async function createPortalSession(
  customerId: string,
  returnUrl: string
) {
  if (!stripe) {
    return { error: "Stripe not configured" };
  }

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    return { url: session.url };
  } catch (error) {
    console.error("[Stripe] Create portal error:", error);
    return { error: "Failed to create portal session" };
  }
}

export async function getSubscription(subscriptionId: string) {
  if (!stripe) {
    return null;
  }

  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    return subscription;
  } catch (error) {
    console.error("[Stripe] Get subscription error:", error);
    return null;
  }
}

export async function cancelSubscription(subscriptionId: string, immediately = false) {
  if (!stripe) {
    return { error: "Stripe not configured" };
  }

  try {
    if (immediately) {
      const subscription = await stripe.subscriptions.cancel(subscriptionId);
      return { subscription };
    } else {
      const subscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      });
      return { subscription };
    }
  } catch (error) {
    console.error("[Stripe] Cancel subscription error:", error);
    return { error: "Failed to cancel subscription" };
  }
}

export async function constructWebhookEvent(
  payload: string | Buffer,
  signature: string
) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  if (!webhookSecret) {
    console.error("[Stripe] Missing webhook secret");
    return null;
  }

  if (!stripe) {
    console.error("[Stripe] Stripe not configured");
    return null;
  }

  try {
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      webhookSecret
    );
    return event;
  } catch (error) {
    console.error("[Stripe] Webhook verification error:", error);
    return null;
  }
}

export function getPlanFromPriceId(priceId: string): PlanType | null {
  for (const [planName, planConfig] of Object.entries(PLANS)) {
    if (planConfig.priceId === priceId) {
      return planName as PlanType;
    }
  }
  return null;
}

export { stripe };