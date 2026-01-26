import { Link, useLocation } from "react-router";
import { useTranslate } from "ra-core";
import { Users, Settings, Palette } from "lucide-react";

interface NavItem {
  key: string;
  href: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  {
    key: "features",
    href: "/features",
    icon: <Users className="w-4 h-4" />,
  },
  {
    key: "pricing",
    href: "/pricing",
    icon: <Settings className="w-4 h-4" />,
  },
  {
    key: "faq",
    href: "/faq",
    icon: <Palette className="w-4 h-4" />,
  },
];

export const ModernNav = () => {
  const location = useLocation();
  const translate = useTranslate();
  
  return (
    <nav className="inline-flex flex-row bg-primary/10 backdrop-blur-sm rounded-lg items-center px-1 border border-primary/20">
      {navItems.map((item) => {
        const isActive = location.pathname === item.href;
        const label = translate(`marketing.nav.${item.key}`);
        
        return (
          <Link
            key={item.href}
            to={item.href}
            className={`
              relative flex items-center gap-2 px-4 py-2.5 mx-1.5 my-1
              text-sm text-foreground rounded-md
              transition-all duration-200
              hover:bg-primary/20
              ${isActive ? 'bg-primary/20' : 'bg-transparent'}
            `}
          >
            {/* Blue indicator bar - using padding to prevent layout shift */}
            <span 
              className={`
                absolute left-0 top-[20%] w-1 h-[60%] bg-primary rounded-full
                transition-opacity duration-200
                ${isActive ? 'opacity-100' : 'opacity-0'}
              `}
            />
            
            {/* Icon */}
            <span className="[&>svg]:text-primary [&>svg]:fill-current">
              {item.icon}
            </span>
            
            {/* Label */}
            <span className="font-medium">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
};
