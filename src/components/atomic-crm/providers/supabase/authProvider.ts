/* eslint-disable no-var */
/* eslint-disable @typescript-eslint/no-namespace */
import type { AuthProvider } from "ra-core";
import { supabaseAuthProvider } from "ra-supabase-core";

import { canAccess } from "../commons/canAccess";
import { getSupabaseClient } from "./supabase";

const hasSupabaseEnv =
  Boolean(import.meta.env.VITE_SUPABASE_URL) &&
  Boolean(import.meta.env.VITE_SUPABASE_ANON_KEY);
const missingSupabaseError = new Error(
  "Supabase env missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.",
);
const missingAuthProvider: AuthProvider = {
  login: async () => {
    throw missingSupabaseError;
  },
  logout: async () => undefined,
  checkAuth: async () => {
    throw missingSupabaseError;
  },
  checkError: async () => undefined,
  getIdentity: async () => {
    throw missingSupabaseError;
  },
  getPermissions: async () => undefined,
  canAccess: async () => false,
};

const baseAuthProvider = hasSupabaseEnv
  ? supabaseAuthProvider(getSupabaseClient(), {
      getIdentity: async () => {
        const sale = await getSaleFromCache();

        if (sale == null) {
          throw new Error();
        }

        return {
          id: sale.id,
          fullName: `${sale.first_name} ${sale.last_name}`,
          avatar: sale.avatar?.src,
        };
      },
    })
  : missingAuthProvider;

const getSupabase = () => {
  if (!hasSupabaseEnv) {
    throw missingSupabaseError;
  }
  return getSupabaseClient();
};

export async function getIsInitialized() {
  if (getIsInitialized._is_initialized_cache == null) {
    const { data } = await getSupabase()
      .from("init_state")
      .select("is_initialized");

    getIsInitialized._is_initialized_cache = data?.at(0)?.is_initialized > 0;
  }

  return getIsInitialized._is_initialized_cache;
}

export namespace getIsInitialized {
  export var _is_initialized_cache: boolean | null = null;
}

export const authProvider: AuthProvider = {
  ...baseAuthProvider,
  login: async (params) => {
    const result = await baseAuthProvider.login(params);
    // clear cached sale
    cachedSale = undefined;
    return result;
  },
  checkAuth: async (params) => {
    // Users are on the set-password page, nothing to do
    if (
      window.location.pathname === "/set-password" ||
      window.location.hash.includes("#/set-password")
    ) {
      return;
    }
    // Users are on the forgot-password page, nothing to do
    if (
      window.location.pathname === "/forgot-password" ||
      window.location.hash.includes("#/forgot-password")
    ) {
      return;
    }
    // Users are on the sign-up page, nothing to do
    if (
      window.location.pathname === "/sign-up" ||
      window.location.hash.includes("#/sign-up")
    ) {
      return;
    }

    const isInitialized = await getIsInitialized();

    if (!isInitialized) {
      await getSupabase().auth.signOut();
      throw {
        redirectTo: "/sign-up",
        message: false,
      };
    }

    return baseAuthProvider.checkAuth(params);
  },
  canAccess: async (params) => {
    const isInitialized = await getIsInitialized();
    if (!isInitialized) return false;

    // Get the current user
    const sale = await getSaleFromCache();
    if (sale == null) return false;

    // Compute access rights from the sale role
    const role = sale.administrator ? "admin" : "user";
    return canAccess(role, params);
  },
  getAuthorizationDetails(authorizationId: string) {
    return getSupabase().auth.oauth.getAuthorizationDetails(authorizationId);
  },
  approveAuthorization(authorizationId: string) {
    return getSupabase().auth.oauth.approveAuthorization(authorizationId);
  },
  denyAuthorization(authorizationId: string) {
    return getSupabase().auth.oauth.denyAuthorization(authorizationId);
  },
};

let cachedSale: any;
const getSaleFromCache = async () => {
  if (cachedSale != null) return cachedSale;

  const { data: dataSession, error: errorSession } =
    await getSupabase().auth.getSession();

  // Shouldn't happen after login but just in case
  if (dataSession?.session?.user == null || errorSession) {
    return undefined;
  }

  const { data: dataSale, error: errorSale } = await getSupabase()
    .from("sales")
    .select("id, first_name, last_name, avatar, administrator")
    .match({ user_id: dataSession?.session?.user.id })
    .single();

  // Shouldn't happen either as all users are sales but just in case
  if (dataSale == null || errorSale) {
    return undefined;
  }

  cachedSale = dataSale;
  return dataSale;
};
