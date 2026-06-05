import { useState, useEffect } from "react";
import {
  X,
  Sparkle,
  CheckCircle2,
  Droplets,
  Apple,
  Footprints,
  Moon,
  Dumbbell,
  UtensilsCrossed,
  Flame,
  Clock,
  Star,
  RefreshCw,
} from "lucide-react";

// ─── Data tugas yang "di-generate AI" ────────────────────────────────────────

export const AI_DAILY_TASKS = [
  { id: 101, title: "Minum air 8 gelas",   category: "Hidrasi",   points: 10, Icon: Droplets,       iconColor: "text-blue-500"   },
  { id: 102, title: "Makan sayur 3 porsi", category: "Nutrisi",   points: 15, Icon: Apple,          iconColor: "text-green-600"  },
  { id: 103, title: "Jalan kaki 30 menit", category: "Olahraga",  points: 20, Icon: Footprints,     iconColor: "text-orange-500" },
  { id: 104, title: "Tidur 8 jam",         category: "Istirahat", points: 10, Icon: Moon,           iconColor: "text-purple-500" },
  { id: 105, title: "Sarapan bergizi",     category: "Nutrisi",   points: 15, Icon: UtensilsCrossed, iconColor: "text-yellow-600" },
];

export const AI_WEEKLY_TASKS = [
  { id: 201, title: "Workout 4x seminggu",    category: "Olahraga",  points: 50 },
  { id: 202, title: "Tidur teratur 7 hari",   category: "Istirahat", points: 30 },
  { id: 203, title: "Minum air cukup 7 hari", category: "Hidrasi",   points: 40 },
];

const AI_TYPING_LINES = [
  "Menganalisis data kesehatanmu...",
  "Menghitung kebutuhan kalori harian...",
  "Menyusun jadwal olahraga optimal...",
  "Membuat daftar tugas baru...",
  "Tugas personalmu siap!",
];

const STEP_DELAY  = 600;
const FINAL_DELAY = 700;

/**
 * Modal generate tugas AI.
 *
 * Props:
 *  - isOpen      {boolean}
 *  - onClose     {fn}
 *  - onConfirm   {fn(dailyTasks, weeklyTasks)}  dipanggil saat user klik "Terapkan"
 *  - stepDelay   {number}  override untuk testing
 *  - finalDelay  {number}  override untuk testing
 */
export default function AiTaskGenerator({
  isOpen,
  onClose,
  onConfirm,
  stepDelay  = STEP_DELAY,
  finalDelay = FINAL_DELAY,
}) {
  const [phase, setPhase] = useState("loading"); // "loading" | "ready"
  const [typingIndex, setTypingIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("harian");

  // Reset state setiap kali modal dibuka
  useEffect(() => {
    if (!isOpen) return;
    setPhase("loading");
    setTypingIndex(0);
    setActiveTab("harian");
  }, [isOpen]);

  // Animasi typing
  useEffect(() => {
    if (!isOpen || phase !== "loading") return;
    if (typingIndex < AI_TYPING_LINES.length - 1) {
      const t = setTimeout(() => setTypingIndex(i => i + 1), stepDelay);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(() => setPhase("ready"), finalDelay);
      return () => clearTimeout(t);
    }
  }, [isOpen, typingIndex, phase, stepDelay, finalDelay]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm(
      AI_DAILY_TASKS.map(t => ({ ...t, completed: false })),
      AI_WEEKLY_TASKS.map(t => ({ ...t, completed: false })),
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#e5eeff]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <Sparkle className="w-5 h-5 text-[#006e2f]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#191c20] font-lexend">Generate Tugas AI</h3>
              <p className="text-xs text-[#6d7b6c] font-jakarta">
                {phase === "loading" ? "Sedang menyusun rencana..." : "Tugas baru siap diterapkan"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-[#f8f9ff] flex items-center justify-center hover:bg-[#e5eeff] transition-colors"
          >
            <X className="w-5 h-5 text-[#6d7b6c]" />
          </button>
        </div>

        <div className="p-6">
          {/* ── FASE LOADING ── */}
          {phase === "loading" && (
            <div className="flex flex-col items-center gap-8 py-4">
              {/* Spinner */}
              <div className="relative w-24 h-24">
                <svg className="absolute inset-0 w-full h-full animate-spin" viewBox="0 0 96 96" fill="none">
                  <circle cx="48" cy="48" r="42" stroke="#e5eeff" strokeWidth="7" />
                  <circle cx="48" cy="48" r="42" stroke="#006e2f" strokeWidth="7"
                    strokeLinecap="round" strokeDasharray="70 195" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkle className="w-8 h-8 text-[#005823]" />
                </div>
              </div>

              {/* Typing log */}
              <div className="w-full space-y-3" aria-live="polite" data-testid="ai-loading-log">
                {AI_TYPING_LINES.slice(0, typingIndex + 1).map((line, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-2 transition-opacity duration-300 ${
                      i < typingIndex ? "opacity-40" : "opacity-100"
                    }`}
                  >
                    <CheckCircle2
                      className={`w-4 h-4 flex-shrink-0 ${
                        i < typingIndex ? "text-[#006e2f]" : "text-[#c1c9bf] animate-pulse"
                      }`}
                    />
                    <span className={`text-sm font-jakarta ${i < typingIndex ? "text-[#6d7b6c]" : "text-[#191c20]"}`}>
                      {line}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── FASE READY ── */}
          {phase === "ready" && (
            <div className="space-y-5">
              {/* Ringkasan */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-[#f8f9ff] rounded-2xl p-3 text-center border border-[#e5eeff]">
                  <Flame className="w-4 h-4 text-orange-500 mx-auto mb-1" />
                  <p className="text-sm font-bold text-[#191c20] font-lexend">1.800</p>
                  <p className="text-[10px] text-[#6d7b6c] font-jakarta">kkal/hari</p>
                </div>
                <div className="bg-[#f8f9ff] rounded-2xl p-3 text-center border border-[#e5eeff]">
                  <Dumbbell className="w-4 h-4 text-blue-500 mx-auto mb-1" />
                  <p className="text-sm font-bold text-[#191c20] font-lexend">5x</p>
                  <p className="text-[10px] text-[#6d7b6c] font-jakarta">olahraga/minggu</p>
                </div>
                <div className="bg-[#f8f9ff] rounded-2xl p-3 text-center border border-[#e5eeff]">
                  <Clock className="w-4 h-4 text-purple-500 mx-auto mb-1" />
                  <p className="text-sm font-bold text-[#191c20] font-lexend">12</p>
                  <p className="text-[10px] text-[#6d7b6c] font-jakarta">minggu target</p>
                </div>
              </div>

              {/* Tab preview */}
              <div className="flex gap-2">
                {[
                  { id: "harian", label: "Tugas Harian" },
                  { id: "mingguan", label: "Tugas Mingguan" },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium font-jakarta transition-colors ${
                      activeTab === tab.id
                        ? "bg-[#006e2f] text-white"
                        : "bg-[#f8f9ff] text-[#6d7b6c] border border-[#e5eeff] hover:bg-[#e5eeff]"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* List preview */}
              <div className="bg-[#f8f9ff] rounded-2xl border border-[#e5eeff] overflow-hidden">
                {activeTab === "harian" && AI_DAILY_TASKS.map((task, i) => (
                  <div
                    key={task.id}
                    className={`flex items-center gap-3 px-4 py-3 ${
                      i < AI_DAILY_TASKS.length - 1 ? "border-b border-[#e5eeff]" : ""
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center flex-shrink-0 border border-[#e5eeff]">
                      <task.Icon className={`w-4 h-4 ${task.iconColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#191c20] font-jakarta truncate">{task.title}</p>
                      <p className="text-xs text-[#6d7b6c] font-jakarta">{task.category}</p>
                    </div>
                    <div className="flex items-center gap-1 bg-yellow-50 px-2 py-0.5 rounded-full flex-shrink-0">
                      <Star className="w-3 h-3 text-yellow-500" />
                      <span className="text-xs font-semibold text-yellow-700 font-lexend">+{task.points}</span>
                    </div>
                  </div>
                ))}

                {activeTab === "mingguan" && AI_WEEKLY_TASKS.map((task, i) => (
                  <div
                    key={task.id}
                    className={`flex items-center gap-3 px-4 py-3 ${
                      i < AI_WEEKLY_TASKS.length - 1 ? "border-b border-[#e5eeff]" : ""
                    }`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center flex-shrink-0 border border-[#e5eeff]">
                      <RefreshCw className="w-4 h-4 text-[#006e2f]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#191c20] font-jakarta truncate">{task.title}</p>
                      <p className="text-xs text-[#6d7b6c] font-jakarta">{task.category}</p>
                    </div>
                    <div className="flex items-center gap-1 bg-yellow-50 px-2 py-0.5 rounded-full flex-shrink-0">
                      <Star className="w-3 h-3 text-yellow-500" />
                      <span className="text-xs font-semibold text-yellow-700 font-lexend">+{task.points}</span>
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-xs text-center text-[#6d7b6c] font-jakarta">
                Tugas akan diperbarui AI setiap hari sesuai progresmu.
              </p>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 border-2 border-[#c1c9bf] text-[#6d7b6c] rounded-xl font-semibold font-jakarta hover:bg-[#f8f9ff] transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleConfirm}
                  className="flex-1 py-3 bg-[#006e2f] text-white rounded-xl font-semibold font-jakarta hover:bg-[#005823] transition-colors flex items-center justify-center gap-2"
                >
                  <Sparkle className="w-4 h-4" />
                  Terapkan
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
