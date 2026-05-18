import { Scale, TrendingDown, TrendingUp, Plus, Lock } from "lucide-react";

/**
 * Kartu ringkasan berat badan untuk Dashboard.
 *
 * Props:
 *  - currentWeight  {number}
 *  - weightDiff     {number}   selisih vs sebelumnya (negatif = turun)
 *  - weightProgress {number}   0–100, persentase menuju target
 *  - targetWeight   {number}
 *  - isLoggedToday  {boolean}  kunci tombol input jika sudah dicatat hari ini
 *  - onAddClick     {fn}       buka modal input
 */
export default function WeightCard({
  currentWeight,
  weightDiff,
  weightProgress,
  targetWeight,
  isLoggedToday,
  onAddClick,
}) {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgba(34,197,94,0.08)] border border-[#e5eeff]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-[#191c20] font-lexend">Berat Badan</h3>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onAddClick}
            disabled={isLoggedToday}
            aria-label={
              isLoggedToday
                ? "Berat badan hari ini sudah dicatat"
                : "Tambah berat badan"
            }
            title={
              isLoggedToday
                ? "Berat badan hari ini sudah dicatat. Coba lagi besok."
                : "Catat berat badan hari ini"
            }
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
              isLoggedToday
                ? "bg-[#f1f5f9] text-[#94a3b8] cursor-not-allowed"
                : "text-[#006e2f] hover:bg-[#006e2f] hover:text-white"
            }`}
          >
            {isLoggedToday ? (
              <Lock className="w-4 h-4" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
          </button>
         
        </div>
      </div>

      <div className="mb-4">
        <span className="text-4xl font-bold text-[#191c20] font-lexend">
          {currentWeight.toFixed(1)}
        </span>
        <span className="text-[#6d7b6c] ml-1 font-jakarta">kg</span>
      </div>

      <div className="flex items-center gap-2 text-sm">
        {weightDiff <= 0 ? (
          <span className="flex items-center gap-1 text-green-600 font-medium">
            <TrendingDown className="w-4 h-4" />
            {weightDiff.toFixed(1)} kg
          </span>
        ) : (
          <span className="flex items-center gap-1 text-red-600 font-medium">
            <TrendingUp className="w-4 h-4" />
            +{weightDiff.toFixed(1)} kg
          </span>
        )}
        <span className="text-[#6d7b6c] font-jakarta">vs sebelumnya</span>
      </div>

      <div className="mt-4 h-2 bg-[#e5eeff] rounded-full overflow-hidden">
        <div
          className="h-full bg-[#006e2f]  rounded-full transition-all"
          style={{ width: `${weightProgress}%` }}
        />
      </div>

      <div className="flex items-center justify-between mt-2">
        <p className="text-xs text-[#6d7b6c] font-jakarta">
          Target: {targetWeight} kg
        </p>
        {isLoggedToday && (
          <span className="text-[10px] font-semibold text-[#006e2f] bg-[#e5eeff] px-2 py-0.5 rounded-full font-jakarta">
            Sudah dicatat hari ini
          </span>
        )}
      </div>
    </div>
  );
}
