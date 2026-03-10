import { Suspense, type ReactNode } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Notification } from "@/components/admin/notification";
import { Error } from "@/components/admin/error";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouteTracker } from "@/hooks/useRouteTracker";

import Header from "./Header";
import {
  SubscriptionProvider,
  SubscriptionGuard,
  TrialBanner,
  ExpiredBanner,
} from "../subscription";

export const Layout = ({ children }: { children: ReactNode }) => {
  // Track SPA page views for Google Analytics
  useRouteTracker();

  return (
    <SubscriptionProvider>
      <SubscriptionGuard>
        <ExpiredBanner />
        <TrialBanner />
        <Header />
        <main className="max-w-screen-2xl mx-auto pt-6 px-6 pb-8" id="main-content">
          <ErrorBoundary FallbackComponent={Error}>
            <Suspense fallback={<Skeleton className="h-12 w-12 rounded-full" />}>
              {children}
            </Suspense>
          </ErrorBoundary>
        </main>
        <Notification />
      </SubscriptionGuard>
    </SubscriptionProvider>
  );
};
