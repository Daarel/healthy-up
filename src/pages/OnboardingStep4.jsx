import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Info } from "lucide-react";

export default function OnboardingStep4() {
  const navigate = useNavigate();
  const [targetWeight, setTargetWeight] = useState(65);

  return (
    <div className="h-screen flex bg-[var(--color-bg)] overflow-hidden">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col px-6 lg:px-16 overflow-y-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate("/onboarding/3")}
          className="flex items-center gap-2 text-[#6d7b6c] hover:text-[#005823] transition-colors pt-6 pb-2 w-fit"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-jakarta text-sm">Kembali</span>
        </button>

        {/* Progress Bar */}
        <div className="w-full max-w-md mx-auto mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-[#6d7b6c] font-jakarta">Langkah 4</span>
            
          </div>
          <div className="h-2 bg-[#e5eeff] rounded-full overflow-hidden">
            <div className="h-full w-[80%] bg-[#006e2f] rounded-full transition-all duration-500"></div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
          <h2 className="text-3xl lg:text-4xl font-bold text-[#191c20] font-lexend mb-3 text-center">
            Target Berat Badan
          </h2>
          <p className="text-[#6d7b6c] text-center mb-8 font-jakarta">
            Tentukan target berat badan ideal yang ingin Anda capai
          </p>

          {/* Weight Display */}
          <div className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgba(34,197,94,0.08)] border border-[#e5eeff] mb-6">
            <div className="text-center mb-6">
              <p className="text-[#6d7b6c] font-jakarta mb-2">Target Berat</p>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-6xl font-bold text-[#006e2f] font-lexend">{targetWeight}</span>
                <span className="text-xl text-[#6d7b6c] font-jakarta">kg</span>
              </div>
            </div>

            {/* Slider */}
            <div className="px-2">
              <input
                type="range"
                min="30"
                max="150"
                value={targetWeight}
                onChange={(e) => setTargetWeight(Number(e.target.value))}
                className="w-full h-2 bg-[#e5eeff] rounded-full appearance-none cursor-pointer accent-[#006e2f]"
              />
              <div className="flex justify-between text-xs text-[#6d7b6c] mt-2 font-jakarta">
                <span>30 kg</span>
                <span>150 kg</span>
              </div>
            </div>
          </div>

          {/* Weight Stats */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-[#e5eeff] rounded-2xl p-4 text-center">
              <p className="text-xs text-[#6d7b6c] font-jakarta mb-1">Saat Ini</p>
              <p className="text-lg font-bold text-[#191c20] font-lexend">70 kg</p>
            </div>
            <div className="bg-green-50 rounded-2xl p-4 text-center border-2 border-[#006e2f]">
              <p className="text-xs text-[#006e2f] font-jakarta mb-1">Target</p>
              <p className="text-lg font-bold text-[#006e2f] font-lexend">{targetWeight} kg</p>
            </div>
            <div className="bg-[#e5eeff] rounded-2xl p-4 text-center">
              <p className="text-xs text-[#6d7b6c] font-jakarta mb-1">Perlu</p>
              <p className={`text-lg font-bold font-lexend ${targetWeight < 70 ? 'text-blue-500' : targetWeight > 70 ? 'text-orange-500' : 'text-[#191c20]'}`}>
                {Math.abs(targetWeight - 70)} kg
              </p>
            </div>
          </div>

          {/* Info Box */}
          <div className="flex items-start gap-3  rounded-2xl p-4 mb-6">
            {/* <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" /> */}
            <p className="text-sm text-[#6d7b6c] font-jakarta">
              Target penurunan berat badan yang sehat adalah 0.5-1 kg per minggu.
            </p>
          </div>

          <button
            onClick={() => navigate("/onboarding/5")}
            className="w-full bg-[#006e2f] text-white font-semibold py-4 rounded-xl hover:bg-[#005823] transition-colors font-lexend flex items-center justify-center gap-2"
          >
            Lanjutkan
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* Bottom Padding */}
        <div className="h-8"></div>
      </div>

      {/* Right Side - Image */}
      <div className="hidden lg:block lg:w-1/2 p-6">
        <div className="h-full rounded-3xl overflow-hidden relative">
          <img
            src="/public/onboarding/4.jpg"
            alt="Fitness"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
}