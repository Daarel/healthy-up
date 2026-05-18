import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function OnboardingStep1() {
  const navigate = useNavigate();

  return (
    <div className="h-screen flex bg-[var(--color-bg)] overflow-hidden">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col px-6 lg:px-16 overflow-y-auto">
        {/* Progress Bar */}
        <div className="w-full max-w-md mx-auto mb-6 pt-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-[#6d7b6c] font-jakarta">Langkah 1</span>
           
          </div>
          <div className="h-2 bg-[#e5eeff] rounded-full overflow-hidden">
            <div className="h-full w-[20%] bg-[#006e2f] rounded-full transition-all duration-500"></div>
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

          {/* Form */}
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-[#191c20] mb-2 font-lexend">
                Nama Lengkap
              </label>
              <input
                type="text"
                placeholder="Masukkan nama lengkap Anda"
                className="w-full px-4 py-3 rounded-xl border border-[#c1c9bf] bg-white focus:outline-none focus:ring-2 focus:ring-[#006e2f] focus:border-transparent font-jakarta"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#191c20] mb-2 font-lexend">
                Email
              </label>
              <input
                type="email"
                placeholder="nama@email.com"
                className="w-full px-4 py-3 rounded-xl border border-[#c1c9bf] bg-white focus:outline-none focus:ring-2 focus:ring-[#006e2f] focus:border-transparent font-jakarta"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#191c20] mb-2 font-lexend">
                Password
              </label>
              <input
                type="password"
                placeholder="Minimal 8 karakter"
                className="w-full px-4 py-3 rounded-xl border border-[#c1c9bf] bg-white focus:outline-none focus:ring-2 focus:ring-[#006e2f] focus:border-transparent font-jakarta"
              />
            </div>

            <button
              onClick={() => navigate("/onboarding/2")}
              className="w-full bg-[#006e2f] text-white font-semibold py-4 rounded-xl hover:bg-[#005823] transition-colors font-lexend flex items-center justify-center gap-2"
            >
              Lanjutkan
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          <p className="text-center text-sm text-[#6d7b6c] mt-8 font-jakarta">
            Sudah punya akun?{" "}
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="text-[#006e2f] font-semibold hover:underline"
            >
              Masuk
            </button>
          </p>
        </div>

        {/* Bottom Padding */}
        <div className="h-8"></div>
      </div>

      {/* Right Side - Image */}
      <div className="hidden lg:block lg:w-1/2 p-6">
        <div className="h-full rounded-3xl overflow-hidden relative">
          <img
            src="/public/onboarding/1.jpg"
            alt="Fitness"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
}