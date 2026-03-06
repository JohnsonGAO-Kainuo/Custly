import type { VercelRequest, VercelResponse } from "@vercel/node";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

type Currency = "usd" | "hkd" | "cny";

// Stripe Price IDs by currency
const PRICE_IDS: Record<Currency, { monthly: string; yearly: string; lifetime: string }> = {
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

const VALID_CURRENCIES: Currency[] = ["usd", "hkd", "cny"];

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Enable CORS
  const origin = req.headers.origin;
  const allowedOrigins = ["https://custlycrm.com", "http://localhost:5173"];
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end("Method Not Allowed");
  }

  try {
    const { plan, currency: rawCurrency, salesId, email, successUrl, cancelUrl } = req.body as {
      plan: "monthly" | "yearly" | "lifetime";
      currency?: string;
      salesId: string;
      email: string;
      successUrl?: string;
      cancelUrl?: string;
    };

    if (!plan || !salesId || !email) {
      return res.status(400).json({ error: "Missing required fields: plan, salesId, email" });
    }

    const currency: Currency = VALID_CURRENCIES.includes(rawCurrency as Currency)
      ? (rawCurrency as Currency)
      : "usd";

    const priceId = PRICE_IDS[currency]?.[plan];
    if (!priceId) {
      return res.status(400).json({ error: "Invalid plan type or currency" });
    }

    // Use production domain or fallback to localhost
    const baseUrl = process.env.NODE_ENV === "production"
      ? "https://custlycrm.com"
      : "http://localhost:5173";

    // For subscriptions, only card is supported. For one-time payments, add Alipay
    const paymentMethods = plan === "lifetime" 
      ? ["card", "alipay"]
      : ["card"];

    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: paymentMethods,
      customer_email: email,
      client_reference_id: salesId,
      success_url: successUrl || `${baseUrl}/#/billing?success=true`,
      cancel_url: cancelUrl || `${baseUrl}/#/billing?canceled=true`,
      metadata: {
        salesId,
        plan,
      },
    };

    if (plan === "lifetime") {
      // One-time payment for lifetime
      sessionConfig.mode = "payment";
      sessionConfig.line_items = [
        {
          price: priceId,
          quantity: 1,
        },
      ];
    } else {
      // Subscription with 14-day trial
      sessionConfig.mode = "subscription";
      sessionConfig.line_items = [
        {
          price: priceId,
          quantity: 1,
        },
      ];
      sessionConfig.subscription_data = {
        metadata: {
          salesId,
          plan,
        },
      };
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    return res.status(200).json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error: unknown) {
    console.error("Error creating checkout session:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({ error: "Failed to create checkout session", details: errorMessage });
  }
}
