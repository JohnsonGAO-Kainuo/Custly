import type { VercelRequest, VercelResponse } from "@vercel/node";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const POCKETBASE_URL = process.env.POCKETBASE_URL || "https://pb-custly.kainuotech.com";
const POCKETBASE_ADMIN_EMAIL = process.env.POCKETBASE_ADMIN_EMAIL!;
const POCKETBASE_ADMIN_PASSWORD = process.env.POCKETBASE_ADMIN_PASSWORD!;

/**
 * Verify PocketBase auth token and return the authenticated user record.
 */
async function verifyPBToken(authHeader: string | undefined): Promise<{ id: string; email: string } | null> {
  if (!authHeader) return null;
  const token = authHeader.startsWith("Bearer ") ? authHeader : `Bearer ${authHeader}`;

  try {
    const response = await fetch(`${POCKETBASE_URL}/api/collections/sales/auth-refresh`, {
      method: "POST",
      headers: { Authorization: token },
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

/** Sanitize a value for use in PocketBase filter queries */
function sanitizePBFilter(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

/**
 * Look up the Stripe customer ID for a given user from PocketBase.
 * Uses admin auth to ensure access regardless of collection rules.
 */
async function getStripeCustomerIdForUser(userId: string): Promise<string | null> {
  try {
    // Get admin token
    const authResp = await fetch(
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
    if (!authResp.ok) return null;
    const { token } = await authResp.json();

    // Look up subscription for this user
    const subResp = await fetch(
      `${POCKETBASE_URL}/api/collections/subscriptions/records?filter=sales_id="${sanitizePBFilter(userId)}"&sort=-created&perPage=1`,
      {
        headers: { Authorization: token },
      }
    );
    if (!subResp.ok) return null;

    const data = await subResp.json();
    return data.items?.[0]?.stripe_customer_id || null;
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
  const allowedOrigins = process.env.VERCEL_ENV === "production"
    ? [
        "https://custlycrm.com",
        "https://www.custlycrm.com",
      ]
    : [
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

    const { flow } = req.body as {
      flow?: "payment_method_update" | "subscription_cancel";
    };

    // Look up the Stripe customer ID server-side — never trust client-sent value
    const stripeCustomerId = await getStripeCustomerIdForUser(user.id);
    if (!stripeCustomerId) {
      return res.status(404).json({ error: "No subscription found for this user" });
    }

    // Use production domain or fallback for local dev
    const baseUrl = process.env.VERCEL_ENV === "production"
      ? "https://custlycrm.com"
      : process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:5173";

    const sessionParams: Stripe.BillingPortal.SessionCreateParams = {
      customer: stripeCustomerId,
      return_url: `${baseUrl}/#/billing`,
    };

    // Deep link flows — skip portal homepage and go directly to the action
    if (flow === "payment_method_update") {
      sessionParams.flow_data = {
        type: "payment_method_update",
        after_completion: {
          type: "redirect",
          redirect: {
            return_url: `${baseUrl}/#/billing?payment_updated=true`,
          },
        },
      };
    } else if (flow === "subscription_cancel") {
      // Get the customer's active subscription for the cancel flow
      const subscriptions = await stripe.subscriptions.list({
        customer: stripeCustomerId,
        status: "active",
        limit: 1,
      });
      const activeSub = subscriptions.data[0];
      if (activeSub) {
        sessionParams.flow_data = {
          type: "subscription_cancel",
          subscription_cancel: {
            subscription: activeSub.id,
          },
          after_completion: {
            type: "redirect",
            redirect: {
              return_url: `${baseUrl}/#/billing?canceled=true`,
            },
          },
        };
      }
    }

    const session = await stripe.billingPortal.sessions.create(sessionParams);

    return res.status(200).json({
      url: session.url,
    });
  } catch (error) {
    console.error("Error creating portal session:", error);
    return res.status(500).json({ error: "Failed to create portal session" });
  }
}
