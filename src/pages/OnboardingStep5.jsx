import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Sparkles,
  Droplets,
  Apple,
  Footprints,
  Moon,
  Dumbbell,
  UtensilsCrossed,
  CheckCircle2,
  Flame,
  Clock,
  Star,
} from "lucide-react";

// Tugas harian hari pertama yang "di-generate AI"
const AI_DAILY_TASKS = [
  { id: 1, title: "Minum air 8 gelas",   category: "Hidrasi",   points: 10, Icon: Droplets,          iconColor: "text-blue-500"   },
  { id: 2, title: "Makan sayur 3 porsi", category: "Nutrisi",   points: 15, Icon: Apple,             iconColor: "text-green-600"  },
  { id: 3, title: "Jalan kaki 30 menit", category: "Olahraga",  points: 20, Icon: Footprints,        iconColor: "text-orange-500" },
  { id: 4, title: "Tidur 8 jam",         category: "Istirahat", points: 10, Icon: Moon,              iconColor: "text-purple-500" },
  { id: 5, title: "Sarapan bergizi",     category: "Nutrisi",   points: 15, Icon: UtensilsCrossed,  iconColor: "text-yellow-600" },
];

// Jadwal olahraga mingguan
const AI_WEEKLY_SCHEDULE = [
  { day: "Senin",  activity: "Cardio ringan 30 menit",    Icon: Footprints, color: "text-orange-500" },
  { day: "Selasa", activity: "Istirahat aktif / yoga",    Icon: Moon,       color: "text-purple-500" },
  { day: "Rabu",   activity: "Latihan kekuatan 45 menit", Icon: Dumbbell,   color: "text-blue-500"   },
  { day: "Kamis",  activity: "Jalan kaki 45 menit",       Icon: Footprints, color: "text-green-600"  },
  { day: "Jumat",  activity: "Cardio + core 40 menit",    Icon: Flame,      color: "text-red-500"    },
  { day: "Sabtu",  activity: "Olahraga bebas pilihan",    Icon: Star,       color: "text-yellow-600" },
  { day: "Minggu", activity: "Istirahat penuh",           Icon: Moon,       color: "text-[#6d7b6c]"  },
];

// Teks yang diketik satu per satu untuk efek AI
const AI_TYPING_LINES = [
  "Menganalisis data kesehatan...",
  "Menghitung kebutuhan kalori harian...",
  "Menyusun jadwal olahraga optimal...",
  "Membuat daftar tugas hari pertama...",
  "Rencana personalmu siap!",
];

// Durasi per baris — bisa di-override via prop untuk testing
const DEFAULT_STEP_DELAY  = 700;
const DEFAULT_FINAL_DELAY = 900;

export default function OnboardingStep5({
  stepDelay  = DEFAULT_STEP_DELAY,
  finalDelay = DEFAULT_FINAL_DELAY,
}) {
  const navigate = useNavigate();
  const [phase, setPhase] = useState("loading"); // "loading" | "ready"
  const [typingIndex, setTypingIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("tugas");

  // Simulasi AI processing: ganti teks setiap STEP_DELAY ms, lalu tampilkan hasil
  useEffect(() => {
    if (phase !== "loading") return;

    if (typingIndex < AI_TYPING_LINES.length - 1) {
      const t = setTimeout(() => setTypingIndex(i => i + 1), stepDelay);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(() => setPhase("ready"), finalDelay);
      return () => clearTimeout(t);
    }
  }, [typingIndex, phase, stepDelay, finalDelay]);

  return (
    <div className="h-screen flex bg-[#f8f9ff] overflow-hidden">
      {/* Left Side */}
      <div className="w-full lg:w-1/2 flex flex-col px-6 lg:px-16 overflow-y-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate("/onboarding/4")}
          className="flex items-center gap-2 text-[#6d7b6c] hover:text-[#005823] transition-colors pt-6 pb-2 w-fit"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-jakarta text-sm">Kembali</span>
        </button>

        {/* Progress Bar */}
        <div className="w-full max-w-md mx-auto mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-[#6d7b6c] font-jakarta">Langkah 5</span>
          </div>
          <div className="h-2 bg-[#e5eeff] rounded-full overflow-hidden">
            <div className="h-full w-full bg-[#006e2f] rounded-full transition-all duration-500" />
          </div>
        </div>

        {/* ── FASE LOADING ── */}
        {phase === "loading" && (
          <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto w-full gap-10">
            {/* Spinner loop */}
            <div className="relative w-28 h-28">
              {/* Ring luar — berputar */}
              <svg
                className="absolute inset-0 w-full h-full animate-spin"
                viewBox="0 0 112 112"
                fill="none"
              >
                <circle
                  cx="56" cy="56" r="50"
                  stroke="#e5eeff"
                  strokeWidth="8"
                />
                <circle
                  cx="56" cy="56" r="50"
                  stroke="#006e2f"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray="80 235"
                />
              </svg>
              {/* Ikon di tengah */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-[#005823]" />
                </div>
              </div>
            </div>

            {/* Judul & teks berjalan */}
            <div className="text-center w-full">
              <h2 className="text-2xl font-bold text-[#191c20] font-lexend mb-6">
                AI sedang menyusun rencanamu
              </h2>

              {/* Typing lines — tanpa box, font Lexend */}
              <div
                className="space-y-3"
                aria-live="polite"
                data-testid="ai-loading-log"
              >
                {AI_TYPING_LINES.slice(0, typingIndex + 1).map((line, i) => (
                  <div
                    key={i}
                    className={`flex items-center justify-center gap-2 transition-opacity duration-300 ${
                      i < typingIndex ? "opacity-40" : "opacity-100"
                    }`}
                  >
                    <CheckCircle2
                      className={`w-4 h-4 flex-shrink-0 ${
                        i < typingIndex ? "text-[#006e2f]" : "text-[#c1c9bf] animate-pulse"
                      }`}
                    />
                    <span
                      className={`text-sm font-lexend ${
                        i < typingIndex ? "text-[#6d7b6c]" : "text-[#191c20]"
                      }`}
                    >
                      {line}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── FASE READY ── */}
        {phase === "ready" && (
          <div className="flex-1 flex flex-col max-w-md mx-auto w-full">
            {/* Header */}
            <div className="text-center mb-5">
              <h2 className="text-2xl lg:text-3xl font-bold text-[#191c20] font-lexend">
                Rencanamu sudah siap!
              </h2>
              <p className="text-sm text-[#6d7b6c] font-jakarta mt-1">
                Ini adalah preview program hari pertamamu
              </p>
            </div>

            {/* Ringkasan singkat */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              <div className="bg-white rounded-2xl p-3 text-center border border-[#e5eeff]">
                <Flame className="w-5 h-5 text-orange-500 mx-auto mb-1" />
                <p className="text-base font-bold text-[#191c20] font-lexend">1.800</p>
                <p className="text-[10px] text-[#6d7b6c] font-jakarta">kkal/hari</p>
              </div>
              <div className="bg-white rounded-2xl p-3 text-center border border-[#e5eeff]">
                <Dumbbell className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                <p className="text-base font-bold text-[#191c20] font-lexend">5x</p>
                <p className="text-[10px] text-[#6d7b6c] font-jakarta">olahraga/minggu</p>
              </div>
              <div className="bg-white rounded-2xl p-3 text-center border border-[#e5eeff]">
                <Clock className="w-5 h-5 text-purple-500 mx-auto mb-1" />
                <p className="text-base font-bold text-[#191c20] font-lexend">12</p>
                <p className="text-[10px] text-[#6d7b6c] font-jakarta">minggu target</p>
              </div>
            </div>

            {/* Tab: Tugas Hari Ini / Jadwal Olahraga */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setActiveTab("tugas")}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium font-jakarta transition-colors ${
                  activeTab === "tugas"
                    ? "bg-[#006e2f] text-white"
                    : "bg-white text-[#6d7b6c] border border-[#e5eeff] hover:bg-[#f8f9ff]"
                }`}
              >
               
                Tugas Hari Ini
              </button>
              <button
                onClick={() => setActiveTab("jadwal")}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium font-jakarta transition-colors ${
                  activeTab === "jadwal"
                    ? "bg-[#006e2f] text-white"
                    : "bg-white text-[#6d7b6c] border border-[#e5eeff] hover:bg-[#f8f9ff]"
                }`}
              >
                
                Jadwal Olahraga
              </button>
            </div>

            {/* Tab: Tugas Hari Ini */}
            {activeTab === "tugas" && (
              <div className="bg-white rounded-2xl border border-[#e5eeff] overflow-hidden mb-5">
                {AI_DAILY_TASKS.map((task, i) => (
                  <div
                    key={task.id}
                    className={`flex items-center gap-3 px-4 py-3 ${
                      i < AI_DAILY_TASKS.length - 1 ? "border-b border-[#e5eeff]" : ""
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0`}>
                      <task.Icon className={`w-4 h-4 ${task.iconColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#191c20] font-jakarta truncate">
                        {task.title}
                      </p>
                      <p className="text-xs text-[#6d7b6c] font-jakarta">{task.category}</p>
                    </div>
                    <div className="flex items-center gap-1 bg-yellow-50 px-2 py-0.5 rounded-full flex-shrink-0">
                      <Star className="w-3 h-3 text-yellow-500" />
                      <span className="text-xs font-semibold text-yellow-700 font-lexend">
                        +{task.points}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Tab: Jadwal Olahraga */}
            {activeTab === "jadwal" && (
              <div className="bg-white rounded-2xl border border-[#e5eeff] overflow-hidden mb-5">
                {AI_WEEKLY_SCHEDULE.map((item, i) => (
                  <div
                    key={item.day}
                    className={`flex items-center gap-3 px-4 py-3 ${
                      i < AI_WEEKLY_SCHEDULE.length - 1 ? "border-b border-[#e5eeff]" : ""
                    }`}
                  >
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0">
                      <item.Icon className={`w-4 h-4 ${item.color}`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-[#006e2f] font-jakarta">{item.day}</p>
                      <p className="text-sm text-[#191c20] font-jakarta">{item.activity}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <p className="text-xs text-center text-[#6d7b6c] font-jakarta mb-4">
              Tugas dan jadwal akan diperbarui AI setiap hari sesuai progresmu!
            </p>

            <button
              onClick={() => navigate("/dashboard")}
              className="w-full bg-[#006e2f] text-white font-semibold py-4 rounded-xl hover:bg-[#005823] transition-colors font-lexend flex items-center justify-center gap-2"
            >
              Mulai Perjalanan
              
            </button>

            <div className="h-6" />
          </div>
        )}
      </div>

      {/* Right Side - Image */}
      <div className="hidden lg:block lg:w-1/2  p-6">
        <div className="h-full rounded-3xl overflow-hidden">
          <img
            src="/public/onboarding/6.jpg"
            alt="Fitness"
            className="w-full h-full object-cover object-[40%_90%]"
          />
        </div>
      </div>
    </div>
  );
}
