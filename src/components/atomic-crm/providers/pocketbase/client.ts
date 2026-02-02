type AuthState = {
  token: string;
  record: Record<string, unknown>;
};

const AUTH_STORAGE_KEY = "custly_pb_auth";
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
  return (
    import.meta.env.VITE_POCKETBASE_URL?.trim() || "http://127.0.0.1:8090"
  );
};

export const getAuthState = (): AuthState | null => {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthState;
  } catch {
    return null;
  }
};

export const setAuthState = (state: AuthState) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(state));
};

export const clearAuthState = () => {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(AUTH_STORAGE_KEY);
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
  const response = await fetch(
    `${baseUrl}/api/collections/sales/auth-methods`,
  );
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

      if (authUrl && resolvedRedirectUrl) {
        try {
          const url = new URL(authUrl);
          // 强制把 redirect_uri 改成前端的 /login（或传入的 redirectUrl）
          url.searchParams.set("redirect_uri", resolvedRedirectUrl);
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
