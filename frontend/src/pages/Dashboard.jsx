import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Clock, Star, Sparkle, Brain, Dumbbell, UtensilsCrossed, Apple, Footprints, Moon, Droplets, Activity, Flame, Heart, Wind, Bike, Salad, RefreshCw, Target, CheckCircle2, X } from "lucide-react";
import WeightCard from "../components/WeightCard";
import WeightReminderBanner from "../components/WeightReminderBanner";
import WeightInputModal from "../components/WeightInputModal";
import SetupTargetModal from "../components/SetupTargetModal";
import Streak from "../components/ui/streak";
import { healthApi, missionApi, userApi } from "../lib/api";

const WEIGHT_STORAGE_KEY = "healthyup:weightLog";
const SETUP_DONE_KEY     = "healthyup:setupDone";

// Map nama icon dari backend → Lucide component (sama seperti Tugas.jsx)
const ICON_MAP = {
  brain: Brain,
  "biceps-flexed": Dumbbell,
  dumbbell: Dumbbell,
  utensils: UtensilsCrossed,
  apple: Apple,
  footprints: Footprints,
  moon: Moon,
  droplets: Droplets,
  activity: Activity,
  flame: Flame,
  heart: Heart,
  wind: Wind,
  bike: Bike,
  salad: Salad,
  mental: Brain,
  nutrition: UtensilsCrossed,
  physical: Dumbbell,
};

const CATEGORY_ICON_COLOR = {
  physical: "text-orange-500",
  mental: "text-purple-500",
  nutrition: "text-green-600",
};

function getTaskIcon(iconName, category) {
  const key = iconName?.toLowerCase();
  if (key && key !== "activity" && ICON_MAP[key]) {
    return ICON_MAP[key];
  }
  return ICON_MAP[category?.toLowerCase()] ?? Activity;
}

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

export default function Dashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [showWeightModal,   setShowWeightModal]   = useState(false);
  const [reminderDismissed, setReminderDismissed] = useState(false);
  const [isGeneratingWeekly, setIsGeneratingWeekly] = useState(false);
  const [weeklyRefreshNotice, setWeeklyRefreshNotice] = useState("");
  const [weeklyGenerateError, setWeeklyGenerateError] = useState("");
  const hasAutoRefreshed = useRef(false);

  // Auto-buka modal setup untuk user baru (hanya 1 kali)
  const [showSetupModal, setShowSetupModal] = useState(() => {
    try { 
      const isNew = localStorage.getItem("healthyup:newUser") === "true"; 
      if (isNew) {
        localStorage.removeItem("healthyup:newUser");
      }
      return isNew;
    }
    catch { return false; }
  });

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const res = await userApi.getMe();
      return res.data?.user;
    },
  });

  const { data: calorieLogsData } = useQuery({
    queryKey: ['calorieLogs'],
    queryFn: async () => {
      const res = await healthApi.getCalorieLogs();
      return res.data || {};
    },
  });

  const { data: healthProfile } = useQuery({
    queryKey: ['healthProfile'],
    queryFn: async () => {
      try {
        const res = await healthApi.getMyProfile();
        return res.data?.profile || null;
      } catch {
        return null;
      }
    },
  });

  const { data: weightLogsData = [] } = useQuery({
    queryKey: ['weightLogs', 'month'],
    queryFn: async () => {
      const res = await healthApi.getWeightLogs('month');
      return res.data?.weightLogs || [];
    },
  });

  const { data: weeklyProgress = { approved: 0, total: 0 } } = useQuery({
    queryKey: ['weeklyProgress'],
    queryFn: async () => {
      const res = await missionApi.getWeeklyProgress();
      const data = res?.data;
      return {
        approved: data?.completedMissions ?? data?.approved ?? 0,
        total: data?.totalMissions ?? data?.total ?? 0,
      };
    },
  });

  const { data: rawMissions = [], isLoading: loadingTasks } = useQuery({
    queryKey: ['missions'],
    queryFn: async () => {
      const res = await missionApi.getAll();
      return res?.data?.missions || [];
    },
  });

  const setupDone = Boolean(healthProfile || localStorage.getItem(SETUP_DONE_KEY) === "true");

  const stored = readWeightLog();
  const onboardingWeight = readOnboardingWeight();
  const validLogs = (weightLogsData || []).filter((l) => l.weight > 0);
  const latestLog = validLogs.length > 0 ? validLogs[validLogs.length - 1] : null;
  const prevLog = validLogs.length >= 2 ? validLogs[validLogs.length - 2] : null;

  const currentWeight = latestLog
    ? latestLog.weight
    : (Number(healthProfile?.weightKg) || stored?.currentWeight || onboardingWeight);
  const previousWeight = prevLog ? prevLog.weight : (stored?.previousWeight ?? 0);
  const targetWeight = Number(healthProfile?.goalWeight) || stored?.targetWeight || 0;

  const lastLoggedDate = (() => {
    if (stored?.lastLoggedDate) return stored.lastLoggedDate;
    if (!latestLog) return null;
    const now = new Date();
    const day = now.getDay();
    const diffToMonday = now.getDate() - day + (day === 0 ? -6 : 1);
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), diffToMonday, 0, 0, 0, 0);
    const latestDate = new Date(latestLog.loggedAt || latestLog.date);
    return latestDate >= startOfWeek ? getThisWeekKey() : null;
  })();

  const stats = {
    caloriesBurned: calorieLogsData?.weeklyBurnedFromLog || 0,
    caloriesTarget: 1800,
    streakCount: user?.streakCount ?? 0,
    username: user?.username || "Pengguna",
  };

  const thisWeekKey = getThisWeekKey();
  const isLoggedThisWeek = lastLoggedDate === thisWeekKey;
  const showReminder = !isLoggedThisWeek && !reminderDismissed;
  const weightDiff = +(currentWeight - previousWeight).toFixed(1);
  const caloriesRemaining = Math.max(0, stats.caloriesTarget - stats.caloriesBurned);
  const caloriesPercent = Math.min(100, Math.round((stats.caloriesBurned / stats.caloriesTarget) * 100));

  const mapMissionsToTasks = useCallback((missions) => {
    return missions.slice(0, 5).map((t) => ({
      id: t.id,
      title: t.title,
      category: t.category,
      icon: t.icon,
      status: t.status,
      verificationStatus: t.verificationStatus,
      completed: t.status === "completed" && t.verificationStatus === "approved",
      claimed: t.status === "completed" && t.verificationStatus === "approved",
      points: t.pointsReward || t.points || 0,
    }));
  }, []);

  const tasks = mapMissionsToTasks(rawMissions);

  // Generate misi minggu baru
  const handleGenerateNewWeek = useCallback(async (isAuto = false) => {
    if (!missionApi?.generate) return;
    setIsGeneratingWeekly(true);
    setWeeklyGenerateError("");
    try {
      await missionApi.generate();
      await queryClient.invalidateQueries({ queryKey: ['missions'] });
      await queryClient.invalidateQueries({ queryKey: ['weeklyProgress'] });
      setWeeklyRefreshNotice(
        isAuto
          ? "Selamat memasuki minggu baru! AI telah otomatis menyusun misi baru untukmu."
          : "Misi minggu ini berhasil diperbarui oleh AI!"
      );
    } catch (err) {
      if (!isAuto) {
        setWeeklyGenerateError(err.message || "Gagal membuat misi mingguan baru.");
      }
    } finally {
      setIsGeneratingWeekly(false);
    }
  }, [queryClient]);

  useEffect(() => {
    if (setupDone && rawMissions.length === 0 && !hasAutoRefreshed.current && !loadingTasks) {
      hasAutoRefreshed.current = true;
      handleGenerateNewWeek(true);
    }
  }, [setupDone, rawMissions.length, loadingTasks, handleGenerateNewWeek]);

  const openWeightModal = () => { if (!isLoggedThisWeek) setShowWeightModal(true); };

  const handleWeightSuccess = async (newWeight) => {
    try {
      await healthApi?.createWeightLog?.({ weight: newWeight });
      queryClient.invalidateQueries({ queryKey: ['weightLogs'] });
      setShowWeightModal(false);
    } catch (err) {
      if (err?.message) {
        alert(err.message);
      }
    }
  };

  const handleSetupConfirm = async ({ gender, age, height, currentWeight: newWeight, targetWeight: newTarget }) => {
    const profilePayload = {
      gender,
      age,
      heightCm: height,
      weightKg: newWeight,
      goalWeight: newTarget,
    };

    try {
      await healthApi?.createProfile?.(profilePayload);
      try {
        await missionApi?.generate?.();
      } catch (e) {
        console.error(e);
      }
      queryClient.invalidateQueries({ queryKey: ['healthProfile'] });
      queryClient.invalidateQueries({ queryKey: ['missions'] });
      queryClient.invalidateQueries({ queryKey: ['weeklyProgress'] });
      localStorage.setItem(SETUP_DONE_KEY, "true");
      localStorage.removeItem("healthyup:newUser");
      setShowSetupModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  const totalEarned    = tasks.filter((t) => t.claimed).reduce((sum, t) => sum + t.points, 0);

  const progressPercent = weeklyProgress.total > 0
    ? Math.round((weeklyProgress.approved / weeklyProgress.total) * 100)
    : 0;
  const circumference   = 2 * Math.PI * 56;

  return (
    <>
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
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold text-[#191c20] font-lexend">Progress Minggu Ini</h3>
              </div>
              <p className="text-xs text-[#6d7b6c] font-jakarta mb-4">Misi yang telah diverifikasi</p>
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
                    <span className="text-xs text-[#6d7b6c] font-jakarta">
                      {weeklyProgress.approved}/{weeklyProgress.total} misi
                    </span>
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

            {/* Banner notifikasi saat misi minggu baru berhasil diperbarui */}
            {weeklyRefreshNotice && (
              <div className="mb-5 flex items-center justify-between gap-3 rounded-2xl bg-[#f0faf4] border border-[#006e2f]/20 px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-[#006e2f] flex-shrink-0" />
                  <p className="text-sm font-medium text-[#005823] font-jakarta">
                    {weeklyRefreshNotice}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setWeeklyRefreshNotice("")}
                  aria-label="Tutup notifikasi"
                  className="text-[#6d7b6c] hover:text-[#191c20] p-1 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {weeklyGenerateError && (
              <div className="mb-5 rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600 font-jakarta">
                {weeklyGenerateError}
              </div>
            )}

            {setupDone ? (
              loadingTasks || isGeneratingWeekly ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="w-8 h-8 border-4 border-[#006e2f] border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-sm font-medium text-[#191c20] mt-4 font-lexend">
                    {isGeneratingWeekly
                      ? "AI sedang menyusun misi baru untuk minggu ini..."
                      : "Memuat tugas..."}
                  </p>
                  {isGeneratingWeekly && (
                    <p className="text-xs text-[#6d7b6c] mt-1 font-jakarta">
                      Menyesuaikan tantangan dengan profil dan target kesehatanmu
                    </p>
                  )}
                </div>
              ) : tasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center py-8 px-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#f0faf4] flex items-center justify-center mb-3">
                    <Sparkle className="w-7 h-7 text-[#006e2f]" />
                  </div>
                  <p className="font-semibold text-[#191c20] font-lexend text-base mb-1">
                    Saatnya Memulai Misi Minggu Baru!
                  </p>
                  <p className="text-[#6d7b6c] font-jakarta text-sm max-w-md mb-5">
                    Siklus misi 7 hari sebelumnya telah berakhir. Buat misi baru untuk minggu ini dengan AI atau sesuaikan kembali target berat badanmu.
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleGenerateNewWeek(false)}
                      disabled={isGeneratingWeekly}
                      className="flex items-center gap-2 px-5 py-2.5 bg-[#006e2f] text-white rounded-xl text-sm font-semibold font-lexend hover:bg-[#005823] transition-colors disabled:opacity-60"
                    >
                      <RefreshCw className={`w-4 h-4 ${isGeneratingWeekly ? "animate-spin" : ""}`} />
                      Generate Misi Minggu Ini
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowSetupModal(true)}
                      className="flex items-center gap-2 px-4 py-2.5 border border-[#c1c9bf] text-[#191c20] rounded-xl text-sm font-semibold font-jakarta hover:bg-[#f8f9ff] transition-colors"
                    >
                      <Target className="w-4 h-4 text-[#006e2f]" />
                      Perbarui Target Berat
                    </button>
                  </div>
                </div>
              ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {tasks.map((task) => {
                  const isApproved =
                    task.status === "completed" &&
                    task.verificationStatus === "approved";
                  const isPending =
                    task.status === "completed" &&
                    task.verificationStatus === "pending";

                  return (
                    <div
                      key={task.id}
                      onClick={() => navigate("/tugas")}
                      className={`flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer ${
                        isApproved
                          ? "bg-[#f0faf4] border-[#006e2f]/20"
                          : isPending
                          ? "bg-[#f8faf8] border-[#e5eeff] hover:border-[#006e2f]/30"
                          : "bg-white border-[#e5eeff] hover:bg-[#f8f9ff]"
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                          isApproved
                            ? "bg-[#006e2f] text-white"
                            : isPending
                            ? "bg-amber-100 text-amber-600"
                            : "bg-[#f0f4f0] text-[#6d7b6c]"
                        }`}
                      >
                        {isApproved ? (
                          <Check className="w-5 h-5" />
                        ) : isPending ? (
                          <Clock className="w-5 h-5" />
                        ) : (
                          (() => {
                            const IconComp = getTaskIcon(task.icon, task.category);
                            const colorClass = CATEGORY_ICON_COLOR[task.category] ?? "text-[#006e2f]";
                            return <IconComp className={`w-5 h-5 ${colorClass}`} />;
                          })()
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium font-jakarta truncate ${
                          isApproved ? "text-[#6d7b6c] line-through" : "text-[#191c20]"
                        }`}>
                          {task.title}
                        </p>
                        <p className="text-xs text-[#6d7b6c] font-jakarta">{task.category}</p>
                      </div>
                      {isApproved ? (
                        <span className="flex items-center gap-1 text-xs font-semibold text-[#006e2f] bg-[#e5eeff] px-2.5 py-1 rounded-full font-jakarta flex-shrink-0">
                          <Star className="w-3 h-3" />
                          +{task.points} Pts
                        </span>
                      ) : isPending ? (
                        <span className="flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full font-jakarta flex-shrink-0">
                          <Clock className="w-3 h-3" />
                          Pending
                        </span>
                      ) : (
                        <span className="text-xs text-[#6d7b6c] font-jakarta flex-shrink-0">{task.points} Pts</span>
                      )}
                    </div>
                  );
                })}
              </div>
              )
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <p className="text-[#6d7b6c] font-jakarta text-sm">
                  Tugas akan muncul setelah kamu mengatur target di atas.
                </p>
              </div>
            )}
          </div>
        </div>

      {/* Weight Input Modal */}
      <WeightInputModal
        isOpen={showWeightModal}
        onClose={() => setShowWeightModal(false)}
        onSuccess={handleWeightSuccess}
        currentWeight={currentWeight}
        targetWeight={targetWeight}
      />

      <SetupTargetModal
        isOpen={showSetupModal}
        onClose={() => setShowSetupModal(false)}
        initialWeight={currentWeight}
        initialTarget={targetWeight}
        onConfirm={handleSetupConfirm}
      />
    </>
  );
}
