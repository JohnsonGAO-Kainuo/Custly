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
import { getAuthState } from "../providers/pocketbase/client";

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
  isPastDue: false,
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

// Detect demo mode — only when using fakerest backend (demo build)
const isDemoMode = () => {
  if (typeof window === "undefined") return false;

  // Only allow demo mode when running the demo/fakerest build
  // This prevents ?demo=1 from bypassing subscription checks in production
  const backend = import.meta.env.VITE_BACKEND;
  if (backend === "fakerest") return true;

  // Also allow demo mode if explicitly configured via env
  if (import.meta.env.VITE_IS_DEMO === "true") return true;

  return false;
};

export const SubscriptionProvider = ({ children }: { children: ReactNode }) => {
  const { data: identity, isLoading: identityLoading } = useGetIdentity();
  const isDemo = isDemoMode();
  const [status, setStatus] = useState<SubscriptionStatus>({
    hasActiveSubscription: false,
    isTrialing: false,
    isLifetime: false,
    isPastDue: false,
    subscription: null,
    daysRemaining: null,
    canUseCRM: false,
  });
  const [isLoading, setIsLoading] = useState(!isDemo);

  // Check if current user is an admin (from server-validated PocketBase auth record)
  const authState = getAuthState();
  const isAdmin = authState?.record?.administrator === true;

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
    // On unmount, default to blocked (safe fallback)
    return () => setSubscriptionExpired(true);
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
