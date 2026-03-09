type AuthState = {
  token: string;
  record: Record<string, unknown>;
};

const AUTH_STORAGE_KEY = "custly_pb_auth";
const AUTH_STORAGE_KEY_SESSION = "custly_pb_auth_session";
let IN_MEMORY_AUTH_STATE: AuthState | null = null;
const OAUTH_STORAGE_KEY = "custly_pb_oauth";

type OAuthState = {
  state: string;
  provider: string;
  codeVerifier?: string;
  redirectUrl?: string;
  createdAt: number;
};

export type OAuthProviderInfo = {
  name: string;
  displayName?: string;
  authUrl?: string;
  state?: string;
  codeVerifier?: string;
};

export const getPocketBaseUrl = () => {
  // In production, use /pb proxy; in development, use env var or localhost
  if (typeof window !== "undefined" && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
    return "/pb";
  }
  return (
    import.meta.env.VITE_POCKETBASE_URL?.trim() || "http://127.0.0.1:8090"
  );
};

export const getAuthState = (): AuthState | null => {
  if (IN_MEMORY_AUTH_STATE) return IN_MEMORY_AUTH_STATE;
  if (typeof window === "undefined") return null;

  const read = (key: string) => {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthState;
    } catch {
      return null;
    }
  };

  const readSession = (key: string) => {
    const raw = window.sessionStorage.getItem(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as AuthState;
    } catch {
      return null;
    }
  };

  const state =
    read(AUTH_STORAGE_KEY) ||
    readSession(AUTH_STORAGE_KEY) ||
    readSession(AUTH_STORAGE_KEY_SESSION) ||
    read(AUTH_STORAGE_KEY_SESSION);

  if (state) {
    IN_MEMORY_AUTH_STATE = state;
  }
  return state;
};

export const setAuthState = (state: AuthState) => {
  if (typeof window === "undefined") return;
  IN_MEMORY_AUTH_STATE = state;
  const payload = JSON.stringify(state);
  try {
    window.localStorage.setItem(AUTH_STORAGE_KEY, payload);
  } catch (err) {
    // fallback to sessionStorage if localStorage is blocked (incognito / privacy mode)
    try {
      window.sessionStorage.setItem(AUTH_STORAGE_KEY_SESSION, payload);
    } catch {
      // eslint-disable-next-line no-console
      console.error("custly_auth_store_failed", err);
    }
  }
};

export const clearAuthState = () => {
  if (typeof window === "undefined") return;
  IN_MEMORY_AUTH_STATE = null;
  window.localStorage.removeItem(AUTH_STORAGE_KEY);
  window.localStorage.removeItem(AUTH_STORAGE_KEY_SESSION);
  window.sessionStorage.removeItem(AUTH_STORAGE_KEY);
  window.sessionStorage.removeItem(AUTH_STORAGE_KEY_SESSION);
};

export const getAuthToken = () => getAuthState()?.token;

export const buildFileUrl = (
  collection: string,
  recordId: string,
  fileName: string,
) => {
  const baseUrl = getPocketBaseUrl();
  const encoded = encodeURIComponent(fileName);
  return `${baseUrl}/api/files/${collection}/${recordId}/${encoded}`;
};

const loadOAuthStates = (): OAuthState[] => {
  if (typeof window === "undefined") return [];
  const raw = window.sessionStorage.getItem(OAUTH_STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as OAuthState[];
    return [];
  } catch {
    return [];
  }
};

const saveOAuthStates = (states: OAuthState[]) => {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(OAUTH_STORAGE_KEY, JSON.stringify(states));
};

export const storeOAuthState = (payload: OAuthState) => {
  const states = loadOAuthStates();
  const filtered = states.filter((item) => item.state !== payload.state);
  filtered.push(payload);
  saveOAuthStates(filtered);
};

export const consumeOAuthState = (state: string) => {
  const states = loadOAuthStates();
  const match = states.find((item) => item.state === state);
  const remaining = states.filter((item) => item.state !== state);
  saveOAuthStates(remaining);
  
  // Enforce 10-minute TTL on OAuth state to prevent replay attacks
  if (match && Date.now() - match.createdAt > 10 * 60 * 1000) {
    return null; // expired
  }
  
  return match ?? null;
};

export const fetchOAuthProviders = async (
  redirectUrl?: string,
): Promise<OAuthProviderInfo[]> => {
  const baseUrl = getPocketBaseUrl();
  const resolvedRedirectUrl =
    redirectUrl ||
    (typeof window !== "undefined"
      ? `${window.location.origin}/login`
      : "");
  // Pass redirectUrl to PocketBase so it generates correct authUrl with proper redirect_uri
  // Use window.location.origin as base so relative paths like "/pb" resolve correctly
  const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost";
  const apiUrl = new URL(`${baseUrl}/api/collections/sales/auth-methods`, origin);
  if (resolvedRedirectUrl) {
    apiUrl.searchParams.set("redirectUrl", resolvedRedirectUrl);
  }
  const response = await fetch(apiUrl.toString());
  if (!response.ok) {
    return [];
  }
  const data = (await response.json()) as Record<string, any>;
  const providers =
    data?.authProviders || data?.oauth2?.providers || data?.providers || [];
  if (!Array.isArray(providers)) return [];
  return providers
    .map((provider: Record<string, any>) => {
      const authUrl = String(provider?.authUrl ?? provider?.authURL ?? "");
      let resolvedAuthUrl = authUrl;

      // Ensure redirect_uri is set correctly even if PocketBase didn't include it
      if (authUrl && resolvedRedirectUrl) {
        try {
          const url = new URL(authUrl);
          const currentRedirect = url.searchParams.get("redirect_uri");
          if (!currentRedirect) {
            url.searchParams.set("redirect_uri", resolvedRedirectUrl);
          }
          resolvedAuthUrl = url.toString();
        } catch {
          resolvedAuthUrl = authUrl;
        }
      }

      return {
        name: String(provider?.name ?? provider?.id ?? ""),
        displayName: provider?.displayName,
        authUrl: resolvedAuthUrl,
        state: provider?.state,
        codeVerifier: provider?.codeVerifier,
      };
    })
    .filter((provider) => provider.name);
};
