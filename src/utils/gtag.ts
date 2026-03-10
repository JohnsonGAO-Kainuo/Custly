/**
 * Google Analytics 4 + Google Ads conversion tracking utilities.
 *
 * Setup:
 * 1. Create a GA4 property at https://analytics.google.com
 * 2. Get your Measurement ID (G-XXXXXXXXXX)
 * 3. Set VITE_GA_MEASUREMENT_ID in your Vercel environment variables
 * 4. For Google Ads: set VITE_GOOGLE_ADS_ID (AW-XXXXXXXXX)
 * 5. For conversion tracking: set VITE_GOOGLE_ADS_CONVERSION_LABEL
 *
 * The gtag.js snippet is injected in index.html with a placeholder.
 * These utilities fire events from React components.
 */

// Type declarations for gtag
declare global {
  interface Window {
    dataLayer: Array<Record<string, unknown>>;
    gtag: (...args: unknown[]) => void;
  }
}

/** GA4 Measurement ID from env */
export const GA_MEASUREMENT_ID =
  import.meta.env.VITE_GA_MEASUREMENT_ID ?? "";

/** Google Ads ID from env */
export const GOOGLE_ADS_ID =
  import.meta.env.VITE_GOOGLE_ADS_ID ?? "";

/** Google Ads conversion label for sign-ups */
export const GOOGLE_ADS_CONVERSION_LABEL =
  import.meta.env.VITE_GOOGLE_ADS_CONVERSION_LABEL ?? "";

/** Safely call gtag — no-op if not loaded */
function gtag(...args: unknown[]) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag(...args);
  }
}

// ────────────────────────── Page Views ──────────────────────────

/** Track a virtual page view (for SPA navigation) */
export function trackPageView(url: string, title?: string) {
  gtag("config", GA_MEASUREMENT_ID, {
    page_path: url,
    page_title: title,
  });
}

// ────────────────────────── Custom Events ──────────────────────────

/** Track a custom event */
export function trackEvent(
  action: string,
  category: string,
  label?: string,
  value?: number,
) {
  gtag("event", action, {
    event_category: category,
    event_label: label,
    value,
  });
}

// ────────────────────────── Google Ads Conversions ──────────────────────────

/**
 * Fire a Google Ads sign-up conversion.
 * Call this after a successful account creation.
 */
export function trackSignUpConversion(email?: string) {
  if (!GOOGLE_ADS_ID || !GOOGLE_ADS_CONVERSION_LABEL) return;

  gtag("event", "conversion", {
    send_to: `${GOOGLE_ADS_ID}/${GOOGLE_ADS_CONVERSION_LABEL}`,
    ...(email ? { email } : {}),
  });
}

/**
 * Fire a Google Ads purchase conversion.
 * Call this after a successful Stripe checkout.
 */
export function trackPurchaseConversion(
  transactionId: string,
  value: number,
  currency = "USD",
) {
  // GA4 ecommerce event
  gtag("event", "purchase", {
    transaction_id: transactionId,
    value,
    currency,
  });

  // Google Ads conversion
  if (GOOGLE_ADS_ID) {
    gtag("event", "conversion", {
      send_to: `${GOOGLE_ADS_ID}/${GOOGLE_ADS_CONVERSION_LABEL}`,
      value,
      currency,
      transaction_id: transactionId,
    });
  }
}

// ────────────────────────── Micro-Conversion Events ──────────────────────────

/** User clicked "View Demo" */
export function trackViewDemo() {
  trackEvent("view_demo", "engagement", "demo_click");
}

/** User clicked "View Pricing" */
export function trackViewPricing() {
  trackEvent("view_pricing", "engagement", "pricing_click");
}

/** User started the sign-up form */
export function trackSignUpStart() {
  trackEvent("sign_up_start", "conversion", "form_started");
}

/** User completed sign-up */
export function trackSignUpComplete() {
  trackEvent("sign_up", "conversion", "form_completed");
}

/** User clicked "Start Free Trial" */
export function trackStartTrial() {
  trackEvent("start_trial", "conversion", "trial_click");
}
