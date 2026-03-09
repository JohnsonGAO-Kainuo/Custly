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

// Helper to clear initialization cache (call after successful login)
export function clearInitializedCache() {
  getIsInitialized._is_initialized_cache = null;
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
    const { provider, code, state } = params as {
      provider?: string;
      code?: string;
      state?: string;
      email?: string;
      password?: string;
    };

    // 1) OAuth callback handling (even if provider未传，但state可匹配之前存的)
    if (code && state) {
      const baseUrl = getPocketBaseUrl();
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

      const rawBody = await response.text();
      if (typeof window !== "undefined" && false) {
        // Debug code removed for security — do not store tokens in sessionStorage/window
      }

      let data: { token: string; record: Record<string, unknown> };
      try {
        data = JSON.parse(rawBody) as {
          token: string;
          record: Record<string, unknown>;
        };
      } catch (e) {
        throw new Error(rawBody || "OAuth login failed (no JSON)");
      }

      if (!response.ok) {
        throw new Error(data?.["message"] || rawBody || "OAuth login failed");
      }

      try {
        setAuthState({ token: data.token, record: data.record });
        // Clear initialization cache after successful login so canAccess re-checks
        clearInitializedCache();
      } catch (err) {
        throw err;
      }
      return;
    }

    // 2) OAuth 发起
    if (provider) {
      const baseUrl = getPocketBaseUrl();
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

    // 3) 密码登录
    const { email, password } = params as { email?: string; password?: string };
    
    // Skip if no credentials provided (this may happen during OAuth flows)
    if (!email && !password) {
      return;
    }
    
    if (!email || !password) {
      throw new Error("Email and password are required");
    }
    
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
      const rawBody = await response.text();
      let errorCode = "invalid_credentials";
      let errorMessage = "Invalid email or password";
      
      try {
        const errorData = JSON.parse(rawBody) as { message?: string; data?: Record<string, unknown> };
        const msg = (errorData.message || "").toLowerCase();
        
        // PocketBase returns "Failed to authenticate." for invalid credentials
        // It doesn't distinguish between non-existent user and wrong password for security
        if (msg.includes("failed to authenticate") || msg.includes("invalid")) {
          errorCode = "invalid_credentials";
          errorMessage = "Invalid email or password";
        } else if (msg.includes("missing") && msg.includes("identity")) {
          errorCode = "email_required";
          errorMessage = "Email is required";
        } else if (msg.includes("missing") && msg.includes("password")) {
          errorCode = "password_required";
          errorMessage = "Password is required";
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch {
        // If we can't parse JSON, use the raw message
        if (rawBody) {
          errorMessage = rawBody;
        }
      }
      
      const error = new Error(errorMessage);
      (error as any).code = errorCode;
      throw error;
    }
    const data = (await response.json()) as {
      token: string;
      record: Record<string, unknown>;
    };
    setAuthState({ token: data.token, record: data.record });
    // Clear initialization cache after successful login so canAccess re-checks
    clearInitializedCache();
  },
  logout: async () => {
    clearAuthState();
    // Clear initialization cache on logout
    clearInitializedCache();
  },
  checkAuth: async () => {
    // Validate token exists and is not expired
    const token = getAuthToken();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        if (payload.exp && payload.exp * 1000 < Date.now()) {
          // Token expired — clear auth and force re-login
          clearAuthState();
          throw new Error("Session expired");
        }
      } catch (e) {
        if (e instanceof Error && e.message === "Session expired") throw e;
        // Malformed token — clear and force re-login
        clearAuthState();
        throw new Error("Invalid session");
      }
      return;
    }
    if (
      window.location.pathname === "/set-password" ||
      window.location.hash === "#/set-password" ||
      window.location.hash.startsWith("#/set-password?")
    ) {
      return;
    }
    if (
      window.location.pathname === "/forgot-password" ||
      window.location.hash === "#/forgot-password" ||
      window.location.hash.startsWith("#/forgot-password?")
    ) {
      return;
    }
    if (
      window.location.pathname === "/reset-password" ||
      window.location.hash === "#/reset-password" ||
      window.location.hash.startsWith("#/reset-password?")
    ) {
      return;
    }
    if (
      window.location.pathname === "/sign-up" ||
      window.location.hash === "#/sign-up" ||
      window.location.hash.startsWith("#/sign-up?")
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
    // First check if user has valid auth state (already logged in)
    const state = getAuthState();
    if (state?.record && state?.token) {
      // User is logged in, check role-based access
      const role = state.record.administrator ? "admin" : "user";
      return canAccess(role, params);
    }
    
    // No auth state, check if system is initialized
    const isInitialized = await getIsInitialized();
    if (!isInitialized) return false;
    
    return false;
  },
};
