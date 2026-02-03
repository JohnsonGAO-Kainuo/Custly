import type { VercelRequest, VercelResponse } from "@vercel/node";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const POCKETBASE_URL = process.env.POCKETBASE_URL || "https://pb-custly.kainuotech.com";
const POCKETBASE_ADMIN_EMAIL = process.env.POCKETBASE_ADMIN_EMAIL!;
const POCKETBASE_ADMIN_PASSWORD = process.env.POCKETBASE_ADMIN_PASSWORD!;

// Stripe Price IDs
const PRICE_IDS = {
  monthly: "price_1SwmpqJTqJOgtjP4lrV1AlqF",
  yearly: "price_1SwmqAJTqJOgtjP4sfzuJ4Vi",
  lifetime: "price_1SwmqMJTqJOgtjP48FPNkAM5",
};

async function getPocketBaseAdminToken(): Promise<string> {
  const response = await fetch(
    `${POCKETBASE_URL}/api/admins/auth-with-password`,
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
    throw new Error("Failed to authenticate with PocketBase");
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

function getPlanTypeFromPriceId(priceId: string): "monthly" | "yearly" | "lifetime" {
  if (priceId === PRICE_IDS.monthly) return "monthly";
  if (priceId === PRICE_IDS.yearly) return "yearly";
  if (priceId === PRICE_IDS.lifetime) return "lifetime";
  return "monthly"; // Default fallback
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
    `/api/collections/subscriptions/records?filter=sales_id="${salesId}"`
  );

  if (mode === "payment") {
    // One-time payment (lifetime plan)
    const subscriptionData = {
      sales_id: salesId,
      stripe_customer_id: customerId,
      stripe_subscription_id: null,
      stripe_price_id: PRICE_IDS.lifetime,
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
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const priceId = subscription.items.data[0]?.price.id;
    const planType = getPlanTypeFromPriceId(priceId || "");

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
      current_period_start: new Date(
        subscription.current_period_start * 1000
      ).toISOString(),
      current_period_end: new Date(
        subscription.current_period_end * 1000
      ).toISOString(),
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
  const customerId = subscription.customer as string;
  const priceId = subscription.items.data[0]?.price.id;
  const planType = getPlanTypeFromPriceId(priceId || "");

  // Find subscription by stripe_subscription_id
  const existingQuery = await pbRequest(
    token,
    "GET",
    `/api/collections/subscriptions/records?filter=stripe_subscription_id="${subscription.id}"`
  );

  if (existingQuery.items?.length > 0) {
    await pbRequest(
      token,
      "PATCH",
      `/api/collections/subscriptions/records/${existingQuery.items[0].id}`,
      {
        status: subscription.status,
        stripe_price_id: priceId,
        plan_type: planType,
        trial_start: subscription.trial_start
          ? new Date(subscription.trial_start * 1000).toISOString()
          : null,
        trial_end: subscription.trial_end
          ? new Date(subscription.trial_end * 1000).toISOString()
          : null,
        current_period_start: new Date(
          subscription.current_period_start * 1000
        ).toISOString(),
        current_period_end: new Date(
          subscription.current_period_end * 1000
        ).toISOString(),
        cancel_at_period_end: subscription.cancel_at_period_end,
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
    `/api/collections/subscriptions/records?filter=stripe_subscription_id="${subscription.id}"`
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
  const subscriptionId = invoice.subscription as string;
  if (!subscriptionId) return;

  // Find subscription by stripe_subscription_id
  const existingQuery = await pbRequest(
    token,
    "GET",
    `/api/collections/subscriptions/records?filter=stripe_subscription_id="${subscriptionId}"`
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

  // Find subscription by stripe_customer_id
  const existingQuery = await pbRequest(
    token,
    "GET",
    `/api/collections/subscriptions/records?filter=stripe_customer_id="${customerId}"`
  );

  if (existingQuery.items?.length > 0) {
    const sub = existingQuery.items[0];
    // If it's a lifetime plan that was refunded, cancel it
    if (sub.plan_type === "lifetime") {
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

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end("Method Not Allowed");
  }

  const sig = req.headers["stripe-signature"] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  let event: Stripe.Event;

  try {
    // Get raw body for signature verification
    const rawBody =
      typeof req.body === "string" ? req.body : JSON.stringify(req.body);
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return res.status(400).json({ error: "Webhook signature verification failed" });
  }

  console.log(`Received Stripe event: ${event.type}`);

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

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return res.status(500).json({ error: "Webhook processing failed" });
  }
}
