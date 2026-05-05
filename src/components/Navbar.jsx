import { useNavigate, useLocation } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div>
      {/* Desktop Side Navigation */}
      <nav className="hidden lg:flex flex-col fixed left-0 top-0 h-full p-6 space-y-8 bg-white border-r border-[#eff4ff] shadow-[20px_0_40px_-10px_rgba(34,197,94,0.04)] w-72 z-50">
        <div className="flex items-center gap-3 px-2">
          
          <div>
            <h1 className="text-xl font-extrabold text-[#22c55e] font-lexend leading-none">HealthyUp</h1>
            <p className="text-[10px] font-lexend font-medium uppercase tracking-widest text-[#6d7b6c]">Weight Management</p>
          </div>
        </div>

        <div className="flex-1 space-y-2">
          <button 
            onClick={() => navigate("/dashboard")}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:translate-x-1 transition-transform duration-200 ${
              isActive("/dashboard") 
                ? "bg-green-50 text-[#006e2f] font-bold" 
                : "text-[#6d7b6c] hover:bg-[#f8f9ff]"
            }`}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>home</span>
            <span className="font-lexend text-[14px] leading-[20px] font-semibold tracking-[0.02em]">Beranda</span>
          </button>
          <button 
            onClick={() => navigate("/tugas")}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:translate-x-1 transition-transform duration-200 ${
              isActive("/tugas") 
                ? "bg-green-50 text-[#006e2f] font-bold" 
                : "text-[#6d7b6c] hover:bg-[#f8f9ff]"
            }`}
          >
            <span className="material-symbols-outlined">assignment</span>
            <span className="font-lexend text-[14px] leading-[20px] font-semibold tracking-[0.02em]">Tugas</span>
          </button>
          <button 
            onClick={() => navigate("/hadiah")}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:translate-x-1 transition-transform duration-200 ${
              isActive("/hadiah") 
                ? "bg-green-50 text-[#006e2f] font-bold" 
                : "text-[#6d7b6c] hover:bg-[#f8f9ff]"
            }`}
          >
            <span className="material-symbols-outlined">emoji_events</span>
            <span className="font-lexend text-[14px] leading-[20px] font-semibold tracking-[0.02em]">Hadiah</span>
          </button>
          <button 
            onClick={() => navigate("/profil")}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:translate-x-1 transition-transform duration-200 ${
              isActive("/profil") 
                ? "bg-green-50 text-[#006e2f] font-bold" 
                : "text-[#6d7b6c] hover:bg-[#f8f9ff]"
            }`}
          >
            <span className="material-symbols-outlined">account_circle</span>
            <span className="font-lexend text-[14px] leading-[20px] font-semibold tracking-[0.02em]">Profil</span>
          </button>
        </div>

        <div>
          <button 
            onClick={() => navigate("/onboarding/1")}
            className="w-full flex items-center gap-4 px-4 py-3 text-[#ba1a1a] hover:opacity-80 transition-opacity"
          >
            <span className="material-symbols-outlined">logout</span>
            <span className="font-lexend text-[14px] leading-[20px] font-semibold tracking-[0.02em]">Keluar</span>
          </button>
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#eff4ff] px-6 py-3 z-50">
        <div className="flex justify-around items-center">
          <button 
            onClick={() => navigate("/dashboard")}
            className={`flex flex-col items-center gap-1 ${isActive("/dashboard") ? "text-[#006e2f]" : "text-[#6d7b6c]"}`}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>home</span>
            <span className="text-[10px] font-medium">Beranda</span>
          </button>
          <button 
            onClick={() => navigate("/tugas")}
            className={`flex flex-col items-center gap-1 ${isActive("/tugas") ? "text-[#006e2f]" : "text-[#6d7b6c]"}`}
          >
            <span className="material-symbols-outlined">assignment</span>
            <span className="text-[10px] font-medium">Tugas</span>
          </button>
          <button 
            onClick={() => navigate("/hadiah")}
            className={`flex flex-col items-center gap-1 ${isActive("/hadiah") ? "text-[#006e2f]" : "text-[#6d7b6c]"}`}
          >
            <span className="material-symbols-outlined">emoji_events</span>
            <span className="text-[10px] font-medium">Hadiah</span>
          </button>
          <button 
            onClick={() => navigate("/profil")}
            className={`flex flex-col items-center gap-1 ${isActive("/profil") ? "text-[#006e2f]" : "text-[#6d7b6c]"}`}
          >
            <span className="material-symbols-outlined">account_circle</span>
            <span className="text-[10px] font-medium">Profil</span>
          </button>
        </div>
      </nav>
    </div>
  );
}