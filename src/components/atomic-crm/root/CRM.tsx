import {
  CustomRoutes,
  localStorageStore,
  Resource,
  type AuthProvider,
  type DataProvider,
} from "ra-core";
import { useEffect } from "react";
import { Route } from "react-router";
import { Admin } from "@/components/admin/admin";
import { ForgotPasswordPage } from "@/components/supabase/forgot-password-page";
import { SetPasswordPage } from "@/components/supabase/set-password-page";
import { OAuthConsentPage } from "@/components/supabase/oauth-consent-page";

import companies from "../companies";
import contacts from "../contacts";
import { Dashboard } from "../dashboard/Dashboard";
import deals from "../deals";
import { Layout } from "../layout/Layout";
import { SignupPage } from "../login/SignupPage";
import { LandingPage } from "../login/LandingPage";
import { StartPage } from "../login/StartPage";
import { EnhancedLoginPage } from "../login/EnhancedLoginPage";
import { PricingPage } from "../login/PricingPage";
import { FeaturesPage } from "../login/FeaturesPage";
import { FAQPage } from "../login/FAQPage";
import { PrivacyPage } from "../login/PrivacyPage";
import { TermsPage } from "../login/TermsPage";
import { PoliciesPage } from "../login/PoliciesPage";
import { PocketbaseForgotPasswordPage } from "../login/PocketbaseForgotPasswordPage";
import { PocketbaseResetPasswordPage } from "../login/PocketbaseResetPasswordPage";
import { BillingPage } from "../billing";
import {
  authProvider as defaultAuthProvider,
  dataProvider as defaultDataProvider,
} from "../providers/supabase";
import {
  authProvider as fakerestAuthProvider,
  dataProvider as fakerestDataProvider,
} from "../providers/fakerest";
import {
  authProvider as pocketbaseAuthProvider,
  dataProvider as pocketbaseDataProvider,
} from "../providers/pocketbase";
import sales from "../sales";
import { SettingsPage } from "../settings/SettingsPage";
import { TemplateCenterPage } from "../templates/TemplateCenterPage";
import { getTemplateOverrides } from "../templates/templates";
import type { ConfigurationContextValue } from "./ConfigurationContext";
import { ConfigurationProvider } from "./ConfigurationContext";
import {
  defaultCompanySectors,
  defaultContactGender,
  defaultDarkModeLogo,
  defaultDealCategories,
  defaultDealPipelineStatuses,
  defaultDealStages,
  defaultLightModeLogo,
  defaultNoteStatuses,
  defaultTaskTypes,
  defaultTitle,
} from "./defaultConfiguration";
import { i18nProvider } from "./i18nProvider";

export type CRMProps = {
  dataProvider?: DataProvider;
  authProvider?: AuthProvider;
  disableTelemetry?: boolean;
} & Partial<ConfigurationContextValue>;

/**
 * CRM Component
 *
 * This component sets up and renders the main CRM application using `ra-core`. It provides
 * default configurations and themes but allows for customization through props. The component
 * wraps the application with a `ConfigurationProvider` to provide configuration values via context.
 *
 * @param {Array<ContactGender>} contactGender - The gender options for contacts used in the application.
 * @param {string[]} companySectors - The list of company sectors used in the application.
 * @param {RaThemeOptions} darkTheme - The theme to use when the application is in dark mode.
 * @param {string[]} dealCategories - The categories of deals used in the application.
 * @param {string[]} dealPipelineStatuses - The statuses of deals in the pipeline used in the application.
 * @param {DealStage[]} dealStages - The stages of deals used in the application.
 * @param {RaThemeOptions} lightTheme - The theme to use when the application is in light mode.
 * @param {string} logo - The logo used in the CRM application.
 * @param {NoteStatus[]} noteStatuses - The statuses of notes used in the application.
 * @param {string[]} taskTypes - The types of tasks used in the application.
 * @param {string} title - The title of the CRM application.
 *
 * @returns {JSX.Element} The rendered CRM application.
 *
 * @example
 * // Basic usage of the CRM component
 * import { CRM } from '@/components/atomic-crm/dashboard/CRM';
 *
 * const App = () => (
 *     <CRM
 *         logo="/path/to/logo.png"
 *         title="My Custom CRM"
 *         lightTheme={{
 *             ...defaultTheme,
 *             palette: {
 *                 primary: { main: '#0000ff' },
 *             },
 *         }}
 *     />
 * );
 *
 * export default App;
 */
export const CRM = ({
  contactGender = defaultContactGender,
  companySectors = defaultCompanySectors,
  dealCategories = defaultDealCategories,
  dealPipelineStatuses = defaultDealPipelineStatuses,
  dealStages = defaultDealStages,
  darkModeLogo = defaultDarkModeLogo,
  lightModeLogo = defaultLightModeLogo,
  noteStatuses = defaultNoteStatuses,
  taskTypes = defaultTaskTypes,
  title = defaultTitle,
  dataProvider,
  authProvider,
  disableTelemetry,
  ...rest
}: CRMProps) => {
  const pathname =
    typeof window !== "undefined" ? window.location.pathname : "";
  const searchParams =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search)
      : null;
  const isDemoPath = pathname.startsWith("/demo");
  const isDemoQuery = searchParams?.get("demo") === "1";
  const isDemo = isDemoPath || isDemoQuery;

  const templateOverrides = getTemplateOverrides() ?? {};
  const backend = import.meta.env.VITE_BACKEND?.toLowerCase() ?? "supabase";
  const isPocketbase = backend === "pocketbase";
  const isFakerest = backend === "fakerest";
  const resolvedDataProvider =
    dataProvider ??
    (isFakerest
      ? fakerestDataProvider
      : isPocketbase
        ? pocketbaseDataProvider
        : defaultDataProvider);
  const resolvedAuthProvider =
    authProvider ??
    (isFakerest
      ? fakerestAuthProvider
      : isPocketbase
        ? pocketbaseAuthProvider
        : defaultAuthProvider);
  const includeSupabaseRoutes = !isPocketbase && !isFakerest;
  const includePocketbaseRoutes = isPocketbase;
  const requireAuth = !isFakerest;

  useEffect(() => {
    if (
      disableTelemetry ||
      process.env.NODE_ENV !== "production" ||
      typeof window === "undefined" ||
      typeof window.location === "undefined" ||
      typeof Image === "undefined"
    ) {
      return;
    }
    const img = new Image();
    img.src = `https://atomic-crm-telemetry.marmelab.com/atomic-crm-telemetry?domain=${window.location.hostname}`;
  }, [disableTelemetry]);

  const resolvedCompanySectors =
    templateOverrides.companySectors ?? companySectors;
  const resolvedDealCategories =
    templateOverrides.dealCategories ?? dealCategories;
  const resolvedDealPipelineStatuses =
    templateOverrides.dealPipelineStatuses ?? dealPipelineStatuses;
  const resolvedDealStages =
    templateOverrides.dealStages ?? dealStages;
  const resolvedNoteStatuses =
    templateOverrides.noteStatuses ?? noteStatuses;
  const resolvedTaskTypes =
    templateOverrides.taskTypes ?? taskTypes;

  return (
    <ConfigurationProvider
      contactGender={contactGender}
      companySectors={resolvedCompanySectors}
      dealCategories={resolvedDealCategories}
      dealPipelineStatuses={resolvedDealPipelineStatuses}
      dealStages={resolvedDealStages}
      darkModeLogo={darkModeLogo}
      lightModeLogo={lightModeLogo}
      noteStatuses={resolvedNoteStatuses}
      taskTypes={resolvedTaskTypes}
      title={title}
    >
      <Admin
        dataProvider={resolvedDataProvider}
        authProvider={resolvedAuthProvider}
        store={localStorageStore(undefined, "CRM")}
        layout={Layout}
        loginPage={LandingPage}
        i18nProvider={i18nProvider}
        dashboard={Dashboard}
        requireAuth={requireAuth}
        disableTelemetry
        {...rest}
      >
        <CustomRoutes noLayout>
          <Route path="/start" element={<StartPage />} />
          <Route path={EnhancedLoginPage.path} element={<EnhancedLoginPage />} />
          <Route path={SignupPage.path} element={<SignupPage />} />
          <Route path={PricingPage.path} element={<PricingPage />} />
          <Route path={FeaturesPage.path} element={<FeaturesPage />} />
          <Route path={FAQPage.path} element={<FAQPage />} />
          <Route path={PrivacyPage.path} element={<PrivacyPage />} />
          <Route path={TermsPage.path} element={<TermsPage />} />
          <Route path={PoliciesPage.path} element={<PoliciesPage />} />
          {includeSupabaseRoutes ? (
            <Route path={SetPasswordPage.path} element={<SetPasswordPage />} />
          ) : null}
          {includeSupabaseRoutes ? (
            <Route
              path={ForgotPasswordPage.path}
              element={<ForgotPasswordPage />}
            />
          ) : null}
          {includeSupabaseRoutes ? (
            <Route
              path={OAuthConsentPage.path}
              element={<OAuthConsentPage />}
            />
          ) : null}
          {includePocketbaseRoutes ? (
            <Route
              path={PocketbaseForgotPasswordPage.path}
              element={<PocketbaseForgotPasswordPage />}
            />
          ) : null}
          {includePocketbaseRoutes ? (
            <Route
              path={PocketbaseResetPasswordPage.path}
              element={<PocketbaseResetPasswordPage />}
            />
          ) : null}
        </CustomRoutes>

        <CustomRoutes>
          <Route path={SettingsPage.path} element={<SettingsPage />} />
          <Route
            path={TemplateCenterPage.path}
            element={<TemplateCenterPage />}
          />
          <Route path="/billing" element={<BillingPage />} />
        </CustomRoutes>
        <Resource name="deals" {...deals} />
        <Resource name="contacts" {...contacts} />
        <Resource name="companies" {...companies} />
        <Resource name="contactNotes" />
        <Resource name="dealNotes" />
        <Resource name="tasks" />
        <Resource name="sales" {...sales} />
        <Resource name="tags" />
      </Admin>
    </ConfigurationProvider>
  );
};
