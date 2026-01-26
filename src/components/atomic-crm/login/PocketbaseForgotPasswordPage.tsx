import { useState } from "react";
import { Link } from "react-router";
import { ArrowLeft, Mail } from "lucide-react";
import { useNotify, useTranslate } from "ra-core";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { getPocketBaseUrl } from "../providers/pocketbase/client";
import { LocaleMenuButton } from "./LocaleMenuButton";
import { MarketingBackdrop } from "./MarketingBackdrop";

export const PocketbaseForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const notify = useNotify();
  const translate = useTranslate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email) return;
    setIsLoading(true);
    try {
      const response = await fetch(
        `${getPocketBaseUrl()}/api/collections/sales/request-password-reset`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        },
      );
      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Request failed");
      }
      setSent(true);
      notify(translate("marketing.auth.reset_request.success"), {
        type: "success",
      });
    } catch (error: any) {
      notify(
        error?.message || translate("marketing.auth.reset_request.error"),
        { type: "error" },
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-background via-muted/20 to-background flex items-center justify-center p-6">
      <MarketingBackdrop />
      <div className="relative z-10 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/login">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {translate("marketing.auth.reset_request.back_to_login")}
            </Link>
          </Button>
          <LocaleMenuButton />
        </div>

        <Card className="shadow-xl border-border/60 bg-card/80 backdrop-blur ring-1 ring-primary/10">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold tracking-tight">
              {translate("marketing.auth.reset_request.title")}
            </CardTitle>
            <CardDescription>
              {translate("marketing.auth.reset_request.subtitle")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">
                  {translate("marketing.auth.reset_request.email_label")}
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder={translate(
                      "marketing.auth.reset_request.email_placeholder",
                    )}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || sent}
              >
                {isLoading
                  ? translate("marketing.auth.reset_request.submitting")
                  : translate("marketing.auth.reset_request.submit")}
              </Button>
            </form>
            {sent ? (
              <div className="text-sm text-muted-foreground text-center">
                {translate("marketing.auth.reset_request.sent_hint")}
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

PocketbaseForgotPasswordPage.path = "/forgot-password";
