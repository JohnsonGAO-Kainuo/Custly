import { useState } from "react";
import { Link, useSearchParams } from "react-router";
import { ArrowLeft, Lock } from "lucide-react";
import { useNotify, useTranslate } from "ra-core";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { getPocketBaseUrl } from "../providers/pocketbase/client";
import { LocaleMenuButton } from "./LocaleMenuButton";
import { MarketingBackdrop } from "./MarketingBackdrop";

export const PocketbaseResetPasswordPage = () => {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [done, setDone] = useState(false);
  const notify = useNotify();
  const translate = useTranslate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!token) return;
    if (password !== confirm) {
      notify(translate("marketing.auth.reset_confirm.mismatch"), {
        type: "warning",
      });
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(
        `${getPocketBaseUrl()}/api/collections/sales/confirm-password-reset`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token,
            password,
            passwordConfirm: confirm,
          }),
        },
      );
      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || "Request failed");
      }
      setDone(true);
      notify(translate("marketing.auth.reset_confirm.success"), {
        type: "success",
      });
    } catch (error: any) {
      notify(
        error?.message || translate("marketing.auth.reset_confirm.error"),
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
              {translate("marketing.auth.reset_confirm.back_to_login")}
            </Link>
          </Button>
          <LocaleMenuButton />
        </div>

        <Card className="shadow-xl border-border/60 bg-card/80 backdrop-blur ring-1 ring-primary/10">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold tracking-tight">
              {translate("marketing.auth.reset_confirm.title")}
            </CardTitle>
            <CardDescription>
              {translate("marketing.auth.reset_confirm.subtitle")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!token ? (
              <div className="text-sm text-muted-foreground text-center">
                {translate("marketing.auth.reset_confirm.missing_token")}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">
                    {translate("marketing.auth.reset_confirm.password_label")}
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder={translate(
                        "marketing.auth.reset_confirm.password_placeholder",
                      )}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      required
                      disabled={isLoading || done}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm">
                    {translate("marketing.auth.reset_confirm.confirm_label")}
                  </Label>
                  <Input
                    id="confirm"
                    type="password"
                    placeholder={translate(
                      "marketing.auth.reset_confirm.confirm_placeholder",
                    )}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                    disabled={isLoading || done}
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading || done}
                >
                  {isLoading
                    ? translate("marketing.auth.reset_confirm.submitting")
                    : translate("marketing.auth.reset_confirm.submit")}
                </Button>
              </form>
            )}
            {done ? (
              <div className="text-sm text-muted-foreground text-center">
                {translate("marketing.auth.reset_confirm.done_hint")}{" "}
                <Link to="/login" className="text-primary hover:underline">
                  {translate("marketing.auth.reset_confirm.back_to_login")}
                </Link>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

PocketbaseResetPasswordPage.path = "/reset-password";
