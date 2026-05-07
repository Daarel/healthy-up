import { useNavigate } from "react-router-dom";
import { ArrowLeft, Rocket, UtensilsCrossed, Dumbbell, Clock } from "lucide-react";

export default function OnboardingStep5() {
  const navigate = useNavigate();

  return (
    <div className="h-screen flex bg-[#f8f9ff] overflow-hidden">
      {/* Left Side - Content */}
      <div className="w-full lg:w-1/2 flex flex-col px-6 lg:px-16 overflow-y-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate("/onboarding/4")}
          className="flex items-center gap-2 text-[#6d7b6c] hover:text-[#191c20] transition-colors pt-6 pb-2 w-fit"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-jakarta text-sm">Kembali</span>
        </button>

        {/* Progress Bar */}
        <div className="w-full max-w-md mx-auto mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-[#6d7b6c] font-jakarta">Langkah 5</span>
            <span className="text-xs font-medium text-[#6d7b6c] font-jakarta">5</span>
          </div>
          <div className="h-2 bg-[#e5eeff] rounded-full overflow-hidden">
            <div className="h-full w-[100%] bg-[#006e2f] rounded-full transition-all duration-500"></div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
          

          <h2 className="text-3xl lg:text-4xl font-bold text-[#191c20] font-lexend mb-3 text-center">
            Ringkasan Rencana AI
          </h2>
          <p className="text-[#6d7b6c] text-center mb-8 font-jakarta">
            Berdasarkan data Anda, kami telah membuat rencana personal untuk Anda
          </p>

          {/* Plan Summary Cards */}
          <div className="space-y-4 mb-6">
            <div className="bg-white rounded-2xl p-5 shadow-[0_8px_30px_rgba(34,197,94,0.08)] border border-[#e5eeff] flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <UtensilsCrossed className="w-6 h-6 text-orange-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-[#6d7b6c] font-jakarta">Kalori Harian</p>
                <p className="text-lg font-bold text-[#191c20] font-lexend">1,800 kkal</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-[0_8px_30px_rgba(34,197,94,0.08)] border border-[#e5eeff] flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Dumbbell className="w-6 h-6 text-blue-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-[#6d7b6c] font-jakarta">Olahraga</p>
                <p className="text-lg font-bold text-[#191c20] font-lexend">4x per minggu</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-[0_8px_30px_rgba(34,197,94,0.08)] border border-[#e5eeff] flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-purple-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-[#6d7b6c] font-jakarta">Estimasi Waktu</p>
                <p className="text-lg font-bold text-[#191c20] font-lexend">12 minggu</p>
              </div>
            </div>
          </div>

     
          

          <button
            onClick={() => navigate("/dashboard")}
            className="w-full bg-[#006e2f] text-white font-semibold py-4 rounded-xl hover:bg-[#005823] transition-colors font-lexend flex items-center justify-center gap-2"
          >
            Mulai Perjalanan
            <Rocket className="w-5 h-5" />
          </button>
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