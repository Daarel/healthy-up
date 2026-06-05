import { useState } from "react";
import { Scale, X } from "lucide-react";

/**
 * Modal input berat badan yang dapat digunakan di Dashboard maupun Profil.
 *
 * Props:
 *  - isOpen          {boolean}  tampilkan modal
 *  - onClose         {fn}       dipanggil saat modal ditutup
 *  - onSuccess       {fn(value, note)}  dipanggil setelah simpan berhasil
 *  - currentWeight   {number}   berat terakhir (untuk placeholder & perbandingan)
 *  - targetWeight    {number|null}  target berat (opsional, tampil di info box)
 *  - allowNote       {boolean}  tampilkan field catatan (default false)
 *  - allowMultiplePerDay {boolean}  izinkan input lebih dari sekali sehari (default false)
 */
export default function WeightInputModal({
  isOpen,
  onClose,
  onSuccess,
  currentWeight,
  targetWeight = null,
  allowNote = false,
  allowMultiplePerDay = false,
}) {
  const [weightInput, setWeightInput] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleClose = () => {
    setWeightInput("");
    setNote("");
    setError("");
    onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const value = parseFloat(weightInput);
    if (Number.isNaN(value) || weightInput === "") {
      setError("Masukkan angka berat badan yang valid.");
      return;
    }
    if (value < 20 || value > 300) {
      setError("Berat badan harus antara 20 – 300 kg.");
      return;
    }
    onSuccess(+value.toFixed(1), note.trim());
    setWeightInput("");
    setNote("");
    setError("");
  };

  const parsedInput = parseFloat(weightInput);
  const diff = !Number.isNaN(parsedInput) && weightInput !== ""
    ? +(parsedInput - currentWeight).toFixed(1)
    : null;

  const todayLabel = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="weight-modal-title"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-3xl w-full max-w-sm shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#e5eeff]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <Scale className="w-5 h-5 text-[#006e2f]" />
            </div>
            <div>
              <h2
                id="weight-modal-title"
                className="text-lg font-bold text-[#191c20] font-lexend"
              >
                Catat Berat Badan
              </h2>
              <p className="text-xs text-[#6d7b6c] font-jakarta">{todayLabel}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Tutup"
            className="w-9 h-9 rounded-xl bg-[#f8f9ff] flex items-center justify-center hover:bg-[#e5eeff] transition-colors"
          >
            <X className="w-5 h-5 text-[#6d7b6c]" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} noValidate>
          <div className="p-6 space-y-4">
            {!allowMultiplePerDay && (
              <p className="text-sm text-[#6d7b6c] font-jakarta">
                Berat badan hanya bisa dicatat sekali per minggu. Pastikan angka yang kamu masukkan sudah benar.
              </p>
            )}

            {/* Input berat */}
            <div>
              <label
                htmlFor="weight-input"
                className="block text-sm font-semibold text-[#191c20] mb-2 font-lexend"
              >
                Berat Badan (kg)
              </label>
              <div className="relative">
                <input
                  id="weight-input"
                  type="number"
                  step="0.1"
                  inputMode="decimal"
                  value={weightInput}
                  onChange={(e) => {
                    setWeightInput(e.target.value);
                    setError("");
                  }}
                  placeholder={`Terakhir: ${currentWeight} kg`}
                  autoFocus
                  data-testid="input-berat"
                  className={`w-full px-4 py-3 pr-14 rounded-xl border ${
                    error
                      ? "border-red-400 focus:ring-red-300"
                      : "border-[#c1c9bf] focus:ring-[#006e2f]"
                  } bg-white focus:outline-none focus:ring-2 focus:border-transparent font-jakarta text-[#191c20] text-lg`}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6d7b6c] font-jakarta text-sm">
                  kg
                </span>
              </div>
              {error && (
                <p className="text-xs text-red-500 mt-1.5 font-jakarta">{error}</p>
              )}
            </div>

            {/* Live diff */}
            {diff !== null && (
              <div className="bg-[#f8f9ff] rounded-xl p-3 flex justify-between text-sm font-jakarta">
                <span className="text-[#6d7b6c]">Perubahan dari sebelumnya:</span>
                <span
                  className={`font-semibold ${
                    diff < 0
                      ? "text-green-600"
                      : diff > 0
                      ? "text-orange-500"
                      : "text-[#6d7b6c]"
                  }`}
                >
                  {diff > 0 ? "+" : ""}
                  {diff} kg
                </span>
              </div>
            )}

            {/* Info box: prev + target */}
            {targetWeight !== null && diff === null && (
              <div className="p-3 bg-[#f8f9ff] rounded-xl text-xs text-[#6d7b6c] font-jakarta">
                Berat sebelumnya:{" "}
                <span className="font-semibold text-[#191c20]">{currentWeight} kg</span>
                <span className="mx-2">•</span>
                Target:{" "}
                <span className="font-semibold text-[#191c20]">{targetWeight} kg</span>
              </div>
            )}

            {/* Catatan opsional */}
            {/* {allowNote && (
              <div>
                <label
                  htmlFor="weight-note"
                  className="block text-sm font-semibold text-[#191c20] mb-2 font-lexend"
                >
                  Catatan{" "}
                  <span className="font-normal text-[#6d7b6c]">(opsional)</span>
                </label>
                <textarea
                  id="weight-note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Contoh: setelah olahraga, sebelum makan..."
                  rows={2}
                  data-testid="input-catatan"
                  className="w-full px-4 py-3 rounded-xl border border-[#c1c9bf] bg-white focus:outline-none focus:ring-2 focus:ring-[#006e2f] focus:border-transparent font-jakarta resize-none text-sm text-[#191c20]"
                />
              </div>
            )} */}

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 py-3 border-2 border-[#c1c9bf] text-[#6d7b6c] rounded-xl font-semibold font-jakarta hover:bg-[#f8f9ff] transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                data-testid="btn-simpan-berat"
                className="flex-1 py-3 bg-[#006e2f] text-white rounded-xl font-semibold font-jakarta hover:bg-[#005425] transition-colors"
              >
                Simpan
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
