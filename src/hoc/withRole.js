import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

/**
 * Higher-Order Component: bọc một component, chỉ cho vai trò hợp lệ truy cập.
 * - Chưa đăng nhập  → chuyển tới /login (nhớ trang đang muốn vào để quay lại).
 * - Sai vai trò      → chuyển tới /forbidden.
 */
export default function withRole(WrappedComponent, allowedRoles) {
  function GuardedComponent(props) {
    const { user } = useAuth();
    const location = useLocation();

    if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
    if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/forbidden" replace />;

    return <WrappedComponent {...props} />;
  }

  const name = WrappedComponent.displayName || WrappedComponent.name || "Component";
  GuardedComponent.displayName = `withRole(${name})`;
  return GuardedComponent;
}
