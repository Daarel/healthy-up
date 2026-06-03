import { createContext, useContext, useState, useEffect } from "react";
import { userApi } from "../lib/api";

const AuthContext = createContext(null);

/**
 * Sediakan data user yang sedang login ke seluruh aplikasi.
 * - user      : objek user { id, username, email } atau null
 * - isLoading : true selama pengecekan sesi awal berlangsung
 * - setUser   : untuk update user setelah login/logout
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Cek sesi aktif saat aplikasi pertama kali dimuat
  useEffect(() => {
    userApi
      .getMe()
      .then((data) => setUser(data.data.user))
      .catch(() => setUser(null))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth harus dipakai di dalam AuthProvider");
  return ctx;
}
