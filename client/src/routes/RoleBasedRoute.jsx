import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RoleBasedRoute({ allowedRoles = [], children }) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) return <Navigate to="/auth/login" replace />;
  if (allowedRoles.length && !allowedRoles.includes(user?.role)) return <Navigate to="/" replace />;

  return children;
}
