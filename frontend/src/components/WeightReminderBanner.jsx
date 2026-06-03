import { Scale, ChevronRight, X } from "lucide-react";

/**
 * Banner pengingat input berat badan harian.
 *
 * Props:
 *  - show      {boolean}  tampilkan banner
 *  - onCatat   {fn}       buka modal input
 *  - onDismiss {fn}       tutup/sembunyikan banner
 */
export default function WeightReminderBanner({ show, onCatat, onDismiss }) {
  if (!show) return null;

  return (
    <div
      role="alert"
      className="relative flex items-center gap-4 mb-8 px-5 py-4 rounded-2xl bg-[#006e2f]  shadow-[0_8px_24px_rgba(0,110,47,0.25)] overflow-hidden"
    >
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-white font-lexend leading-tight">
          Jangan lupa catat berat badan hari ini!
        </p>
        <p className="text-sm text-white/80 font-jakarta mt-0.5">
          Pencatatan rutin membantu kamu memantau progres dengan akurat.
        </p>
      </div>

      <button
        type="button"
        onClick={onCatat}
        className="flex items-center gap-1.5 px-4 py-2 bg-white text-[#006e2f] text-sm font-semibold rounded-xl hover:bg-green-50 transition-colors font-jakarta whitespace-nowrap flex-shrink-0"
      >
        Catat Sekarang
        <ChevronRight className="w-4 h-4" />
      </button>

      <button
        type="button"
        onClick={onDismiss}
        aria-label="Tutup pengingat"
        className="w-7 h-7 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center flex-shrink-0 transition-colors"
      >
        <X className="w-4 h-4 text-white" />
      </button>
    </div>
  );
}
