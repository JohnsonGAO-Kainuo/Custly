import { Navigate } from "react-router-dom";

// 最简单的登录态探测：PocketBase 的 auth 状态或已解析的 oauth debug
const hasPocketBaseAuth = () => {
  if (typeof window === "undefined") return false;
  return (
    window.localStorage.getItem("custly_pb_auth") ||
    window.localStorage.getItem("custly_pb_auth_session") ||
    window.sessionStorage.getItem("custly_pb_auth") ||
    window.sessionStorage.getItem("custly_pb_auth_session") ||
    window.sessionStorage.getItem("custly_oauth_debug")
  );
};

// Supabase/Fakerest 可以在需要时扩展，这里只要能把已登录用户带进主应用即可

export const StartPage = () => {
  const isAuthenticated = hasPocketBaseAuth();

  // 已登录用户直接进入主应用（选一个资源路由，避免再回 Landing）
  if (isAuthenticated) {
    return <Navigate to="/companies" replace />;
  }

  // 未登录用户进入 Marketing Landing
  return <Navigate to="/landing" replace />;
};
