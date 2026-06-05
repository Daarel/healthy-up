import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Bungkus halaman yang butuh login.
 * - Selama cek sesi: tampilkan layar loading
 * - Belum login: redirect ke /login
 * - Sudah login: render halaman
 */
export default function PrivateRoute({ children }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f9ff]">
        <div className="flex flex-col items-center gap-4">
          <svg
            className="w-12 h-12 animate-spin text-[#006e2f]"
            viewBox="0 0 50 50"
            fill="none"
          >
            <circle
              cx="25" cy="25" r="20"
              stroke="#e5eeff"
              strokeWidth="5"
            />
            <circle
              cx="25" cy="25" r="20"
              stroke="#006e2f"
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray="60 200"
            />
          </svg>
          <p className="text-sm text-[#6d7b6c] font-jakarta">Memuat...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
