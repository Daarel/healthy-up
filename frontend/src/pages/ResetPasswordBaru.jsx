import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, KeyRound, CheckCircle2, Loader2 } from "lucide-react";
import Logo from "../components/ui/logo";
import { authApi } from "../lib/api";

const RULES = [
  { id: "length",  label: "Minimal 8 karakter",          test: (v) => v.length >= 8 },
  { id: "upper",   label: "Mengandung huruf kapital",     test: (v) => /[A-Z]/.test(v) },
  { id: "number",  label: "Mengandung angka",             test: (v) => /\d/.test(v) },
];

export default function ResetPasswordBaru() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const passedRules = RULES.filter((r) => r.test(password));
  const strength = passedRules.length; // 0–3

  const strengthLabel = ["", "Lemah", "Cukup", "Kuat"][strength];
  const strengthColor = ["", "bg-red-400", "bg-yellow-400", "bg-[#006e2f]"][strength];

  const validate = () => {
    const errs = {};
    if (!password) {
      errs.password = "Password tidak boleh kosong.";
    } else if (strength < RULES.length) {
      errs.password = "Password belum memenuhi semua syarat.";
    }
    if (!confirm) {
      errs.confirm = "Konfirmasi password tidak boleh kosong.";
    } else if (password !== confirm) {
      errs.confirm = "Password tidak cocok.";
    }
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});
    setServerError("");

    const email = sessionStorage.getItem("reset_email")?.trim();
    const otp = sessionStorage.getItem("reset_otp")?.trim();
    if (!email || !otp) {
      setServerError("Sesi reset password tidak valid. Silakan minta kode OTP ulang.");
      return;
    }

    setIsLoading(true);
    try {
      await authApi.resetPassword(email, otp, password, confirm);
      sessionStorage.removeItem("reset_email");
      sessionStorage.removeItem("reset_otp");
      setSuccess(true);
    } catch (err) {
      setServerError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="h-screen flex items-center justify-center bg-[var(--color-bg)] p-6">
        <div className="bg-white rounded-3xl p-10 max-w-sm w-full text-center shadow-[0_8px_30px_rgba(34,197,94,0.08)] border border-[#e5eeff]">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-[#006e2f]" />
          </div>
          <h2 className="text-2xl font-bold text-[#191c20] font-lexend mb-2">
            Password Berhasil Diubah!
          </h2>
          <p className="text-[#6d7b6c] font-jakarta mb-8">
            Password kamu sudah diperbarui. Silakan masuk dengan password baru.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="w-full bg-[#006e2f] text-white font-semibold py-4 rounded-xl hover:bg-[#005823] transition-colors font-lexend"
          >
            Masuk Sekarang
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-[var(--color-bg)] overflow-hidden">
      <div className="w-full lg:w-1/2 flex flex-col px-6 lg:px-16 overflow-y-auto">
        <div className="pt-8 pb-2 max-w-md mx-auto w-full">
          <Logo />
        </div>

        <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
          {/* Icon */}
          <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-6">
            <KeyRound className="w-8 h-8 text-[#006e2f]" />
          </div>

          <h2 className="text-3xl font-bold text-[#191c20] font-lexend mb-2">
            Buat Password Baru
          </h2>
          <p className="text-[#6d7b6c] font-jakarta mb-8">
            Password baru harus berbeda dari password sebelumnya.
          </p>

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {serverError && (
              <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600 font-jakarta">
                {serverError}
              </div>
            )}

            {/* Password Baru */}
            <div>
              <label
                htmlFor="new-password"
                className="block text-sm font-semibold text-[#191c20] mb-2 font-lexend"
              >
                Password Baru
              </label>
              <div className="relative">
                <input
                  id="new-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Buat password baru"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrors((prev) => ({ ...prev, password: undefined }));
                  }}
                  className={`w-full px-4 py-3 pr-12 rounded-xl border ${
                    errors.password
                      ? "border-red-400 focus:ring-red-300"
                      : "border-[#c1c9bf] focus:ring-[#006e2f]"
                  } bg-white focus:outline-none focus:ring-2 focus:border-transparent font-jakarta`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6d7b6c] hover:text-[#191c20] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-red-500 font-jakarta">{errors.password}</p>
              )}

              {/* Strength bar */}
              {password && (
                <div className="mt-3">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3].map((level) => (
                      <div
                        key={level}
                        className={`h-1.5 flex-1 rounded-full transition-colors ${
                          strength >= level ? strengthColor : "bg-[#e5eeff]"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-[#6d7b6c] font-jakarta">
                    Kekuatan:{" "}
                    <span
                      className={`font-semibold ${
                        strength === 1
                          ? "text-red-500"
                          : strength === 2
                          ? "text-yellow-600"
                          : "text-[#006e2f]"
                      }`}
                    >
                      {strengthLabel}
                    </span>
                  </p>
                </div>
              )}

              {/* Rules checklist */}
              <ul className="mt-3 space-y-1">
                {RULES.map((rule) => (
                  <li
                    key={rule.id}
                    className={`flex items-center gap-2 text-xs font-jakarta transition-colors ${
                      rule.test(password) ? "text-[#006e2f]" : "text-[#6d7b6c]"
                    }`}
                  >
                    <CheckCircle2
                      className={`w-3.5 h-3.5 flex-shrink-0 ${
                        rule.test(password) ? "text-[#006e2f]" : "text-[#c1c9bf]"
                      }`}
                    />
                    {rule.label}
                  </li>
                ))}
              </ul>
            </div>

            {/* Konfirmasi Password */}
            <div>
              <label
                htmlFor="confirm-password"
                className="block text-sm font-semibold text-[#191c20] mb-2 font-lexend"
              >
                Konfirmasi Password
              </label>
              <div className="relative">
                <input
                  id="confirm-password"
                  type={showConfirm ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Ulangi password baru"
                  value={confirm}
                  onChange={(e) => {
                    setConfirm(e.target.value);
                    setErrors((prev) => ({ ...prev, confirm: undefined }));
                  }}
                  className={`w-full px-4 py-3 pr-12 rounded-xl border ${
                    errors.confirm
                      ? "border-red-400 focus:ring-red-300"
                      : confirm && confirm === password
                      ? "border-[#006e2f]"
                      : "border-[#c1c9bf] focus:ring-[#006e2f]"
                  } bg-white focus:outline-none focus:ring-2 focus:border-transparent font-jakarta`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  aria-label={showConfirm ? "Sembunyikan konfirmasi" : "Tampilkan konfirmasi"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6d7b6c] hover:text-[#191c20] transition-colors"
                >
                  {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.confirm && (
                <p className="mt-1.5 text-xs text-red-500 font-jakarta">{errors.confirm}</p>
              )}
              {confirm && confirm === password && !errors.confirm && (
                <p className="mt-1.5 text-xs text-[#006e2f] font-jakarta flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Password cocok
                </p>
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
                  Menyimpan...
                </>
              ) : (
                "Simpan Password Baru"
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
