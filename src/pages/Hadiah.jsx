import { useState } from "react";
import { 
  Star, 
  BadgeCheck, 
  Gift, 
  CheckCircle2, 
  X
} from "lucide-react";
import Navbar from "../components/Navbar";
import Streak from "../components/ui/streak";

export default function Hadiah() {
  const [activeTab, setActiveTab] = useState("semua");
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState(null);

  const totalPoints = 12450;
  const currentLevel = 12;
  const currentPoints = 12450;
  const nextLevelPoints = 13000;
  const progress = ((currentPoints - 12450 + 8900) / (nextLevelPoints - 12450 + 8900)) * 100;
  const streak = 14;

  const vouchers = {
    "semua": [
      { id: 1, title: "Voucher Medical Checkup", points: 2500, image: "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=400&h=300&fit=crop", category: "Kesehatan", description: "Potongan langsung Rp 100.000 untuk paket pemeriksaan kesehatan dasar.", badge: "Terbatas" },
      { id: 2, title: "1 Minggu Free Gym", points: 1200, image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop", category: "Gym", description: "Akses tak terbatas ke semua kelas dan fasilitas FitLife Center selama 7 hari." },
      { id: 3, title: "Diskon 50% SaladStop!", points: 800, image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop", category: "Makanan", description: "Nikmati makanan sehat favoritmu dengan setengah harga. Berlaku untuk semua menu." },
      { id: 4, title: "Konsultasi Nutrisi", points: 3000, image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop", category: "Kesehatan", description: "Sesi konsultasi 1-on-1 dengan ahli gizi bersertifikasi selama 45 menit." },
      { id: 5, title: "Yoga Class Premium", points: 1500, image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&fit=crop", category: "Gym", description: "Akses kelas yoga premium selama 1 bulan di studio partner kami." },
      { id: 6, title: "Healthy Snack Box", points: 600, image: "https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=400&h=300&fit=crop", category: "Makanan", description: "Box snack sehat dengan berbagai pilihan kacang-kacangan dan buah kering." },
    ],
    "Kesehatan": [
      { id: 1, title: "Voucher Medical Checkup", points: 2500, image: "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=400&h=300&fit=crop", category: "Kesehatan", description: "Potongan langsung Rp 100.000 untuk paket pemeriksaan kesehatan dasar.", badge: "Terbatas" },
      { id: 4, title: "Konsultasi Nutrisi", points: 3000, image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop", category: "Kesehatan", description: "Sesi konsultasi 1-on-1 dengan ahli gizi bersertifikasi selama 45 menit." },
    ],
    "Makanan": [
      { id: 3, title: "Diskon 50% SaladStop!", points: 800, image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop", category: "Makanan", description: "Nikmati makanan sehat favoritmu dengan setengah harga. Berlaku untuk semua menu." },
      { id: 6, title: "Healthy Snack Box", points: 600, image: "https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=400&h=300&fit=crop", category: "Makanan", description: "Box snack sehat dengan berbagai pilihan kacang-kacangan dan buah kering." },
    ],
    "Gym": [
      { id: 2, title: "1 Minggu Free Gym", points: 1200, image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop", category: "Gym", description: "Akses tak terbatas ke semua kelas dan fasilitas FitLife Center selama 7 hari." },
      { id: 5, title: "Yoga Class Premium", points: 1500, image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&fit=crop", category: "Gym", description: "Akses kelas yoga premium selama 1 bulan di studio partner kami." },
    ],
  };

  const riwayat = [
    { id: 1, voucher: "Diskon 25% Juice It Up", merchantId: "JIU-8821", tanggal: "24 Okt 2023", points: -400, status: "Berhasil" },
    { id: 2, voucher: "Personal Trainer 1-on-1", merchantId: "FLX-1029", tanggal: "12 Okt 2023", points: -2000, status: "Kadaluarsa" },
  ];

  const currentVouchers = activeTab === "semua" ? vouchers["semua"] : vouchers[activeTab] || [];

  const openRedeemModal = (voucher) => {
    setSelectedVoucher(voucher);
    setShowRedeemModal(true);
  };

  const closeRedeemModal = () => {
    setShowRedeemModal(false);
    setSelectedVoucher(null);
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <Navbar />

      {/* Main Content */}
      <main className="lg:ml-72 pb-20 lg:pb-0">
        <div className="p-6 lg:p-8 max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 mb-8">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-[#191c20] font-lexend">
                Pusat Hadiah
              </h1>
              <p className="text-[#6d7b6c] font-jakarta mt-1 max-w-md">
                Kumpulkan poin dari aktivitas sehatmu dan tukarkan dengan berbagai voucher menarik.
              </p>
            </div>
            <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl border border-[#e5eeff] shadow-sm">
              <div className="w-10 h-10 flex items-center justify-center">
                <Star className="w-8 h-8 text-[#006e2f]" />
              </div>
              <div>
                <p className="text-xs text-[#6d7b6c] font-jakarta uppercase tracking-wide">Total Poin Kamu</p>
                <p className="text-2xl font-bold text-[#006e2f] font-lexend">{totalPoints.toLocaleString()} <span className="text-sm font-normal text-[#6d7b6c]">Pts</span></p>
              </div>
            </div>
          </div>

          {/* Level & Badges Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Level Card */}
            <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgba(34,197,94,0.08)] border border-[#e5eeff]">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="inline-flex items-center gap-2 text-orange-700 py-1 rounded-full text-md font-extrabold mb-2">
                    LEVEL {currentLevel}
                  </div>
                  <h3 className="text-xl font-bold text-[#191c20] font-lexend">Pejuang Sehat</h3>
                  <p className="text-sm text-[#6d7b6c] font-jakarta mt-1">
                    Dapatkan {nextLevelPoints - currentPoints} poin lagi untuk naik ke Level {currentLevel + 1}: <span className="font-semibold text-[#191c20]">Maratonis</span>
                  </p>
                </div>
                <Streak count={streak} variant="compact" />
              </div>
              {/* Progress Bar */}
              <div className="relative">
                <div className="h-3 bg-[#e5eeff] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#006e2f] rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                  ></div>
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-xs text-[#6d7b6c] font-jakarta">{currentPoints.toLocaleString()} Poin</span>
                  <span className="text-xs text-[#6d7b6c] font-jakarta">{nextLevelPoints.toLocaleString()} Poin</span>
                </div>
              </div>
            </div>

            {/* Elite Badge Card */}
            <div className="bg-[#006e2f] rounded-3xl p-6 text-white shadow-lg flex flex-col justify-center">
              <h3 className="text-lg font-bold font-lexend mb-2">Lencana Elite</h3>
              <p className="text-sm text-white/80 font-jakarta">
                Kamu masuk ke dalam 5% pengguna teraktif bulan ini!
              </p>
            </div>
          </div>

          {/* Voucher Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-[#191c20] font-lexend">Tukarkan Voucher</h2>
              {/* Category Tabs */}
              <div className="flex gap-2">
                {["semua", "Kesehatan", "Makanan", "Gym"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium font-jakarta transition-colors ${
                      activeTab === tab
                        ? "bg-[#006e2f] text-white"
                        : "bg-white text-[#6d7b6c] border border-[#e5eeff] hover:bg-[#f8f9ff]"
                    }`}
                  >
                    {tab === "semua" ? "Semua" : tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Voucher Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentVouchers.map((voucher) => (
                <div key={voucher.id} className="bg-white rounded-3xl overflow-hidden shadow-[0_8px_30px_rgba(34,197,94,0.08)] border border-[#e5eeff]">
                  <div className="relative h-40">
                    <img src={voucher.image} alt={voucher.title} className="w-full h-full object-cover" />
                    {voucher.badge && (
                      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1">
                        <BadgeCheck className="w-3 h-3 text-[#006e2f]" />
                        <span className="text-xs font-semibold text-[#006e2f] font-jakarta">{voucher.badge}</span>
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <h4 className="font-semibold text-[#191c20] font-lexend mb-1">{voucher.title}</h4>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-2xl font-bold text-[#006e2f] font-lexend">{voucher.points.toLocaleString()}</span>
                      <span className="text-sm text-[#6d7b6c] font-jakarta">Pts</span>
                    </div>
                    <p className="text-sm text-[#6d7b6c] font-jakarta mb-4 line-clamp-2">{voucher.description}</p>
                    <button
                      onClick={() => openRedeemModal(voucher)}
                      disabled={totalPoints < voucher.points}
                      className={`w-full py-3 rounded-xl font-semibold font-jakarta transition-colors ${
                        totalPoints >= voucher.points
                          ? "bg-[#006e2f] text-white hover:bg-[#005823]"
                          : "bg-[#e5eeff] text-[#6d7b6c] cursor-not-allowed"
                      }`}
                    >
                      {totalPoints >= voucher.points ? "Tukarkan Sekarang" : "Poin Tidak Cukup"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Riwayat Penukaran */}
          <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgba(34,197,94,0.08)] border border-[#e5eeff]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-[#191c20] font-lexend">Riwayat Penukaran</h2>
              <button className="text-sm text-[#006e2f] font-medium hover:underline font-jakarta">Lihat Semua</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#e5eeff]">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-[#6d7b6c] uppercase tracking-wide font-jakarta">Voucher</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-[#6d7b6c] uppercase tracking-wide font-jakarta">Tanggal</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-[#6d7b6c] uppercase tracking-wide font-jakarta">Poin Digunakan</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-[#6d7b6c] uppercase tracking-wide font-jakarta">Status</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-[#6d7b6c] uppercase tracking-wide font-jakarta">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {riwayat.map((item) => (
                    <tr key={item.id} className="border-b border-[#e5eeff] last:border-0 hover:bg-[#f8f9ff]">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-[#e5eeff] rounded-xl flex items-center justify-center">
                            <Gift className="w-5 h-5 text-[#006e2f]" />
                          </div>
                          <div>
                            <p className="font-semibold text-[#191c20] font-jakarta">{item.voucher}</p>
                            <p className="text-xs text-[#6d7b6c] font-jakarta">Merchant ID: {item.merchantId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-[#6d7b6c] font-jakarta">{item.tanggal}</td>
                      <td className="py-4 px-4">
                        <span className="text-red-500 font-semibold font-lexend">{item.points.toLocaleString()} Pts</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold font-jakarta ${
                          item.status === "Berhasil" 
                            ? "bg-green-100 text-green-700" 
                            : "bg-gray-100 text-gray-600"
                        }`}>
                          {item.status === "Berhasil" && <CheckCircle2 className="w-3 h-3" />}
                          {item.status}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        {item.status === "Berhasil" ? (
                          <button className="text-sm text-[#006e2f] font-semibold hover:underline font-jakarta">
                            Gunakan
                          </button>
                        ) : (
                          <button className="text-sm text-[#6d7b6c] font-jakarta">
                            Detail
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Redeem Modal */}
      {showRedeemModal && selectedVoucher && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-[#191c20] font-lexend">Konfirmasi Penukaran</h3>
                <button
                  onClick={closeRedeemModal}
                  className="w-10 h-10 rounded-xl bg-[#f8f9ff] flex items-center justify-center hover:bg-[#e5eeff] transition-colors"
                >
                  <X className="w-5 h-5 text-[#6d7b6c]" />
                </button>
              </div>
              <div className="rounded-2xl overflow-hidden mb-4">
                <img src={selectedVoucher.image} alt={selectedVoucher.title} className="w-full h-48 object-cover" />
              </div>
              <h4 className="font-semibold text-[#191c20] font-lexend mb-1">{selectedVoucher.title}</h4>
              <p className="text-sm text-[#6d7b6c] font-jakarta mb-4">{selectedVoucher.description}</p>
              <div className="bg-[#f8f9ff] rounded-xl p-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-[#6d7b6c] font-jakarta">Poin yang akan digunakan:</span>
                  <span className="text-xl font-bold text-[#006e2f] font-lexend">{selectedVoucher.points.toLocaleString()} Pts</span>
                </div>
                <div className="flex justify-between items-center mt-2 pt-2 border-t border-[#e5eeff]">
                  <span className="text-[#6d7b6c] font-jakarta">Sisa poin setelahnya:</span>
                  <span className="font-semibold text-[#191c20] font-lexend">{(totalPoints - selectedVoucher.points).toLocaleString()} Pts</span>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={closeRedeemModal}
                  className="flex-1 py-3 border-2 border-[#c1c9bf] text-[#6d7b6c] rounded-xl font-semibold font-jakarta hover:bg-[#f8f9ff] transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={closeRedeemModal}
                  className="flex-1 py-3 bg-[#006e2f] text-white rounded-xl font-semibold font-jakarta hover:bg-[#005823] transition-colors"
                >
                  Tukar Sekarang
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}