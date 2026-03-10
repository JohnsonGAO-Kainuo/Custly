import { useEffect } from "react";
import { useLocation } from "react-router";
import { trackPageView, GA_MEASUREMENT_ID } from "@/utils/gtag";

/**
 * Tracks SPA page views for Google Analytics.
 * Place this component inside the Router to listen for route changes.
 *
 * Google Analytics gtag.js only fires the initial page view automatically.
 * For SPA route transitions we need to manually call gtag('config', ...).
 */
export function useRouteTracker() {
  const location = useLocation();

  useEffect(() => {
    if (!GA_MEASUREMENT_ID) return;
    trackPageView(location.pathname + location.search, document.title);
  }, [location.pathname, location.search]);
}
