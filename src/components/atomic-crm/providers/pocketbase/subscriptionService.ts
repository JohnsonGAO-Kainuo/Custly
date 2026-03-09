import { getPocketBaseUrl, getAuthToken, getAuthState } from "./client";

// Module-level subscription state — accessible outside React tree (e.g., dataProvider)
// Default to true (blocked) — SubscriptionContext will set to false once status is confirmed
let _isSubscriptionExpired = true;

/** Called by SubscriptionContext to sync expired state */
export const setSubscriptionExpired = (expired: boolean) => {
  _isSubscriptionExpired = expired;
};

/** Check if subscription is expired (for use outside React components) */
export const isSubscriptionExpired = () => _isSubscriptionExpired;

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
  isPastDue: boolean;
  subscription: Subscription | null;
  daysRemaining: number | null;
  canUseCRM: boolean;
}

// Multi-currency Price IDs (Stripe auto-detects currency by customer IP)
export const PRICE_IDS = {
  monthly: "price_1T7rhPJTqJOgtjP4dIDUZYtn",
  yearly: "price_1T7riQJTqJOgtjP4lV1UxJlB",
  lifetime: "price_1T7rjDJTqJOgtjP4OqKwRmtj",
} as const;

// Default pricing display (USD) — Stripe shows local currency at checkout
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
      isPastDue: false,
      subscription: null,
      daysRemaining: null,
      canUseCRM: false,
    };
  }

  try {
    const salesId = String(authState.record.id).replace(/[^a-zA-Z0-9_]/g, "");
    const response = await fetch(
      `${baseUrl}/api/collections/subscriptions/records?filter=sales_id="${salesId}"&sort=-created&perPage=1`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      console.error("Failed to fetch subscription:", await response.text());
      return {
        hasActiveSubscription: false,
        isTrialing: false,
        isLifetime: false,
        isPastDue: false,
        subscription: null,
        daysRemaining: null,
        canUseCRM: false,
      };
    }

    const data = await response.json();
    const subscription: Subscription | null = data.items?.[0] || null;

    if (!subscription) {
      // No Stripe subscription — check if account is within free trial period
      const TRIAL_DAYS = 14;
      const accountCreated = authState.record?.created
        ? new Date(authState.record.created)
        : null;

      if (accountCreated) {
        const now = new Date();
        const trialEnd = new Date(accountCreated.getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000);
        const daysRemaining = Math.max(0, Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
        const isInTrial = now < trialEnd;

        return {
          hasActiveSubscription: isInTrial,
          isTrialing: isInTrial,
          isLifetime: false,
          isPastDue: false,
          subscription: null,
          daysRemaining: isInTrial ? daysRemaining : 0,
          canUseCRM: isInTrial,
        };
      }

      return {
        hasActiveSubscription: false,
        isTrialing: false,
        isLifetime: false,
        isPastDue: false,
        subscription: null,
        daysRemaining: null,
        canUseCRM: false,
      };
    }

    const now = new Date();
    const isLifetime = subscription.status === "lifetime";
    const isTrialing = subscription.status === "trialing" &&
      (!subscription.trial_end || new Date(subscription.trial_end) > now);
    const isActive = subscription.status === "active";
    const isPastDue = subscription.status === "past_due";
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
      isPastDue,
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
      isPastDue: false,
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
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

    const token = getAuthToken();
    const response = await fetch("/api/create-checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: token } : {}),
      },
      body: JSON.stringify({
        plan,
        salesId: authState.record.id,
        email: authState.record.email,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const error = await response.json();
      return { url: null, error: error.error || "Failed to create checkout session" };
    }

    const data = await response.json();
    return { url: data.url };
  } catch (error) {
    console.error("Error creating checkout session:", error);
    if (error instanceof DOMException && error.name === "AbortError") {
      return { url: null, error: "Request timed out. Please check your network connection and try again." };
    }
    return { url: null, error: "Failed to create checkout session. Please check your network connection." };
  }
}

/**
 * Open Stripe Customer Portal for managing subscription
 * @param flow - Optional deep link flow: "payment_method_update" or "subscription_cancel"
 */
export async function openCustomerPortal(
  flow?: "payment_method_update" | "subscription_cancel"
): Promise<{ url: string | null; error?: string }> {
  // Auth token is required — server will look up stripeCustomerId
  const token = getAuthToken();
  if (!token) {
    return { url: null, error: "Not authenticated" };
  }

  try {
    const response = await fetch("/api/customer-portal", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      body: JSON.stringify({
        ...(flow && { flow }),
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


