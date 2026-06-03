import { NavLink, useNavigate } from "react-router-dom";
import { Users, ClipboardCheck, Gift, LogOut } from "lucide-react";
import { adminApi } from "@/lib/api";

const navItems = [
  { to: "/admin/users", label: "Manajemen User", icon: Users },
  { to: "/admin/missions", label: "Verifikasi Misi", icon: ClipboardCheck },
  { to: "/admin/rewards", label: "Manajemen Reward", icon: Gift },
];

export default function AdminNavbar() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await adminApi.logout();
    } catch {
      localStorage.removeItem("admin_token");
    }
    navigate("/admin/login");
  };

  return (
    <aside className="w-52 bg-white border-r border-gray-200 flex flex-col fixed h-full z-10">
      {/* Brand */}
      <div className="px-4 py-3.5 border-b border-gray-200 flex flex-col">
        <span className="text-xl font-extrabold text-[#005823] font-lexend leading-none">
          HealthyUp
        </span>
        <span className="text-sm font-bold text-gray-400 font-lexend leading-none mt-0.5">
          Admin
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 space-y-0.5 px-2">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors ${
                isActive
                  ? "bg-green-50 text-[#006e2f] font-semibold"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
              }`
            }
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-2 py-3 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-red-600 hover:bg-red-50 w-full transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Keluar
        </button>
      </div>
    </aside>
  );
}
