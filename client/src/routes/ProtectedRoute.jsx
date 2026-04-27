import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Loader from "../components/ui/Loader";

// ProtectedRoute guards routes by:
// 1. Authentication  — redirects to /auth/login if not logged in
// 2. Role            — redirects to /unauthorized if role doesn't match
// 3. Status          — redirects if account is suspended/banned
//
// Usage:
//   <ProtectedRoute>                        — any logged-in user
//   <ProtectedRoute role="tourist">         — tourist only
//   <ProtectedRoute role={["admin","security"]}> — multiple roles

export default function ProtectedRoute({ children, role = null }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Still initialising auth state
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAF7F2]">
        <Loader />
      </div>
    );
  }

  // Not logged in → send to login, preserve intended destination
  if (!user) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // Account not usable
  if (user.status === "suspended") {
    return <Navigate to="/suspended" replace />;
  }
  if (user.status === "banned") {
    return <Navigate to="/banned" replace />;
  }

  // Role check
  if (role) {
    const allowed = Array.isArray(role) ? role : [role];
    if (!allowed.includes(user.role)) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return children;
}