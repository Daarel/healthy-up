import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getToken } from "../lib/apiClient";
import { getRoleFromToken, isTokenExpired } from "../lib/jwt";

export default function PublicRoute({ children }) {
  const { user, role, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  const token = getToken();
  const tokenExpired = token ? isTokenExpired(token) : false;

  if (user && !tokenExpired) {
    const effectiveRole = getRoleFromToken(token) || role || user?.role || "user";
    const destination = effectiveRole === "admin" ? "/admin/users" : "/dashboard";
    return <Navigate to={destination} replace />;
  }

  return children ? children : <Outlet />;
}
