import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Scale, Ruler } from "lucide-react";

export default function OnboardingStep3() {
  const navigate = useNavigate();
  const bmi = 24.2;
  const bmiCategory = "Normal";

  return (
    <div className="h-screen flex bg-[#f8f9ff] overflow-hidden">
      {/* Left Side - Content */}
      <div className="w-full lg:w-1/2 flex flex-col px-6 lg:px-16 overflow-y-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate("/onboarding/2")}
          className="flex items-center gap-2 text-[#6d7b6c] hover:text-[#191c20] transition-colors pt-6 pb-2 w-fit"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-jakarta text-sm">Kembali</span>
        </button>

        {/* Progress Bar */}
        <div className="w-full max-w-md mx-auto mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-[#6d7b6c] font-jakarta">Langkah 3</span>
            <span className="text-xs font-medium text-[#6d7b6c] font-jakarta">5</span>
          </div>
          <div className="h-2 bg-[#e5eeff] rounded-full overflow-hidden">
            <div className="h-full w-[60%] bg-[#006e2f] rounded-full transition-all duration-500"></div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
          <h2 className="text-3xl lg:text-4xl font-bold text-[#191c20] font-lexend mb-3 text-center">
            Hasil BMI Anda
          </h2>
          <p className="text-[#6d7b6c] text-center mb-8 font-jakarta">
            Berdasarkan data yang Anda masukkan, berikut adalah hasil perhitungan BMI Anda
          </p>

          {/* BMI Card */}
          <div className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgba(34,197,94,0.08)] border border-[#e5eeff] mb-6">
            <div className="text-center mb-6">
              <p className="text-[#6d7b6c] font-jakarta mb-2">BMI Score</p>
              <p className="text-6xl font-bold text-[#006e2f] font-lexend">{bmi}</p>
              <div className="inline-flex items-center gap-2 bg-green-100 text-[#006e2f] px-4 py-1 rounded-full mt-3">
                <span className="w-2 h-2 rounded-full bg-[#006e2f]"></span>
                <span className="font-semibold font-lexend">{bmiCategory}</span>
              </div>
            </div>

            {/* BMI Gauge */}
            <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden mb-4">
              <div className="absolute left-0 top-0 h-full w-[18%] bg-blue-400"></div>
              <div className="absolute left-[18%] top-0 h-full w-[25%] bg-green-500"></div>
              <div className="absolute left-[43%] top-0 h-full w-[17%] bg-yellow-400"></div>
              <div className="absolute left-[60%] top-0 h-full w-[40%] bg-red-500"></div>
              <div 
                className="absolute top-1/2 -translate-y-1/2 w-6 h-6 bg-white border-4 border-[#006e2f] rounded-full shadow-lg transform -translate-x-1/2 transition-all"
                style={{ left: "50%" }}
              ></div>
            </div>

            {/* BMI Legend */}
            <div className="flex justify-between text-xs text-[#6d7b6c] font-jakarta">
              <span>Kurus</span>
              <span>Normal</span>
              <span>Berlebihan</span>
              <span>Obesitas</span>
            </div>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-[#e5eeff] rounded-2xl p-4 text-center">
              <Scale className="w-6 h-6 text-[#006e2f] mx-auto mb-2" />
              <p className="text-xs text-[#6d7b6c] font-jakarta">Berat Ideal</p>
              <p className="text-lg font-bold text-[#191c20] font-lexend">58 - 71 kg</p>
            </div>
            <div className="bg-[#e5eeff] rounded-2xl p-4 text-center">
              <Ruler className="w-6 h-6 text-[#006e2f] mx-auto mb-2" />
              <p className="text-xs text-[#6d7b6c] font-jakarta">Tinggi</p>
              <p className="text-lg font-bold text-[#191c20] font-lexend">170 cm</p>
            </div>
          </div>

          <button
            onClick={() => navigate("/onboarding/4")}
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
      <div className="hidden lg:block lg:w-1/2 bg-[#e5eeff] p-6">
        <div className="h-full rounded-[32px] overflow-hidden relative">
          <img
            src="https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=1200&h=1600&fit=crop"
            alt="Fitness"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
}