import { useNavigate } from "react-router-dom";
import { TrendingDown, TrendingUp, ArrowRight } from "lucide-react";

/**
 * Kartu ringkasan berat badan untuk Dashboard.
 *
 * Props:
 *  - currentWeight    {number}
 *  - weightDiff       {number}  selisih vs sebelumnya (negatif = turun)
 *  - targetWeight     {number}
 *  - isLoggedThisWeek {boolean}
 */
export default function WeightCard({
  currentWeight,
  weightDiff,
  targetWeight,
  isLoggedThisWeek,
}) {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgba(34,197,94,0.08)] border border-[#e5eeff]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-[#191c20] font-lexend">Berat Badan</h3>
        <button
          type="button"
          onClick={() => navigate("/profil")}
          aria-label="Lihat detail berat badan"
          className="flex items-center gap-1 text-xs text-[#006e2f] font-semibold font-jakarta hover:underline"
        >
          Lihat Detail
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="mb-4">
        <span className="text-4xl font-bold text-[#191c20] font-lexend">
          {currentWeight.toFixed(1)}
        </span>
        <span className="text-[#6d7b6c] ml-1 font-jakarta">kg</span>
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-sm">
          {weightDiff <= 0 ? (
            <span className="flex items-center gap-1 text-green-600 font-medium">
              <TrendingDown className="w-5 h-5" />
              {weightDiff.toFixed(1)} kg
            </span>
          ) : (
            <span className="flex items-center gap-1 text-red-600 font-medium">
              <TrendingUp className="w-5 h-5" />
              +{weightDiff.toFixed(1)} kg
            </span>
          )}
          <span className="text-[#6d7b6c] text-sm font-jakarta">vs sebelumnya</span>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm text-[#6d7b6c] font-jakarta">
            Target: {targetWeight} kg
          </p>
          {isLoggedThisWeek && (
            <span className="text-[10px] font-semibold text-[#006e2f] bg-[#e5eeff] px-2 py-0.5 rounded-full font-jakarta">
              Sudah dicatat minggu ini
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
