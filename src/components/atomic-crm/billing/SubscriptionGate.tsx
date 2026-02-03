import { useEffect, useState, type ReactNode } from "react";
import {
  getSubscriptionStatus,
  type SubscriptionStatus,
} from "../providers/pocketbase/subscriptionService";
import { Paywall } from "./Paywall";

interface SubscriptionGateProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export const SubscriptionGate = ({
  children,
  fallback,
}: SubscriptionGateProps) => {
  const [status, setStatus] = useState<SubscriptionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkSubscription = async () => {
    setIsLoading(true);
    try {
      const result = await getSubscriptionStatus();
      setStatus(result);
    } catch (error) {
      console.error("Failed to check subscription:", error);
      setStatus({
        hasActiveSubscription: false,
        isTrialing: false,
        isLifetime: false,
        subscription: null,
        daysRemaining: null,
        canUseCRM: false,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkSubscription();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!status?.canUseCRM) {
    return fallback || <Paywall onTrialStarted={checkSubscription} />;
  }

  return <>{children}</>;
};

export default SubscriptionGate;
