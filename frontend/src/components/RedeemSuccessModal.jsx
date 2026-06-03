import { Gift, CheckCircle2, PartyPopper, Copy, Check, X } from "lucide-react";

/**
 * Modal yang muncul setelah penukaran voucher berhasil.
 *
 * Props:
 * - voucher      : objek voucher yang ditukarkan (title, image, category, points, code)
 * - remainingPts : sisa poin user setelah penukaran
 * - onClose      : fungsi untuk menutup modal
 * - codeCopied   : boolean apakah kode sudah disalin
 * - onCopy       : fungsi untuk menyalin kode voucher
 */
export default function RedeemSuccessModal({
  voucher,
  remainingPts,
  onClose,
  codeCopied,
  onCopy,
}) {
  if (!voucher) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden">

        {/* ── Header hijau ── */}
        <div className="bg-[#006e2f] px-6 pt-10 pb-8 flex flex-col items-center text-center relative">
          <button
            onClick={onClose}
            aria-label="Tutup modal"
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>

          {/* Ikon centang */}
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4 shadow-lg">
            <CheckCircle2 className="w-12 h-12 text-[#006e2f]" />
          </div>

          <div className="flex items-center gap-2 mb-2">
            <PartyPopper className="w-5 h-5 text-yellow-300" />
            <h3 className="text-2xl font-bold text-white font-lexend">
              Penukaran Berhasil!
            </h3>
            <PartyPopper className="w-5 h-5 text-yellow-300 scale-x-[-1]" />
          </div>
          <p className="text-white/80 font-jakarta text-sm">
            Selamat! Voucher kamu sudah siap digunakan.
          </p>
        </div>

        {/* ── Body ── */}
        <div className="p-6">

          {/* Info voucher */}
          <div className="flex items-center gap-4 mb-5">
            <div className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0">
              <img
                src={voucher.image}
                alt={voucher.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="font-semibold text-[#191c20] font-lexend">
                {voucher.title}
              </p>
              <div className="flex items-center gap-1 mt-1">
                <Gift className="w-3.5 h-3.5 text-[#006e2f]" />
                <span className="text-xs text-[#6d7b6c] font-jakarta">
                  {voucher.category}
                </span>
              </div>
            </div>
          </div>

          {/* Ringkasan poin */}
          <div className="bg-[#f0faf4] rounded-2xl p-4 mb-5 flex justify-between items-center">
            <div>
              <p className="text-xs text-[#6d7b6c] font-jakarta">Poin digunakan</p>
              <p className="text-lg font-bold text-red-500 font-lexend">
                -{voucher.points.toLocaleString()} Pts
              </p>
            </div>
            <div className="w-px h-10 bg-[#e5eeff]" />
            <div className="text-right">
              <p className="text-xs text-[#6d7b6c] font-jakarta">Sisa poin kamu</p>
              <p className="text-lg font-bold text-[#006e2f] font-lexend">
                {remainingPts.toLocaleString()} Pts
              </p>
            </div>
          </div>

          {/* Kode voucher */}
          <div className="mb-6">
            <p className="text-xs text-[#6d7b6c] font-jakarta mb-2 uppercase tracking-wide font-semibold">
              Kode Voucher
            </p>
            <div className="flex items-center gap-2 bg-[#f8f9ff] border-2 border-dashed border-[#006e2f]/30 rounded-xl p-3">
              <span className="flex-1 text-center text-lg font-bold text-[#191c20] font-lexend tracking-widest">
                {voucher.code}
              </span>
              <button
                onClick={onCopy}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold font-jakarta transition-all ${
                  codeCopied
                    ? "bg-green-100 text-green-700"
                    : "bg-[#006e2f] text-white hover:bg-[#005823]"
                }`}
              >
                {codeCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    Tersalin
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Salin
                  </>
                )}
              </button>
            </div>
            <p className="text-xs text-[#6d7b6c] font-jakarta mt-2 text-center">
              Tunjukkan kode ini kepada merchant untuk menggunakan voucher.
            </p>
          </div>

          {/* Tombol kembali */}
          <button
            onClick={onClose}
            className="w-full py-3.5 bg-[#006e2f] text-white rounded-xl font-semibold font-jakarta hover:bg-[#005823] transition-colors"
          >
            Kembali ke Pusat Hadiah
          </button>
        </div>
      </div>
    </div>
  );
}
