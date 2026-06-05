import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { authApi } from "../lib/api";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    if (!email.trim()) return "Email tidak boleh kosong.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return "Format email tidak valid.";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    setError("");
    setIsLoading(true);

    try {
      const normalizedEmail = email.trim();
      await authApi.forgotPassword(normalizedEmail);
      sessionStorage.setItem("reset_email", normalizedEmail);
      sessionStorage.removeItem("reset_otp");
      navigate("/reset-password/otp");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex bg-[var(--color-bg)] overflow-hidden">
      <div className="w-full lg:w-1/2 flex flex-col px-6 lg:px-16 overflow-y-auto">
        {/* Back */}
        <button
          onClick={() => navigate("/login")}
          className="flex items-center gap-2 text-[#6d7b6c] hover:text-[#005823] transition-colors pt-8 pb-2 w-fit"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-jakarta text-sm">Kembali ke Login</span>
        </button>

        <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
          <h2 className="text-3xl font-bold text-[#005823] font-lexend mb-2">
            Lupa Password?
          </h2>
          <p className="text-[#6d7b6c] font-jakarta mb-8">
            Masukkan email yang terdaftar. Kami akan mengirimkan kode verifikasi untuk mereset password kamu.
          </p>

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div>
              <label
                htmlFor="forgot-email"
                className="block text-sm font-semibold text-[#191c20] mb-2 font-lexend"
              >
                Alamat Email
              </label>
              <input
                id="forgot-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                className={`w-full px-4 py-3 rounded-xl border ${
                  error
                    ? "border-red-400 focus:ring-red-300"
                    : "border-[#c1c9bf] focus:ring-[#006e2f]"
                } bg-white focus:outline-none focus:ring-2 focus:border-transparent font-jakarta`}
              />
              {error && (
                <p className="mt-1.5 text-xs text-red-500 font-jakarta">{error}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#006e2f] text-white font-semibold py-4 rounded-xl hover:bg-[#005823] transition-colors font-lexend flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Mengirim...
                </>
              ) : (
                <>
                  Kirim Kode OTP
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
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
