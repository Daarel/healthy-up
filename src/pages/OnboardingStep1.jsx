import { useNavigate } from "react-router-dom";

export default function OnboardingStep1() {
  const navigate = useNavigate();

  return (
    <div className="h-screen flex bg-[#f8f9ff] overflow-hidden">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col px-6 lg:px-16 overflow-y-auto">
        {/* Progress Bar */}
        <div className="w-full max-w-md mx-auto mb-6 pt-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-[#6d7b6c] font-jakarta">Langkah 1</span>
            <span className="text-xs font-medium text-[#6d7b6c] font-jakarta">5</span>
          </div>
          <div className="h-2 bg-[#e5eeff] rounded-full overflow-hidden">
            <div className="h-full w-[20%] bg-[#006e2f] rounded-full transition-all duration-500"></div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
          <h2 className="text-3xl lg:text-4xl font-bold text-[#191c20] font-lexend mb-3 text-center">
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
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>

            <div className="relative flex items-center justify-center my-6">
              <div className="border-t border-[#c1c9bf] flex-1"></div>
              <span className="px-4 text-sm text-[#6d7b6c] font-jakarta">atau</span>
              <div className="border-t border-[#c1c9bf] flex-1"></div>
            </div>

            <button className="w-full bg-white border border-[#c1c9bf] text-[#191c20] font-semibold py-3 rounded-xl hover:bg-[#f8f9ff] transition-colors font-jakarta flex items-center justify-center gap-3">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Daftar dengan Google
            </button>
          </div>

          <p className="text-center text-sm text-[#6d7b6c] mt-8 font-jakarta">
            Sudah punya akun?{" "}
            <a href="#" className="text-[#006e2f] font-semibold hover:underline">Masuk</a>
          </p>
        </div>

        {/* Bottom Padding */}
        <div className="h-8"></div>
      </div>

      {/* Right Side - Image */}
      <div className="hidden lg:block lg:w-1/2 bg-[#e5eeff] p-6">
        <div className="h-full rounded-[32px] overflow-hidden relative">
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
