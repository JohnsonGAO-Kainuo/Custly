import { useLocation } from "react-router";
import { LandingPage } from "./LandingPage";
import { EnhancedLoginPage } from "./EnhancedLoginPage";

/**
 * LoginGateway - Smart router for the login page
 *
 * When React Admin redirects unauthenticated users from protected routes (e.g., /),
 * it adds ?redirectTo=/ to the URL. In this case, show the Landing Page.
 *
 * When users explicitly click "Sign In" on the landing page,
 * they navigate to /login without params. In this case, show the login form.
 */
export const LoginGateway = (props: any) => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  // If redirected from a protected route (has ?redirectTo param), show landing page
  if (searchParams.has("redirectTo")) {
    return <LandingPage />;
  }

  // User navigated directly to /login → show actual login form
  return <EnhancedLoginPage {...props} />;
};

LoginGateway.path = "/login";
