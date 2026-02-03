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
  Lock,
  Crown,
  Zap,
  Shield,
  Users,
  BarChart3,
  Clock,
} from "lucide-react";
import {
  createCheckoutSession,
  startFreeTrial,
  PRICING,
} from "../providers/pocketbase/subscriptionService";

const features = [
  { icon: Users, text: "Unlimited contacts & companies" },
  { icon: BarChart3, text: "Deal pipeline management" },
  { icon: Clock, text: "Activity timeline" },
  { icon: Zap, text: "Templates & automation" },
  { icon: Shield, text: "Data import/export" },
];

export const Paywall = ({ onTrialStarted }: { onTrialStarted?: () => void }) => {
  const notify = useNotify();
  const [isLoading, setIsLoading] = useState(false);

  const handleStartTrial = async () => {
    setIsLoading(true);
    try {
      const success = await startFreeTrial();
      if (success) {
        notify("Your 14-day free trial has started!", { type: "success" });
        onTrialStarted?.();
        // Reload the page to reflect the new subscription status
        window.location.reload();
      } else {
        notify("Failed to start trial. You may already have a subscription.", { type: "error" });
      }
    } catch (error) {
      notify("Failed to start trial", { type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPlan = async (plan: "monthly" | "yearly" | "lifetime") => {
    setIsLoading(true);
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
    }
  };

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">
            Start Your Free Trial
          </CardTitle>
          <CardDescription className="text-base">
            Get full access to Custly CRM for 14 days. No credit card required.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Features List */}
          <div className="grid grid-cols-2 gap-3">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                <span>{feature.text}</span>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="space-y-3">
            <Button
              className="w-full h-12 text-lg"
              onClick={handleStartTrial}
              disabled={isLoading}
            >
              <Zap className="h-5 w-5 mr-2" />
              Start 14-Day Free Trial
            </Button>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or subscribe now
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Button
                variant="outline"
                className="flex flex-col h-auto py-3"
                onClick={() => handleSelectPlan("monthly")}
                disabled={isLoading}
              >
                <span className="font-bold">${PRICING.monthly.price}</span>
                <span className="text-xs text-muted-foreground">/month</span>
              </Button>
              <Button
                variant="outline"
                className="flex flex-col h-auto py-3 border-primary relative"
                onClick={() => handleSelectPlan("yearly")}
                disabled={isLoading}
              >
                <Badge className="absolute -top-2 text-xs" variant="default">
                  Save 30%
                </Badge>
                <span className="font-bold">${PRICING.yearly.price}</span>
                <span className="text-xs text-muted-foreground">/year</span>
              </Button>
              <Button
                variant="outline"
                className="flex flex-col h-auto py-3"
                onClick={() => handleSelectPlan("lifetime")}
                disabled={isLoading}
              >
                <Crown className="h-4 w-4 text-yellow-500 mb-1" />
                <span className="font-bold">${PRICING.lifetime.price}</span>
                <span className="text-xs text-muted-foreground">lifetime</span>
              </Button>
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
