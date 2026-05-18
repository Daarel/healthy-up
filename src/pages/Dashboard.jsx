import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Droplets,
  Apple,
  Footprints,
  Moon,
  Flame,
  MoreVertical,
  Check,
  Star,
} from "lucide-react";
import Navbar from "../components/Navbar";
import WeightCard from "../components/WeightCard";
import WeightReminderBanner from "../components/WeightReminderBanner";
import WeightInputModal from "../components/WeightInputModal";
import Streak from "../components/ui/streak";

const WEIGHT_STORAGE_KEY = "healthyup:weightLog";

const getTodayKey = () => {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const readWeightLog = () => {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(WEIGHT_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export default function Dashboard() {
  const navigate = useNavigate();

  // Weight state
  const targetWeight = 65;
  const stored = readWeightLog();
  const [currentWeight, setCurrentWeight] = useState(stored?.currentWeight ?? 68.5);
  const [previousWeight, setPreviousWeight] = useState(stored?.previousWeight ?? 70.0);
  const [lastLoggedDate, setLastLoggedDate] = useState(stored?.lastLoggedDate ?? null);
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [reminderDismissed, setReminderDismissed] = useState(false);

  const todayKey = getTodayKey();
  const isLoggedToday = lastLoggedDate === todayKey;
  const showReminder = !isLoggedToday && !reminderDismissed;

  const weightDiff = +(currentWeight - previousWeight).toFixed(1);
  const weightProgress = Math.min(
    100,
    Math.max(0, ((previousWeight - currentWeight) / (previousWeight - targetWeight)) * 100)
  );

  const openWeightModal = () => {
    if (isLoggedToday) return;
    setShowWeightModal(true);
  };

  const handleWeightSuccess = (newWeight) => {
    const newPrev = currentWeight;
    setPreviousWeight(newPrev);
    setCurrentWeight(newWeight);
    setLastLoggedDate(todayKey);
    try {
      window.localStorage.setItem(
        WEIGHT_STORAGE_KEY,
        JSON.stringify({
          currentWeight: newWeight,
          previousWeight: newPrev,
          lastLoggedDate: todayKey,
        })
      );
    } catch {
      // ignore storage errors
    }
    setShowWeightModal(false);
  };

  const [tasks, setTasks] = useState([
    { id: 1, title: "Minum air 8 gelas",   category: "Hidrasi",   completed: true,  claimed: false, points: 50,  Icon: Droplets   },
    { id: 2, title: "Makan sayur 3 porsi", category: "Nutrisi",   completed: false, claimed: false, points: 75,  Icon: Apple      },
    { id: 3, title: "Jalan kaki 30 menit", category: "Olahraga",  completed: false, claimed: false, points: 100, Icon: Footprints },
    { id: 4, title: "Tidur 8 jam",         category: "Istirahat", completed: false, claimed: false, points: 60,  Icon: Moon       },
  ]);

  const toggleTask = (id) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const claimTask = (id) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, claimed: true } : t))
    );
  };

  const totalEarned = tasks.filter((t) => t.claimed).reduce((sum, t) => sum + t.points, 0);

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <Navbar />

      <main className="lg:ml-72 pb-20 lg:pb-0">
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-[#191c20] font-lexend">
                Selamat Pagi, Ghifari!
              </h1>
              <p className="text-[#6d7b6c] font-jakarta mt-1">
                Mari lanjutkan perjalanan sehatmu hari ini
              </p>
            </div>
            <div className="hidden sm:flex">
              <Streak count={14} />
            </div>
          </div>

          {/* Weight Reminder Banner */}
          <WeightReminderBanner
            show={showReminder}
            onCatat={openWeightModal}
            onDismiss={() => setReminderDismissed(true)}
          />

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
                      strokeDasharray={`${0.75 * 351.86} 351.86`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-[#191c20] font-lexend">75%</span>
                    <span className="text-xs text-[#6d7b6c] font-jakarta">selesai</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Weight Card */}
            <WeightCard
              currentWeight={currentWeight}
              weightDiff={weightDiff}
              weightProgress={weightProgress}
              targetWeight={targetWeight}
              isLoggedToday={isLoggedToday}
              onAddClick={openWeightModal}
            />

            {/* Calories Card */}
            <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgba(34,197,94,0.08)] border border-[#e5eeff] flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-[#191c20] font-lexend">Kalori Hari Ini</h3>
              
              </div>

              <div className="mb-4">
                <span className="text-4xl font-bold text-[#191c20] font-lexend">1,250</span>
                <span className="text-[#6d7b6c] ml-1 font-jakarta">kkal</span>
              </div>

              <div className="flex items-center gap-2 text-sm mb-4">
                <span className="flex items-center gap-1 text-orange-500 font-medium">
               
                  550 kkal
                </span>
                <span className="text-[#6d7b6c] font-jakarta">tersisa</span>
              </div>

              <div className="h-2 bg-[#e5eeff] rounded-full overflow-hidden">
                <div
                  className="h-full bg-orange-400 rounded-full transition-all"
                  style={{ width: "69%" }}
                />
              </div>

              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-[#6d7b6c] font-jakarta">Target: 1,800 kkal</p>
                <p className="text-xs text-[#6d7b6c] font-jakarta">69%</p>
              </div>
            </div>
          </div>

          {/* Tasks */}
          <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgba(34,197,94,0.08)] border border-[#e5eeff]">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-[#191c20] font-lexend">Tugas Hari Ini</h3>
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
            <p className="text-xs text-[#6d7b6c] font-jakarta mb-6">Selesaikan tugas dan klaim poinmu</p>

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
                  {/* Icon toggle */}
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

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium font-jakarta truncate ${
                      task.claimed ? "text-[#6d7b6c] line-through" : task.completed ? "text-[#191c20]" : "text-[#191c20]"
                    }`}>
                      {task.title}
                    </p>
                    <p className="text-xs text-[#6d7b6c] font-jakarta">{task.category}</p>
                  </div>

                  {/* Points / Klaim */}
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
    </div>
  );
}
