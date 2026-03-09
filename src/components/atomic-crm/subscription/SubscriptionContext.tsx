import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { useGetIdentity } from "ra-core";
import {
  getSubscriptionStatus,
  setSubscriptionExpired,
  type SubscriptionStatus,
} from "../providers/pocketbase/subscriptionService";

// Admin emails that are exempt from subscription requirements
const ADMIN_EMAILS = [
  "kainuotech@gmail.com",
  // Add more admin emails here
];

interface SubscriptionContextValue extends SubscriptionStatus {
  isLoading: boolean;
  isAdmin: boolean;
  isExpired: boolean;
  refresh: () => Promise<void>;
}

const defaultContext: SubscriptionContextValue = {
  hasActiveSubscription: false,
  isTrialing: false,
  isLifetime: false,
  subscription: null,
  daysRemaining: null,
  canUseCRM: false,
  isLoading: true,
  isAdmin: false,
  isExpired: false,
  refresh: async () => {},
};

const SubscriptionContext = createContext<SubscriptionContextValue>(defaultContext);

export const useSubscription = () => useContext(SubscriptionContext);

// Detect demo mode from URL or sessionStorage (persists across navigation)
const isDemoMode = () => {
  if (typeof window === "undefined") return false;

  const searchParams = new URLSearchParams(window.location.search);
  const fromUrl =
    window.location.pathname.startsWith("/demo") ||
    searchParams.get("demo") === "1";

  // Once detected, persist in sessionStorage so it survives URL changes
  if (fromUrl) {
    try {
      sessionStorage.setItem("custly_demo", "1");
    } catch {
      // ignore
    }
    return true;
  }

  // Fallback: check sessionStorage in case ?demo=1 was stripped from URL
  try {
    return sessionStorage.getItem("custly_demo") === "1";
  } catch {
    return false;
  }
};

export const SubscriptionProvider = ({ children }: { children: ReactNode }) => {
  const { data: identity, isLoading: identityLoading } = useGetIdentity();
  const isDemo = isDemoMode();
  const [status, setStatus] = useState<SubscriptionStatus>({
    hasActiveSubscription: false,
    isTrialing: false,
    isLifetime: false,
    subscription: null,
    daysRemaining: null,
    canUseCRM: false,
  });
  const [isLoading, setIsLoading] = useState(!isDemo);

  // Check if current user is an admin
  const isAdmin = identity?.email ? ADMIN_EMAILS.includes(identity.email as string) : false;

  const fetchSubscriptionStatus = useCallback(async () => {
    // Skip subscription check in demo mode
    if (isDemo) return;
    if (identityLoading) return;
    
    setIsLoading(true);
    try {
      const subscriptionStatus = await getSubscriptionStatus();
      setStatus(subscriptionStatus);
    } catch (error) {
      console.error("Failed to fetch subscription status:", error);
    } finally {
      setIsLoading(false);
    }
  }, [identityLoading, isDemo]);

  useEffect(() => {
    fetchSubscriptionStatus();
  }, [fetchSubscriptionStatus]);

  // Listen for subscription changes (e.g., after payment)
  useEffect(() => {
    const handleFocus = () => {
      fetchSubscriptionStatus();
    };
    const handleHashChange = () => {
      fetchSubscriptionStatus();
    };

    window.addEventListener("focus", handleFocus);
    window.addEventListener("hashchange", handleHashChange);
    return () => {
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, [fetchSubscriptionStatus]);

  // Poll for subscription activation after payment redirect
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash.includes("success=true")) return;
    if (status.hasActiveSubscription) return;

    let attempts = 0;
    const maxAttempts = 15;
    const interval = setInterval(async () => {
      attempts++;
      await fetchSubscriptionStatus();
      if (attempts >= maxAttempts) {
        clearInterval(interval);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [status.hasActiveSubscription, fetchSubscriptionStatus]);

  // Determine if subscription is expired (authenticated but no active access)
  const isExpired = !isDemo && !isAdmin && !status.canUseCRM && !isLoading && !identityLoading;

  // Sync expired state to module-level for dataProvider access
  useEffect(() => {
    setSubscriptionExpired(isExpired);
    return () => setSubscriptionExpired(false);
  }, [isExpired]);

  const value: SubscriptionContextValue = {
    ...status,
    // Demo mode and admin users can always use CRM
    canUseCRM: isDemo || isAdmin || status.canUseCRM,
    isLoading: isDemo ? false : isLoading || identityLoading,
    isAdmin: isAdmin || isDemo,
    isExpired,
    refresh: fetchSubscriptionStatus,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};
