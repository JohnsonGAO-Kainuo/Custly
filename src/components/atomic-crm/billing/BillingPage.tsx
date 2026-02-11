import { useEffect, useState } from "react";
import { useNotify } from "ra-core";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  Crown,
  Clock,
  AlertTriangle,
  ExternalLink,
  ArrowLeft,
  Zap,
  Shield,
  Users,
  BarChart3,
} from "lucide-react";
import {
  getSubscriptionStatus,
  createCheckoutSession,
  openCustomerPortal,
  PRICING,
  type SubscriptionStatus,
} from "../providers/pocketbase/subscriptionService";

const features = [
  { icon: Users, text: "Unlimited contacts & companies" },
  { icon: BarChart3, text: "Deal pipeline management" },
  { icon: Clock, text: "Activity timeline" },
  { icon: Zap, text: "Templates & automation" },
  { icon: Shield, text: "Data import/export" },
];

const PricingCard = ({
  plan,
  pricing,
  isPopular,
  onSelect,
  isLoading,
  currentPlan,
}: {
  plan: "monthly" | "yearly" | "lifetime";
  pricing: typeof PRICING.monthly | typeof PRICING.yearly | typeof PRICING.lifetime;
  isPopular?: boolean;
  onSelect: (plan: "monthly" | "yearly" | "lifetime") => void;
  isLoading: boolean;
  currentPlan?: string;
}) => {
  const isCurrent = currentPlan === plan;

  return (
    <Card className={`relative ${isPopular ? "border-primary shadow-lg" : ""}`}>
      {isPopular && (
        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">
          Most Popular
        </Badge>
      )}
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-lg capitalize">{plan}</CardTitle>
        <div className="mt-4">
          <span className="text-4xl font-bold">${pricing.price}</span>
          {pricing.interval !== "one-time" && (
            <span className="text-muted-foreground">/{pricing.interval}</span>
          )}
        </div>
        {"savings" in pricing && (
          <Badge variant="secondary" className="mt-2">
            {pricing.savings}
          </Badge>
        )}
      </CardHeader>
      <CardContent className="pt-4">
        <ul className="space-y-2 mb-6">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-green-500" />
              <span>{feature.text}</span>
            </li>
          ))}
          {plan !== "monthly" && (
            <li className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-green-500" />
              <span>14-day free trial</span>
            </li>
          )}
        </ul>
        <Button
          className="w-full"
          variant={isPopular ? "default" : "outline"}
          onClick={() => onSelect(plan)}
          disabled={isLoading || isCurrent}
        >
          {isCurrent ? "Current Plan" : isLoading ? "Loading..." : "Get Started"}
        </Button>
      </CardContent>
    </Card>
  );
};

export const BillingPage = () => {
  const notify = useNotify();
  const [status, setStatus] = useState<SubscriptionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const [isActivating, setIsActivating] = useState(false);

  useEffect(() => {
    loadSubscriptionStatus();
    
    // Check for success/canceled query params
    const hash = window.location.hash;
    if (hash.includes("success=true")) {
      setIsActivating(true);
      // Poll until subscription is active (webhook may take a few seconds)
      let attempts = 0;
      const maxAttempts = 15;
      const pollInterval = setInterval(async () => {
        attempts++;
        const result = await getSubscriptionStatus();
        if (result.hasActiveSubscription || attempts >= maxAttempts) {
          clearInterval(pollInterval);
          setStatus(result);
          setIsActivating(false);
          setIsLoading(false);
          if (result.hasActiveSubscription) {
            notify("Subscription activated successfully!", { type: "success" });
          } else {
            notify("Subscription is being activated. Please refresh in a moment.", { type: "info" });
          }
          // Clean up URL
          window.history.replaceState({}, "", window.location.pathname + "#/billing");
        }
      }, 2000);
      return () => clearInterval(pollInterval);
    } else if (hash.includes("canceled=true")) {
      notify("Checkout was canceled", { type: "info" });
      window.history.replaceState({}, "", window.location.pathname + "#/billing");
    }
  }, [notify]);

  const loadSubscriptionStatus = async () => {
    setIsLoading(true);
    try {
      const result = await getSubscriptionStatus();
      setStatus(result);
    } catch (error) {
      console.error("Failed to load subscription status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPlan = async (plan: "monthly" | "yearly" | "lifetime") => {
    setCheckoutLoading(true);
    try {
      const result = await createCheckoutSession(plan);
      if (result.url) {
        window.location.href = result.url;
      } else {
        notify(result.error || "Failed to start checkout", { type: "error" });
      }
    } catch (error) {
      notify("Failed to start checkout", { type: "error" });
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    setCheckoutLoading(true);
    try {
      const result = await openCustomerPortal();
      if (result.url) {
        window.location.href = result.url;
      } else {
        notify(result.error || "Failed to open billing portal", { type: "error" });
      }
    } catch (error) {
      notify("Failed to open billing portal", { type: "error" });
    } finally {
      setCheckoutLoading(false);
    }
  };

  const getStatusBadge = () => {
    if (!status?.subscription) return null;

    switch (status.subscription.status) {
      case "trialing":
        return (
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" />
            Trial - {status.daysRemaining} days left
          </Badge>
        );
      case "active":
        return (
          <Badge variant="default" className="gap-1 bg-green-500">
            <Check className="h-3 w-3" />
            Active
          </Badge>
        );
      case "lifetime":
        return (
          <Badge variant="default" className="gap-1 bg-yellow-500">
            <Crown className="h-3 w-3" />
            Lifetime
          </Badge>
        );
      case "past_due":
        return (
          <Badge variant="destructive" className="gap-1">
            <AlertTriangle className="h-3 w-3" />
            Payment Failed
          </Badge>
        );
      case "canceled":
        return (
          <Badge variant="outline" className="gap-1">
            Canceled
          </Badge>
        );
      default:
        return null;
    }
  };

  if (isActivating) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="text-muted-foreground">Activating your subscription...</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container max-w-5xl mx-auto py-8 px-4">
      <div className="mb-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
      </div>

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {status?.hasActiveSubscription ? "Your Subscription" : "Choose Your Plan"}
        </h1>
        <p className="text-muted-foreground">
          {status?.hasActiveSubscription
            ? "Manage your subscription and billing"
            : "Start your 14-day free trial today. Cancel anytime."}
        </p>
      </div>

      {/* Current Subscription Status */}
      {status?.subscription && (
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Current Plan</CardTitle>
                <CardDescription className="capitalize">
                  {status.subscription.plan_type} Plan
                </CardDescription>
              </div>
              {getStatusBadge()}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              {status.subscription.stripe_customer_id && (
                <Button
                  variant="outline"
                  onClick={handleManageSubscription}
                  disabled={checkoutLoading}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Manage Subscription
                </Button>
              )}
              {status.subscription.status === "trialing" && (
                <p className="text-sm text-muted-foreground self-center">
                  Your trial ends on{" "}
                  {status.subscription.trial_end
                    ? new Date(status.subscription.trial_end).toLocaleDateString()
                    : "N/A"}
                </p>
              )}
              {status.subscription.cancel_at_period_end && (
                <p className="text-sm text-orange-500 self-center">
                  Your subscription will cancel at the end of the billing period
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pricing Cards */}
      {(!status?.hasActiveSubscription || status?.subscription?.status === "trialing") && (
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <PricingCard
            plan="monthly"
            pricing={PRICING.monthly}
            onSelect={handleSelectPlan}
            isLoading={checkoutLoading}
            currentPlan={status?.subscription?.plan_type}
          />
          <PricingCard
            plan="yearly"
            pricing={PRICING.yearly}
            isPopular
            onSelect={handleSelectPlan}
            isLoading={checkoutLoading}
            currentPlan={status?.subscription?.plan_type}
          />
          <PricingCard
            plan="lifetime"
            pricing={PRICING.lifetime}
            onSelect={handleSelectPlan}
            isLoading={checkoutLoading}
            currentPlan={status?.subscription?.plan_type}
          />
        </div>
      )}

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-1">What's included in the free trial?</h4>
            <p className="text-sm text-muted-foreground">
              You get full access to all features for 14 days. A credit card is required to start your trial, but you won't be charged until the trial ends.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-1">Can I cancel anytime?</h4>
            <p className="text-sm text-muted-foreground">
              Yes, you can cancel your subscription at any time through the Stripe Customer Portal. You'll continue to have access until the end of your billing period.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-1">How do I manage my subscription?</h4>
            <p className="text-sm text-muted-foreground">
              Click the "Manage Subscription" button above to access the Stripe Customer Portal where you can update payment methods, view invoices, change plans, or cancel your subscription.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-1">What payment methods do you accept?</h4>
            <p className="text-sm text-muted-foreground">
              We accept all major credit cards through Stripe's secure payment processing.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Footer Links */}
      <div className="mt-8 text-center text-sm text-muted-foreground">
        <Link to="/privacy" className="hover:underline">
          Privacy Policy
        </Link>
        <span className="mx-2">•</span>
        <Link to="/terms" className="hover:underline">
          Terms of Service
        </Link>
      </div>
    </div>
  );
};

export default BillingPage;
