import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function Profile() {
  const navigate = useNavigate();
  const [chartPeriod, setChartPeriod] = useState("mingguan");
  const [darkMode, setDarkMode] = useState(false);
  const [dailyReminder, setDailyReminder] = useState(true);

  const user = {
    name: "Gathan Ghifari",
    location: "Jakarta, Indonesia",
    joinDate: "Jan 2024",
    level: 12,
    title: "Pejuang",
    avatar: "/public/profile/avatar.png",
    streak: 14,
  };

  const weightData = {
    awal: 78.5,
    sekarang: 69.2,
    target: 65.0,
  };

  const stats = {
    calories: 12480,
    steps: "248.5K",
    stepsGrowth: "+12%",
  };

  const badges = [
    { id: 1, name: "Pagi Aktif", icon: "wb_sunny", color: "bg-orange-100", iconColor: "text-orange-500", locked: false, desc: "Lari 5 hari berturut" },
    { id: 2, name: "Hidrasi Juara", icon: "water_drop", color: "bg-blue-100", iconColor: "text-blue-500", locked: false, desc: "Target air 1 bulan" },
    { id: 3, name: "Pecinta Alam", icon: "forest", color: "bg-green-100", iconColor: "text-green-500", locked: false, desc: "10km di jalur trail" },
    { id: 4, name: "Hati Sehat", icon: "favorite", color: "bg-red-100", iconColor: "text-red-500", locked: false, desc: "Detak jantung ideal" },
    { id: 5, name: "Maraton Pertama", icon: "directions_run", color: "bg-purple-100", iconColor: "text-purple-500", locked: true, desc: "Segera hadir" },
    { id: 6, name: "Master Yoga", icon: "self_improvement", color: "bg-teal-100", iconColor: "text-teal-500", locked: true, desc: "Segera hadir" },
  ];

  const menuItems = [
    { id: 1, icon: "person", label: "Informasi Pribadi", action: () => {} },
    { id: 2, icon: "lock", label: "Keamanan & Password", action: () => {} },
    { id: 3, icon: "credit_card", label: "Metode Pembayaran", action: () => {} },
  ];

  return (
    <div className="min-h-screen bg-[#f8f9ff]">
      <Navbar />

      {/* Main Content */}
      <main className="lg:ml-72 pb-20 lg:pb-0">
        <div className="p-6 lg:p-8 max-w-6xl mx-auto">
          {/* Profile Header */}
          <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgba(34,197,94,0.08)] border border-[#e5eeff] mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center gap-6">
              {/* Avatar */}
              <div className="relative">
                <div className="w-24 h-24 rounded-2xl overflow-hidden border-4 border-[#e5eeff]">
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                </div>
                <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-[#006e2f] text-white rounded-lg flex items-center justify-center hover:bg-[#005823] transition-colors">
                  <span className="material-symbols-outlined text-sm">edit</span>
                </button>
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6">
                  <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-[#191c20] font-lexend">{user.name}</h1>
                    <p className="text-[#6d7b6c] font-jakarta">
                      {user.location} • Bergabung sejak {user.joinDate}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 bg-yellow-50 mx-4 px-10 py-1 rounded-full w-fit">
                    <span className="material-symbols-outlined text-yellow-500 text-sm">stars</span>
                    <span className="text-xs font-semibold text-yellow-700 font-jakarta">
                      Level {user.level} - {user.title}
                    </span>
                  </div>
                </div>
              </div>

              {/* Streak & Actions */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex items-center gap-2 bg-orange-50 px-14 py-2 rounded-xl">
                  <span className="material-symbols-outlined text-orange-500">local_fire_department</span>
                  <div>
                    <p className="text-lg font-bold text-orange-600 font-lexend">{user.streak}</p>
                    <p className="text-xs text-orange-500 font-jakarta">Hari</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  
                  <button className="flex items-center gap-2 px-4 py-2 bg-[#006e2f] text-white rounded-xl hover:bg-[#005823] transition-colors font-jakarta">
                    <span className="material-symbols-outlined">share</span>
                    Bagikan Profil
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Stats & Chart Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Weight Chart */}
            <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgba(34,197,94,0.08)] border border-[#e5eeff]">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-[#191c20] font-lexend">Riwayat Berat Badan</h3>
                  <p className="text-sm text-[#6d7b6c] font-jakarta">Progres 6 bulan terakhir</p>
                </div>
                <div className="flex gap-2">
                  {["mingguan", "bulanan"].map((period) => (
                    <button
                      key={period}
                      onClick={() => setChartPeriod(period)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium font-jakarta transition-colors ${
                        chartPeriod === period
                          ? "bg-[#006e2f] text-white"
                          : "bg-[#f8f9ff] text-[#6d7b6c] hover:bg-[#e5eeff]"
                      }`}
                    >
                      {period === "mingguan" ? "Mingguan" : "Bulanan"}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Chart Visualization */}
              <div className="relative h-48 mb-6">
                <svg viewBox="0 0 600 200" className="w-full h-full">
                  {/* Gradient */}
                  <defs>
                    <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#22c55e" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  {/* Area */}
                  <path
                    d="M 0 180 Q 100 160 150 140 T 300 80 T 450 120 T 600 40 L 600 200 L 0 200 Z"
                    fill="url(#chartGradient)"
                  />
                  {/* Line */}
                  <path
                    d="M 0 180 Q 100 160 150 140 T 300 80 T 450 120 T 600 40"
                    fill="none"
                    stroke="#006e2f"
                    strokeWidth="3"
                  />
                  {/* Data Points */}
                  {[[0, 180], [100, 160], [200, 100], [300, 80], [400, 120], [500, 60], [600, 40]].map(([x, y], i) => (
                    <circle key={i} cx={x} cy={y} r="6" fill="#006e2f" stroke="white" strokeWidth="2" />
                  ))}
                </svg>
                {/* X-axis labels */}
                <div className="flex justify-between text-xs text-[#6d7b6c] font-jakarta mt-2">
                  {["Jan", "Feb", "Mar", "Apr", "Mei", "Jun"].map((month) => (
                    <span key={month}>{month}</span>
                  ))}
                </div>
              </div>

              {/* Weight Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-[#f8f9ff] rounded-2xl">
                  <p className="text-xs text-[#6d7b6c] font-jakarta mb-1">Berat Awal</p>
                  <p className="text-xl font-bold text-[#191c20] font-lexend">{weightData.awal} kg</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-2xl border border-green-100">
                  <p className="text-xs text-green-600 font-jakarta mb-1">Sekarang</p>
                  <p className="text-xl font-bold text-green-700 font-lexend">{weightData.sekarang} kg</p>
                </div>
                <div className="text-center p-4 bg-[#f8f9ff] rounded-2xl">
                  <p className="text-xs text-[#6d7b6c] font-jakarta mb-1">Target</p>
                  <p className="text-xl font-bold text-[#191c20] font-lexend">{weightData.target} kg</p>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="space-y-4">
              {/* Calories Card */}
              <div className="bg-gradient-to-br from-[#006e2f] to-[#22c55e] rounded-3xl p-6 text-white">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-2xl">local_fire_department</span>
                </div>
                <h4 className="text-sm font-medium text-white/80 font-jakarta">Kalori Terbakar</h4>
                <p className="text-2xl font-bold font-lexend mt-1">{stats.calories.toLocaleString()}</p>
                <p className="text-sm text-white/70 font-jakarta mt-1">Minggu ini</p>
              </div>

              {/* Steps Card */}
              <div className="bg-gradient-to-br from-[#3b82f6] to-[#60a5fa] rounded-3xl p-6 text-white">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-2xl">footprint</span>
                </div>
                <h4 className="text-sm font-medium text-white/80 font-jakarta">Langkah Total</h4>
                <p className="text-2xl font-bold font-lexend mt-1">{stats.steps}</p>
                <p className="text-sm text-green-300 font-jakarta mt-1">{stats.stepsGrowth} vs bulan lalu</p>
              </div>
            </div>
          </div>

          

          {/* Settings Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Account Management */}
            <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgba(34,197,94,0.08)] border border-[#e5eeff]">
              <h3 className="text-lg font-bold text-[#191c20] font-lexend mb-4">Manajemen Akun</h3>
              <div className="space-y-2">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={item.action}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-[#f8f9ff] transition-colors text-left"
                  >
                    <span className="material-symbols-outlined text-[#6d7b6c]">{item.icon}</span>
                    <span className="flex-1 font-jakarta text-[#191c20]">{item.label}</span>
                    <span className="material-symbols-outlined text-[#6d7b6c]">chevron_right</span>
                  </button>
                ))}
              </div>
            </div>

            {/* App Preferences */}
            <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgba(34,197,94,0.08)] border border-[#e5eeff]">
              <h3 className="text-lg font-bold text-[#191c20] font-lexend mb-4">Preferensi Aplikasi</h3>
              <div className="space-y-4">
                {/* Dark Mode Toggle */}
                <div className="flex items-center justify-between p-2">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#6d7b6c]">dark_mode</span>
                    <span className="font-jakarta text-[#191c20]">Mode Gelap</span>
                  </div>
                  <button
                    onClick={() => setDarkMode(!darkMode)}
                    className={`w-12 h-6 rounded-full transition-colors relative ${darkMode ? "bg-[#006e2f]" : "bg-[#c1c9bf]"}`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${darkMode ? "translate-x-6" : "translate-x-0.5"}`} />
                  </button>
                </div>

                {/* Daily Reminder Toggle */}
                <div className="flex items-center justify-between p-2">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#6d7b6c]">notifications_active</span>
                    <span className="font-jakarta text-[#191c20]">Peringatan Harian</span>
                  </div>
                  <button
                    onClick={() => setDailyReminder(!dailyReminder)}
                    className={`w-12 h-6 rounded-full transition-colors relative ${dailyReminder ? "bg-[#006e2f]" : "bg-[#c1c9bf]"}`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${dailyReminder ? "translate-x-6" : "translate-x-0.5"}`} />
                  </button>
                </div>

                {/* Delete Account */}
                <button className="w-full flex items-center gap-3 p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors mt-4">
                  <span className="material-symbols-outlined">delete</span>
                  <span className="font-jakarta">Hapus Akun</span>
                  <span className="material-symbols-outlined ml-auto text-red-400">warning</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
