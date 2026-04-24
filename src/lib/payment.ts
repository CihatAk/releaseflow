const LEMON_API_KEY = process.env.LEMONSQUEEZY_API_KEY || "";
const LEMON_STORE_ID = process.env.LEMONSQUEEZY_STORE_ID || "";
const LEMON_WEBHOOK_SECRET = process.env.LEMONSQUEEZY_WEBHOOK_SECRET || "";

const LEMON_API_URL = "https://api.lemonsqueezy.com/v1";

export const PLANS = {
  free: {
    name: "Free",
    price: 0,
    variantId: null,
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
    variantId: process.env.LEMONSQUEEZY_PRO_VARIANT_ID || "",
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
    variantId: process.env.LEMONSQUEEZY_TEAM_VARIANT_ID || "",
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

async function lemonFetch(endpoint: string, options: RequestInit = {}) {
  if (!LEMON_API_KEY || !LEMON_STORE_ID) {
    throw new Error("Lemon Squeezy not configured");
  }

  const response = await fetch(`${LEMON_API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Accept": "application/vnd.api+json",
      "Content-Type": "application/vnd.api+json",
      "Authorization": `Bearer ${LEMON_API_KEY}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Lemon Squeezy API error");
  }

  return response.json();
}

export async function createCheckout(
  userId: string,
  userEmail: string,
  plan: PlanType,
  successUrl: string,
  cancelUrl: string
) {
  const planConfig = PLANS[plan];

  if (!planConfig.variantId) {
    return { error: "Invalid plan" };
  }

  try {
    const checkout = await lemonFetch("/checkouts", {
      method: "POST",
      body: JSON.stringify({
        data: {
          type: "checkouts",
          attributes: {
            checkout_data: {
              email: userEmail,
            },
          },
          relationships: {
            store: {
              data: {
                type: "stores",
                id: LEMON_STORE_ID,
              },
            },
            variant: {
              data: {
                type: "variants",
                id: planConfig.variantId,
              },
            },
          },
        },
      }),
    });

    return {
      checkoutId: checkout.data.id,
      url: checkout.data.attributes.url,
      userId,
      plan,
    };
  } catch (error) {
    console.error("[Lemon] Create checkout error:", error);
    return { error: "Failed to create checkout" };
  }
}

export async function getSubscription(subscriptionId: string) {
  try {
    const subscription = await lemonFetch(`/subscriptions/${subscriptionId}`);
    return subscription.data;
  } catch (error) {
    console.error("[Lemon] Get subscription error:", error);
    return null;
  }
}

export async function cancelSubscription(subscriptionId: string, immediately = false) {
  try {
    const subscription = await lemonFetch(`/subscriptions/${subscriptionId}`, {
      method: "DELETE",
    });
    return { subscription };
  } catch (error) {
    console.error("[Lemon] Cancel subscription error:", error);
    return { error: "Failed to cancel subscription" };
  }
}

export async function constructWebhookEvent(payload: string, signature: string) {
  if (!LEMON_WEBHOOK_SECRET) {
    console.error("[Lemon] Missing webhook secret");
    return null;
  }

  const crypto = require("crypto");
  const expectedSignature = crypto
    .createHmac("sha256", LEMON_WEBHOOK_SECRET)
    .update(payload)
    .digest("hex");

  if (signature !== expectedSignature) {
    console.error("[Lemon] Invalid webhook signature");
    return null;
  }

  try {
    const event = JSON.parse(payload);
    return event;
  } catch (error) {
    console.error("[Lemon] Webhook parse error:", error);
    return null;
  }
}

export function getPlanFromVariantId(variantId: string): PlanType | null {
  for (const [planName, planConfig] of Object.entries(PLANS)) {
    if (planConfig.variantId === variantId) {
      return planName as PlanType;
    }
  }
  return null;
}

export function isLemonConfigured(): boolean {
  return !!(LEMON_API_KEY && LEMON_STORE_ID);
}