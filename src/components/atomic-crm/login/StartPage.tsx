import { Navigate, useLocation } from "react-router-dom";

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

// StartPage: 用于处理初始路由重定向
// 已登录用户 -> Dashboard (/)
// 未登录用户 -> Landing Page
export const StartPage = () => {
  const isAuthenticated = hasPocketBaseAuth();

  if (isAuthenticated) {
    // 已登录用户进入 Dashboard
    return <Navigate to="/" replace />;
  }

  // 未登录用户进入 Marketing Landing
  return <Navigate to="/landing" replace />;
};
