import { CRM } from "@/components/atomic-crm/root/CRM";
import {
  authProvider as fakerestAuthProvider,
  dataProvider as fakerestDataProvider,
} from "@/components/atomic-crm/providers/fakerest";

const isDemoPath =
  typeof window !== "undefined" && window.location.pathname.startsWith("/demo");
const isDemoHash =
  typeof window !== "undefined" && window.location.hash.startsWith("#/demo");
const isDemo = isDemoPath || isDemoHash;

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
      basename="/demo"
    />
  ) : (
    <CRM />
  );

export default App;
