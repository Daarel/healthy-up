import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Edit2, 
  Star, 
  Flame, 
  Share2, 
  ChevronRight, 
  User, 
  Lock, 
  CreditCard, 
  Moon, 
  Bell,
  Trash2,
  AlertTriangle,
  Flame as FireIcon,
  Plus,
  Scale,
  TrendingDown,
  TrendingUp,
  Minus,
  X,
  CheckCircle2,
} from "lucide-react";
import Navbar from "../components/Navbar";

// Data riwayat berat awal (hardcoded sebagai data historis)
const INITIAL_WEIGHT_LOG = [
  { id: 1, date: "2024-01-15", weight: 78.5, note: "Berat awal" },
  { id: 2, date: "2024-02-10", weight: 76.8, note: "" },
  { id: 3, date: "2024-03-05", weight: 74.2, note: "" },
  { id: 4, date: "2024-04-01", weight: 72.5, note: "" },
  { id: 5, date: "2024-05-12", weight: 70.9, note: "" },
  { id: 6, date: "2024-06-20", weight: 69.2, note: "" },
];

export default function Profile() {
  const navigate = useNavigate();
  const [chartPeriod, setChartPeriod] = useState("mingguan");
  const [darkMode, setDarkMode] = useState(false);
  const [dailyReminder, setDailyReminder] = useState(true);

  // --- State berat badan ---
  const [weightLog, setWeightLog] = useState(INITIAL_WEIGHT_LOG);
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [inputWeight, setInputWeight] = useState("");
  const [inputNote, setInputNote] = useState("");
  const [inputError, setInputError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  // Derived values dari weightLog
  const latestEntry = weightLog[weightLog.length - 1];
  const firstEntry  = weightLog[0];
  const prevEntry   = weightLog.length >= 2 ? weightLog[weightLog.length - 2] : null;
  const currentWeight = latestEntry.weight;
  const weightDiff    = prevEntry ? +(currentWeight - prevEntry.weight).toFixed(1) : 0;
  const TARGET_WEIGHT = 65.0;

  const user = {
    name: "Gathan Ghifari",
    location: "Jakarta, Indonesia",
    joinDate: "Jan 2024",
    level: 12,
    title: "Pejuang",
    avatar: "/public/profile/avatar.png",
    streak: 14,
  };

  const stats = { calories: 12480 };

  const badges = [
    { id: 1, name: "Pagi Aktif",       icon: "sun",          color: "bg-orange-100", iconColor: "text-orange-500", locked: false, desc: "Lari 5 hari berturut" },
    { id: 2, name: "Hidrasi Juara",    icon: "droplets",     color: "bg-blue-100",   iconColor: "text-blue-500",   locked: false, desc: "Target air 1 bulan"  },
    { id: 3, name: "Pecinta Alam",     icon: "tree-pine",    color: "bg-green-100",  iconColor: "text-green-500",  locked: false, desc: "10km di jalur trail" },
    { id: 4, name: "Nutrisi Juara",    icon: "salad",        color: "bg-red-100",    iconColor: "text-red-500",    locked: false, desc: "Makan sehat 30 hari" },
    { id: 5, name: "Maraton Pertama",  icon: "person-running", color: "bg-purple-100", iconColor: "text-purple-500", locked: true, desc: "Segera hadir" },
    { id: 6, name: "Master Yoga",      icon: "flower-lotus", color: "bg-teal-100",   iconColor: "text-teal-500",   locked: true,  desc: "Segera hadir" },
  ];

  const menuItems = [
    { id: 1, Icon: User,       label: "Informasi Pribadi",     action: () => {} },
    { id: 2, Icon: Lock,       label: "Keamanan & Password",   action: () => {} },
    { id: 3, Icon: CreditCard, label: "Metode Pembayaran",     action: () => {} },
  ];

  // --- Handlers modal berat badan ---
  const openWeightModal = () => {
    setInputWeight("");
    setInputNote("");
    setInputError("");
    setShowWeightModal(true);
  };

  const closeWeightModal = () => {
    setShowWeightModal(false);
    setInputError("");
  };

  const handleSaveWeight = () => {
    const val = parseFloat(inputWeight);
    if (!inputWeight || isNaN(val)) {
      setInputError("Masukkan angka berat badan yang valid.");
      return;
    }
    if (val < 20 || val > 300) {
      setInputError("Berat badan harus antara 20 – 300 kg.");
      return;
    }

    const today = new Date().toISOString().split("T")[0];
    const newEntry = {
      id: Date.now(),
      date: today,
      weight: val,
      note: inputNote.trim(),
    };

    setWeightLog(prev => [...prev, newEntry]);
    setShowWeightModal(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  // --- Chart helpers ---
  // Ambil 7 entri terakhir untuk chart
  const chartEntries = weightLog.slice(-7);
  const chartMin = Math.floor(Math.min(...chartEntries.map(e => e.weight)) - 2);
  const chartMax = Math.ceil(Math.max(...chartEntries.map(e => e.weight)) + 2);
  const chartRange = chartMax - chartMin || 1;
  const SVG_W = 600;
  const SVG_H = 200;
  const PAD_X = 20;

  // Hitung koordinat SVG dari nilai berat
  const toY = (w) => SVG_H - ((w - chartMin) / chartRange) * (SVG_H - 20) - 10;
  const toX = (i) => PAD_X + (i / Math.max(chartEntries.length - 1, 1)) * (SVG_W - PAD_X * 2);

  // Buat path SVG
  const points = chartEntries.map((e, i) => [toX(i), toY(e.weight)]);
  const linePath = points.map((p, i) => (i === 0 ? `M ${p[0]} ${p[1]}` : `L ${p[0]} ${p[1]}`)).join(" ");
  const areaPath = linePath + ` L ${points[points.length - 1][0]} ${SVG_H} L ${points[0][0]} ${SVG_H} Z`;

  // Format tanggal singkat
  const fmtDate = (iso) => {
    const d = new Date(iso);
    return `${d.getDate()} ${["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"][d.getMonth()]}`;
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff]">
      <Navbar />

      {/* Main Content */}
      <main className="lg:ml-72 pb-20 lg:pb-0">
        <div className="p-6 lg:p-8 max-w-6xl mx-auto">

          {/* Toast sukses */}
          {showSuccess && (
            <div className="fixed top-6 right-6 z-50 flex items-center gap-3 bg-white border border-green-200 shadow-lg rounded-2xl px-5 py-4">
              <CheckCircle2 className="w-5 h-5 text-[#006e2f] flex-shrink-0" />
              <p className="font-jakarta text-sm text-[#191c20]">Berat badan berhasil dicatat!</p>
            </div>
          )}

          {/* Profile Header */}
          <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgba(34,197,94,0.08)] border border-[#e5eeff] mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center gap-6">
              {/* Avatar */}
              <div className="relative">
                <div className="w-24 h-24 rounded-2xl overflow-hidden border-4 border-[#e5eeff]">
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                </div>
                <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-[#006e2f] text-white rounded-lg flex items-center justify-center hover:bg-[#005823] transition-colors">
                  <Edit2 className="w-4 h-4" />
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
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="text-xs font-semibold text-yellow-700 font-jakarta">
                      Level {user.level} - {user.title}
                    </span>
                  </div>
                </div>
              </div>

              {/* Streak & Actions */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex items-center gap-2 bg-orange-50 px-14 py-2 rounded-xl">
                  <Flame className="w-5 h-5 text-orange-500" />
                  <div>
                    <p className="text-lg font-bold text-orange-600 font-lexend">{user.streak}</p>
                    <p className="text-xs text-orange-500 font-jakarta">Hari</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="flex items-center gap-2 px-4 py-2 bg-[#006e2f] text-white rounded-xl hover:bg-[#005823] transition-colors font-jakarta">
                    <Share2 className="w-5 h-5" />
                    Bagikan Profil
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Catat Berat Badan Banner */}
          <div className="bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgba(34,197,94,0.08)] border border-[#e5eeff] mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Scale className="w-6 h-6 text-[#006e2f]" />
              </div>
              <div>
                <p className="font-semibold text-[#191c20] font-lexend">Catat Berat Badan Hari Ini</p>
                <p className="text-sm text-[#6d7b6c] font-jakarta">
                  Terakhir dicatat: <span className="font-semibold text-[#191c20]">{currentWeight} kg</span>
                  {" "}pada {fmtDate(latestEntry.date)}
                </p>
              </div>
            </div>
            <button
              onClick={openWeightModal}
              data-testid="btn-catat-berat"
              className="flex items-center gap-2 px-5 py-3 bg-[#006e2f] text-white rounded-xl hover:bg-[#005823] transition-colors font-semibold font-jakarta whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              Tambah Berat
            </button>
          </div>

          {/* Stats & Chart Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Weight Chart */}
            <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgba(34,197,94,0.08)] border border-[#e5eeff]">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-[#191c20] font-lexend">Riwayat Berat Badan</h3>
                  <p className="text-sm text-[#6d7b6c] font-jakarta">
                    {chartEntries.length} entri terakhir
                  </p>
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

              {/* Chart Visualization — dinamis dari weightLog */}
              <div className="relative h-48 mb-6">
                <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full h-full" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%"   stopColor="#22c55e" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#22c55e" stopOpacity="0.02" />
                    </linearGradient>
                  </defs>
                  {/* Area fill */}
                  <path d={areaPath} fill="url(#chartGradient)" />
                  {/* Line */}
                  <path d={linePath} fill="none" stroke="#006e2f" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  {/* Data points */}
                  {points.map(([x, y], i) => (
                    <g key={i}>
                      <circle cx={x} cy={y} r="8" fill="#006e2f" stroke="white" strokeWidth="3" />
                      <circle cx={x} cy={y} r="4" fill="white" />
                    </g>
                  ))}
                </svg>
                {/* X-axis labels */}
                <div className="flex justify-between text-xs text-[#6d7b6c] font-jakarta mt-2 px-1">
                  {chartEntries.map((e, i) => (
                    <span key={i} className={i === 0 ? "-ml-2" : i === chartEntries.length - 1 ? "-mr-2" : ""}>
                      {fmtDate(e.date)}
                    </span>
                  ))}
                </div>
              </div>

              {/* Weight Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-[#f8f9ff] rounded-2xl">
                  <p className="text-xs text-[#6d7b6c] font-jakarta mb-1">Berat Awal</p>
                  <p className="text-xl font-bold text-[#191c20] font-lexend">{firstEntry.weight} kg</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-2xl border border-green-100">
                  <p className="text-xs text-green-600 font-jakarta mb-1">Sekarang</p>
                  <p className="text-xl font-bold text-green-700 font-lexend">{currentWeight} kg</p>
                  {prevEntry && (
                    <p className={`text-xs mt-1 font-jakarta flex items-center justify-center gap-0.5 ${weightDiff < 0 ? "text-green-600" : weightDiff > 0 ? "text-orange-500" : "text-[#6d7b6c]"}`}>
                      {weightDiff < 0
                        ? <TrendingDown className="w-3 h-3" />
                        : weightDiff > 0
                        ? <TrendingUp className="w-3 h-3" />
                        : <Minus className="w-3 h-3" />}
                      {weightDiff > 0 ? "+" : ""}{weightDiff} kg
                    </p>
                  )}
                </div>
                <div className="text-center p-4 bg-[#f8f9ff] rounded-2xl">
                  <p className="text-xs text-[#6d7b6c] font-jakarta mb-1">Target</p>
                  <p className="text-xl font-bold text-[#191c20] font-lexend">{TARGET_WEIGHT} kg</p>
                </div>
              </div>

              {/* Log Riwayat Terakhir */}
              <div className="mt-6 border-t border-[#e5eeff] pt-4">
                <p className="text-sm font-semibold text-[#191c20] font-lexend mb-3">Catatan Terakhir</p>
                <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                  {[...weightLog].reverse().map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-[#f8f9ff] transition-colors">
                      <div>
                        <p className="text-sm font-semibold text-[#191c20] font-lexend">{entry.weight} kg</p>
                        {entry.note && (
                          <p className="text-xs text-[#6d7b6c] font-jakarta">{entry.note}</p>
                        )}
                      </div>
                      <p className="text-xs text-[#6d7b6c] font-jakarta">{fmtDate(entry.date)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="space-y-4">
              {/* Progress ke Target */}
              <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgba(34,197,94,0.08)] border border-[#e5eeff]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                    <Scale className="w-5 h-5 text-[#006e2f]" />
                  </div>
                  <div>
                    <p className="text-xs text-[#6d7b6c] font-jakarta">Sisa menuju target</p>
                    <p className="text-xl font-bold text-[#006e2f] font-lexend">
                      {Math.max(0, +(currentWeight - TARGET_WEIGHT).toFixed(1))} kg
                    </p>
                  </div>
                </div>
                <div className="h-2 bg-[#e5eeff] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#006e2f] to-[#22c55e] rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, Math.max(0,
                        ((firstEntry.weight - currentWeight) / (firstEntry.weight - TARGET_WEIGHT)) * 100
                      ))}%`
                    }}
                  />
                </div>
                <div className="flex justify-between text-xs text-[#6d7b6c] font-jakarta mt-1">
                  <span>{firstEntry.weight} kg</span>
                  <span>{TARGET_WEIGHT} kg</span>
                </div>
              </div>

              {/* Calories Card */}
              <div className="bg-gradient-to-br from-[#006e2f] to-[#22c55e] rounded-3xl p-6 text-white">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                  <FireIcon className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-medium text-white/80 font-jakarta">Kalori Terbakar</h4>
                <p className="text-2xl font-bold font-lexend mt-1">{stats.calories.toLocaleString()}</p>
                <p className="text-sm text-white/70 font-jakarta mt-1">Minggu ini</p>
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
                    <item.Icon className="w-5 h-5 text-[#6d7b6c]" />
                    <span className="flex-1 font-jakarta text-[#191c20]">{item.label}</span>
                    <ChevronRight className="w-5 h-5 text-[#6d7b6c]" />
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
                    <Moon className="w-5 h-5 text-[#6d7b6c]" />
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
                    <Bell className="w-5 h-5 text-[#6d7b6c]" />
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
                  <Trash2 className="w-5 h-5" />
                  <span className="font-jakarta">Hapus Akun</span>
                  <AlertTriangle className="w-5 h-5 ml-auto text-red-400" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modal Input Berat Badan */}
      {showWeightModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#e5eeff]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <Scale className="w-5 h-5 text-[#006e2f]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#191c20] font-lexend">Catat Berat Badan</h3>
                  <p className="text-xs text-[#6d7b6c] font-jakarta">
                    {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                </div>
              </div>
              <button
                onClick={closeWeightModal}
                className="w-9 h-9 rounded-xl bg-[#f8f9ff] flex items-center justify-center hover:bg-[#e5eeff] transition-colors"
              >
                <X className="w-5 h-5 text-[#6d7b6c]" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5">
              {/* Input berat */}
              <div>
                <label className="block text-sm font-semibold text-[#191c20] mb-2 font-lexend">
                  Berat Badan (kg)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="20"
                    max="300"
                    value={inputWeight}
                    onChange={(e) => {
                      setInputWeight(e.target.value);
                      setInputError("");
                    }}
                    placeholder={`Terakhir: ${currentWeight} kg`}
                    data-testid="input-berat"
                    className={`w-full px-4 py-3 pr-14 rounded-xl border ${
                      inputError ? "border-red-400 focus:ring-red-300" : "border-[#c1c9bf] focus:ring-[#006e2f]"
                    } bg-white focus:outline-none focus:ring-2 focus:border-transparent font-jakarta text-[#191c20] text-lg`}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6d7b6c] font-jakarta text-sm">
                    kg
                  </span>
                </div>
                {inputError && (
                  <p className="text-xs text-red-500 mt-1.5 font-jakarta">{inputError}</p>
                )}
              </div>

              {/* Perbandingan cepat */}
              {inputWeight && !isNaN(parseFloat(inputWeight)) && (
                <div className="bg-[#f8f9ff] rounded-xl p-3 flex justify-between text-sm font-jakarta">
                  <span className="text-[#6d7b6c]">Perubahan dari sebelumnya:</span>
                  <span className={`font-semibold ${
                    parseFloat(inputWeight) < currentWeight
                      ? "text-green-600"
                      : parseFloat(inputWeight) > currentWeight
                      ? "text-orange-500"
                      : "text-[#6d7b6c]"
                  }`}>
                    {parseFloat(inputWeight) > currentWeight ? "+" : ""}
                    {(parseFloat(inputWeight) - currentWeight).toFixed(1)} kg
                  </span>
                </div>
              )}

              {/* Catatan opsional */}
              <div>
                <label className="block text-sm font-semibold text-[#191c20] mb-2 font-lexend">
                  Catatan <span className="font-normal text-[#6d7b6c]">(opsional)</span>
                </label>
                <textarea
                  value={inputNote}
                  onChange={(e) => setInputNote(e.target.value)}
                  placeholder="Contoh: setelah olahraga, sebelum makan..."
                  rows={2}
                  data-testid="input-catatan"
                  className="w-full px-4 py-3 rounded-xl border border-[#c1c9bf] bg-white focus:outline-none focus:ring-2 focus:ring-[#006e2f] focus:border-transparent font-jakarta resize-none text-sm text-[#191c20]"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                <button
                  onClick={closeWeightModal}
                  className="flex-1 py-3 border-2 border-[#c1c9bf] text-[#6d7b6c] rounded-xl font-semibold font-jakarta hover:bg-[#f8f9ff] transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleSaveWeight}
                  data-testid="btn-simpan-berat"
                  className="flex-1 py-3 bg-[#006e2f] text-white rounded-xl font-semibold font-jakarta hover:bg-[#005823] transition-colors"
                >
                  Simpan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
