import { type ReactNode } from "react";
import { useSubscription } from "./SubscriptionContext";
import { Paywall } from "../billing/Paywall";
import { Loader2 } from "lucide-react";

interface SubscriptionGuardProps {
  children: ReactNode;
}

/**
 * SubscriptionGuard component that wraps content and shows paywall if user doesn't have active subscription
 */
export const SubscriptionGuard = ({ children }: SubscriptionGuardProps) => {
  const { canUseCRM, isLoading, isAdmin, refresh } = useSubscription();

  // Show loading state while checking subscription
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center z-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Checking subscription status...</p>
        </div>
      </div>
    );
  }

  // Admin users bypass paywall
  if (isAdmin) {
    return <>{children}</>;
  }

  // Users without active subscription see paywall
  if (!canUseCRM) {
    return <Paywall onTrialStarted={refresh} />;
  }

  // Users with active subscription can use the app
  return <>{children}</>;
};

/**
 * TrialBanner component to show trial status
 */
export const TrialBanner = () => {
  const { isTrialing, daysRemaining, isAdmin, canUseCRM } = useSubscription();

  // Don't show banner for admins or if user can't use CRM
  if (isAdmin || !canUseCRM) {
    return null;
  }

  // Only show for trialing users
  if (!isTrialing || daysRemaining === null) {
    return null;
  }

  const isUrgent = daysRemaining <= 3;
  const bgColor = isUrgent ? "bg-destructive" : "bg-primary";
  const textColor = isUrgent ? "text-destructive-foreground" : "text-primary-foreground";

  return (
    <div className={`${bgColor} ${textColor} px-4 py-2 text-center text-sm`}>
      {daysRemaining === 0 ? (
        <span>Your trial ends today! <a href="/billing" className="underline font-medium">Upgrade now</a> to keep using Custly.</span>
      ) : daysRemaining === 1 ? (
        <span>Your trial ends tomorrow! <a href="/billing" className="underline font-medium">Upgrade now</a> to keep using Custly.</span>
      ) : (
        <span>{daysRemaining} days left in your free trial. <a href="/billing" className="underline font-medium">View plans</a></span>
      )}
    </div>
  );
};
