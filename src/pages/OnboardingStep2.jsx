import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Minus, Plus, User, UserCircle2 } from "lucide-react";

export default function OnboardingStep2() {
  const navigate = useNavigate();
  const [gender, setGender] = useState("");
  const [age, setAge] = useState(25);

  return (
    <div className="h-screen flex bg-[var(--color-bg)] overflow-hidden">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col px-6 lg:px-16 overflow-y-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate("/onboarding/1")}
          className="flex items-center gap-2 text-[#6d7b6c] hover:text-[#005823] transition-colors pt-6 pb-2 w-fit"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-jakarta text-sm">Kembali</span>
        </button>

        {/* Progress Bar */}
        <div className="w-full max-w-md mx-auto mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-[#6d7b6c] font-jakarta">Langkah 2</span>
        
          </div>
          <div className="h-2 bg-[#e5eeff] rounded-full overflow-hidden">
            <div className="h-full w-[40%] bg-[#006e2f] rounded-full transition-all duration-500"></div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
          <h2 className="text-3xl lg:text-4xl font-bold text-[#191c20] font-lexend mb-3 text-center">
            Data Pribadi
          </h2>
          <p className="text-[#6d7b6c] text-center mb-8 font-jakarta">
            Beritahu kami sedikit tentang diri Anda untuk personalisasi yang lebih baik
          </p>

          {/* Form */}
          <div className="space-y-6">
            {/* Gender Selection */}
            <div>
              <label className="block text-sm font-semibold text-[#191c20] mb-3 font-lexend">
                Jenis Kelamin
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setGender("male")}
                  className={`flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all ${
                    gender === "male"
                      ? "border-[#006e2f] bg-green-50"
                      : "border-[#c1c9bf] bg-white hover:border-[#006e2f]/50"
                  }`}
                >
                  <User className={`w-10 h-10 ${gender === "male" ? "text-[#006e2f]" : "text-[#6d7b6c]"}`} />
                  <span className={`font-jakarta font-medium ${gender === "male" ? "text-[#006e2f]" : "text-[#191c20]"}`}>
                    Laki-laki
                  </span>
                </button>
                <button
                  onClick={() => setGender("female")}
                  className={`flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all ${
                    gender === "female"
                      ? "border-[#006e2f] bg-green-50"
                      : "border-[#c1c9bf] bg-white hover:border-[#006e2f]/50"
                  }`}
                >
                  <UserCircle2 className={`w-10 h-10 ${gender === "female" ? "text-[#006e2f]" : "text-[#6d7b6c]"}`} />
                  <span className={`font-jakarta font-medium ${gender === "female" ? "text-[#006e2f]" : "text-[#191c20]"}`}>
                    Perempuan
                  </span>
                </button>
              </div>
            </div>

            {/* Age Input */}
            <div>
              <label className="block text-sm font-semibold text-[#191c20] mb-3 font-lexend">
                Usia
              </label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setAge(Math.max(10, age - 1))}
                  className="w-12 h-12 rounded-xl bg-white border border-[#c1c9bf] flex items-center justify-center hover:bg-[#f8f9ff] transition-colors"
                >
                  <Minus className="w-5 h-5 text-[#191c20]" />
                </button>
                <div className="flex-1 text-center">
                  <span className="text-3xl font-bold text-[#191c20] font-lexend">{age}</span>
                  <span className="text-[#6d7b6c] ml-1 font-jakarta">tahun</span>
                </div>
                <button
                  onClick={() => setAge(Math.min(100, age + 1))}
                  className="w-12 h-12 rounded-xl bg-white border border-[#c1c9bf] flex items-center justify-center hover:bg-[#f8f9ff] transition-colors"
                >
                  <Plus className="w-5 h-5 text-[#191c20]" />
                </button>
              </div>
            </div>

            {/* Height & Weight Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-[#191c20] mb-2 font-lexend">
                  Tinggi (cm)
                </label>
                <input
                  type="number"
                  defaultValue="170"
                  className="w-full px-4 py-3 rounded-xl border border-[#c1c9bf] bg-white focus:outline-none focus:ring-2 focus:ring-[#006e2f] focus:border-transparent font-jakarta text-center"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#191c20] mb-2 font-lexend">
                  Berat (kg)
                </label>
                <input
                  type="number"
                  defaultValue="70"
                  className="w-full px-4 py-3 rounded-xl border border-[#c1c9bf] bg-white focus:outline-none focus:ring-2 focus:ring-[#006e2f] focus:border-transparent font-jakarta text-center"
                />
              </div>
            </div>

            <button
              onClick={() => navigate("/onboarding/3")}
              className="w-full bg-[#006e2f] text-white font-semibold py-4 rounded-xl hover:bg-[#005823] transition-colors font-lexend flex items-center justify-center gap-2"
            >
              Lanjutkan
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Bottom Padding */}
        <div className="h-8"></div>
      </div>

      {/* Right Side - Image */}
      <div className="hidden lg:block lg:w-1/2 p-6">
        <div className="h-full rounded-3xl overflow-hidden relative">
          <img
            src="/public/onboarding/2.jpg"
            alt="Fitness"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
}