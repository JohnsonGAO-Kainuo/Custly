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

export type Currency = "usd" | "hkd" | "cny";

export const CURRENCY_OPTIONS: { value: Currency; label: string; symbol: string }[] = [
  { value: "usd", label: "USD", symbol: "$" },
  { value: "hkd", label: "HKD", symbol: "HK$" },
  { value: "cny", label: "CNY", symbol: "¥" },
];

// Price IDs by currency
export const PRICE_IDS: Record<Currency, { monthly: string; yearly: string; lifetime: string }> = {
  usd: {
    monthly: "price_1SwmpqJTqJOgtjP4lrV1AlqF",
    yearly: "price_1SwmqAJTqJOgtjP4sfzuJ4Vi",
    lifetime: "price_1SwmqMJTqJOgtjP48FPNkAM5",
  },
  hkd: {
    monthly: "price_1T7rQSJTqJOgtjP4Llsv59Bq",
    yearly: "price_1T7rQSJTqJOgtjP4LM6coUl7",
    lifetime: "price_1T7rQSJTqJOgtjP4peRkIycs",
  },
  cny: {
    monthly: "price_1T7rQTJTqJOgtjP4lRfPtTJZ",
    yearly: "price_1T7rQTJTqJOgtjP4sC9lfWko",
    lifetime: "price_1T7rQSJTqJOgtjP4V9PkyPFc",
  },
};

interface PlanPricing {
  price: number;
  currency: string;
  symbol: string;
  interval: string;
  label: string;
  savings?: string;
}

// Pricing info by currency
export const PRICING: Record<Currency, { monthly: PlanPricing; yearly: PlanPricing; lifetime: PlanPricing }> = {
  usd: {
    monthly: { price: 20, currency: "USD", symbol: "$", interval: "month", label: "$20/month" },
    yearly: { price: 168, currency: "USD", symbol: "$", interval: "year", label: "$168/year", savings: "Save 30%" },
    lifetime: { price: 399, currency: "USD", symbol: "$", interval: "one-time", label: "$399 lifetime" },
  },
  hkd: {
    monthly: { price: 158, currency: "HKD", symbol: "HK$", interval: "month", label: "HK$158/month" },
    yearly: { price: 1288, currency: "HKD", symbol: "HK$", interval: "year", label: "HK$1,288/year", savings: "Save 32%" },
    lifetime: { price: 3088, currency: "HKD", symbol: "HK$", interval: "one-time", label: "HK$3,088 lifetime" },
  },
  cny: {
    monthly: { price: 148, currency: "CNY", symbol: "¥", interval: "month", label: "¥148/month" },
    yearly: { price: 1188, currency: "CNY", symbol: "¥", interval: "year", label: "¥1,188/year", savings: "Save 33%" },
    lifetime: { price: 2888, currency: "CNY", symbol: "¥", interval: "one-time", label: "¥2,888 lifetime" },
  },
};

export function getDefaultCurrency(): Currency {
  return (localStorage.getItem("custly_currency") as Currency) || "usd";
}

export function saveCurrency(currency: Currency) {
  localStorage.setItem("custly_currency", currency);
}

export function formatPrice(price: number, symbol: string): string {
  if (price >= 1000) {
    return `${symbol}${price.toLocaleString()}`;
  }
  return `${symbol}${price}`;
}

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
          subscription: null,
          daysRemaining: isInTrial ? daysRemaining : 0,
          canUseCRM: isInTrial,
        };
      }

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
    const isTrialing = subscription.status === "trialing" &&
      (!subscription.trial_end || new Date(subscription.trial_end) > now);
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
  plan: "monthly" | "yearly" | "lifetime",
  currency: Currency = "usd"
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
        currency,
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


