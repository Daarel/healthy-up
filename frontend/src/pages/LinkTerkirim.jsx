import { useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, RefreshCw } from "lucide-react";

export default function LinkTerkirim() {
  const navigate = useNavigate();
  const email = sessionStorage.getItem("reset_email") || "emailmu@contoh.com";

  return (
    <div className="h-screen flex bg-[var(--color-bg)] overflow-hidden">
      <div className="w-full lg:w-1/2 flex flex-col px-6 lg:px-16 overflow-y-auto">
        {/* Back */}
        <button
          onClick={() => navigate("/lupa-password")}
          className="flex items-center gap-2 text-[#6d7b6c] hover:text-[#005823] transition-colors pt-8 pb-2 w-fit"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-jakarta text-sm">Kembali</span>
        </button>

        <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
          {/* Icon */}
          <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mb-6">
            <Mail className="w-8 h-8 text-[#006e2f]" />
          </div>

          <h2 className="text-3xl font-bold text-[#005823] font-lexend mb-2">
            Link Telah Dikirim
          </h2>
          <p className="text-[#6d7b6c] font-jakarta mb-2">
            Kami telah mengirimkan link reset password ke:
          </p>
          <p className="font-semibold text-[#191c20] font-lexend mb-8 break-all">
            {email}
          </p>

          <div className="bg-[#f8faf8] border border-[#e5eeff] rounded-2xl p-5 mb-8 space-y-3">
            <p className="text-sm text-[#6d7b6c] font-jakarta">
              Buka email kamu dan klik link yang kami kirimkan untuk melanjutkan proses reset password.
            </p>
            <p className="text-sm text-[#6d7b6c] font-jakarta">
              Link berlaku selama <span className="font-semibold text-[#191c20]">15 menit</span>. Periksa juga folder <span className="font-semibold text-[#191c20]">Spam</span> jika tidak menemukan emailnya.
            </p>
          </div>

          {/* Kirim ulang */}
          <button
            onClick={() => navigate("/lupa-password")}
            className="w-full flex items-center justify-center gap-2 py-4 border-2 border-[#006e2f] text-[#006e2f] font-semibold rounded-xl hover:bg-green-50 transition-colors font-lexend"
          >
            <RefreshCw className="w-4 h-4" />
            Kirim Ulang Email
          </button>

          <p className="text-center text-sm text-[#6d7b6c] font-jakarta mt-6">
            Sudah punya akun?{" "}
            <button
              onClick={() => navigate("/login")}
              className="text-[#006e2f] font-semibold hover:underline"
            >
              Masuk
            </button>
          </p>
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
