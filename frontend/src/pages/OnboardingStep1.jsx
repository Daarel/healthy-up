import { useNavigate } from "react-router-dom";
import { useRef, useState } from "react";
import { ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";
import { useNavigateWithTransition } from "../lib/useNavigateWithTransition";
import { authApi } from "../lib/api";
import { useAuth } from "../context/AuthContext";

export default function OnboardingStep1() {
  const navigate = useNavigate();
  const go = useNavigateWithTransition();
  const panelRef = useRef(null);
  const { setUser } = useAuth();

  const [username,     setUsername]     = useState("");
  const [email,        setEmail]        = useState("");
  const [password,     setPassword]     = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors,       setErrors]       = useState({});
  const [isLoading,    setIsLoading]    = useState(false);
  const [registerError, setRegisterError] = useState("");

  const validate = () => {
    const next = {};
    if (!username.trim()) next.username = "Nama tidak boleh kosong.";
    else if (username.trim().length < 3) next.username = "Nama minimal 3 karakter.";
    if (!email.trim()) next.email = "Email tidak boleh kosong.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      next.email = "Format email tidak valid.";
    if (!password) next.password = "Password tidak boleh kosong.";
    else if (password.length < 8) next.password = "Password minimal 8 karakter.";
    return next;
  };

  const handleRegister = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setRegisterError("");
    setIsLoading(true);
    try {
      // TODO: kirim juga gender, age, height, weight dari SetupTargetModal saat backend siap
      const res = await authApi.register(username.trim(), email.trim(), password);
      setUser(res.data.user);
      // Tandai user baru agar Dashboard auto-buka SetupTargetModal
      localStorage.setItem("healthyup:newUser", "true");
      navigate("/dashboard");
    } catch (err) {
      setRegisterError(err.message || "Gagal membuat akun. Coba lagi.");
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
        {/* Progress Bar */}
        <div className="w-full max-w-md mx-auto mb-6 pt-8">
          <div className="h-2 bg-[#e5eeff] rounded-full overflow-hidden">
            <div className="h-full w-[50%] bg-[#006e2f] rounded-full transition-all duration-500" />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
          <h2 className="text-3xl lg:text-4xl font-bold text-[#005823] font-lexend mb-3 text-center">
            Buat Akun Anda
          </h2>
          <p className="text-[#6d7b6c] text-center mb-8 font-jakarta">
            Mulai perjalanan kesehatan Anda dengan mendaftar akun HealthyUp
          </p>

          <div className="space-y-5">
            {/* Username */}
            <div>
              <label className="block text-sm font-semibold text-[#191c20] mb-2 font-lexend">
                Nama Pengguna
              </label>
              <input
                type="text"
                placeholder="Masukkan nama pengguna Anda"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setErrors((prev) => ({ ...prev, username: undefined }));
                }}
                className={`w-full px-4 py-3 rounded-xl border ${
                  errors.username ? "border-red-400 focus:ring-red-300" : "border-[#c1c9bf] focus:ring-[#006e2f]"
                } bg-white focus:outline-none focus:ring-2 focus:border-transparent font-jakarta`}
              />
              {errors.username && (
                <p className="mt-1.5 text-xs text-red-500 font-jakarta">{errors.username}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-[#191c20] mb-2 font-lexend">
                Email
              </label>
              <input
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrors((prev) => ({ ...prev, email: undefined }));
                }}
                className={`w-full px-4 py-3 rounded-xl border ${
                  errors.email ? "border-red-400 focus:ring-red-300" : "border-[#c1c9bf] focus:ring-[#006e2f]"
                } bg-white focus:outline-none focus:ring-2 focus:border-transparent font-jakarta`}
              />
              {errors.email && (
                <p className="mt-1.5 text-xs text-red-500 font-jakarta">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-[#191c20] mb-2 font-lexend">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Minimal 8 karakter"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrors((prev) => ({ ...prev, password: undefined }));
                  }}
                  className={`w-full px-4 py-3 pr-12 rounded-xl border ${
                    errors.password ? "border-red-400 focus:ring-red-300" : "border-[#c1c9bf] focus:ring-[#006e2f]"
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
            </div>

            {registerError && (
              <div className="px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600 font-jakarta">
                {registerError}
              </div>
            )}

            <button
              onClick={handleRegister}
              disabled={isLoading}
              className="w-full bg-[#006e2f] text-white font-semibold py-4 rounded-xl hover:bg-[#005823] transition-colors font-lexend flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Membuat akun...
                </>
              ) : (
                <>
                  Daftar
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>

          <p className="text-center text-sm text-[#6d7b6c] mt-8 font-jakarta">
            Sudah punya akun?{" "}
            <button
              type="button"
              onClick={() => go("/login", panelRef)}
              className="text-[#006e2f] font-semibold hover:underline"
            >
              Masuk
            </button>
          </p>
        </div>

        <div className="h-8" />
      </div>

      {/* Right Side - Image */}
      <div className="hidden lg:block lg:w-1/2 p-6 bg-[#e5eeff]">
        <div className="h-full overflow-hidden relative">
          <img
            src="/onboarding/1.jpg"
            alt="Fitness"
            className="w-full h-full object-cover rounded-3xl"
          />
        </div>
      </div>
    </div>
  );
}
