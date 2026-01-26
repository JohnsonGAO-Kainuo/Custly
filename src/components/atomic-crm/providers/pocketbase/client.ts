type AuthState = {
  token: string;
  record: Record<string, unknown>;
};

const AUTH_STORAGE_KEY = "custly_pb_auth";

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
