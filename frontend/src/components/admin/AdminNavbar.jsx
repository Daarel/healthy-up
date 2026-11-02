import { useNavigate, useLocation } from "react-router-dom";
import { LogOut } from "lucide-react";
import { adminApi } from "@/lib/api";
import { removeToken } from "@/lib/apiClient";
import { useAuth } from "@/context/AuthContext";
import { NAV_ITEMS } from "../../constants";

export default function AdminNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useAuth();

  const isActive = (path) => {
    if (path === "/admin/users") {
      return (
        location.pathname === "/admin" ||
        location.pathname === "/admin/" ||
        location.pathname.startsWith("/admin/users")
      );
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = async () => {
    try {
      await adminApi.logout();
    } catch {
      removeToken();
    } finally {
      setUser(null);
      navigate("/login", { replace: true });
    }
  };

  return (
    <div>
      {/* Desktop Side Navigation */}
      <nav className="hidden lg:flex flex-col fixed left-0 top-0 h-full p-6 space-y-8 bg-white border-r border-[#eff4ff] shadow-[20px_0_40px_-10px_rgba(34,197,94,0.04)] w-72 z-50">
        <div className="flex items-center gap-3 px-2">
          <div className="flex flex-col">
            <span className="text-2xl font-extrabold text-[#005823] font-lexend leading-none">
              HealthyUp
            </span>
            <span className="text-xs font-semibold text-gray-400 font-lexend leading-none mt-1.5">
              Admin Panel
            </span>
          </div>
        </div>

        <div className="flex-1 space-y-2">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <button
              key={to}
              onClick={() => navigate(to)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:translate-x-1 transition-transform duration-200 text-left ${
                isActive(to)
                  ? "bg-green-50 text-[#006e2f] font-bold"
                  : "text-[#6d7b6c] hover:bg-[#f8f9ff]"
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="font-lexend text-[14px] leading-[20px] font-semibold tracking-[0.02em]">
                {label}
              </span>
            </button>
          ))}
        </div>

        <div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-4 py-3 text-[#ba1a1a] hover:opacity-80 transition-opacity"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-lexend text-[14px] leading-[20px] font-semibold tracking-[0.02em]">
              Keluar
            </span>
          </button>
        </div>
      </nav>

      {/* Mobile Top Header */}
      <header className="lg:hidden bg-white border-b border-[#eff4ff] px-5 py-3.5 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <span className="text-lg font-extrabold text-[#005823] font-lexend leading-none">
            HealthyUp
          </span>
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-green-50 text-[#006e2f] font-lexend border border-green-200/50">
            Admin
          </span>
        </div>
        <button
          onClick={handleLogout}
          className="text-xs font-medium text-[#ba1a1a] hover:opacity-80 flex items-center gap-1 transition-opacity"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Keluar</span>
        </button>
      </header>

      {/* Mobile Bottom Navigation — sama persis seperti di halaman pengguna */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#eff4ff] px-6 py-3 z-50">
        <div className="flex justify-around items-center">
          {NAV_ITEMS.map(({ to, shortLabel, label, icon: Icon }) => (
            <button
              key={to}
              onClick={() => navigate(to)}
              className={`flex flex-col items-center gap-1 ${
                isActive(to) ? "text-[#006e2f]" : "text-[#6d7b6c]"
              }`}
            >
              <Icon className="w-6 h-6" />
              <span className="text-[10px] font-medium">{shortLabel || label}</span>
            </button>
          ))}
          <button
            onClick={handleLogout}
            className="flex flex-col items-center gap-1 text-[#ba1a1a] hover:opacity-80 transition-opacity"
          >
            <LogOut className="w-6 h-6" />
            <span className="text-[10px] font-medium">Keluar</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
