import { type ReactNode } from "react";
import { useSubscription } from "./SubscriptionContext";
import { Loader2, AlertTriangle } from "lucide-react";

interface SubscriptionGuardProps {
  children: ReactNode;
}

/**
 * SubscriptionGuard component that wraps content.
 * When subscription expires, users enter read-only mode (can view data, not edit).
 * A persistent banner encourages re-subscription.
 * Mutations are blocked at the dataProvider level via readOnlyDataProvider.
 */
export const SubscriptionGuard = ({ children }: SubscriptionGuardProps) => {
  const { isLoading } = useSubscription();

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

  // Always render children — expired users get read-only access
  // Mutations are blocked at the dataProvider level
  return <>{children}</>;
};

/**
 * ExpiredBanner component — shown when subscription has expired.
 * Non-blocking persistent banner that encourages re-subscription.
 */
export const ExpiredBanner = () => {
  const { isExpired } = useSubscription();

  if (!isExpired) {
    return null;
  }

  return (
    <div className="bg-destructive text-destructive-foreground px-4 py-3 text-center text-sm">
      <div className="flex items-center justify-center gap-2">
        <AlertTriangle className="h-4 w-4 flex-shrink-0" />
        <span>
          Your subscription has expired. You can still view and export your data, but editing is disabled.{" "}
          <a href="/#/billing" className="underline font-medium hover:opacity-80">
            Subscribe now
          </a>{" "}
          to regain full access.
        </span>
      </div>
    </div>
  );
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
        <span>Your trial ends today! <a href="/#/billing" className="underline font-medium">Choose a plan</a> to keep using Custly.</span>
      ) : daysRemaining === 1 ? (
        <span>Your trial ends tomorrow! <a href="/#/billing" className="underline font-medium">Choose a plan</a> to keep using Custly.</span>
      ) : (
        <span>{daysRemaining} days left in your free trial. <a href="/#/billing" className="underline font-medium">View plans</a></span>
      )}
    </div>
  );
};
