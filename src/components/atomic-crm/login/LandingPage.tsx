import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { useState } from "react";
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
  // Smooth scroll to section
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header - Figma Style */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-card/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <Link to="/landing" className="flex items-center gap-2 group">
              <img src="/logo.svg" alt="Custly" className="h-8 w-auto" />
            </Link>

            {/* Center Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              <NavItem label="Solutions" onClick={() => scrollToSection('features')} />
              <NavItem label="Industries" onClick={() => scrollToSection('industries')} />
              <NavItem label="Resources" onClick={() => scrollToSection('faq')} />
              <NavItem label="Customers" onClick={() => scrollToSection('trust')} />
              <NavItem label="Pricing" onClick={() => scrollToSection('cta')} />
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              <GitHubIconButton />
              <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground">
                <Link to="/login">Sign in</Link>
              </Button>
              <Button size="sm" asChild className="rounded-md px-4">
                <Link to="/sign-up">Sign up</Link>
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
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <h1 className="text-4xl md:text-5xl font-serif font-normal text-foreground/90 leading-tight">
              CRM for Modern Business
            </h1>
            <p className="text-base text-muted-foreground leading-relaxed max-w-xl mx-auto">
              Custly helps teams manage customer relationships with elegance and efficiency
            </p>

            {/* CTA Button */}
            <div className="pt-4">
              <Button size="lg" asChild className="rounded-md px-6 gap-2">
                <Link to="/sign-up">
                  Try now
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>

            {/* Search/Demo Box */}
            <div className="mt-12 max-w-xl mx-auto">
              <div className="rounded-lg border border-border/60 bg-card/60 backdrop-blur-sm p-5 shadow-sm">
                <p className="text-sm text-muted-foreground text-left mb-3">
                  How can we help you manage customers better?
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground/60">Great question!</span>
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <ArrowRight className="w-4 h-4 text-primary" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section id="trust" className="py-12 border-y border-border/30">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-xs text-muted-foreground/60 tracking-wider mb-8">
            TRUSTED BY TEAMS WORLDWIDE
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
            <span className="text-lg font-bold text-muted-foreground/50">ACME</span>
            <span className="text-lg font-semibold text-muted-foreground/50">TechCorp</span>
            <span className="text-lg font-serif text-muted-foreground/50">Stanford</span>
            <span className="text-lg font-medium text-muted-foreground/50">GlobalInc</span>
            <span className="text-lg text-muted-foreground/50">Innovate</span>
          </div>
          <div className="text-center mt-8">
            <Button variant="outline" size="sm" className="rounded-full text-xs px-4 gap-1">
              READ OUR CUSTOMER STORIES
              <ArrowRight className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </section>

      {/* Value Proposition Section */}
      <section className="py-20 bg-primary/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-serif font-normal text-foreground/90 mb-4">
              Stand on the shoulders of giants
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Use Custly to understand your customers better, so that you can grow your business faster.
            </p>
          </div>
        </div>
      </section>

      {/* How We're Different Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-serif font-normal text-foreground/90 mb-3">
              How we're different
            </h2>
            <p className="text-sm text-muted-foreground mb-10">
              There are a lot of CRM tools out there. What makes Custly unique?
            </p>

            <div className="grid md:grid-cols-4 gap-8">
              <DifferentiatorCard 
                icon={<Layers className="w-4 h-4" />}
                title="Scale"
                description="Manage thousands of contacts and analyze data points at once."
              />
              <DifferentiatorCard 
                icon={<CheckCircle2 className="w-4 h-4" />}
                title="Accuracy"
                description="The most accurate CRM with validated data and smart deduplication."
              />
              <DifferentiatorCard 
                icon={<Eye className="w-4 h-4" />}
                title="Transparency"
                description="All actions are tracked with complete audit trails."
              />
              <DifferentiatorCard 
                icon={<TrendingUp className="w-4 h-4" />}
                title="More than chat"
                description="Rich interactive tables and multi-step workflows."
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
              INDUSTRIES
            </div>
            <h2 className="text-2xl font-serif font-normal text-foreground/90 mb-2">
              We serve a diverse world
            </h2>
            <p className="text-sm text-muted-foreground mb-10">
              Custly supports teams across many domains and industries
            </p>

            <div className="space-y-4">
              <IndustryCard 
                title="Professional Services"
                description="Bring clients onboard and manage relationships efficiently"
              />
              <IndustryCard 
                title="Technology"
                description="Track leads and customers through the sales pipeline"
              />
              <IndustryCard 
                title="Healthcare"
                description="Manage patient relationships with care and compliance"
              />
              <IndustryCard 
                title="Retail & E-commerce"
                description="Build customer loyalty and drive repeat purchases"
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
              Everything You Need
            </h3>
            <p className="text-muted-foreground text-base">
              Powerful features to manage your customer relationships
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard
              icon={<Users className="w-6 h-6" />}
              title="Contact Management"
              description="Keep all your contacts organized in one place with custom fields and tags."
            />
            <FeatureCard
              icon={<TrendingUp className="w-6 h-6" />}
              title="Deal Pipeline"
              description="Visualize your sales pipeline with an intuitive Kanban board interface."
            />
            <FeatureCard
              icon={<Mail className="w-6 h-6" />}
              title="Email Integration"
              description="Capture emails automatically and keep track of all communications."
            />
            <FeatureCard
              icon={<ClipboardList className="w-6 h-6" />}
              title="Task Management"
              description="Never miss a follow-up with built-in task tracking and reminders."
            />
            <FeatureCard
              icon={<Shield className="w-6 h-6" />}
              title="Team Collaboration"
              description="Work together with your team on deals and customer interactions."
            />
            <FeatureCard
              icon={<BarChart3 className="w-6 h-6" />}
              title="Analytics"
              description="Gain insights with comprehensive reports and dashboards."
            />
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-primary text-primary-foreground">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-serif font-normal mb-10 text-primary-foreground/90">
              FAQ
            </h2>
            <div className="space-y-6">
              <FAQItem question="How do you ensure data quality?" />
              <FAQItem question="Is Custly free?" />
              <FAQItem question="What integrations do you support?" />
              <FAQItem question="Who is Custly built for?" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="cta" className="py-20 bg-gradient-to-br from-primary/10 via-primary/5 to-background">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-serif font-normal mb-3">
              <span className="text-primary/80">Save time, think better.</span>
            </h2>
            <h2 className="text-3xl md:text-4xl font-serif font-normal mb-8 text-muted-foreground">
              Try Custly for free
            </h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" variant="secondary" asChild className="min-w-[160px] bg-accent text-accent-foreground border border-accent">
                <Link to="/sign-up">
                  Sign up
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="min-w-[160px]">
                <Link to="/login">Talk to Sales</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - Figma Style */}
      <footer className="bg-primary text-primary-foreground py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-5 gap-8 mb-12">
            {/* Logo */}
            <div className="md:col-span-1">
              <Link to="/landing" className="flex items-center gap-2 mb-4">
                <img src="/logo.svg" alt="Custly" className="h-10 w-auto brightness-0 invert" />
              </Link>
            </div>

            {/* Solutions */}
            <div>
              <h4 className="text-xs font-bold text-primary-foreground/60 mb-4 tracking-wider">SOLUTIONS</h4>
              <ul className="space-y-3">
                <FooterLink>Contact Management</FooterLink>
                <FooterLink>Deal Pipeline</FooterLink>
                <FooterLink>Reports</FooterLink>
                <FooterLink>Integrations</FooterLink>
              </ul>
            </div>

            {/* Industries */}
            <div>
              <h4 className="text-xs font-bold text-primary-foreground/60 mb-4 tracking-wider">INDUSTRIES</h4>
              <ul className="space-y-3">
                <FooterLink>Technology</FooterLink>
                <FooterLink>Healthcare</FooterLink>
                <FooterLink>Professional Services</FooterLink>
                <FooterLink>Retail</FooterLink>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="text-xs font-bold text-primary-foreground/60 mb-4 tracking-wider">RESOURCES</h4>
              <ul className="space-y-3">
                <FooterLink>Customers</FooterLink>
                <FooterLink>Blog</FooterLink>
                <FooterLink>Help center</FooterLink>
                <FooterLink>Documentation</FooterLink>
              </ul>
            </div>

            {/* More */}
            <div>
              <h4 className="text-xs font-bold text-primary-foreground/60 mb-4 tracking-wider">MORE</h4>
              <ul className="space-y-3">
                <FooterLink>Team</FooterLink>
                <FooterLink>Careers</FooterLink>
                <FooterLink>Contact</FooterLink>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-primary-foreground/10 flex flex-col md:flex-row items-center justify-between gap-4">
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
            <div className="flex items-center gap-6 text-sm text-primary-foreground/60">
              <span>© 2026 Custly, Inc.</span>
              <Link to="#" className="hover:text-primary-foreground transition-colors">Privacy policy</Link>
              <Link to="#" className="hover:text-primary-foreground transition-colors">Terms of service</Link>
              <Link to="#" className="hover:text-primary-foreground transition-colors">Policies</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Component: Navigation Item
const NavItem = ({ label, onClick }: { label: string; onClick?: () => void }) => (
  <button 
    onClick={onClick}
    className="flex items-center gap-1 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
  >
    {label}
  </button>
);

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
}: {
  title: string;
  description: string;
}) => (
  <div className="rounded-lg border border-border/60 bg-card/60 p-4 flex items-center justify-between group hover:bg-card transition-colors">
    <div>
      <h4 className="text-sm font-medium text-foreground/80 mb-1">{title}</h4>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
    <Button size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
      Learn more
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
  <div className="group rounded-2xl border border-border/60 bg-card/40 p-6 hover:bg-card/60 hover:shadow-lg transition-all">
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
const FooterLink = ({ children }: { children: React.ReactNode }) => (
  <li>
    <Link to="#" className="text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
      {children}
    </Link>
  </li>
);

LandingPage.path = "/landing";
