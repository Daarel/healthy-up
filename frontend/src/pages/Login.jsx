import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";
import Logo from "../components/ui/logo";
import { useNavigateWithTransition } from "../lib/useNavigateWithTransition";
import { authApi } from "../lib/api";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const go = useNavigateWithTransition();
  const { setUser } = useAuth();
  const panelRef = useRef(null);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const next = {};
    if (!email.trim()) next.email = "Email tidak boleh kosong.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      next.email = "Format email tidak valid.";
    if (!password) next.password = "Password tidak boleh kosong.";
    else if (password.length < 8)
      next.password = "Password minimal 8 karakter.";
    return next;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setServerError("");
    setIsLoading(true);

    try {
      const res = await authApi.login(email, password);
      setUser(res.data.user);
      navigate("/dashboard");
    } catch (err) {
      setServerError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex bg-[var(--color-bg)] overflow-hidden">
      {/* Left Side - Form */}
      <div
        ref={panelRef}
        className="w-full lg:w-1/2 flex flex-col px-6 lg:px-16 overflow-y-auto panel-enter"
      >
        {/* Logo */}
        <div className="pt-8 pb-2 max-w-md mx-auto w-full">
          <button
            onClick={() => navigate("/onboarding/1")}
            className="flex items-center gap-2 group"
          >
            <Logo />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
          <h2 className="text-3xl lg:text-4xl font-bold text-[#005823] font-lexend mb-2">
            Selamat datang kembali!
          </h2>
          <p className="text-[#6d7b6c] mb-8 font-jakarta">
            Masuk untuk melanjutkan perjalanan sehatmu
          </p>

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Server error */}
            {serverError && (
              <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600 font-jakarta">
                {serverError}
              </div>
            )}
            {/* Email */}
            <div>
              <label
                htmlFor="login-email"
                className="block text-sm font-semibold text-[#191c20] mb-2 font-lexend"
              >
                Email
              </label>
              <input
                id="login-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrors((prev) => ({ ...prev, email: undefined }));
                }}
                className={`w-full px-4 py-3 rounded-3xl border ${
                  errors.email
                    ? "border-red-400 focus:ring-red-300"
                    : "border-[#c1c9bf] focus:ring-[#006e2f]"
                } bg-white focus:outline-none focus:ring-2 focus:border-transparent font-jakarta`}
              />
              {errors.email && (
                <p className="mt-1.5 text-xs text-red-500 font-jakarta">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="login-password"
                  className="text-sm font-semibold text-[#191c20] font-lexend"
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => navigate("/lupa-password")}
                  className="text-xs text-[#006e2f] font-semibold hover:underline font-jakarta"
                >
                  Lupa password?
                </button>
              </div>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Masukkan password"
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
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-red-500 font-jakarta">{errors.password}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#006e2f] text-white font-semibold py-4 rounded-xl hover:bg-[#005823] active:scale-[0.97] transition-all duration-150 font-lexend flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  Masuk
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-[#6d7b6c] mt-8 font-jakarta">
            Belum punya akun?{" "}
            <button
              type="button"
              onClick={() => go("/onboarding/1", panelRef)}
              className="text-[#006e2f] font-semibold hover:underline active:scale-95 transition-transform duration-150 inline-block"
            >
              Daftar sekarang
            </button>
          </p>
        </div>

        <div className="h-8" />
      </div>

      {/* Right Side - Image */}
      <div className="hidden lg:block lg:w-1/2 bg-[#e5eeff] p-6">
        <div className="h-full rounded-3xl overflow-hidden">
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