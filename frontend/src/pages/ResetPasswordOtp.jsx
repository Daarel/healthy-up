import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { maskEmail } from "../lib/utils";
import { authApi } from "../lib/api";

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60; // detik

export default function ResetPasswordOtp() {
  const navigate = useNavigate();
  const email = sessionStorage.getItem("reset_email") || "email kamu";

  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN);
  const [isResending, setIsResending] = useState(false);
  const inputRefs = useRef([]);

  // Hitung mundur resend
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const handleChange = (index, value) => {
    // Hanya terima satu digit angka
    if (!/^\d?$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    setError("");
    // Auto-focus ke kotak berikutnya
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    const next = [...otp];
    pasted.split("").forEach((char, i) => { next[i] = char; });
    setOtp(next);
    inputRefs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length < OTP_LENGTH) {
      setError("Masukkan 6 digit kode OTP.");
      return;
    }
    sessionStorage.setItem("reset_otp", code);
    navigate("/reset-password/baru");
  };

  const handleResend = async () => {
    if (cooldown > 0 || isResending) return;

    setIsResending(true);
    setError("");

    try {
      await authApi.resendOtp(email);
      setCooldown(RESEND_COOLDOWN);
      setOtp(Array(OTP_LENGTH).fill(""));
      sessionStorage.removeItem("reset_otp");
      inputRefs.current[0]?.focus();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="h-screen flex bg-[var(--color-bg)] overflow-hidden">
      <div className="w-full lg:w-1/2 flex flex-col px-6 lg:px-16 overflow-y-auto">
        {/* Back */}
        <button
          onClick={() => navigate("/lupa-password")}
          className="flex items-center gap-2 text-[#6d7b6c] hover:text-[#191c20] transition-colors pt-8 pb-2 w-fit"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-jakarta text-sm">Kembali</span>
        </button>

        <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
          {/* Icon */}
         

          <h2 className="text-3xl text-left mb-10 font-bold text-[#005823] font-lexend mb-2">
            Verifikasi OTP
          </h2>
          <p className="text-[#6d7b6c] font-jakarta mb-2">
            Kode OTP telah dikirim ke
          </p>
          <p className="font-semibold text-[#191c20] font-jakarta mb-8">{maskEmail(email, 3)}</p>

          <form onSubmit={handleSubmit} noValidate>
            {/* OTP Boxes */}
            <div
              className="flex gap-3 justify-between mb-4"
              onPaste={handlePaste}
              aria-label="Kode OTP"
            >
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { inputRefs.current[i] = el; }}
                  id={`otp-${i}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  aria-label={`Digit ${i + 1}`}
                  className={`w-12 h-14 text-center text-xl font-bold rounded-xl border-2 ${
                    error
                      ? "border-red-400 focus:ring-red-300"
                      : digit
                      ? "border-[#006e2f] bg-green-50"
                      : "border-[#c1c9bf] focus:ring-[#006e2f]"
                  } bg-white focus:outline-none focus:ring-2 focus:border-transparent font-lexend transition-colors`}
                />
              ))}
            </div>

            {error && (
              <p className="mb-4 text-xs text-red-500 font-jakarta">{error}</p>
            )}

            <button
              type="submit"
              className="w-full bg-[#006e2f] text-white font-semibold py-4 rounded-xl hover:bg-[#005823] transition-colors font-lexend mb-5"
            >
              Verifikasi
            </button>
          </form>

          {/* Resend */}
          <p className="text-center text-sm text-[#6d7b6c] font-jakarta">
            Tidak menerima kode?{" "}
            {cooldown > 0 ? (
              <span className="text-[#c1c9bf]">
                Kirim ulang dalam{" "}
                <span className="font-semibold text-[#191c20]">{cooldown}s</span>
              </span>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                disabled={isResending}
                className="text-[#006e2f] font-semibold hover:underline disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isResending ? "Mengirim..." : "Kirim ulang"}
              </button>
            )}
          </p>
        </div>

        <div className="h-8" />
      </div>

      {/* Right Side */}
      <div className="hidden lg:block lg:w-1/2 bg-[#e5eeff] p-6">
        <div className="h-full rounded-[32px] overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1200&h=1600&fit=crop"
            alt="Fitness"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
}
