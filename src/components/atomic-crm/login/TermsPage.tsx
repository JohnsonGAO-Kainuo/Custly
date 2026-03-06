import { ArrowLeft } from "lucide-react";
import { Link } from "react-router";
import { useTranslate } from "ra-core";
import { usePageSEO } from "@/hooks/usePageSEO";
import { Button } from "@/components/ui/button";
import { LocaleMenuButton } from "./LocaleMenuButton";
import { MarketingBackdrop } from "./MarketingBackdrop";

const LegalSection = ({ title, body }: { title: string; body: string }) => (
  <div className="space-y-2">
    <h3 className="text-lg font-semibold text-foreground/90">{title}</h3>
    <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
  </div>
);

export const TermsPage = () => {
  const translate = useTranslate();

  usePageSEO({
    title: "Terms of Service — Custly CRM",
    description: "Terms and conditions for using the Custly CRM platform. Eligibility, acceptable use, service modifications, and contact information.",
    canonical: "https://custlycrm.com/terms",
  });

  return (
    <div className="relative min-h-screen bg-background">
      <MarketingBackdrop />
      <div className="relative z-10">
        <header className="border-b border-border/40 bg-card/30 backdrop-blur-sm">
          <div className="max-w-5xl mx-auto px-6">
            <div className="flex items-center justify-between h-16">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/landing">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {translate("marketing.common.back_to_home")}
                </Link>
              </Button>
              <LocaleMenuButton />
            </div>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-6 py-14">
          <div className="space-y-4 mb-10">
            <h1 className="text-3xl md:text-4xl font-serif font-normal text-foreground/90">
              {translate("marketing.legal.terms.title")}
            </h1>
            <p className="text-base text-muted-foreground max-w-2xl">
              {translate("marketing.legal.terms.subtitle")}
            </p>
          </div>

          <div className="grid gap-8">
            <LegalSection
              title={translate("marketing.legal.terms.sections.eligibility.title")}
              body={translate("marketing.legal.terms.sections.eligibility.body")}
            />
            <LegalSection
              title={translate("marketing.legal.terms.sections.usage.title")}
              body={translate("marketing.legal.terms.sections.usage.body")}
            />
            <LegalSection
              title={translate("marketing.legal.terms.sections.changes.title")}
              body={translate("marketing.legal.terms.sections.changes.body")}
            />
            <LegalSection
              title={translate("marketing.legal.terms.sections.contact.title")}
              body={translate("marketing.legal.terms.sections.contact.body")}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

TermsPage.path = "/terms";
