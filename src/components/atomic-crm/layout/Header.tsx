import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { LayoutGrid, Settings, User, CreditCard } from "lucide-react";
import { CanAccess, useTranslate } from "ra-core";
import { Link, matchPath, useLocation } from "react-router";
import { RefreshButton } from "@/components/admin/refresh-button";
import { ThemeModeToggle } from "@/components/admin/theme-mode-toggle";
import { UserMenu } from "@/components/admin/user-menu";
import { LocalesMenuButton } from "@/components/admin/locales-menu-button";
import { useUserMenu } from "@/hooks/user-menu-context";

import { useConfigurationContext } from "../root/ConfigurationContext";

const Header = () => {
  const { darkModeLogo, lightModeLogo, title } = useConfigurationContext();
  const translate = useTranslate();
  const location = useLocation();

  let currentPath: string | boolean = "/";
  if (matchPath("/", location.pathname)) {
    currentPath = "/";
  } else if (matchPath("/contacts/*", location.pathname)) {
    currentPath = "/contacts";
  } else if (matchPath("/companies/*", location.pathname)) {
    currentPath = "/companies";
  } else if (matchPath("/deals/*", location.pathname)) {
    currentPath = "/deals";
  } else if (matchPath("/templates/*", location.pathname)) {
    currentPath = "/templates";
  } else {
    currentPath = false;
  }

  return (
    <nav className="flex-grow">
      <header className="bg-card/30 backdrop-blur-sm border-b border-border/40">
        <div className="px-6">
          <div className="flex justify-between items-center flex-1 h-16">
            <Link
              to="/"
              className="flex items-center gap-3 text-foreground no-underline group"
            >
              <img
                src="/logo.svg"
                alt="Custly"
                className="h-9 transition-transform group-hover:scale-105"
              />
            </Link>
            <div>
              <nav className="flex gap-1">
                <NavigationTab
                  label={translate("crm.nav.dashboard")}
                  to="/"
                  isActive={currentPath === "/"}
                />
                <NavigationTab
                  label={translate("crm.nav.contacts")}
                  to="/contacts"
                  isActive={currentPath === "/contacts"}
                />
                <NavigationTab
                  label={translate("crm.nav.companies")}
                  to="/companies"
                  isActive={currentPath === "/companies"}
                />
                <NavigationTab
                  label={translate("crm.nav.deals")}
                  to="/deals"
                  isActive={currentPath === "/deals"}
                />
                <NavigationTab
                  label={translate("crm.nav.templates")}
                  to="/templates"
                  isActive={currentPath === "/templates"}
                />
              </nav>
            </div>
            <div className="flex items-center gap-1">
              <LocalesMenuButton />
              <ThemeModeToggle />
              <RefreshButton />
              <UserMenu>
                <ConfigurationMenu />
                <CanAccess resource="sales" action="list">
                  <UsersMenu />
                </CanAccess>
              </UserMenu>
            </div>
          </div>
        </div>
      </header>
    </nav>
  );
};

const NavigationTab = ({
  label,
  to,
  isActive,
}: {
  label: string;
  to: string;
  isActive: boolean;
}) => (
  <Link
    to={to}
    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
      isActive
        ? "bg-primary/10 text-primary font-semibold"
        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
    }`}
  >
    {label}
  </Link>
);

const UsersMenu = () => {
  const { onClose } = useUserMenu() ?? {};
  const translate = useTranslate();
  return (
    <DropdownMenuItem asChild onClick={onClose}>
      <Link to="/sales" className="flex items-center gap-2">
        <User /> {translate("crm.menu.users")}
      </Link>
    </DropdownMenuItem>
  );
};

const ConfigurationMenu = () => {
  const { onClose } = useUserMenu() ?? {};
  const translate = useTranslate();
  return (
    <>
      <DropdownMenuItem asChild onClick={onClose}>
        <Link to="/templates" className="flex items-center gap-2">
          <LayoutGrid />
          {translate("crm.menu.templates")}
        </Link>
      </DropdownMenuItem>
      <DropdownMenuItem asChild onClick={onClose}>
        <Link to="/billing" className="flex items-center gap-2">
          <CreditCard />
          {translate("crm.menu.billing")}
        </Link>
      </DropdownMenuItem>
      <DropdownMenuItem asChild onClick={onClose}>
        <Link to="/settings" className="flex items-center gap-2">
          <Settings />
          {translate("crm.menu.profile")}
        </Link>
      </DropdownMenuItem>
    </>
  );
};
export default Header;
