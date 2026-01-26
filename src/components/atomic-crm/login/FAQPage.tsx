import { Link } from "react-router";
import { useTranslate } from "ra-core";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { LocaleMenuButton } from "./LocaleMenuButton";
import { MarketingBackdrop } from "./MarketingBackdrop";

export const FAQPage = () => {
  const translate = useTranslate();

  const faqKeys = [
    "what_is",
    "pricing",
    "trial",
    "payment_methods",
    "data_security",
    "data_import",
    "support",
    "cancel_subscription",
    "integrations",
    "mobile_app",
    "user_limits",
    "contact_limits",
    "training",
    "customization",
    "uptime",
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
                  className="px-4 py-2 text-sm font-medium rounded-lg transition-all text-muted-foreground hover:text-foreground hover:bg-muted/50"
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
                  className="px-4 py-2 text-sm font-medium rounded-lg transition-all bg-primary/10 text-primary font-semibold"
                >
                  {translate("marketing.nav.faq")}
                </Link>
              </nav>
              <div className="flex items-center gap-4">
                <LocaleMenuButton />
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
            {translate("marketing.nav.faq")}
          </div>
          <h1 className="text-5xl font-bold tracking-tight mb-6">
            {translate("marketing.faq_page.hero.title")}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {translate("marketing.faq_page.hero.subtitle")}
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqKeys.map((faqKey, index) => (
              <AccordionItem 
                key={faqKey}
                value={`item-${index}`}
                className="border border-border/60 rounded-lg px-6 data-[state=open]:border-primary/50 transition-shadow hover:shadow-sm"
              >
                <AccordionTrigger className="text-left hover:no-underline py-6">
                  <span className="text-lg font-semibold pr-4">
                    {translate(`marketing.faq_page.items.${faqKey}.question`)}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pb-6">
                  {translate(`marketing.faq_page.items.${faqKey}.answer`)}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Contact Support CTA */}
        <div className="mt-20">
          <Card className="max-w-2xl mx-auto bg-gradient-to-br from-primary/10 via-card to-card border-primary/20 shadow-sm">
            <CardHeader className="text-center space-y-4">
              <div className="inline-flex p-4 bg-primary/10 rounded-full w-fit mx-auto">
                <MessageCircle className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">
                {translate("marketing.faq_page.contact.title")}
              </CardTitle>
              <CardDescription className="text-lg">
                {translate("marketing.faq_page.contact.subtitle")}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <a href="mailto:support@custly.com">
                  {translate("marketing.faq_page.contact.primary")}
                </a>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/sign-up">
                  {translate("marketing.faq_page.contact.secondary")}
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
              {translate("marketing.faq_page.footer.copyright")}
            </p>
            <div className="flex gap-6">
              <a href="https://github.com/JohnsonGAO-Kainuo/Custly" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {translate("marketing.faq_page.footer.github")}
              </a>
              <Link to="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {translate("marketing.faq_page.footer.pricing")}
              </Link>
              <Link to="/faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {translate("marketing.faq_page.footer.support")}
              </Link>
            </div>
          </div>
        </div>
      </footer>
      </div>
    </div>
  );
};

FAQPage.path = "/faq";
