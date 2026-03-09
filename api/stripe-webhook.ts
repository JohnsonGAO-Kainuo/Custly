import type { VercelRequest, VercelResponse } from "@vercel/node";
import Stripe from "stripe";

// Disable Vercel's default body parsing so we can get the raw body for Stripe signature verification
export const config = {
  api: {
    bodyParser: false,
  },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const POCKETBASE_URL = process.env.POCKETBASE_URL;
const POCKETBASE_ADMIN_EMAIL = process.env.POCKETBASE_ADMIN_EMAIL;
const POCKETBASE_ADMIN_PASSWORD = process.env.POCKETBASE_ADMIN_PASSWORD;

// Stripe Price IDs — new multi-currency prices + old ones for backward compatibility
const PRICE_IDS: Record<string, { plan: "monthly" | "yearly" | "lifetime" }> = {
  // New multi-currency prices (with currency_options: USD/HKD/CNY)
  "price_1T7rhPJTqJOgtjP4dIDUZYtn": { plan: "monthly" },
  "price_1T7riQJTqJOgtjP4lV1UxJlB": { plan: "yearly" },
  "price_1T7rjDJTqJOgtjP4OqKwRmtj": { plan: "lifetime" },
  // Legacy USD prices (backward compat for any in-flight sessions)
  "price_1SwmpqJTqJOgtjP4lrV1AlqF": { plan: "monthly" },
  "price_1SwmqAJTqJOgtjP4sfzuJ4Vi": { plan: "yearly" },
  "price_1SwmqMJTqJOgtjP48FPNkAM5": { plan: "lifetime" },
  // Legacy separate HKD prices
  "price_1T7rQSJTqJOgtjP4Llsv59Bq": { plan: "monthly" },
  "price_1T7rQSJTqJOgtjP4LM6coUl7": { plan: "yearly" },
  "price_1T7rQSJTqJOgtjP4peRkIycs": { plan: "lifetime" },
  // Legacy separate CNY prices
  "price_1T7rQTJTqJOgtjP4lRfPtTJZ": { plan: "monthly" },
  "price_1T7rQTJTqJOgtjP4sC9lfWko": { plan: "yearly" },
  "price_1T7rQSJTqJOgtjP4V9PkyPFc": { plan: "lifetime" },
};

// All lifetime price IDs (new + legacy)
const LIFETIME_PRICE_IDS = [
  "price_1T7rjDJTqJOgtjP4OqKwRmtj",  // new multi-currency
  "price_1SwmqMJTqJOgtjP48FPNkAM5",   // legacy USD
  "price_1T7rQSJTqJOgtjP4peRkIycs",   // legacy HKD
  "price_1T7rQSJTqJOgtjP4V9PkyPFc",   // legacy CNY
];

// Idempotency: track processed Stripe event IDs to prevent double-processing
// This works for warm function reuse; PocketBase unique constraints provide ultimate safety
const processedEventIds = new Set<string>();
const MAX_PROCESSED_CACHE = 1000;

async function getPocketBaseAdminToken(): Promise<string> {
  const response = await fetch(
    `${POCKETBASE_URL}/api/collections/_superusers/auth-with-password`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        identity: POCKETBASE_ADMIN_EMAIL,
        password: POCKETBASE_ADMIN_PASSWORD,
      }),
    }
  );
  if (!response.ok) {
    const errorText = await response.text();
    console.error("PocketBase auth failed:", response.status, errorText);
    throw new Error(`Failed to authenticate with PocketBase: ${response.status}`);
  }
  const data = await response.json();
  return data.token;
}

async function pbRequest(
  token: string,
  method: string,
  path: string,
  body?: unknown
) {
  const response = await fetch(`${POCKETBASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: token,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!response.ok) {
    const text = await response.text();
    console.error(`PocketBase error: ${response.status} ${text}`);
    throw new Error(`PocketBase request failed: ${response.status}`);
  }
  return response.json();
}

function getPlanTypeFromPriceId(priceId: string): "monthly" | "yearly" | "lifetime" | null {
  const entry = PRICE_IDS[priceId as keyof typeof PRICE_IDS];
  if (!entry) {
    console.error(`Unknown price ID: ${priceId} — rejecting. Add it to PRICE_IDS if valid.`);
    return null;
  }
  return entry.plan;
}

function isLifetimePriceId(priceId: string): boolean {
  return LIFETIME_PRICE_IDS.includes(priceId);
}

/** Sanitize a value for use in PocketBase filter queries to prevent injection */
function sanitizePBFilter(value: string): string {
  // Escape double quotes and backslashes to prevent filter injection
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session,
  token: string
) {
  const customerId = session.customer as string;
  const subscriptionId = session.subscription as string;
  const salesId = session.client_reference_id;
  const mode = session.mode;

  if (!salesId) {
    console.error("No client_reference_id (sales_id) in session");
    return;
  }

  // Check if subscription already exists for this user
  const existingQuery = await pbRequest(
    token,
    "GET",
    `/api/collections/subscriptions/records?filter=sales_id="${sanitizePBFilter(salesId)}"`
  );

  if (mode === "payment") {
    // One-time payment (lifetime plan)
    // Get the actual price ID from the session line items
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { limit: 1 });
    const actualPriceId = lineItems.data[0]?.price?.id;

    if (!actualPriceId) {
      console.error(`No line items found for checkout session ${session.id}`);
      return;
    }

    // Defense-in-depth: verify the price ID is a known lifetime price
    if (!isLifetimePriceId(actualPriceId)) {
      console.error(`Checkout session ${session.id}: price ${actualPriceId} is not a recognized lifetime price, skipping`);
      return;
    }

    const subscriptionData = {
      sales_id: salesId,
      stripe_customer_id: customerId,
      stripe_subscription_id: null,
      stripe_price_id: actualPriceId,
      status: "lifetime",
      plan_type: "lifetime",
      trial_start: null,
      trial_end: null,
      current_period_start: new Date().toISOString(),
      current_period_end: null, // Lifetime has no end
      cancel_at_period_end: false,
    };

    if (existingQuery.items?.length > 0) {
      // Update existing subscription
      await pbRequest(
        token,
        "PATCH",
        `/api/collections/subscriptions/records/${existingQuery.items[0].id}`,
        subscriptionData
      );
    } else {
      // Create new subscription
      await pbRequest(
        token,
        "POST",
        "/api/collections/subscriptions/records",
        subscriptionData
      );
    }
  } else if (mode === "subscription" && subscriptionId) {
    // Subscription payment - get subscription details
    const subscription = await stripe.subscriptions.retrieve(subscriptionId) as Stripe.Subscription & { current_period_start?: number; current_period_end?: number };
    const priceId = subscription.items.data[0]?.price.id;
    const planType = getPlanTypeFromPriceId(priceId || "");

    if (!planType) {
      console.error(`Checkout session ${session.id}: unknown price ID ${priceId}, skipping`);
      return;
    }

    const periodStart = subscription.current_period_start ?? Math.floor(Date.now() / 1000);
    const periodEnd = subscription.current_period_end ?? Math.floor(Date.now() / 1000) + 30 * 86400;

    const subscriptionData = {
      sales_id: salesId,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscriptionId,
      stripe_price_id: priceId,
      status: subscription.status,
      plan_type: planType,
      trial_start: subscription.trial_start
        ? new Date(subscription.trial_start * 1000).toISOString()
        : null,
      trial_end: subscription.trial_end
        ? new Date(subscription.trial_end * 1000).toISOString()
        : null,
      current_period_start: new Date(periodStart * 1000).toISOString(),
      current_period_end: new Date(periodEnd * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
    };

    if (existingQuery.items?.length > 0) {
      await pbRequest(
        token,
        "PATCH",
        `/api/collections/subscriptions/records/${existingQuery.items[0].id}`,
        subscriptionData
      );
    } else {
      await pbRequest(
        token,
        "POST",
        "/api/collections/subscriptions/records",
        subscriptionData
      );
    }
  }
}

async function handleSubscriptionUpdated(
  subscription: Stripe.Subscription,
  token: string
) {
  const sub = subscription as Stripe.Subscription & { current_period_start?: number; current_period_end?: number };
  const customerId = sub.customer as string;
  const priceId = sub.items.data[0]?.price.id;
  const planType = getPlanTypeFromPriceId(priceId || "");

  if (!planType) {
    console.error(`Subscription ${sub.id}: unknown price ID ${priceId}, skipping`);
    return;
  }

  const periodStart = sub.current_period_start ?? Math.floor(Date.now() / 1000);
  const periodEnd = sub.current_period_end ?? Math.floor(Date.now() / 1000) + 30 * 86400;

  // Find subscription by stripe_subscription_id
  const existingQuery = await pbRequest(
    token,
    "GET",
    `/api/collections/subscriptions/records?filter=stripe_subscription_id="${sanitizePBFilter(sub.id)}"`
  );

  if (existingQuery.items?.length > 0) {
    await pbRequest(
      token,
      "PATCH",
      `/api/collections/subscriptions/records/${existingQuery.items[0].id}`,
      {
        status: sub.status,
        stripe_price_id: priceId,
        plan_type: planType,
        trial_start: sub.trial_start
          ? new Date(sub.trial_start * 1000).toISOString()
          : null,
        trial_end: sub.trial_end
          ? new Date(sub.trial_end * 1000).toISOString()
          : null,
        current_period_start: new Date(periodStart * 1000).toISOString(),
        current_period_end: new Date(periodEnd * 1000).toISOString(),
        cancel_at_period_end: sub.cancel_at_period_end,
      }
    );
  }
}

async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription,
  token: string
) {
  // Find subscription by stripe_subscription_id
  const existingQuery = await pbRequest(
    token,
    "GET",
    `/api/collections/subscriptions/records?filter=stripe_subscription_id="${sanitizePBFilter(subscription.id)}"`
  );

  if (existingQuery.items?.length > 0) {
    await pbRequest(
      token,
      "PATCH",
      `/api/collections/subscriptions/records/${existingQuery.items[0].id}`,
      {
        status: "canceled",
        cancel_at_period_end: false,
      }
    );
  }
}

async function handleInvoicePaymentFailed(
  invoice: Stripe.Invoice,
  token: string
) {
  const rawSub = (invoice as unknown as Record<string, unknown>).subscription;
  const subscriptionId = typeof rawSub === 'string' ? rawSub : (rawSub as { id?: string })?.id;
  if (!subscriptionId) return;

  // Find subscription by stripe_subscription_id
  const existingQuery = await pbRequest(
    token,
    "GET",
    `/api/collections/subscriptions/records?filter=stripe_subscription_id="${sanitizePBFilter(subscriptionId)}"`
  );

  if (existingQuery.items?.length > 0) {
    await pbRequest(
      token,
      "PATCH",
      `/api/collections/subscriptions/records/${existingQuery.items[0].id}`,
      {
        status: "past_due",
      }
    );
  }
}

async function handleChargeRefunded(
  charge: Stripe.Charge,
  token: string
) {
  const customerId = charge.customer as string;
  if (!customerId) return;

  // Only cancel subscription on FULL refund, not partial refund
  if (!charge.refunded || charge.amount_refunded < charge.amount) {
    return;
  }

  // Try to find the specific subscription via the payment intent's invoice
  let subscriptionId: string | null = null;
  if (charge.payment_intent) {
    try {
      const pi = await stripe.paymentIntents.retrieve(charge.payment_intent as string);
      if (pi.invoice) {
        const invoice = await stripe.invoices.retrieve(pi.invoice as string);
        if (typeof invoice.subscription === 'string') {
          subscriptionId = invoice.subscription;
        }
      }
    } catch {
      // Fall back to customer-based lookup
    }
  }

  // Find the specific subscription record
  let existingQuery;
  if (subscriptionId) {
    existingQuery = await pbRequest(
      token,
      "GET",
      `/api/collections/subscriptions/records?filter=stripe_subscription_id="${sanitizePBFilter(subscriptionId)}"&perPage=1`
    );
  }
  // Fallback: look up by customer ID (most recent)
  if (!existingQuery?.items?.length) {
    existingQuery = await pbRequest(
      token,
      "GET",
      `/api/collections/subscriptions/records?filter=stripe_customer_id="${sanitizePBFilter(customerId)}"&sort=-created&perPage=1`
    );
  }

  if (existingQuery.items?.length > 0) {
    const sub = existingQuery.items[0];
    // Cancel subscription on refund regardless of plan type
    if (sub.status !== "canceled") {
      await pbRequest(
        token,
        "PATCH",
        `/api/collections/subscriptions/records/${sub.id}`,
        {
          status: "canceled",
        }
      );
    }
  }
}

// Read raw body from request stream for Stripe signature verification
// Max 512KB — Stripe webhook payloads are typically under 100KB
const MAX_BODY_SIZE = 512 * 1024;

async function getRawBody(req: VercelRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let totalSize = 0;
    const timeout = setTimeout(() => {
      reject(new Error("Raw body read timed out after 10s"));
    }, 10000);
    req.on("data", (chunk: Buffer) => {
      totalSize += chunk.length;
      if (totalSize > MAX_BODY_SIZE) {
        clearTimeout(timeout);
        reject(new Error(`Request body too large (>${MAX_BODY_SIZE} bytes)`));
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => {
      clearTimeout(timeout);
      resolve(Buffer.concat(chunks));
    });
    req.on("error", (err) => {
      clearTimeout(timeout);
      reject(err);
    });
  });
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (!process.env.STRIPE_SECRET_KEY || !POCKETBASE_URL || !POCKETBASE_ADMIN_EMAIL || !POCKETBASE_ADMIN_PASSWORD) {
    console.error("Missing required environment variables");
    return res.status(500).json({ error: "Server misconfigured" });
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end("Method Not Allowed");
  }

  const sig = req.headers["stripe-signature"] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  if (!sig) {
    return res.status(400).json({ error: "Missing stripe-signature header" });
  }

  if (!webhookSecret || webhookSecret.startsWith("whsec_placeholder")) {
    console.error("STRIPE_WEBHOOK_SECRET not configured");
    return res.status(500).json({ error: "Webhook secret not configured" });
  }

  let event: Stripe.Event;

  try {
    const rawBody = await getRawBody(req);
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return res.status(400).json({ error: "Webhook signature verification failed" });
  }

  console.log(`Received Stripe event: ${event.type} (${event.id})`);

  // Idempotency guard: skip already-processed events
  if (processedEventIds.has(event.id)) {
    console.log(`Event ${event.id} already processed, skipping`);
    return res.status(200).json({ received: true, duplicate: true });
  }

  try {
    const token = await getPocketBaseAdminToken();

    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(
          event.data.object as Stripe.Checkout.Session,
          token
        );
        break;

      case "customer.subscription.created":
      case "customer.subscription.updated":
        await handleSubscriptionUpdated(
          event.data.object as Stripe.Subscription,
          token
        );
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(
          event.data.object as Stripe.Subscription,
          token
        );
        break;

      case "invoice.payment_failed":
        await handleInvoicePaymentFailed(
          event.data.object as Stripe.Invoice,
          token
        );
        break;

      case "charge.refunded":
        await handleChargeRefunded(
          event.data.object as Stripe.Charge,
          token
        );
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Mark event as processed
    processedEventIds.add(event.id);
    if (processedEventIds.size > MAX_PROCESSED_CACHE) {
      // Evict oldest entries — convert to array to reliably slice
      const all = [...processedEventIds];
      processedEventIds.clear();
      for (const id of all.slice(200)) processedEventIds.add(id);
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return res.status(500).json({ error: "Webhook processing failed" });
  }
}
