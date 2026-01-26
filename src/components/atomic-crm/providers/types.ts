import type { DataProvider, Identifier } from "ra-core";

import type { Activity, Deal, Sale, SalesFormData, SignUpData } from "../types";

export type CrmDataProvider = DataProvider & {
  signUp: (data: SignUpData) => Promise<{
    id: string;
    email: string;
    password: string;
  }>;
  salesCreate: (data: SalesFormData) => Promise<Sale>;
  salesUpdate: (
    id: Identifier,
    data: Partial<Omit<SalesFormData, "password">>,
  ) => Promise<Partial<Omit<SalesFormData, "password">>>;
  updatePassword: (id: Identifier) => Promise<true>;
  mergeContacts: (sourceId: Identifier, targetId: Identifier) => Promise<unknown>;
  getActivityLog: (companyId?: Identifier) => Promise<Activity[]>;
  isInitialized: () => Promise<boolean>;
  unarchiveDeal: (deal: Deal) => Promise<Deal[]>;
};
