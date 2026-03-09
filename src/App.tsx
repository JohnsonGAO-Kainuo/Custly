import { CRM } from "@/components/atomic-crm/root/CRM";
import {
  authProvider as fakerestAuthProvider,
  dataProvider as fakerestDataProvider,
} from "@/components/atomic-crm/providers/fakerest";

const pathname =
  typeof window !== "undefined" ? window.location.pathname : "";
const isDemoPath = pathname.startsWith("/demo");
// Demo mode is ONLY via /demo path (used by demo build with fakerest)
// ?demo=1 query parameter is NOT supported — prevents production bypass
const isDemo = isDemoPath;
const demoBasename = isDemoPath ? "/demo" : undefined;

/**
 * Application entry point
 *
 * Customize Atomic CRM by passing props to the CRM component:
 *  - contactGender
 *  - companySectors
 *  - darkTheme
 *  - dealCategories
 *  - dealPipelineStatuses
 *  - dealStages
 *  - lightTheme
 *  - logo
 *  - noteStatuses
 *  - taskTypes
 *  - title
 * ... as well as all the props accepted by shadcn-admin-kit's <Admin> component.
 *
 * @example
 * const App = () => (
 *    <CRM
 *       logo="./img/logo.png"
 *       title="Acme CRM"
 *    />
 * );
 */
const App = () =>
  isDemo ? (
    <CRM
      dataProvider={fakerestDataProvider}
      authProvider={fakerestAuthProvider}
      requireAuth={false}
      basename={demoBasename}
    />
  ) : (
    <CRM />
  );

export default App;
