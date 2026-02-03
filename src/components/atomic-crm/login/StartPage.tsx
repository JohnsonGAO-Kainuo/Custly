import { Navigate } from "react-router-dom";

// 检测是否有有效的登录态（必须有token）
const hasPocketBaseAuth = () => {
  if (typeof window === "undefined") return false;
  
  // 只检查真正的 auth 状态，不依赖 debug 信息
  const authKeys = [
    "custly_pb_auth",
    "custly_pb_auth_session",
  ];
  
  for (const key of authKeys) {
    const raw = window.localStorage.getItem(key) || window.sessionStorage.getItem(key);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        // 确保有有效的 token 和 record
        if (parsed?.token && parsed?.record) {
          return true;
        }
      } catch {
        // 无效的 JSON，忽略
      }
    }
  }
  
  return false;
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
