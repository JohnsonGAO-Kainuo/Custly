import type { VercelRequest, VercelResponse } from "@vercel/node";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const POCKETBASE_URL = process.env.POCKETBASE_URL || "https://pb-custly.kainuotech.com";

// Multi-currency Price IDs (Stripe auto-detects currency by customer IP via currency_options)
const PRICE_IDS = {
  monthly: "price_1T7rhPJTqJOgtjP4dIDUZYtn",
  yearly: "price_1T7riQJTqJOgtjP4lV1UxJlB",
  lifetime: "price_1T7rjDJTqJOgtjP4OqKwRmtj",
} as const;

/**
 * Verify PocketBase auth token and return the authenticated user record.
 * Returns null if the token is invalid or expired.
 */
async function verifyPBToken(authHeader: string | undefined): Promise<{ id: string; email: string } | null> {
  if (!authHeader) return null;
  // Strip "Bearer " prefix if present, but also accept raw token
  const token = authHeader.startsWith("Bearer ") ? authHeader : `Bearer ${authHeader}`;

  try {
    const response = await fetch(`${POCKETBASE_URL}/api/collections/sales/auth-refresh`, {
      method: "POST",
      headers: {
        Authorization: token,
      },
    });

    if (!response.ok) return null;

    const data = await response.json();
    const record = data.record;
    if (!record?.id || !record?.email) return null;

    return { id: record.id, email: record.email };
  } catch {
    return null;
  }
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Enable CORS
  const origin = req.headers.origin;
  const allowedOrigins = [
    "https://custlycrm.com",
    "https://www.custlycrm.com",
    "http://localhost:5173",
  ];
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
    // Verify PocketBase auth token
    const user = await verifyPBToken(req.headers.authorization);
    if (!user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const { plan, salesId, email } = req.body as {
      plan: "monthly" | "yearly" | "lifetime";
      salesId: string;
      email: string;
    };

    if (!plan || !salesId || !email) {
      return res.status(400).json({ error: "Missing required fields: plan, salesId, email" });
    }

    // Validate salesId format (PocketBase 15-char alphanumeric ID)
    if (!/^[a-z0-9]{15}$/.test(salesId)) {
      return res.status(400).json({ error: "Invalid salesId format" });
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    // Ensure the authenticated user matches the requested salesId
    if (user.id !== salesId || user.email !== email) {
      return res.status(403).json({ error: "Forbidden: user mismatch" });
    }

    const priceId = PRICE_IDS[plan];
    if (!priceId) {
      return res.status(400).json({ error: "Invalid plan type" });
    }

    // Use production domain or fallback for local dev
    const baseUrl = process.env.VERCEL_ENV === "production"
      ? "https://custlycrm.com"
      : process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:5173";

    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      // Don't specify payment_method_types — Stripe auto-selects based on
      // currency, customer location, and Dashboard settings
      customer_email: email,
      client_reference_id: salesId,
      allow_promotion_codes: true,
      billing_address_collection: "required",
      tax_id_collection: { enabled: true },
      success_url: `${baseUrl}/#/billing?success=true`,
      cancel_url: `${baseUrl}/#/billing?canceled=true`,
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
      // Subscription for monthly/yearly
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
    return res.status(500).json({ error: "Failed to create checkout session" });
  }
}
