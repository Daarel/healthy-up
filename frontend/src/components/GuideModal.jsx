import { useState } from "react";
import { X, Camera, Clapperboard, Lightbulb } from "lucide-react";

const GUIDE_PAGES = [
  {
    title: "Panduan Foto",
    icon: Camera,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-500",
    tips: [
      "Pastikan pencahayaan cukup terang, hindari backlight",
      "Foto dari sudut yang jelas dan tidak blur",
      "Objek utama berada di tengah frame",
      "Resolusi minimal 720p agar detail terlihat",
    ],
  },
  {
    title: "Panduan Video",
    icon: Clapperboard,
    iconBg: "bg-purple-50",
    iconColor: "text-purple-500",
    tips: [
      "Durasi minimal 10 detik, maksimal 60 detik",
      "Rekam dengan posisi landscape (horizontal)",
      "Pastikan suara dan gerakan terlihat jelas",
    ],
  },
  {
    title: "Tips Tambahan",
    icon: Lightbulb,
    iconBg: "bg-yellow-50",
    iconColor: "text-yellow-500",
    tips: [
      "Bisa upload lebih dari 1 foto/video untuk bukti yang lebih kuat",
      "Tambahkan catatan untuk menjelaskan konteks",
    ],
  },
];

export default function GuideModal({ onClose }) {
  const [currentPage, setCurrentPage] = useState(0);

  const page = GUIDE_PAGES[currentPage];
  const Icon = page.icon;
  const isFirst = currentPage === 0;
  const isLast = currentPage === GUIDE_PAGES.length - 1;

  const handleClose = () => {
    setCurrentPage(0);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-xl">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#e5eeff]">
          <div>
            <h3 className="text-xl font-bold text-[#191c20] font-lexend">
              Panduan Upload Bukti
            </h3>
            <p className="text-sm text-[#6d7b6c] font-jakarta">
              Tips agar bukti diterima
            </p>
          </div>
          <button
            onClick={handleClose}
            className="w-10 h-10 rounded-xl bg-[#f8f9ff] flex items-center justify-center hover:bg-[#e5eeff] transition-colors"
          >
            <X className="w-5 h-5 text-[#6d7b6c]" />
          </button>
        </div>

        {/* Dot Indicator */}
        <div className="flex items-center justify-center gap-2 pt-5 px-6">
          {GUIDE_PAGES.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === currentPage ? "w-8 bg-[#006e2f]" : "w-2 bg-[#e5eeff]"
              }`}
              aria-label={`Halaman ${i + 1}`}
            />
          ))}
        </div>

        {/* Body */}
        <div className="p-6 min-h-[260px] flex flex-col justify-between">
          <div>
            {/* Topic Header */}
            <div className="flex items-center gap-4 mb-6">
              <div className={`w-14 h-14 rounded-2xl ${page.iconBg} flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-7 h-7 ${page.iconColor}`} />
              </div>
              <h4 className="text-2xl font-bold text-[#191c20] font-lexend">
                {page.title}
              </h4>
            </div>

            {/* Tips */}
            <ul className="space-y-4">
              {page.tips.map((tip, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-0.5 w-6 h-6 rounded-full bg-[#e6f4ec] text-[#006e2f] flex items-center justify-center text-sm font-bold font-lexend flex-shrink-0">
                    {i + 1}
                  </span>
                  <span className="text-base text-[#3d4a3c] font-jakarta leading-relaxed">
                    {tip}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Navigation */}
          <div className="flex gap-3 mt-8">
            {!isFirst && (
              <button
                onClick={() => setCurrentPage((p) => p - 1)}
                className="flex-1 py-3 border-2 border-[#e5eeff] text-[#6d7b6c] rounded-xl font-semibold hover:bg-[#f8f9ff] transition-colors font-lexend"
              >
                ← Sebelumnya
              </button>
            )}
            <button
              onClick={() => {
                if (isLast) handleClose();
                else setCurrentPage((p) => p + 1);
              }}
              className="flex-1 py-3 bg-[#006e2f] text-white rounded-xl font-semibold hover:bg-[#005823] transition-colors font-lexend"
            >
              {isLast ? "Oke" : "Selanjutnya →"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
