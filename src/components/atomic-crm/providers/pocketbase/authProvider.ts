import type { AuthProvider } from "ra-core";

import { canAccess } from "../commons/canAccess";
import {
  buildFileUrl,
  clearAuthState,
  consumeOAuthState,
  fetchOAuthProviders,
  getAuthState,
  getAuthToken,
  getPocketBaseUrl,
  storeOAuthState,
  setAuthState,
} from "./client";

export async function getIsInitialized() {
  if (getIsInitialized._is_initialized_cache == null) {
    const baseUrl = getPocketBaseUrl();
    const response = await fetch(
      `${baseUrl}/api/collections/sales/records?page=1&perPage=1`,
    );
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        getIsInitialized._is_initialized_cache = true;
        return getIsInitialized._is_initialized_cache;
      }
      throw new Error("Failed to check initialization state");
    }
    const data = (await response.json()) as { totalItems?: number };
    getIsInitialized._is_initialized_cache = (data.totalItems ?? 0) > 0;
  }
  return getIsInitialized._is_initialized_cache;
}

export namespace getIsInitialized {
  export let _is_initialized_cache: boolean | null = null;
}

const getAvatarUrl = (record: Record<string, unknown>) => {
  const avatar = record.avatar;
  if (!avatar || typeof avatar !== "string") return undefined;
  const id = record.id;
  if (!id || typeof id !== "string") return undefined;
  return buildFileUrl("sales", id, avatar);
};

export const authProvider: AuthProvider = {
  login: async (params) => {
    if ("provider" in params) {
      const { provider, code, state } = params as {
        provider?: string;
        code?: string;
        state?: string;
      };
      const baseUrl = getPocketBaseUrl();

      if (code && state) {
        const stored = consumeOAuthState(state);
        const resolvedProvider = provider || stored?.provider;
        if (!resolvedProvider) {
          throw new Error("Missing OAuth provider");
        }

        const response = await fetch(
          `${baseUrl}/api/collections/sales/auth-with-oauth2`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              provider: resolvedProvider,
              code,
              codeVerifier: stored?.codeVerifier,
              redirectUrl: stored?.redirectUrl,
              state,
            }),
          },
        );
        if (!response.ok) {
          const message = await response.text();
          throw new Error(message || "OAuth login failed");
        }
        const data = (await response.json()) as {
          token: string;
          record: Record<string, unknown>;
        };
        setAuthState({ token: data.token, record: data.record });
        return;
      }

      if (!provider) {
        throw new Error("Missing OAuth provider");
      }

      const redirectUrl = `${window.location.origin}/login`;
      const providers = await fetchOAuthProviders(redirectUrl);
      const selected = providers.find((item) => item.name === provider);
      if (!selected?.authUrl) {
        throw new Error("OAuth provider not configured");
      }

      const derivedState =
        selected.state ||
        (() => {
          try {
            const url = new URL(selected.authUrl);
            return url.searchParams.get("state") || "";
          } catch {
            return "";
          }
        })();

      if (!derivedState) {
        throw new Error("Missing OAuth state");
      }

      storeOAuthState({
        state: derivedState,
        provider,
        codeVerifier: selected.codeVerifier,
        redirectUrl,
        createdAt: Date.now(),
      });

      window.location.href = selected.authUrl;
      return;
    }
    const { email, password } = params as { email: string; password: string };
    const baseUrl = getPocketBaseUrl();
    const response = await fetch(
      `${baseUrl}/api/collections/sales/auth-with-password`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identity: email,
          password,
        }),
      },
    );
    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || "Invalid credentials");
    }
    const data = (await response.json()) as {
      token: string;
      record: Record<string, unknown>;
    };
    setAuthState({ token: data.token, record: data.record });
  },
  logout: async () => {
    clearAuthState();
  },
  checkAuth: async () => {
    if (
      window.location.pathname === "/set-password" ||
      window.location.hash.includes("#/set-password")
    ) {
      return;
    }
    if (
      window.location.pathname === "/forgot-password" ||
      window.location.hash.includes("#/forgot-password")
    ) {
      return;
    }
    if (
      window.location.pathname === "/reset-password" ||
      window.location.hash.includes("#/reset-password")
    ) {
      return;
    }
    if (
      window.location.pathname === "/sign-up" ||
      window.location.hash.includes("#/sign-up")
    ) {
      return;
    }

    const isInitialized = await getIsInitialized();
    if (!isInitialized) {
      clearAuthState();
      throw {
        redirectTo: "/sign-up",
        message: false,
      };
    }

    if (!getAuthToken()) {
      throw new Error("Not authenticated");
    }
  },
  getIdentity: async () => {
    const state = getAuthState();
    if (!state?.record) {
      throw new Error("No active session");
    }
    const record = state.record;
    const firstName = (record.first_name as string) || "";
    const lastName = (record.last_name as string) || "";
    return {
      id: record.id as string,
      fullName: `${firstName} ${lastName}`.trim(),
      avatar: getAvatarUrl(record),
    };
  },
  canAccess: async (params) => {
    const isInitialized = await getIsInitialized();
    if (!isInitialized) return false;
    const state = getAuthState();
    if (!state?.record) return false;
    const role = state.record.administrator ? "admin" : "user";
    return canAccess(role, params);
  },
};
