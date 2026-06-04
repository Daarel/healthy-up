import { useState, useEffect } from "react";
import {
  X,
  Target,
  ArrowRight,
  ArrowLeft,
  Sparkle,
  CheckCircle2,
  Droplets,
  Apple,
  Footprints,
  Moon,
  UtensilsCrossed,
  Star,
  User,
  UserCircle2,
  Minus,
  Plus,
} from "lucide-react";

// Tugas harian yang "di-generate AI"
const AI_DAILY_TASKS = [
  { id: 1, title: "Minum air 8 gelas",   category: "Hidrasi",   points: 10, Icon: Droplets,        iconColor: "text-blue-500"   },
  { id: 2, title: "Makan sayur 3 porsi", category: "Nutrisi",   points: 15, Icon: Apple,           iconColor: "text-green-600"  },
  { id: 3, title: "Jalan kaki 30 menit", category: "Olahraga",  points: 20, Icon: Footprints,      iconColor: "text-orange-500" },
  { id: 4, title: "Tidur 8 jam",         category: "Istirahat", points: 10, Icon: Moon,            iconColor: "text-purple-500" },
  { id: 5, title: "Sarapan bergizi",     category: "Nutrisi",   points: 15, Icon: UtensilsCrossed, iconColor: "text-yellow-600" },
];

const AI_TYPING_LINES = [
  "Menganalisis data kesehatanmu...",
  "Menghitung kebutuhan kalori mingguan...",
  "Menyusun jadwal olahraga optimal...",
  "Membuat daftar tugas minggu ini...",
  "Rencanamu siap!",
];

/**
 * Modal 5 langkah:
 *  1. personal   — data pribadi (gender, usia, tinggi, berat)
 *  2. bmi        — tampil BMI placeholder + gauge
 *  3. target     — slider target berat badan
 *  4. generating — animasi AI
 *  5. preview    — preview tugas → konfirmasi
 *
 * Props:
 *  - isOpen        {boolean}
 *  - onClose       {fn}
 *  - initialWeight {number}  berat dari localStorage (0 jika belum ada)
 *  - initialTarget {number}  target dari localStorage (0 jika belum ada)
 *  - onConfirm     {fn({ gender, age, height, currentWeight, targetWeight, tasks })}
 */
export default function SetupTargetModal({
  isOpen,
  onClose,
  initialWeight = 0,
  initialTarget = 0,
  onConfirm,
}) {
  // ── Step state ──────────────────────────────────────────────────────────
  const [step, setStep] = useState("personal");
  const [realTasks, setRealTasks] = useState(AI_DAILY_TASKS);

  // ── Step 1: personal ────────────────────────────────────────────────────
  const [gender, setGender] = useState("");
  const [age,    setAge]    = useState(25);
  const [height, setHeight] = useState(170);
  const [weight, setWeight] = useState(initialWeight || 70);

  // ── Step 3: target ──────────────────────────────────────────────────────
  const [targetWeight, setTargetWeight] = useState(
    initialTarget || Math.max(30, (initialWeight || 70) - 5)
  );

  // ── Step 4: generating ──────────────────────────────────────────────────
  const [typingIndex, setTypingIndex] = useState(0);

  // Reset setiap kali modal dibuka (menggunakan render-phase update sesuai anjuran React)
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setStep("personal");
      setWeight(initialWeight || 70);
      setTargetWeight(initialTarget || Math.max(30, (initialWeight || 70) - 5));
      setTypingIndex(0);
    }
  }

  // Saat weight berubah di step personal, sesuaikan target (render-phase update)
  const [prevWeight, setPrevWeight] = useState(weight);
  if (weight !== prevWeight) {
    setPrevWeight(weight);
    if (weight > 30) {
      setTargetWeight((prev) => Math.min(prev, weight - 0.5));
    }
  }

  // Animasi AI typing
  useEffect(() => {
    if (step !== "generating") return;
    if (typingIndex < AI_TYPING_LINES.length - 1) {
      const t = setTimeout(() => setTypingIndex((i) => i + 1), 650);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(() => setStep("preview"), 800);
      return () => clearTimeout(t);
    }
  }, [typingIndex, step]);

  if (!isOpen) return null;

  const weightMax  = weight > 30 ? weight : 150;
  const diff       = Math.abs(targetWeight - weight).toFixed(1);
  const isLose     = targetWeight < weight;
  const isGain     = targetWeight > weight;

  const handleConfirm = async () => {
    setTypingIndex(0);
    setStep("generating");
    const confirmData = { gender, age, height, currentWeight: weight, targetWeight, tasks: AI_DAILY_TASKS };
    try {
      const generatedTasks = await onConfirm(confirmData);
      if (generatedTasks && generatedTasks.length > 0) {
        setRealTasks(generatedTasks);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // ── KALKULASI BMI MANUAL ────────────────────────────────────────────────
  // Rumus BMI: Berat (kg) / (Tinggi (m) * Tinggi (m))
  const heightInMeters = height / 100;
  const calculatedBmi = heightInMeters > 0 ? (weight / (heightInMeters * heightInMeters)).toFixed(2) : 0;
  
  let bmiCategory = "";
  let bmiColorClass = "";
  let gaugePosition = 0;

  const numBmi = parseFloat(calculatedBmi);
  if (numBmi < 18.5) {
    bmiCategory = "Kurus (Underweight)";
    bmiColorClass = "text-blue-500";
    gaugePosition = Math.min(18, Math.max(0, ((numBmi - 10) / 8.5) * 18));
  } else if (numBmi >= 18.5 && numBmi < 25) {
    bmiCategory = "Normal";
    bmiColorClass = "text-green-500";
    gaugePosition = 18 + ((numBmi - 18.5) / 6.5) * 25;
  } else if (numBmi >= 25 && numBmi < 30) {
    bmiCategory = "Berat Berlebih (Overweight)";
    bmiColorClass = "text-yellow-500";
    gaugePosition = 43 + ((numBmi - 25) / 5) * 17;
  } else {
    bmiCategory = "Obesitas";
    bmiColorClass = "text-red-500";
    gaugePosition = 60 + Math.min(40, ((numBmi - 30) / 15) * 40);
  }

  // ── Progress dots ────────────────────────────────────────────────────────
  const STEPS = ["personal", "bmi", "target", "generating", "preview"];
  const stepIdx = STEPS.indexOf(step);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="setup-modal-title"
      onClick={step === "personal" ? onClose : undefined}
    >
      <div
        className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >

        {/* ── STEP 1: DATA PRIBADI ── */}
        {step === "personal" && (
          <>
            <div className="flex items-center justify-between p-6 border-b border-[#e5eeff]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <User className="w-5 h-5 text-[#006e2f]" />
                </div>
                <div>
                  <h2 id="setup-modal-title" className="text-lg font-bold text-[#191c20] font-lexend">
                    Data Pribadi
                  </h2>
                  <p className="text-xs text-[#6d7b6c] font-jakarta">Langkah 1 dari 3</p>
                </div>
              </div>
              <button type="button" onClick={onClose} aria-label="Tutup"
                className="w-9 h-9 rounded-xl bg-[#f8f9ff] flex items-center justify-center hover:bg-[#e5eeff] transition-colors">
                <X className="w-5 h-5 text-[#6d7b6c]" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Progress dots */}
              <div className="flex items-center justify-center gap-2">
                <div className="w-8 h-2 rounded-full bg-[#006e2f]" />
                <div className="w-2 h-2 rounded-full bg-[#e5eeff]" />
                <div className="w-2 h-2 rounded-full bg-[#e5eeff]" />
              </div>

              {/* Gender */}
              <div>
                <p className="text-sm font-semibold text-[#191c20] mb-3 font-lexend">Jenis Kelamin</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { val: "male",   label: "Laki-laki",  Icon: User },
                    { val: "female", label: "Perempuan",  Icon: UserCircle2 },
                  ].map(({ val, label, Icon }) => (
                    <button key={val} type="button" onClick={() => setGender(val)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                        gender === val
                          ? "border-[#006e2f] bg-green-50"
                          : "border-[#c1c9bf] bg-white hover:border-[#006e2f]/50"
                      }`}>
                      <Icon className={`w-8 h-8 ${gender === val ? "text-[#006e2f]" : "text-[#6d7b6c]"}`} />
                      <span className={`font-jakarta font-medium text-sm ${gender === val ? "text-[#006e2f]" : "text-[#191c20]"}`}>
                        {label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Usia */}
              <div>
                <p className="text-sm font-semibold text-[#191c20] mb-3 font-lexend">Usia</p>
                <div className="flex items-center gap-4">
                  <button type="button" onClick={() => setAge(Math.max(10, age - 1))}
                    className="w-11 h-11 rounded-xl bg-white border border-[#c1c9bf] flex items-center justify-center hover:bg-[#f8f9ff] transition-colors">
                    <Minus className="w-4 h-4 text-[#191c20]" />
                  </button>
                  <div className="flex-1 text-center">
                    <span className="text-3xl font-bold text-[#191c20] font-lexend">{age}</span>
                    <span className="text-[#6d7b6c] ml-1 font-jakarta text-sm">tahun</span>
                  </div>
                  <button type="button" onClick={() => setAge(Math.min(100, age + 1))}
                    className="w-11 h-11 rounded-xl bg-white border border-[#c1c9bf] flex items-center justify-center hover:bg-[#f8f9ff] transition-colors">
                    <Plus className="w-4 h-4 text-[#191c20]" />
                  </button>
                </div>
              </div>

              {/* Tinggi & Berat */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-sm font-semibold text-[#191c20] mb-2 font-lexend">Tinggi (cm)</p>
                  <input type="number" value={height}
                    onChange={(e) => setHeight(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#c1c9bf] bg-white focus:outline-none focus:ring-2 focus:ring-[#006e2f] focus:border-transparent font-jakarta text-center" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#191c20] mb-2 font-lexend">Berat (kg)</p>
                  <input type="number" value={weight}
                    onChange={(e) => setWeight(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#c1c9bf] bg-white focus:outline-none focus:ring-2 focus:ring-[#006e2f] focus:border-transparent font-jakarta text-center" />
                </div>
              </div>

              <button type="button" onClick={() => setStep("bmi")}
                className="w-full py-3.5 bg-[#006e2f] text-white rounded-xl font-semibold font-lexend hover:bg-[#005425] transition-colors flex items-center justify-center gap-2">
                Selanjutnya
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </>
        )}

        {/* ── STEP 2: BMI ── */}
        {step === "bmi" && (
          <>
            <div className="flex items-center justify-between p-6 border-b border-[#e5eeff]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <Target className="w-5 h-5 text-[#006e2f]" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#191c20] font-lexend">Hasil BMI Anda</h2>
                  <p className="text-xs text-[#6d7b6c] font-jakarta">Langkah 2 dari 3</p>
                </div>
              </div>
              <button type="button" onClick={onClose} aria-label="Tutup"
                className="w-9 h-9 rounded-xl bg-[#f8f9ff] flex items-center justify-center hover:bg-[#e5eeff] transition-colors">
                <X className="w-5 h-5 text-[#6d7b6c]" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Progress dots */}
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#006e2f]" />
                <div className="w-8 h-2 rounded-full bg-[#006e2f]" />
                <div className="w-2 h-2 rounded-full bg-[#e5eeff]" />
              </div>

              {/* BMI placeholder */}
              <div className="bg-[#f8f9ff] rounded-2xl p-5 border border-[#e5eeff]">
                <p className="text-xs text-[#6d7b6c] font-jakarta text-center mb-3">BMI Score</p>
                {/* BMI Hasil Kalkulasi */}
                <div className="flex flex-col items-center mb-6">
                  <span className={`text-4xl font-bold font-lexend ${bmiColorClass}`}>
                    {calculatedBmi}
                  </span>
                  <span className={`text-sm font-semibold font-jakarta mt-1 ${bmiColorClass}`}>
                    {bmiCategory}
                  </span>
                </div>

                {/* Gauge */}
                <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden mb-2">
                  <div className="absolute left-0 top-0 h-full w-[18%] bg-blue-400 rounded-l-full" />
                  <div className="absolute left-[18%] top-0 h-full w-[25%] bg-green-500" />
                  <div className="absolute left-[43%] top-0 h-full w-[17%] bg-yellow-400" />
                  <div className="absolute left-[60%] top-0 h-full w-[40%] bg-red-500 rounded-r-full" />
                  {/* Dot */}
                  <div 
                    className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-[3px rounded-full shadow-md transition-all duration-700 ease-out z-10"
                    style={{ left: `calc(${gaugePosition}% - 8px)` }} 
                  />
                </div>
                <div className="flex justify-between text-[10px] text-[#6d7b6c] font-jakarta">
                  <span>Kurus</span>
                  <span>Normal</span>
                  <span>Berlebihan</span>
                  <span>Obesitas</span>
                </div>
                <p className="text-xs text-center text-[#6d7b6c] font-jakarta mt-3">
                  Skor BMI lengkap tersedia setelah akun dibuat.
                </p>
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setStep("personal")}
                  className="flex items-center justify-center w-11 h-11 border-2 border-[#c1c9bf] text-[#6d7b6c] rounded-xl hover:bg-[#f8f9ff] transition-colors flex-shrink-0">
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <button type="button" onClick={() => setStep("target")}
                  className="flex-1 py-3 bg-[#006e2f] text-white rounded-xl font-semibold font-lexend hover:bg-[#005425] transition-colors flex items-center justify-center gap-2">
                  Set Target
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}

        {/* ── STEP 3: SET TARGET ── */}
        {step === "target" && (
          <>
            <div className="flex items-center justify-between p-6 border-b border-[#e5eeff]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <Target className="w-5 h-5 text-[#006e2f]" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#191c20] font-lexend">Set Target Berat</h2>
                  <p className="text-xs text-[#6d7b6c] font-jakarta">Langkah 3 dari 3</p>
                </div>
              </div>
              <button type="button" onClick={onClose} aria-label="Tutup"
                className="w-9 h-9 rounded-xl bg-[#f8f9ff] flex items-center justify-center hover:bg-[#e5eeff] transition-colors">
                <X className="w-5 h-5 text-[#6d7b6c]" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Progress dots */}
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#006e2f]" />
                <div className="w-2 h-2 rounded-full bg-[#006e2f]" />
                <div className="w-8 h-2 rounded-full bg-[#006e2f]" />
              </div>

              {/* Angka target */}
              <div className="text-center">
                <p className="text-xs text-[#6d7b6c] font-jakarta mb-1">Target Berat</p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-5xl font-bold text-[#006e2f] font-lexend">
                    {targetWeight.toFixed(1)}
                  </span>
                  <span className="text-lg text-[#6d7b6c] font-jakarta">kg</span>
                </div>
              </div>

              {/* Slider */}
              <div className="px-1">
                <input type="range" min="30" max={weightMax} step="0.5"
                  value={targetWeight}
                  onChange={(e) => setTargetWeight(parseFloat(e.target.value))}
                  aria-label="Target berat badan"
                  className="w-full h-2 bg-[#e5eeff] rounded-full appearance-none cursor-pointer accent-[#006e2f]" />
                <div className="flex justify-between text-xs text-[#6d7b6c] mt-1.5 font-jakarta">
                  <span>30 kg</span>
                  <span>{weight} kg</span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-[#f8f9ff] rounded-2xl p-3 text-center border border-[#e5eeff]">
                  <p className="text-[10px] text-[#6d7b6c] font-jakarta mb-1">Saat Ini</p>
                  <p className="text-base font-bold text-[#191c20] font-lexend">{weight} kg</p>
                </div>
                <div className="bg-green-50 rounded-2xl p-3 text-center border-2 border-[#006e2f]">
                  <p className="text-[10px] text-[#006e2f] font-jakarta mb-1">Target</p>
                  <p className="text-base font-bold text-[#006e2f] font-lexend">{targetWeight.toFixed(1)} kg</p>
                </div>
                <div className="bg-[#f8f9ff] rounded-2xl p-3 text-center border border-[#e5eeff]">
                  <p className="text-[10px] text-[#6d7b6c] font-jakarta mb-1">Perlu</p>
                  <p className={`text-base font-bold font-lexend ${
                    isLose ? "text-blue-500" : isGain ? "text-orange-500" : "text-[#191c20]"
                  }`}>{diff} kg</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setStep("bmi")}
                  className="flex items-center justify-center w-11 h-11 border-2 border-[#c1c9bf] text-[#6d7b6c] rounded-xl hover:bg-[#f8f9ff] transition-colors flex-shrink-0">
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <button type="button"
                  onClick={handleConfirm}
                  className="flex-1 py-3 bg-[#006e2f] text-white rounded-xl font-semibold font-lexend hover:bg-[#005425] transition-colors flex items-center justify-center gap-2">
                  <Sparkle className="w-4 h-4" />
                  Generate Tugas dengan AI
                </button>
              </div>
            </div>
          </>
        )}

        {/* ── STEP 4: GENERATING ── */}
        {step === "generating" && (
          <div className="p-8 flex flex-col items-center gap-8">
            <div className="relative w-24 h-24">
              <svg className="absolute inset-0 w-full h-full animate-spin" viewBox="0 0 96 96" fill="none">
                <circle cx="48" cy="48" r="42" stroke="#e5eeff" strokeWidth="8" />
                <circle cx="48" cy="48" r="42" stroke="#006e2f" strokeWidth="8"
                  strokeLinecap="round" strokeDasharray="70 194" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkle className="w-7 h-7 text-[#005823]" />
              </div>
            </div>
            <div className="text-center w-full">
              <h2 className="text-xl font-bold text-[#191c20] font-lexend mb-5">
                AI sedang menyusun rencanamu
              </h2>
              <div className="space-y-3" aria-live="polite">
                {AI_TYPING_LINES.slice(0, typingIndex + 1).map((line, i) => (
                  <div key={i} className={`flex items-center justify-center gap-2 transition-opacity duration-300 ${
                    i < typingIndex ? "opacity-40" : "opacity-100"
                  }`}>
                    <CheckCircle2 className={`w-4 h-4 flex-shrink-0 ${
                      i < typingIndex ? "text-[#006e2f]" : "text-[#c1c9bf] animate-pulse"
                    }`} />
                    <span className={`text-sm font-lexend ${
                      i < typingIndex ? "text-[#6d7b6c]" : "text-[#191c20]"
                    }`}>{line}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 5: PREVIEW ── */}
        {step === "preview" && (
          <>
            <div className="flex items-center justify-between p-6 border-b border-[#e5eeff]">
              <div>
                <h2 className="text-lg font-bold text-[#191c20] font-lexend">Rencanamu sudah siap!</h2>
                <p className="text-xs text-[#6d7b6c] font-jakarta mt-0.5">
                  Target: <span className="font-semibold text-[#006e2f]">{targetWeight.toFixed(1)} kg</span>
                  {" · "}
                  <span className="font-semibold text-blue-500">{diff} kg</span> lagi
                </p>
              </div>
              <button type="button" onClick={onClose} aria-label="Tutup"
                className="w-9 h-9 rounded-xl bg-[#f8f9ff] flex items-center justify-center hover:bg-[#e5eeff] transition-colors">
                <X className="w-5 h-5 text-[#6d7b6c]" />
              </button>
            </div>

            {/* Daftar tugas */}
            <div className="px-6 pt-5 pb-2">
              <p className="text-xs font-semibold text-[#6d7b6c] font-jakarta mb-2 uppercase tracking-wide">
                Tugas Minggu Ini
              </p>
              <div className="bg-[#f8f9ff] rounded-2xl border border-[#e5eeff] overflow-hidden">
                {realTasks.map((task, i) => {
                  const Icon = task.Icon || Sparkle;
                  const iconColor = task.iconColor || "text-[#006e2f]";
                  return (
                  <div key={task.id} className={`flex items-center gap-3 px-4 py-3 ${
                    i < realTasks.length - 1 ? "border-b border-[#e5eeff]" : ""
                  }`}>
                    <Icon className={`w-4 h-4 flex-shrink-0 ${iconColor}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#191c20] font-jakarta truncate">{task.title}</p>
                      <p className="text-xs text-[#6d7b6c] font-jakarta">{task.category}</p>
                    </div>
                    <div className="flex items-center gap-1 bg-yellow-50 px-2 py-0.5 rounded-full flex-shrink-0">
                      <Star className="w-3 h-3 text-yellow-500" />
                      <span className="text-xs font-semibold text-yellow-700 font-lexend">+{task.pointsReward || task.points || 0}</span>
                    </div>
                  </div>
                  );
                })}
              </div>
            </div>

            <p className="text-xs text-center text-[#6d7b6c] font-jakarta px-6 py-3">
              Tugas diperbarui AI setiap minggu sesuai progresmu!
            </p>

            <div className="flex gap-3 px-6 pb-6">
              <button type="button" onClick={() => setStep("target")}
                className="flex-1 py-3 border-2 border-[#c1c9bf] text-[#6d7b6c] rounded-xl font-semibold font-jakarta hover:bg-[#f8f9ff] transition-colors">
                Ubah Target
              </button>
              <button type="button" onClick={onClose}
                className="flex-1 py-3 bg-[#006e2f] text-white rounded-xl font-semibold font-jakarta hover:bg-[#005425] transition-colors flex items-center justify-center gap-2">
                Mulai Sekarang
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
