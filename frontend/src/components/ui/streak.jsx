import { Flame } from "lucide-react";

/**
 * Komponen streak harian.
 *
 * Props:
 *  - count     {number}   jumlah hari streak
 *  - variant   {"badge"|"compact"}
 *              "badge"   — kotak oranye dengan ikon, label "Streak" + "{count} Hari"  (default, untuk Dashboard)
 *              "compact" — hanya angka + "Hari Streak" tanpa ikon (untuk Hadiah / card kecil)
 *  - className {string}   class tambahan pada wrapper
 */
export default function Streak({ count, variant = "badge", className = "" }) {
  if (variant === "compact") {
    return (
      <div className={`flex items-center gap-1 py-2 ${className}`}>
        <p className="text-lg font-bold text-orange-600 font-lexend">{count}</p>
        <p className="text-xs text-orange-500 font-jakarta">Hari Streak</p>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 bg-orange-50 px-3 py-2 rounded-xl whitespace-nowrap ${className}`}>
      <Flame className="w-5 h-5 text-orange-500" />
      <div className="whitespace-nowrap">
        <p className="text-sm font-bold text-orange-600 font-lexend leading-none">Streak</p>
        <p className="text-xs text-orange-500 font-jakarta">{count} Hari</p>
      </div>
    </div>
  );
}
