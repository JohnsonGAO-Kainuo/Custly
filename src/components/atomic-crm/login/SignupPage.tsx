import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, ArrowLeft, Github, Mail } from "lucide-react";
import { useDataProvider, useLogin, useNotify, useTranslate } from "ra-core";
import { useForm, type SubmitHandler } from "react-hook-form";
import { Navigate, Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import type { CrmDataProvider } from "../providers/types";
import { useConfigurationContext } from "../root/ConfigurationContext";
import type { SignUpData } from "../types";
import { LoginSkeleton } from "./LoginSkeleton";
import { Notification } from "@/components/admin/notification";
import { LocaleMenuButton } from "./LocaleMenuButton";
import { MarketingBackdrop } from "./MarketingBackdrop";
import { usePocketbaseOAuthProviders } from "./usePocketbaseOAuthProviders";

export const SignupPage = () => {
  const queryClient = useQueryClient();
  const dataProvider = useDataProvider<CrmDataProvider>();
  const { darkModeLogo: logo, title } = useConfigurationContext();
  const { data: isInitialized, isPending } = useQuery({
    queryKey: ["init"],
    queryFn: async () => {
      return dataProvider.isInitialized();
    },
  });

  const { isPending: isSignUpPending, mutate } = useMutation({
    mutationKey: ["signup"],
    mutationFn: async (data: SignUpData) => {
      return dataProvider.signUp(data);
    },
    onSuccess: (data) => {
      login({
        email: data.email,
        password: data.password,
        redirectTo: "/",
      }).then(() => {
        notify(translate("marketing.auth.signup.success"), { type: "success" });
        // FIXME: We should probably provide a hook for that in the ra-core package
        queryClient.invalidateQueries({
          queryKey: ["auth", "canAccess"],
        });
      }).catch((err) => {
        // Registration succeeded but login failed - still show success and redirect to login
        notify(translate("marketing.auth.signup.success_please_login"), { type: "success" });
        window.location.href = "/login";
      });
    },
    onError: (error: Error) => {
      // Parse the error message
      let errorMessage = error.message;
      let shouldRedirectToLogin = false;
      
      try {
        const parsed = JSON.parse(error.message);
        if (parsed.data?.email?.code === "validation_not_unique") {
          errorMessage = translate("marketing.auth.signup.email_exists");
          shouldRedirectToLogin = true;
        } else if (parsed.message) {
          errorMessage = parsed.message;
        }
      } catch {
        // Use original message if parsing fails
      }
      
      notify(errorMessage, { type: "error" });
      
      // If email exists, redirect to login after a short delay so user can see the message
      if (shouldRedirectToLogin) {
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
      }
    },
  });

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
  const allowMultipleSignups = isPocketbase;
  const showOAuth = supportsOAuth && (!isInitialized || isPocketbase);

  const {
    register,
    handleSubmit,
    formState: { isValid },
  } = useForm<SignUpData>({
    mode: "onChange",
  });

  if (isPending) {
    return <LoginSkeleton />;
  }

  // For Supabase demo, only allow the first user to sign up.
  if (isInitialized && !allowMultipleSignups) {
    return <Navigate to="/login" />;
  }

  const onSubmit: SubmitHandler<SignUpData> = async (data) => {
    mutate(data);
  };

  const handleOAuthLogin = async (provider: "github" | "google") => {
    try {
      await login({ provider });
    } catch (error) {
      const providerLabel = provider === "github" ? "GitHub" : "Google";
      notify(
        translate("marketing.auth.login.oauth_failed", {
          provider: providerLabel,
        }),
        { type: "error" },
      );
    }
  };

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
              {isInitialized && !allowMultipleSignups
                ? translate("marketing.auth.signup.title_existing")
                : translate("marketing.auth.signup.title_new")}
            </CardTitle>
            <CardDescription>
              {isInitialized && !allowMultipleSignups
                ? translate("marketing.auth.signup.subtitle_existing")
                : translate("marketing.auth.signup.subtitle_new")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* OAuth Buttons - only show for initial signup */}
            {showOAuth ? (
              <>
                <div className="space-y-3">
                  {(!isPocketbase ||
                    pocketbaseProviders.includes("github")) && (
                    <Button
                      variant="outline"
                      className="w-full !bg-[#24292e] hover:!bg-[#1a1e22] !text-white !border-[#24292e] hover:!border-[#1a1e22] [&>svg]:!text-white"
                      style={{ backgroundColor: "#24292e", color: "#ffffff", borderColor: "#24292e" }}
                      onClick={() => handleOAuthLogin("github")}
                    >
                      <Github className="mr-2 h-5 w-5" />
                      {translate("marketing.auth.signup.oauth_github")}
                    </Button>
                  )}
                  {(!isPocketbase ||
                    pocketbaseProviders.includes("google")) && (
                    <Button
                      variant="outline"
                      className="w-full !bg-white hover:!bg-gray-50 !text-gray-900 !border-gray-300 hover:!border-gray-400"
                      style={{ backgroundColor: "#ffffff", color: "#111827", borderColor: "#d1d5db" }}
                      onClick={() => handleOAuthLogin("google")}
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
                      {translate("marketing.auth.signup.oauth_google")}
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
                      {translate("marketing.auth.signup.or_email")}
                    </span>
                  </div>
                </div>
              </>
            ) : null}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">
                    {translate("marketing.auth.signup.first_name")}
                  </Label>
                  <Input
                    {...register("first_name", { required: true })}
                    id="first_name"
                    type="text"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">
                    {translate("marketing.auth.signup.last_name")}
                  </Label>
                  <Input
                    {...register("last_name", { required: true })}
                    id="last_name"
                    type="text"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">
                  {translate("marketing.auth.signup.email_label")}
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    {...register("email", { required: true })}
                    id="email"
                    type="email"
                    placeholder={translate("marketing.auth.signup.email_placeholder")}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">
                  {translate("marketing.auth.signup.password_label")}
                </Label>
                <Input
                  {...register("password", { required: true })}
                  id="password"
                  type="password"
                  placeholder={translate("marketing.auth.signup.password_placeholder")}
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={!isValid || isSignUpPending}
                className="w-full"
              >
                {isSignUpPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    {translate("marketing.auth.signup.submitting")}
                  </>
                ) : (
                  translate("marketing.auth.signup.submit")
                )}
              </Button>
            </form>

            {/* Sign In Link */}
            <div className="text-center text-sm text-muted-foreground">
              {translate("marketing.auth.signup.have_account")}{" "}
              <Link to="/login" className="text-primary hover:underline font-medium">
                {translate("marketing.auth.signup.sign_in")}
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
      <Notification />
    </div>
  );
};

SignupPage.path = "/sign-up";
