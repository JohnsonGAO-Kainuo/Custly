import { useQuery } from "@tanstack/react-query";
import { useDataProvider } from "ra-core";
import { Navigate } from "react-router-dom";

import type { CrmDataProvider } from "../providers/types";
import { LoginSkeleton } from "./LoginSkeleton";

export const StartPage = () => {
  const dataProvider = useDataProvider<CrmDataProvider>();
  const {
    data: isInitialized,
    error,
    isPending,
  } = useQuery({
    queryKey: ["init"],
    queryFn: async () => {
      return dataProvider.isInitialized();
    },
  });

  if (isPending) return <LoginSkeleton />;
  
  // Always redirect to landing page first
  // Users can access login or signup from there
  return <Navigate to="/landing" />;
};
