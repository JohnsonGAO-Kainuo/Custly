import { useState, type ElementType } from "react";
import { Link } from "react-router";
import { useTranslate } from "ra-core";
import { Button } from "@/components/ui/button";
import { LocaleMenuButton } from "./LocaleMenuButton";
import { MarketingBackdrop } from "./MarketingBackdrop";
import { 
  ArrowRight, 
  Users, 
  TrendingUp, 
  Mail, 
  CheckCircle2,
  ClipboardList,
  BarChart3,
  ChevronDown,
  Shield,
  Eye,
  Layers,
  Github
} from "lucide-react";

// GitHub Icon Button Component (styled-components design converted to Tailwind)
const GitHubIconButton = () => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <a
      href="https://github.com/JohnsonGAO-Kainuo/Custly"
      target="_blank"
      rel="noopener noreferrer"
      className="relative w-[45px] h-[45px] flex items-center justify-center rounded-[10px] overflow-hidden transition-all duration-300 group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: isHovered 
          ? 'linear-gradient(35deg, rgba(42, 95, 106, 0.12) 0%, rgba(42, 95, 106, 0.06) 100%)'
          : 'transparent',
        backdropFilter: isHovered ? 'blur(8px)' : 'none',
      }}
    >
      <svg 
        viewBox="0 0 24 24" 
        className="w-6 h-6 transition-transform duration-300"
        style={{
          transform: isHovered ? 'scale(1.1)' : 'scale(1)',
        }}
      >
        <path 
          fill="currentColor" 
          d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.167 6.839 9.49.5.092.682-.217.682-.482 0-.237-.009-.866-.013-1.7-2.782.604-3.369-1.341-3.369-1.341-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z"
          className="text-foreground/70 group-hover:text-primary transition-colors duration-300"
        />
      </svg>
    </a>
  );
};

export const LandingPage = () => {
  const translate = useTranslate();
  const demoUrl = import.meta.env.VITE_DEMO_URL?.trim() || "/demo";

  return (
    <div className="relative min-h-screen bg-background">
      <MarketingBackdrop />
      <div className="relative z-10">
        {/* Navigation Header */}
        <header className="sticky top-0 z-50 border-b border-border/40 bg-card/30 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <Link to="/landing" className="flex items-center gap-3 group">
                <img src="/logo.svg" alt="Custly" className="h-14 w-auto" />
              </Link>

              {/* Center Navigation - Fixed position, same style as CRM backend */}
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
                  className="px-4 py-2 text-sm font-medium rounded-lg transition-all text-muted-foreground hover:text-foreground hover:bg-muted/50"
                >
                  {translate("marketing.nav.faq")}
                </Link>
              </nav>

              {/* Right Actions */}
              <div className="flex items-center gap-2">
                <GitHubIconButton />
                <LocaleMenuButton />
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="rounded-md px-4"
                >
                  <a href={demoUrl} target="_blank" rel="noreferrer">
                    {translate("marketing.common.view_demo")}
                  </a>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Link to="/login">{translate("marketing.common.sign_in")}</Link>
                </Button>
                <Button size="sm" asChild className="rounded-md px-4">
                  <Link to="/sign-up">{translate("marketing.common.sign_up")}</Link>
                </Button>
              </div>
            </div>
          </div>
        </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-muted/30 via-muted/10 to-background" />

        <div className="relative max-w-7xl mx-auto px-6 pt-20 pb-24">
          <div className="text-center max-w-4xl mx-auto space-y-6">
            <h1 className="text-5xl md:text-6xl font-serif font-normal text-foreground/90 leading-tight">
              {translate("marketing.landing.hero.title")}
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              {translate("marketing.landing.hero.subtitle")}
            </p>

            {/* CTA Button */}
            <div className="pt-4">
              <div className="flex flex-col sm:flex-row justify-center gap-3">
                <Button size="lg" asChild className="rounded-md px-6 gap-2">
                  <Link to="/sign-up">
                    {translate("marketing.common.try_now")}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="rounded-md px-6 gap-2"
                >
                  <a href={demoUrl} target="_blank" rel="noreferrer">
                    {translate("marketing.common.view_demo")}
                  </a>
                </Button>
              </div>
            </div>

            {/* Search/Demo Box */}
            <div className="mt-12 max-w-xl mx-auto">
              <div className="rounded-lg border border-border/60 bg-card/60 backdrop-blur-sm p-5 shadow-sm">
                <p className="text-sm text-muted-foreground text-left mb-3">
                  {translate("marketing.landing.search.prompt")}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground/60">
                    {translate("marketing.landing.search.response")}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <ArrowRight className="w-4 h-4 text-primary" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Proposition Section */}
      <section className="py-20 bg-primary/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-serif font-normal text-foreground/90 mb-4">
              {translate("marketing.landing.value.title")}
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {translate("marketing.landing.value.description")}
            </p>
          </div>
        </div>
      </section>

      {/* How We're Different Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-serif font-normal text-foreground/90 mb-3">
              {translate("marketing.landing.differentiators.title")}
            </h2>
            <p className="text-sm text-muted-foreground mb-10">
              {translate("marketing.landing.differentiators.subtitle")}
            </p>

            <div className="grid md:grid-cols-4 gap-8">
              <DifferentiatorCard 
                icon={<Layers className="w-4 h-4" />}
                title={translate("marketing.landing.differentiators.items.scale.title")}
                description={translate("marketing.landing.differentiators.items.scale.description")}
              />
              <DifferentiatorCard 
                icon={<CheckCircle2 className="w-4 h-4" />}
                title={translate("marketing.landing.differentiators.items.accuracy.title")}
                description={translate("marketing.landing.differentiators.items.accuracy.description")}
              />
              <DifferentiatorCard 
                icon={<Eye className="w-4 h-4" />}
                title={translate("marketing.landing.differentiators.items.transparency.title")}
                description={translate("marketing.landing.differentiators.items.transparency.description")}
              />
              <DifferentiatorCard 
                icon={<TrendingUp className="w-4 h-4" />}
                title={translate("marketing.landing.differentiators.items.more_than_chat.title")}
                description={translate("marketing.landing.differentiators.items.more_than_chat.description")}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Industries Section */}
      <section id="industries" className="py-20 bg-muted/20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4">
              <Layers className="w-3 h-3" />
              {translate("marketing.landing.industries.label")}
            </div>
            <h2 className="text-2xl font-serif font-normal text-foreground/90 mb-2">
              {translate("marketing.landing.industries.title")}
            </h2>
            <p className="text-sm text-muted-foreground mb-10">
              {translate("marketing.landing.industries.subtitle")}
            </p>

            <div className="space-y-4">
              <IndustryCard 
                title={translate("marketing.landing.industries.items.professional_services.title")}
                description={translate("marketing.landing.industries.items.professional_services.description")}
                ctaLabel={translate("marketing.common.learn_more")}
              />
              <IndustryCard 
                title={translate("marketing.landing.industries.items.technology.title")}
                description={translate("marketing.landing.industries.items.technology.description")}
                ctaLabel={translate("marketing.common.learn_more")}
              />
              <IndustryCard 
                title={translate("marketing.landing.industries.items.healthcare.title")}
                description={translate("marketing.landing.industries.items.healthcare.description")}
                ctaLabel={translate("marketing.common.learn_more")}
              />
              <IndustryCard 
                title={translate("marketing.landing.industries.items.retail.title")}
                description={translate("marketing.landing.industries.items.retail.description")}
                ctaLabel={translate("marketing.common.learn_more")}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-serif font-normal mb-4 text-foreground/90">
              {translate("marketing.landing.features.title")}
            </h3>
            <p className="text-muted-foreground text-base">
              {translate("marketing.landing.features.subtitle")}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard
              icon={<Users className="w-6 h-6" />}
              title={translate("marketing.landing.features.items.contact_management.title")}
              description={translate("marketing.landing.features.items.contact_management.description")}
            />
            <FeatureCard
              icon={<TrendingUp className="w-6 h-6" />}
              title={translate("marketing.landing.features.items.deal_pipeline.title")}
              description={translate("marketing.landing.features.items.deal_pipeline.description")}
            />
            <FeatureCard
              icon={<Mail className="w-6 h-6" />}
              title={translate("marketing.landing.features.items.email_integration.title")}
              description={translate("marketing.landing.features.items.email_integration.description")}
            />
            <FeatureCard
              icon={<ClipboardList className="w-6 h-6" />}
              title={translate("marketing.landing.features.items.task_management.title")}
              description={translate("marketing.landing.features.items.task_management.description")}
            />
            <FeatureCard
              icon={<Shield className="w-6 h-6" />}
              title={translate("marketing.landing.features.items.team_collaboration.title")}
              description={translate("marketing.landing.features.items.team_collaboration.description")}
            />
            <FeatureCard
              icon={<BarChart3 className="w-6 h-6" />}
              title={translate("marketing.landing.features.items.analytics.title")}
              description={translate("marketing.landing.features.items.analytics.description")}
            />
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-serif font-normal mb-10 text-primary-foreground/90">
              {translate("marketing.landing.faq.title")}
            </h2>
            <div className="space-y-6">
              <FAQItem question={translate("marketing.landing.faq.items.data_quality")} />
              <FAQItem question={translate("marketing.landing.faq.items.free")} />
              <FAQItem question={translate("marketing.landing.faq.items.integrations")} />
              <FAQItem question={translate("marketing.landing.faq.items.built_for")} />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="cta" className="py-20 bg-gradient-to-br from-primary/10 via-primary/5 to-background">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-serif font-normal mb-3">
              <span className="text-primary/80">
                {translate("marketing.landing.cta.kicker")}
              </span>
            </h2>
            <h2 className="text-3xl md:text-4xl font-serif font-normal mb-8 text-muted-foreground">
              {translate("marketing.landing.cta.title")}
            </h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" variant="secondary" asChild className="min-w-[160px] bg-accent text-accent-foreground border border-accent">
                <Link to="/sign-up">
                  {translate("marketing.landing.cta.primary")}
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="min-w-[160px]">
                <Link to="/login">
                  {translate("marketing.landing.cta.secondary")}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8 py-10">
            <div className="space-y-4">
              <Link to="/landing" className="flex items-center gap-2">
                <img src="/logo.svg" alt="Custly" className="h-14 w-auto brightness-0 invert" />
              </Link>
              <p className="text-sm text-primary-foreground/70 max-w-xs">
                {translate("marketing.landing.footer.tagline")}
              </p>
            </div>

            <div>
              <h4 className="text-xs font-bold text-primary-foreground/60 mb-4 tracking-wider">
                {translate("marketing.landing.footer.sections.product")}
              </h4>
              <ul className="space-y-3">
                <FooterLink as={Link} to="/features">
                  {translate("marketing.landing.footer.links.features")}
                </FooterLink>
                <FooterLink as={Link} to="/pricing">
                  {translate("marketing.landing.footer.links.pricing")}
                </FooterLink>
                <FooterLink as={Link} to="/faq">
                  {translate("marketing.landing.footer.links.faq")}
                </FooterLink>
                <FooterLink as="a" href={demoUrl} target="_blank" rel="noreferrer">
                  {translate("marketing.landing.footer.links.demo")}
                </FooterLink>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold text-primary-foreground/60 mb-4 tracking-wider">
                {translate("marketing.landing.footer.sections.account")}
              </h4>
              <ul className="space-y-3">
                <FooterLink as={Link} to="/login">
                  {translate("marketing.landing.footer.links.sign_in")}
                </FooterLink>
                <FooterLink as={Link} to="/sign-up">
                  {translate("marketing.landing.footer.links.sign_up")}
                </FooterLink>
                <FooterLink as="a" href="mailto:contact@kainuotech.com">
                  {translate("marketing.landing.footer.links.contact")}
                </FooterLink>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="py-4 border-t border-primary-foreground/10 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-primary-foreground/60">
            <div className="flex items-center gap-4">
              <a 
                href="https://github.com/JohnsonGAO-Kainuo"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-primary-foreground/10 flex items-center justify-center text-primary-foreground/60 hover:text-primary-foreground hover:bg-primary-foreground/20 transition-all"
              >
                <Github className="w-5 h-5" />
              </a>
            </div>
            <div className="flex items-center gap-6">
              <span>{translate("marketing.landing.footer.bottom.copyright")}</span>
              <Link to="/privacy" className="hover:text-primary-foreground transition-colors">
                {translate("marketing.landing.footer.bottom.privacy")}
              </Link>
              <Link to="/terms" className="hover:text-primary-foreground transition-colors">
                {translate("marketing.landing.footer.bottom.terms")}
              </Link>
              <Link to="/policies" className="hover:text-primary-foreground transition-colors">
                {translate("marketing.landing.footer.bottom.policies")}
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Component: Differentiator Card
const DifferentiatorCard = ({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) => (
  <div className="space-y-2">
    <div className="flex items-center gap-2 text-foreground/80">
      {icon}
      <span className="text-xs font-medium">{title}</span>
    </div>
    <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
  </div>
);

// Component: Industry Card
const IndustryCard = ({
  title,
  description,
  ctaLabel,
}: {
  title: string;
  description: string;
  ctaLabel: string;
}) => (
  <div className="rounded-lg border border-border/60 bg-card/60 p-4 flex items-center justify-between group hover:bg-card hover:border-primary/30 transition-colors">
    <div>
      <h4 className="text-sm font-medium text-foreground/80 mb-1">{title}</h4>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
    <Button size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
      {ctaLabel}
      <ArrowRight className="w-3 h-3 ml-1" />
    </Button>
  </div>
);

// Component: Feature Card
const FeatureCard = ({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) => (
  <div className="group rounded-2xl border border-border/60 bg-card/40 p-6 hover:-translate-y-1 hover:bg-card/60 hover:shadow-lg transition-all">
    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 text-primary group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <h4 className="text-base font-semibold mb-2 text-foreground/90">{title}</h4>
    <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
  </div>
);


// Component: FAQ Item
const FAQItem = ({ question }: { question: string }) => (
  <div className="flex items-center justify-between py-4 border-b border-primary-foreground/20">
    <span className="text-base text-primary-foreground/80">{question}</span>
    <ChevronDown className="w-4 h-4 text-primary-foreground/60" />
  </div>
);

// Component: Footer Link
const FooterLink = ({
  as: Component = Link,
  to,
  href,
  children,
  ...rest
}: {
  as?: ElementType;
  to?: string;
  href?: string;
  children: React.ReactNode;
  [key: string]: any;
}) => {
  const className =
    "text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors";

  if (Component === "a") {
    return (
      <li>
        <a href={href} className={className} {...rest}>
          {children}
        </a>
      </li>
    );
  }

  return (
    <li>
      <Component to={to ?? "#"} className={className} {...rest}>
        {children}
      </Component>
    </li>
  );
};

LandingPage.path = "/landing";
