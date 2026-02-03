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
  refresh: async () => {},
};

const SubscriptionContext = createContext<SubscriptionContextValue>(defaultContext);

export const useSubscription = () => useContext(SubscriptionContext);

export const SubscriptionProvider = ({ children }: { children: ReactNode }) => {
  const { data: identity, isLoading: identityLoading } = useGetIdentity();
  const [status, setStatus] = useState<SubscriptionStatus>({
    hasActiveSubscription: false,
    isTrialing: false,
    isLifetime: false,
    subscription: null,
    daysRemaining: null,
    canUseCRM: false,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Check if current user is an admin
  const isAdmin = identity?.email ? ADMIN_EMAILS.includes(identity.email as string) : false;

  const fetchSubscriptionStatus = useCallback(async () => {
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
  }, [identityLoading]);

  useEffect(() => {
    fetchSubscriptionStatus();
  }, [fetchSubscriptionStatus]);

  // Listen for subscription changes (e.g., after payment)
  useEffect(() => {
    const handleFocus = () => {
      fetchSubscriptionStatus();
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [fetchSubscriptionStatus]);

  const value: SubscriptionContextValue = {
    ...status,
    // Admin users can always use CRM
    canUseCRM: isAdmin || status.canUseCRM,
    isLoading: isLoading || identityLoading,
    isAdmin,
    refresh: fetchSubscriptionStatus,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};
