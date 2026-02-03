import type { VercelRequest, VercelResponse } from "@vercel/node";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-11-20.acacia",
});

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
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
    const { stripeCustomerId, returnUrl } = req.body as {
      stripeCustomerId: string;
      returnUrl?: string;
    };

    if (!stripeCustomerId) {
      return res.status(400).json({ error: "Missing stripeCustomerId" });
    }

    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:5173";

    const session = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: returnUrl || `${baseUrl}/#/billing`,
    });

    return res.status(200).json({
      url: session.url,
    });
  } catch (error) {
    console.error("Error creating portal session:", error);
    return res.status(500).json({ error: "Failed to create portal session" });
  }
}
