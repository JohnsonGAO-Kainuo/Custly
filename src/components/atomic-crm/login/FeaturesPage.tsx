import { Link } from "react-router";
import { useTranslate } from "ra-core";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LocaleMenuButton } from "./LocaleMenuButton";
import { MarketingBackdrop } from "./MarketingBackdrop";
import { 
  ArrowLeft, 
  Users, 
  Building2, 
  TrendingUp, 
  FileText, 
  CheckSquare, 
  Mail,
  BarChart3,
  Shield,
  Zap,
  Globe,
  Smartphone,
  Lock
} from "lucide-react";

export const FeaturesPage = () => {
  const translate = useTranslate();
  const demoUrl = import.meta.env.VITE_DEMO_URL?.trim() || "/?demo=1";

  const features = [
    {
      icon: Users,
      key: "contact_management",
    },
    {
      icon: Building2,
      key: "company_profiles",
    },
    {
      icon: TrendingUp,
      key: "deal_pipeline",
    },
    {
      icon: FileText,
      key: "notes_documents",
    },
    {
      icon: CheckSquare,
      key: "task_management",
    },
    {
      icon: Mail,
      key: "email_integration",
    },
    {
      icon: BarChart3,
      key: "advanced_analytics",
    },
    {
      icon: Shield,
      key: "enterprise_security",
    },
    {
      icon: Zap,
      key: "workflow_automation",
    },
    {
      icon: Globe,
      key: "api_access",
    },
    {
      icon: Smartphone,
      key: "mobile_apps",
    },
    {
      icon: Lock,
      key: "role_based_access",
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
                <img src="/logo.svg" alt="Custly" className="h-11 w-auto" />
              </Link>
              <nav className="hidden md:flex gap-1">
                <Link
                  to="/features"
                  className="px-4 py-2 text-sm font-medium rounded-lg transition-all bg-primary/10 text-primary font-semibold"
                >
                  {translate("marketing.nav.features")}
                </Link>
                <Link
                  to="/pricing"
                  className="px-4 py-2 text-sm font-medium rounded-lg transition-all text-muted-foreground hover:text-foreground hover:bg-muted/50"
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
      <div className="container mx-auto px-6 py-20">
        <Button variant="ghost" size="sm" asChild className="mb-8">
          <Link to="/landing">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {translate("marketing.common.back_to_home")}
          </Link>
        </Button>

        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary mb-4">
            {translate("marketing.nav.features")}
          </div>
          <h1 className="text-5xl font-bold tracking-tight mb-6">
            {translate("marketing.features_page.hero.title")}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {translate("marketing.features_page.hero.subtitle")}
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {features.map((feature) => {
            const Icon = feature.icon;
            const title = translate(
              `marketing.features_page.items.${feature.key}.title`,
            );
            const description = translate(
              `marketing.features_page.items.${feature.key}.description`,
            );
            return (
              <Card
                key={feature.key}
                className="group border-border/60 hover:border-primary/50 hover:-translate-y-1 hover:shadow-md transition-all"
              >
                <CardHeader>
                  <div className="mb-4 inline-flex p-3 bg-primary/10 rounded-lg w-fit">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center">
            <Card className="max-w-3xl mx-auto bg-gradient-to-br from-primary/10 via-card to-card border-primary/20 shadow-sm">
              <CardHeader className="space-y-4">
                <CardTitle className="text-3xl">
                  {translate("marketing.features_page.cta.title")}
                </CardTitle>
                <CardDescription className="text-lg">
                  {translate("marketing.features_page.cta.subtitle")}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild>
                  <Link to="/sign-up">
                    {translate("marketing.features_page.cta.primary")}
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/pricing">
                    {translate("marketing.features_page.cta.secondary")}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

      {/* Footer */}
      <footer className="border-t border-border/40 mt-20">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              {translate("marketing.features_page.footer.copyright")}
            </p>
            <div className="flex gap-6">
              <a href="https://github.com/JohnsonGAO-Kainuo/Custly" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {translate("marketing.features_page.footer.github")}
              </a>
              <Link to="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {translate("marketing.features_page.footer.pricing")}
              </Link>
              <Link to="/faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {translate("marketing.features_page.footer.support")}
              </Link>
            </div>
          </div>
        </div>
      </footer>
      </div>
    </div>
  );
};

FeaturesPage.path = "/features";
