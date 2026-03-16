import { Link } from "react-router";
import { useTranslate } from "ra-core";
import { usePageSEO } from "@/hooks/usePageSEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, ArrowLeft } from "lucide-react";
import { LocaleMenuButton } from "./LocaleMenuButton";
import { MarketingBackdrop } from "./MarketingBackdrop";
import {
  PRICING,
} from "../providers/pocketbase/subscriptionService";

export const PricingPage = () => {
  const translate = useTranslate();
  const demoUrl = "/demo";

  usePageSEO({
    title: "CRM Pricing — From $20/mo, Free 14-Day Trial",
    description: "Start free, no credit card needed. Simple CRM pricing: Monthly $20, Yearly $168 (save 30%), or Lifetime $399. All plans include unlimited contacts, deal pipeline, templates.",
    canonical: "https://custlycrm.com/pricing",
    keywords: "CRM pricing, cheap CRM, affordable CRM, CRM cost, free CRM, CRM free trial, free CRM trial, try CRM free, CRM plans, CRM monthly plan, CRM lifetime deal, small business CRM price, best value CRM, CRM subscription, CRM no credit card",
  });

  const plans = [
    {
      price: `$${PRICING.monthly.price}`,
      key: "monthly",
      periodKey: "marketing.pricing_page.period.month",
      featureKeys: [
        "unlimited_contacts",
        "deal_pipeline",
        "activity_timeline",
        "templates",
        "import_export",
        "email_support",
      ],
      popular: false
    },
    {
      price: `$${PRICING.yearly.price}`,
      key: "yearly",
      periodKey: "marketing.pricing_page.period.year",
      savings: PRICING.yearly.savings,
      featureKeys: [
        "unlimited_contacts",
        "deal_pipeline",
        "activity_timeline",
        "templates",
        "import_export",
        "priority_support",
      ],
      popular: true
    },
    {
      price: `$${PRICING.lifetime.price}`,
      key: "lifetime",
      periodKey: "marketing.pricing_page.period.lifetime",
      featureKeys: [
        "unlimited_contacts",
        "deal_pipeline",
        "activity_timeline",
        "templates",
        "import_export",
        "priority_support",
        "lifetime_updates",
        "no_recurring",
      ],
      popular: false
    }
  ];

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <MarketingBackdrop />
      <div className="relative z-10">
        {/* Header */}
        <div className="border-b border-border/40 bg-card/30 backdrop-blur-sm">
          <div className="container mx-auto px-6">
            <div className="flex items-center justify-between h-16">
              <Link to="/landing" className="flex items-center hover:opacity-80 transition-opacity">
                <img src="/logo.svg" alt="Custly" className="h-14 w-auto" />
              </Link>
              <nav className="hidden md:flex gap-1">
                <Link
                  to="/features"
                  className="px-4 py-2 text-sm font-medium rounded-lg transition-all text-muted-foreground hover:text-foreground hover:bg-muted/50"
                >
                  {translate("marketing.nav.features")}
                </Link>
                <Link
                  to="/pricing"
                  className="px-4 py-2 text-sm font-medium rounded-lg transition-all bg-primary/10 text-primary font-semibold"
                >
                  {translate("marketing.nav.pricing")}
                </Link>
                <Link
                  to="/faq"
                  className="px-4 py-2 text-sm font-medium rounded-lg transition-all text-muted-foreground hover:text-foreground hover:bg-muted/50"
                >
                  {translate("marketing.nav.faq")}
                </Link>
              </nav>
              <div className="flex items-center gap-4">
                <LocaleMenuButton />
                <Button variant="outline" asChild>
                  <a href={demoUrl} target="_blank" rel="noreferrer">
                    {translate("marketing.common.view_demo")}
                  </a>
                </Button>
                <Button variant="ghost" asChild>
                  <Link to="/login">{translate("marketing.common.sign_in")}</Link>
                </Button>
                <Button asChild>
                  <Link to="/sign-up">
                    {translate("marketing.common.get_started")}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

      {/* Hero Section */}
      <div className="container mx-auto px-6 py-20 text-center">
        <Button variant="ghost" size="sm" asChild className="mb-8">
          <Link to="/landing">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {translate("marketing.common.back_to_home")}
          </Link>
        </Button>

        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary mb-4">
          {translate("marketing.nav.pricing")}
        </div>
        <h1 className="text-5xl font-bold tracking-tight mb-6">
          {translate("marketing.pricing_page.hero.title")}
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          {translate("marketing.pricing_page.hero.subtitle")}
        </p>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => {
            const planName = translate(
              `marketing.pricing_page.plans.${plan.key}.name`,
            );
            const planDescription = translate(
              `marketing.pricing_page.plans.${plan.key}.description`,
            );
            const priceLabel = plan.price;
            const periodLabel = plan.periodKey
              ? translate(plan.periodKey)
              : "";
            return (
              <Card
                key={plan.key}
                className={`relative overflow-hidden transition-all ${plan.popular ? "border-primary shadow-lg scale-105" : "hover:-translate-y-1 hover:shadow-md"}`}
              >
                {plan.popular && (
                  <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-br from-primary/15 via-transparent to-transparent" />
                )}
                {plan.popular && (
                  <div className="absolute top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                      {plan.savings ? plan.savings : translate("marketing.pricing_page.most_popular")}
                    </span>
                  </div>
                )}
                <CardHeader
                  className={`relative z-10 text-center pb-8 ${plan.popular ? "pt-10" : ""}`}
                >
                  <CardTitle className="text-2xl mb-2">{planName}</CardTitle>
                  <CardDescription className="text-base">
                    {planDescription}
                  </CardDescription>
                  <div className="mt-6">
                    <span className="text-5xl font-bold">{priceLabel}</span>
                    {periodLabel && (
                      <span className="text-muted-foreground ml-1">
                        {periodLabel}
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="relative z-10 space-y-6">
                  <ul className="space-y-3">
                    {plan.featureKeys.map((featureKey) => (
                      <li key={featureKey} className="flex items-start gap-3">
                        <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-muted-foreground">
                          {translate(
                            `marketing.pricing_page.features.${featureKey}`,
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full"
                    variant={plan.popular ? "default" : "outline"}
                    asChild
                  >
                    <Link to="/sign-up">
                      {translate("marketing.common.start_free_trial")}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* FAQ Link */}
        <div className="mt-20 text-center">
          <p className="text-muted-foreground mb-4">
            {translate("marketing.pricing_page.cta.question")}
          </p>
          <Button variant="link" asChild>
            <Link to="/faq">{translate("marketing.pricing_page.cta.link")}</Link>
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border/40 mt-20">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              {translate("marketing.pricing_page.footer.copyright")}
            </p>
            <div className="flex gap-6">
              <a href="https://github.com/JohnsonGAO-Kainuo/Custly" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {translate("marketing.pricing_page.footer.github")}
              </a>
              <Link to="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {translate("marketing.pricing_page.footer.pricing")}
              </Link>
              <Link to="/faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {translate("marketing.pricing_page.footer.support")}
              </Link>
            </div>
          </div>
        </div>
      </footer>
      </div>
    </div>
  );
};

PricingPage.path = "/pricing";
