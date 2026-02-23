import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Github, Mail, ArrowLeft } from "lucide-react";
import { useLogin, useNotify, useTranslate } from "ra-core";
import { LocaleMenuButton } from "./LocaleMenuButton";
import { MarketingBackdrop } from "./MarketingBackdrop";
import { usePocketbaseOAuthProviders } from "./usePocketbaseOAuthProviders";

export const EnhancedLoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const login = useLogin();
  const notify = useNotify();
  const translate = useTranslate();
  const backend = import.meta.env.VITE_BACKEND?.toLowerCase() ?? "supabase";
  const isPocketbase = backend === "pocketbase";
  const { providers: pocketbaseProviders } = usePocketbaseOAuthProviders(
    isPocketbase,
    typeof window !== "undefined"
      ? `${window.location.origin}/login`
      : "/login",
  );
  const supportsOAuth =
    backend === "supabase" || (isPocketbase && pocketbaseProviders.length > 0);
  const supportsPasswordReset =
    backend === "supabase" || backend === "pocketbase";

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login({ email, password });
      notify(translate("marketing.auth.login.login_success"), { type: "success" });
      navigate("/", { replace: true });
    } catch (error: any) {
      // Try to get error code from the error object
      const errorCode = error?.code || "invalid_credentials";
      const translationKey = `marketing.auth.login.${errorCode}`;
      
      // Try translated message first, fallback to error message or default
      let errorMessage = translate(translationKey, { _: "" });
      if (!errorMessage || errorMessage === translationKey) {
        errorMessage = error?.message || translate("marketing.auth.login.invalid_credentials");
      }
      
      notify(errorMessage, { type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: "github" | "google") => {
    setIsLoading(true);
    try {
      await login({ provider });
      navigate("/", { replace: true });
    } catch (error) {
      const providerLabel = provider === "github" ? "GitHub" : "Google";
      notify(
        translate("marketing.auth.login.oauth_failed", {
          provider: providerLabel,
        }),
        { type: "error" },
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isPocketbase) return;
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const state = params.get("state");
    const oauthError = params.get("error");
    const errorDescription = params.get("error_description");

    // Debug: log OAuth callback params
    if (code || state || oauthError) {
      // eslint-disable-next-line no-console
      console.log("[OAuth Callback]", { code: code?.substring(0, 20) + "...", state, oauthError, errorDescription });
    }

    if (oauthError) {
      // eslint-disable-next-line no-console
      console.error("[OAuth Error]", oauthError, errorDescription);
      notify(
        errorDescription || translate("marketing.auth.login.oauth_failed", {
          provider: "OAuth",
        }),
        { type: "error" },
      );
      params.delete("error");
      params.delete("error_description");
      window.history.replaceState({}, "", `${window.location.pathname}`);
      return;
    }

    if (!code || !state) return;

    setIsLoading(true);
    // eslint-disable-next-line no-console
    console.log("[OAuth] Starting login with code and state...");
    
    login({ code, state })
      .then(() => {
        // eslint-disable-next-line no-console
        console.log("[OAuth] Login successful!");
        const url = new URL(window.location.href);
        url.searchParams.delete("code");
        url.searchParams.delete("state");
        url.searchParams.delete("error");
        window.history.replaceState({}, "", url.toString());
        navigate("/", { replace: true });
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error("[OAuth] Login failed:", error);
        const errorMessage = error?.message || error?.toString() || "Unknown error";
        notify(errorMessage, { type: "error" });
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [isPocketbase, login, notify, translate, navigate]);

  // 如果是从根路径 / 被 React Admin 重定向过来的，跳转到 Landing Page
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const redirectTo = params.get("redirectTo");
    if (redirectTo === "/" || redirectTo === "%2F") {
      navigate("/landing", { replace: true });
      return;
    }
  }, [navigate]);

  // 如果已经有有效登录态，直接跳转到主页
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    // 只检查真正的 auth 状态（必须有 token 和 record）
    const checkValidAuth = () => {
      const authKeys = ["custly_pb_auth", "custly_pb_auth_session"];
      for (const key of authKeys) {
        const raw = window.localStorage.getItem(key) || window.sessionStorage.getItem(key);
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            if (parsed?.token && parsed?.record) {
              return true;
            }
          } catch {
            // 无效 JSON
          }
        }
      }
      return false;
    };
    
    if (checkValidAuth()) {
      navigate("/", { replace: true });
    }
  }, [navigate]);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-background via-muted/20 to-background flex items-center justify-center p-6">
      <MarketingBackdrop />
      <div className="relative z-10 w-full max-w-md">
        {/* Back to Landing */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/landing">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {translate("marketing.common.back_to_home")}
            </Link>
          </Button>
          <LocaleMenuButton />
        </div>

        <Card className="shadow-xl border-border/60 bg-card/80 backdrop-blur ring-1 ring-primary/10">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold tracking-tight">
              {translate("marketing.auth.login.title")}
            </CardTitle>
            <CardDescription>
              {translate("marketing.auth.login.subtitle")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* OAuth Buttons */}
            {supportsOAuth ? (
              <>
                <div className="space-y-3">
                  {(!isPocketbase ||
                    pocketbaseProviders.includes("github")) && (
                    <Button
                      variant="outline"
                      className="w-full !bg-[#24292e] hover:!bg-[#1a1e22] !text-white !border-[#24292e] hover:!border-[#1a1e22] [&>svg]:!text-white"
                      style={{ backgroundColor: "#24292e", color: "#ffffff", borderColor: "#24292e" }}
                      onClick={() => handleOAuthLogin("github")}
                      disabled={isLoading}
                    >
                      <Github className="mr-2 h-5 w-5" />
                      {translate("marketing.auth.login.oauth_github")}
                    </Button>
                  )}
                  {(!isPocketbase ||
                    pocketbaseProviders.includes("google")) && (
                    <Button
                      variant="outline"
                      className="w-full !bg-white hover:!bg-gray-50 !text-gray-900 !border-gray-300 hover:!border-gray-400"
                      style={{ backgroundColor: "#ffffff", color: "#111827", borderColor: "#d1d5db" }}
                      onClick={() => handleOAuthLogin("google")}
                      disabled={isLoading}
                    >
                      <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      {translate("marketing.auth.login.oauth_google")}
                    </Button>
                  )}
                </div>

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                      {translate("marketing.auth.login.or_email")}
                    </span>
                  </div>
                </div>
              </>
            ) : null}

            {/* Email Login Form */}
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">
                  {translate("marketing.auth.login.email_label")}
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder={translate("marketing.auth.login.email_placeholder")}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">
                    {translate("marketing.auth.login.password_label")}
                  </Label>
                  {supportsPasswordReset ? (
                    <Link
                      to="/forgot-password"
                      className="text-sm text-primary hover:underline"
                    >
                      {translate("marketing.auth.login.forgot_password")}
                    </Link>
                  ) : null}
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading
                  ? translate("marketing.auth.login.submitting")
                  : translate("marketing.auth.login.submit")}
              </Button>
            </form>

            {/* Sign Up Link */}
            <div className="text-center text-sm text-muted-foreground">
              {translate("marketing.auth.login.no_account")}{" "}
              <Link to="/sign-up" className="text-primary hover:underline font-medium">
                {translate("marketing.auth.login.sign_up")}
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

EnhancedLoginPage.path = "/login";
