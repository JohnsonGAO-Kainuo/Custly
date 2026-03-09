import type { VercelRequest, VercelResponse } from "@vercel/node";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

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
    const { stripeCustomerId, returnUrl, flow } = req.body as {
      stripeCustomerId: string;
      returnUrl?: string;
      flow?: "payment_method_update" | "subscription_cancel";
    };

    if (!stripeCustomerId) {
      return res.status(400).json({ error: "Missing stripeCustomerId" });
    }

    // Use production domain or fallback to localhost
    const baseUrl = process.env.NODE_ENV === "production"
      ? "https://custlycrm.com"
      : "http://localhost:5173";

    const sessionParams: Stripe.BillingPortal.SessionCreateParams = {
      customer: stripeCustomerId,
      return_url: returnUrl || `${baseUrl}/#/billing`,
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
        status: "all",
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
