import { useState } from "react";
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
  Shield,
  Loader2,
} from "lucide-react";
import {
  createCheckoutSession,
  PRICING,
} from "../providers/pocketbase/subscriptionService";

const features = [
  "Unlimited contacts & companies",
  "Deal pipeline management",
  "Activity timeline",
  "Templates & automation",
  "Data import/export",
];

export const Paywall = ({ onTrialStarted }: { onTrialStarted?: () => void }) => {
  const notify = useNotify();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleSelectPlan = async (plan: "monthly" | "yearly" | "lifetime") => {
    setIsLoading(true);
    setLoadingPlan(plan);
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
      setIsLoading(false);
      setLoadingPlan(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <Card className="max-w-3xl w-full my-8">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Choose Your Plan</CardTitle>
          <CardDescription className="text-base">
            Start with a 14-day free trial. Cancel anytime.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Features List */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 py-4 border-y">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            {/* Monthly */}
            <Card 
              className={`relative cursor-pointer transition-all hover:shadow-md ${loadingPlan === 'monthly' ? 'ring-2 ring-primary' : ''}`}
              onClick={() => !isLoading && handleSelectPlan("monthly")}
            >
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-lg">Monthly</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">${PRICING.monthly.price}</span>
                  <span className="text-muted-foreground">/mo</span>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <ul className="space-y-2 mb-6">
                  {features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span>14-day free trial</span>
                  </li>
                </ul>
                <Button 
                  className="w-full" 
                  variant="outline"
                  disabled={isLoading}
                >
                  {loadingPlan === 'monthly' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Start Free Trial"
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Yearly - Most Popular */}
            <Card 
              className={`relative cursor-pointer transition-all hover:shadow-md border-primary shadow-lg ${loadingPlan === 'yearly' ? 'ring-2 ring-primary' : ''}`}
              onClick={() => !isLoading && handleSelectPlan("yearly")}
            >
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">
                Most Popular
              </Badge>
              <CardHeader className="text-center pb-2 pt-6">
                <CardTitle className="text-lg">Yearly</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">${PRICING.yearly.price}</span>
                  <span className="text-muted-foreground">/yr</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">~$14/month</p>
              </CardHeader>
              <CardContent className="pt-4">
                <ul className="space-y-2 mb-6">
                  {features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span>14-day free trial</span>
                  </li>
                </ul>
                <Button 
                  className="w-full"
                  disabled={isLoading}
                >
                  {loadingPlan === 'yearly' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Start Free Trial"
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Lifetime */}
            <Card 
              className={`relative cursor-pointer transition-all hover:shadow-md ${loadingPlan === 'lifetime' ? 'ring-2 ring-primary' : ''}`}
              onClick={() => !isLoading && handleSelectPlan("lifetime")}
            >
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-lg">Lifetime</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">${PRICING.lifetime.price}</span>
                  <span className="text-muted-foreground"> once</span>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <ul className="space-y-2 mb-6">
                  {features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span>No subscription needed</span>
                  </li>
                </ul>
                <Button 
                  className="w-full" 
                  variant="outline"
                  disabled={isLoading}
                >
                  {loadingPlan === 'lifetime' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Buy Now"
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Trust indicators */}
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground pt-2">
            <div className="flex items-center gap-1">
              <Shield className="h-4 w-4" />
              <span>Secure payment</span>
            </div>
            <div className="flex items-center gap-1">
              <Check className="h-4 w-4" />
              <span>Cancel anytime</span>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-xs text-muted-foreground">
            By continuing, you agree to our{" "}
            <Link to="/terms" className="underline hover:text-foreground">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link to="/privacy" className="underline hover:text-foreground">
              Privacy Policy
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Paywall;
