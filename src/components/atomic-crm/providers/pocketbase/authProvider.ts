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

      // --- Debug hook: capture raw body for troubleshooting (even在导航后也能取到) ---
      const rawBody = await response.text();
      const debugPayload = {
        status: response.status,
        ok: response.ok,
        provider: resolvedProvider,
        state,
        stored,
        rawBody,
      };
      if (typeof window !== "undefined") {
        (window as any).__custlyOAuthDebug = debugPayload;
        try {
          window.sessionStorage.setItem(
            "custly_oauth_debug",
            JSON.stringify(debugPayload),
          );
        } catch (err) {
          // 最后兜底：至少在控制台留一份
          // eslint-disable-next-line no-console
          console.warn("custly_oauth_debug: sessionStorage write failed", err);
        }
        // 直接在控制台打一份，方便用户复制
        // eslint-disable-next-line no-console
        console.debug("custly_oauth_debug", debugPayload);
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
        if (typeof window !== "undefined") {
          const persisted = window.localStorage.getItem("custly_pb_auth");
          // eslint-disable-next-line no-console
          console.debug("custly_auth_written", persisted);
          try {
            window.sessionStorage.setItem(
              "custly_auth_written",
              persisted ?? "",
            );
          } catch {
            /* ignore */
          }
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("custly_auth_set_failed", err);
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
    // 已有有效 token 直接通过，避免初始化检查把新 OAuth 会话清掉
    if (getAuthToken()) {
      return;
    }
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
