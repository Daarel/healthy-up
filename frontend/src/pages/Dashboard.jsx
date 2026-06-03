import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MoreVertical, Check, Star, Sparkle } from "lucide-react";
import Navbar from "../components/Navbar";
import WeightCard from "../components/WeightCard";
import WeightReminderBanner from "../components/WeightReminderBanner";
import WeightInputModal from "../components/WeightInputModal";
import SetupTargetModal from "../components/SetupTargetModal";
import Streak from "../components/ui/streak";

const WEIGHT_STORAGE_KEY = "healthyup:weightLog";
const SETUP_DONE_KEY     = "healthyup:setupDone";
const STATS_STORAGE_KEY  = "healthyup:stats";

const getTodayKey = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")}`;
};

// Kembalikan key ISO minggu: "YYYY-Www" (misal "2026-W22")
const getThisWeekKey = () => {
  const now  = new Date();
  const jan1 = new Date(now.getFullYear(), 0, 1);
  const week = Math.ceil(((now - jan1) / 86400000 + jan1.getDay() + 1) / 7);
  return `${now.getFullYear()}-W${String(week).padStart(2, "0")}`;
};

const readWeightLog = () => {
  if (typeof window === "undefined") return null;
  try { return JSON.parse(window.localStorage.getItem(WEIGHT_STORAGE_KEY)) ?? null; }
  catch { return null; }
};

// Baca berat dari onboarding jika weightLog belum ada
const readOnboardingWeight = () => {
  try {
    return JSON.parse(sessionStorage.getItem("healthyup:register"))?.weight ?? 0;
  } catch { return 0; }
};

const readStats = () => {
  if (typeof window === "undefined") return null;
  try { return JSON.parse(window.localStorage.getItem(STATS_STORAGE_KEY)) ?? null; }
  catch { return null; }
};

export default function Dashboard() {
  const navigate = useNavigate();

  // ─── Weight state (TODO: fetch GET /api/weight-logs/latest saat backend siap) ──
  const stored = readWeightLog();
  const onboardingWeight = readOnboardingWeight();
  const [targetWeight,   setTargetWeight]   = useState(stored?.targetWeight   ?? 0);
  const [currentWeight,  setCurrentWeight]  = useState(stored?.currentWeight  ?? onboardingWeight);
  const [previousWeight, setPreviousWeight] = useState(stored?.previousWeight ?? 0);
  const [lastLoggedDate, setLastLoggedDate] = useState(stored?.lastLoggedDate ?? null);

  // ─── Stats state (TODO: fetch GET /api/users/me/stats saat backend siap) ────
  const storedStats = readStats();
  const [stats] = useState({
    caloriesBurned:  storedStats?.caloriesBurned  ?? 0,
    caloriesTarget:  storedStats?.caloriesTarget  ?? 1800,
    streakCount:     storedStats?.streakCount     ?? 0,
    username:        storedStats?.username        ?? "Pengguna",
  });

  // ─── UI state ─────────────────────────────────────────────────────────────
  const [showWeightModal,   setShowWeightModal]   = useState(false);
  const [reminderDismissed, setReminderDismissed] = useState(false);

  const [setupDone, setSetupDone] = useState(() => {
    try { return localStorage.getItem(SETUP_DONE_KEY) === "true"; }
    catch { return false; }
  });

  // Auto-buka modal setup untuk user baru
  const [showSetupModal, setShowSetupModal] = useState(() => {
    try { return localStorage.getItem("healthyup:newUser") === "true"; }
    catch { return false; }
  });

  // ─── Derived values ───────────────────────────────────────────────────────
  const todayKey         = getTodayKey();
  const thisWeekKey      = getThisWeekKey();
  const isLoggedThisWeek = lastLoggedDate === thisWeekKey;
  const showReminder     = !isLoggedThisWeek && !reminderDismissed;
  const weightDiff       = +(currentWeight - previousWeight).toFixed(1);
  const caloriesRemaining = Math.max(0, stats.caloriesTarget - stats.caloriesBurned);
  const caloriesPercent   = Math.min(100, Math.round((stats.caloriesBurned / stats.caloriesTarget) * 100));

  // ─── Tasks state (siap diganti API GET /api/missions) ─────────────────────
  // TODO: ganti dengan fetch ke GET /api/missions?status=assigned saat backend siap
  const [tasks, setTasks] = useState([]);

  // ─── Handlers ─────────────────────────────────────────────────────────────
  const openWeightModal = () => { if (!isLoggedThisWeek) setShowWeightModal(true); };

  const handleWeightSuccess = (newWeight) => {
    const newPrev = currentWeight;
    setPreviousWeight(newPrev);
    setCurrentWeight(newWeight);
    setLastLoggedDate(thisWeekKey);
    try {
      window.localStorage.setItem(WEIGHT_STORAGE_KEY, JSON.stringify({
        currentWeight: newWeight, previousWeight: newPrev,
        lastLoggedDate: thisWeekKey, targetWeight,
      }));
    } catch {}
    setShowWeightModal(false);
  };

  // Dipakai baik untuk setup awal maupun ubah target dari WeightCard
  const handleSetupConfirm = ({ gender, age, height, currentWeight: newWeight, targetWeight: newTarget, tasks: newTasks }) => {
    if (newWeight !== currentWeight) {
      setPreviousWeight(currentWeight);
      setCurrentWeight(newWeight);
    }
    setTargetWeight(newTarget);
    setTasks(newTasks.map((t) => ({
      id: t.id, title: t.title, category: t.category,
      completed: false, claimed: false, points: t.points, Icon: t.Icon,
    })));
    try {
      window.localStorage.setItem(WEIGHT_STORAGE_KEY, JSON.stringify({
        currentWeight: newWeight, previousWeight: currentWeight,
        lastLoggedDate, targetWeight: newTarget,
      }));
      window.localStorage.setItem(SETUP_DONE_KEY, "true");
      window.localStorage.removeItem("healthyup:newUser");
    } catch {}
    setSetupDone(true);
  };

  const toggleTask = (id) =>
    setTasks((prev) => prev.map((t) => t.id === id ? { ...t, completed: !t.completed } : t));

  const claimTask = (id) =>
    setTasks((prev) => prev.map((t) => t.id === id ? { ...t, claimed: true } : t));

  const totalEarned    = tasks.filter((t) => t.claimed).reduce((sum, t) => sum + t.points, 0);
  const totalTasks     = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed || t.claimed).length;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const circumference   = 2 * Math.PI * 56; // r=56

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <Navbar />

      <main className="lg:ml-72 pb-20 lg:pb-0">
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-[#191c20] font-lexend">
                Selamat Pagi, {stats.username}!
              </h1>
              <p className="text-[#6d7b6c] font-jakarta mt-1">
                Mari lanjutkan perjalanan sehatmu hari ini
              </p>
            </div>
            <div className="hidden sm:flex">
              <Streak count={stats.streakCount} />
            </div>
          </div>

          {/* Weight Reminder Banner */}
          <WeightReminderBanner
            show={showReminder}
            onCatat={openWeightModal}
            onDismiss={() => setReminderDismissed(true)}
          />

          {/* Setup Target Banner — muncul jika user belum setup */}
          {!setupDone && (
            <div className="mb-6 bg-[#006e2f]  rounded-3xl p-5 flex items-center justify-between gap-4 shadow-[0_8px_30px_rgba(0,110,47,0.2)]">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Sparkle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-white font-lexend">
                    Belum ada target & tugas
                  </p>
                  <p className="text-sm text-white/80 font-jakarta mt-0.5">
                    Set target berat badanmu dan biarkan AI menyusun tugas harianmu
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowSetupModal(true)}
                className="flex-shrink-0 bg-white text-[#006e2f] font-semibold text-sm px-4 py-2.5 rounded-xl hover:bg-green-50 transition-colors font-jakarta whitespace-nowrap"
              >
                Mulai Setup
              </button>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Progress Circle Card */}
            <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgba(34,197,94,0.08)] border border-[#e5eeff]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-[#191c20] font-lexend">Progress Minggu Ini</h3>
                <MoreVertical className="w-5 h-5 text-[#6d7b6c]" />
              </div>
              <div className="flex items-center justify-center">
                <div className="relative w-32 h-32">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="64" cy="64" r="56" stroke="#e5eeff" strokeWidth="12" fill="none" />
                    <circle cx="64" cy="64" r="56" stroke="#006e2f" strokeWidth="12" fill="none"
                      strokeDasharray={`${(progressPercent / 100) * circumference} ${circumference}`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-[#191c20] font-lexend">{progressPercent}%</span>
                    <span className="text-xs text-[#6d7b6c] font-jakarta">selesai</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Weight Card */}
            <WeightCard
              currentWeight={currentWeight}
              weightDiff={weightDiff}
              targetWeight={targetWeight}
              isLoggedThisWeek={isLoggedThisWeek}
            />

            {/* Calories Card */}
            <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgba(34,197,94,0.08)] border border-[#e5eeff] flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-[#191c20] font-lexend">Kalori Yang Terbakar Dari Olahraga</h3>
              </div>
              <div className="mb-4">
                <span className="text-4xl font-bold text-[#191c20] font-lexend">
                  {stats.caloriesBurned.toLocaleString("id-ID")}
                </span>
                <span className="text-[#6d7b6c] ml-1 font-jakarta">kkal</span>
              </div>
              <div className="flex items-center gap-2 text-sm mb-4">
                <span className="flex items-center gap-1 text-orange-500 font-medium">
                  {caloriesRemaining.toLocaleString("id-ID")} kkal
                </span>
                <span className="text-[#6d7b6c] font-jakarta">tersisa</span>
              </div>
              <div className="h-2 bg-[#e5eeff] rounded-full overflow-hidden">
                <div
                  className="h-full bg-orange-400 rounded-full transition-all"
                  style={{ width: `${caloriesPercent}%` }}
                />
              </div>
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-[#6d7b6c] font-jakarta">
                  Target: {stats.caloriesTarget.toLocaleString("id-ID")} kkal
                </p>
                <p className="text-xs text-[#6d7b6c] font-jakarta">{caloriesPercent}%</p>
              </div>
            </div>
          </div>

          {/* Tasks */}
          <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgba(34,197,94,0.08)] border border-[#e5eeff]">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-[#191c20] font-lexend">Tugas Minggu ini</h3>
              <div className="flex items-center gap-3">
                {totalEarned > 0 && (
                  <span className="flex items-center gap-1 text-sm font-semibold text-[#006e2f] bg-[#e5eeff] px-3 py-1 rounded-full font-jakarta">
                    <Star className="w-3.5 h-3.5" />
                    +{totalEarned} Pts hari ini
                  </span>
                )}
                <button
                  onClick={() => navigate("/tugas")}
                  className="text-sm text-[#006e2f] font-medium hover:underline font-jakarta"
                >
                  Lihat Semua
                </button>
              </div>
            </div>
            <p className="text-xs text-[#6d7b6c] font-jakarta mb-6">Selesaikan tugas minggu ini dan klaim poinmu</p>

            {setupDone ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                      task.claimed
                        ? "bg-[#f0faf4] border-[#006e2f]/20"
                        : task.completed
                        ? "bg-[#f8faf8] border-[#e5eeff] hover:border-[#006e2f]/30"
                        : "bg-white border-[#e5eeff] hover:bg-[#f8f9ff]"
                    }`}
                  >
                    <button
                      onClick={() => !task.claimed && toggleTask(task.id)}
                      disabled={task.claimed}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                        task.completed || task.claimed
                          ? "bg-[#006e2f] text-white"
                          : "bg-[#f0f4f0] text-[#6d7b6c] hover:bg-[#e5eeff]"
                      }`}
                    >
                      {task.completed || task.claimed ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <task.Icon className="w-5 h-5" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium font-jakarta truncate ${
                        task.claimed ? "text-[#6d7b6c] line-through" : "text-[#191c20]"
                      }`}>
                        {task.title}
                      </p>
                      <p className="text-xs text-[#6d7b6c] font-jakarta">{task.category}</p>
                    </div>
                    {task.claimed ? (
                      <span className="flex items-center gap-1 text-xs font-semibold text-[#006e2f] bg-[#e5eeff] px-2.5 py-1 rounded-full font-jakarta flex-shrink-0">
                        <Star className="w-3 h-3" />
                        +{task.points} Pts
                      </span>
                    ) : task.completed ? (
                      <button
                        onClick={() => claimTask(task.id)}
                        className="flex items-center gap-1 text-xs font-semibold text-white bg-[#006e2f] hover:bg-[#005823] px-3 py-1.5 rounded-full font-jakarta flex-shrink-0 transition-colors"
                      >
                        <Star className="w-3 h-3" />
                        Klaim {task.points} Pts
                      </button>
                    ) : (
                      <span className="text-xs text-[#6d7b6c] font-jakarta flex-shrink-0">{task.points} Pts</span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <p className="text-[#6d7b6c] font-jakarta text-sm">
                  Tugas akan muncul setelah kamu mengatur target di atas.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Weight Input Modal */}
      <WeightInputModal
        isOpen={showWeightModal}
        onClose={() => setShowWeightModal(false)}
        onSuccess={handleWeightSuccess}
        currentWeight={currentWeight}
        targetWeight={targetWeight}
      />

      {/* Setup Target & Generate Tugas Modal — dipakai untuk setup awal dan ubah target */}
      <SetupTargetModal
        isOpen={showSetupModal}
        onClose={() => setShowSetupModal(false)}
        initialWeight={currentWeight}
        initialTarget={targetWeight}
        onConfirm={handleSetupConfirm}
      />
    </div>
  );
}
