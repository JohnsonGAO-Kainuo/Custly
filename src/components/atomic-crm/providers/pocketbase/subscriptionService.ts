import { getPocketBaseUrl, getAuthToken, getAuthState } from "./client";

export interface Subscription {
  id: string;
  sales_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  stripe_price_id: string | null;
  status: "trialing" | "active" | "canceled" | "past_due" | "incomplete" | "unpaid" | "paused" | "lifetime";
  plan_type: "monthly" | "yearly" | "lifetime";
  trial_start: string | null;
  trial_end: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  created: string;
  updated: string;
}

export interface SubscriptionStatus {
  hasActiveSubscription: boolean;
  isTrialing: boolean;
  isLifetime: boolean;
  subscription: Subscription | null;
  daysRemaining: number | null;
  canUseCRM: boolean;
}

// Price IDs
export const PRICE_IDS = {
  monthly: "price_1SwmpqJTqJOgtjP4lrV1AlqF",
  yearly: "price_1SwmqAJTqJOgtjP4sfzuJ4Vi",
  lifetime: "price_1SwmqMJTqJOgtjP48FPNkAM5",
} as const;

// Payment links
export const PAYMENT_LINKS = {
  monthly: "https://buy.stripe.com/28E14oggL7iY7QR4JrcV20a",
  yearly: "https://buy.stripe.com/00w5kE7KfgTy2wxb7PcV20b",
  lifetime: "https://buy.stripe.com/3cIeVe2pV1YE6MN2BjcV20c",
} as const;

// Pricing info
export const PRICING = {
  monthly: {
    price: 20,
    currency: "USD",
    interval: "month",
    label: "$20/month",
  },
  yearly: {
    price: 168,
    currency: "USD",
    interval: "year",
    label: "$168/year",
    savings: "Save 30%",
  },
  lifetime: {
    price: 399,
    currency: "USD",
    interval: "one-time",
    label: "$399 lifetime",
  },
} as const;

/**
 * Fetch the current user's subscription status
 */
export async function getSubscriptionStatus(): Promise<SubscriptionStatus> {
  const baseUrl = getPocketBaseUrl();
  const token = getAuthToken();
  const authState = getAuthState();

  if (!token || !authState?.record?.id) {
    return {
      hasActiveSubscription: false,
      isTrialing: false,
      isLifetime: false,
      subscription: null,
      daysRemaining: null,
      canUseCRM: false,
    };
  }

  try {
    const response = await fetch(
      `${baseUrl}/api/collections/subscriptions/records?filter=sales_id="${authState.record.id}"&sort=-created&perPage=1`,
      {
        headers: {
          Authorization: token,
        },
      }
    );

    if (!response.ok) {
      console.error("Failed to fetch subscription:", await response.text());
      return {
        hasActiveSubscription: false,
        isTrialing: false,
        isLifetime: false,
        subscription: null,
        daysRemaining: null,
        canUseCRM: false,
      };
    }

    const data = await response.json();
    const subscription: Subscription | null = data.items?.[0] || null;

    if (!subscription) {
      return {
        hasActiveSubscription: false,
        isTrialing: false,
        isLifetime: false,
        subscription: null,
        daysRemaining: null,
        canUseCRM: false,
      };
    }

    const now = new Date();
    const isLifetime = subscription.status === "lifetime";
    const isTrialing = subscription.status === "trialing";
    const isActive = subscription.status === "active";
    const hasActiveSubscription = isLifetime || isTrialing || isActive;

    let daysRemaining: number | null = null;

    if (isTrialing && subscription.trial_end) {
      const trialEnd = new Date(subscription.trial_end);
      daysRemaining = Math.max(0, Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    } else if (isActive && subscription.current_period_end) {
      const periodEnd = new Date(subscription.current_period_end);
      daysRemaining = Math.max(0, Math.ceil((periodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    }

    return {
      hasActiveSubscription,
      isTrialing,
      isLifetime,
      subscription,
      daysRemaining,
      canUseCRM: hasActiveSubscription,
    };
  } catch (error) {
    console.error("Error fetching subscription status:", error);
    return {
      hasActiveSubscription: false,
      isTrialing: false,
      isLifetime: false,
      subscription: null,
      daysRemaining: null,
      canUseCRM: false,
    };
  }
}

/**
 * Create a checkout session for subscription
 */
export async function createCheckoutSession(
  plan: "monthly" | "yearly" | "lifetime"
): Promise<{ url: string | null; error?: string }> {
  const authState = getAuthState();
  
  if (!authState?.record?.id || !authState?.record?.email) {
    return { url: null, error: "Not authenticated" };
  }

  try {
    const response = await fetch("/api/create-checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        plan,
        salesId: authState.record.id,
        email: authState.record.email,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return { url: null, error: error.error || "Failed to create checkout session" };
    }

    const data = await response.json();
    return { url: data.url };
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return { url: null, error: "Failed to create checkout session" };
  }
}

/**
 * Open Stripe Customer Portal for managing subscription
 */
export async function openCustomerPortal(): Promise<{ url: string | null; error?: string }> {
  const status = await getSubscriptionStatus();
  
  if (!status.subscription?.stripe_customer_id) {
    return { url: null, error: "No subscription found" };
  }

  try {
    const response = await fetch("/api/customer-portal", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        stripeCustomerId: status.subscription.stripe_customer_id,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return { url: null, error: error.error || "Failed to open customer portal" };
    }

    const data = await response.json();
    return { url: data.url };
  } catch (error) {
    console.error("Error opening customer portal:", error);
    return { url: null, error: "Failed to open customer portal" };
  }
}

/**
 * Start 14-day free trial for new user
 */
export async function startFreeTrial(): Promise<boolean> {
  const baseUrl = getPocketBaseUrl();
  const token = getAuthToken();
  const authState = getAuthState();

  if (!token || !authState?.record?.id) {
    return false;
  }

  // Check if user already has a subscription
  const status = await getSubscriptionStatus();
  if (status.subscription) {
    return false; // Already has a subscription
  }

  try {
    const now = new Date();
    const trialEnd = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000); // 14 days

    const response = await fetch(
      `${baseUrl}/api/collections/subscriptions/records`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({
          sales_id: authState.record.id,
          status: "trialing",
          plan_type: "monthly", // Default to monthly after trial
          trial_start: now.toISOString(),
          trial_end: trialEnd.toISOString(),
          current_period_start: now.toISOString(),
          current_period_end: trialEnd.toISOString(),
          cancel_at_period_end: false,
        }),
      }
    );

    return response.ok;
  } catch (error) {
    console.error("Error starting free trial:", error);
    return false;
  }
}
