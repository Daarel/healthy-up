import { createContext, useContext, useState, useEffect } from "react";
import { userApi } from "../lib/api";
import { getToken, removeToken } from "../lib/apiClient";
import { getRoleFromToken, isTokenExpired } from "../lib/jwt";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Cek sesi aktif saat aplikasi pertama kali dimuat
  useEffect(() => {
    const token = getToken();
    if (token && isTokenExpired(token)) {
      removeToken();
    }

    userApi
      .getMe()
      .then((data) => {
        const apiUser = data?.data?.user;
        if (apiUser) {
          const currentToken = getToken();
          const tokenRole = getRoleFromToken(currentToken);
          setUser({
            ...apiUser,
            role: tokenRole || apiUser.role || "user",
          });
        } else {
          setUser(null);
        }
      })
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, []);

  const currentToken = getToken();
  const role = getRoleFromToken(currentToken) || user?.role || null;
  const isAdmin = role === "admin";

  return (
    <AuthContext.Provider value={{ user, setUser, role, isAdmin, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth harus dipakai di dalam AuthProvider");
  return ctx;
}
