import { useState, useRef, useEffect } from 'react';
import {
  Star,
  BadgeCheck,
  Gift,
  CheckCircle2,
  X,
  Copy,
  Check,
  PartyPopper,
  SlidersHorizontal,
  History,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Streak from '../components/ui/streak';
import { mapReward, mapUserReward } from '../features/rewards/rewardMappers';
import { rewardApi, userApi } from '../lib/api';

const VOUCHER_CATEGORIES = ['semua', 'Kesehatan', 'Makanan', 'Gym'];

export default function Hadiah() {
  const [userProfile, setUserProfile] = useState({
    totalPoints: 0,
    currentLevel: 1,
    currentPoints: 0,
    nextLevelPoints: 1000,
    nextLevelName: 'Penggerak',
    streakCount: 0,
    eliteBadge: false,
  });

  const [vouchers, setVouchers] = useState([]);
  const [riwayat, setRiwayat] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isRedeeming, setIsRedeeming] = useState(false);

  // ─── UI state ─────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('semua');
  const [filterOpen, setFilterOpen] = useState(false);
  const [showRiwayat, setShowRiwayat] = useState(false);
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [redeemedVoucher, setRedeemedVoucher] = useState(null);
  const [codeCopied, setCodeCopied] = useState(false);

  const filterRef = useRef(null);

  // Tutup dropdown filter kalau klik di luar
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    let ignore = false;

    const loadRewards = async () => {
      setIsLoading(true);
      setError('');
      try {
        const [userRes, rewardsRes, mineRes] = await Promise.all([
          userApi.getMe(),
          rewardApi.getAll('semua'),
          rewardApi.getMine('all'),
        ]);
        const user = userRes.data.user;
        if (ignore) return;

        setUserProfile({
          totalPoints: user.rewardPoints ?? 0,
          currentLevel: user.level ?? 1,
          currentPoints: user.experiencePoints ?? 0,
          nextLevelPoints: (user.level ?? 1) * 1000,
          nextLevelName: user.rankTitle || 'Level berikutnya',
          streakCount: user.streakCount ?? 0,
          eliteBadge: (user.level ?? 1) >= 10,
        });
        setVouchers((rewardsRes.data.rewards || []).map(mapReward));
        setRiwayat((mineRes.data.myRewards || []).map(mapUserReward));
      } catch (err) {
        if (!ignore) setError(err.message || 'Gagal memuat data hadiah.');
      } finally {
        if (!ignore) setIsLoading(false);
      }
    };

    loadRewards();
    return () => {
      ignore = true;
    };
  }, []);

  // ─── Derived values ───────────────────────────────────────────────────────
  const {
    totalPoints,
    currentLevel,
    currentPoints,
    nextLevelPoints,
    nextLevelName,
    streakCount,
    eliteBadge,
  } = userProfile;
  const levelProgress =
    nextLevelPoints > currentPoints
      ? Math.min(100, Math.max(0, (currentPoints / nextLevelPoints) * 100))
      : 100;

  const currentVouchers =
    activeTab === 'semua'
      ? vouchers
      : vouchers.filter((v) => v.category === activeTab);

  // ─── Handlers ─────────────────────────────────────────────────────────────
  const openRedeemModal = (voucher) => {
    setSelectedVoucher(voucher);
    setShowRedeemModal(true);
  };

  const closeRedeemModal = () => {
    setShowRedeemModal(false);
    setSelectedVoucher(null);
  };

  const handleConfirmRedeem = async () => {
    if (!selectedVoucher) return;
    setIsRedeeming(true);
    setError('');
    try {
      const res = await rewardApi.claim(selectedVoucher.id);
      const { redemptionCode, remainingPoints } = res.data;
      const redeemed = {
        ...selectedVoucher,
        code: redemptionCode,
        remainingPoints,
      };
      setRedeemedVoucher(redeemed);
      setUserProfile((prev) => ({ ...prev, totalPoints: remainingPoints }));
      setVouchers((prev) =>
        prev.map((item) =>
          item.id === selectedVoucher.id
            ? { ...item, stockQuantity: Math.max(0, item.stockQuantity - 1) }
            : item,
        ),
      );
      setRiwayat((prev) => [
        {
          id: redemptionCode,
          voucher: selectedVoucher.title,
          merchantId: redemptionCode,
          tanggal: new Date().toLocaleDateString('id-ID'),
          points: selectedVoucher.points,
          status: 'Berhasil',
          code: redemptionCode,
        },
        ...prev,
      ]);
      setShowRedeemModal(false);
      setSelectedVoucher(null);
      setShowSuccessModal(true);
      setCodeCopied(false);
    } catch (err) {
      setError(err.message || 'Gagal menukarkan voucher.');
    } finally {
      setIsRedeeming(false);
    }
  };

  const closeSuccessModal = () => {
    setShowSuccessModal(false);
    setRedeemedVoucher(null);
    setCodeCopied(false);
  };

  const handleCopyCode = () => {
    if (!redeemedVoucher?.code) return;
    navigator.clipboard.writeText(redeemedVoucher.code);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className='min-h-screen bg-[var(--color-bg)]'>
      <Navbar />

      <main className='lg:ml-72 pb-20 lg:pb-0'>
        <div className='p-6 lg:p-8 max-w-6xl mx-auto'>
          {error && (
            <p className='mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 font-jakarta'>
              {error}
            </p>
          )}

          {/* Header */}
          <div className='flex flex-col lg:flex-row lg:items-start justify-between gap-6 mb-8'>
            <div>
              <h1 className='text-2xl lg:text-3xl font-bold text-[#191c20] font-lexend'>
                Pusat Hadiah
              </h1>
              <p className='text-[#6d7b6c] font-jakarta mt-1 max-w-md'>
                Kumpulkan poin dari aktivitas sehatmu dan tukarkan dengan
                berbagai voucher menarik.
              </p>
            </div>
            <div className='flex items-center gap-3 bg-white px-5 py-3 rounded-2xl border border-[#e5eeff] shadow-sm'>
              <Star className='w-8 h-8 text-[#006e2f]' />
              <div>
                <p className='text-xs text-[#6d7b6c] font-jakarta uppercase tracking-wide'>
                  Total Poin Kamu
                </p>
                <p className='text-2xl font-bold text-[#006e2f] font-lexend'>
                  {totalPoints.toLocaleString('id-ID')}{' '}
                  <span className='text-sm font-normal text-[#6d7b6c]'>
                    Pts
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Level & Badge */}
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8'>
            {/* Level Card */}
            <div className='lg:col-span-2 bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgba(34,197,94,0.08)] border border-[#e5eeff]'>
              <div className='flex items-start justify-between mb-4'>
                <div>
                  <div className='inline-flex items-center gap-2 text-orange-700 text-md font-extrabold mb-2'>
                    LEVEL {currentLevel}
                  </div>
                  <h3 className='text-xl font-bold text-[#191c20] font-lexend'>
                    Pejuang
                  </h3>
                  <p className='text-sm text-[#6d7b6c] font-jakarta mt-1'>
                    Dapatkan{' '}
                    <span className='font-semibold text-[#191c20]'>
                      {(nextLevelPoints - currentPoints).toLocaleString(
                        'id-ID',
                      )}{' '}
                      Exp
                    </span>{' '}
                    lagi untuk naik ke Level {currentLevel + 1}:{' '}
                    <span className='font-semibold text-[#191c20]'>
                      {nextLevelName}
                    </span>
                  </p>
                </div>
                <Streak count={streakCount} variant='compact' />
              </div>
              <div>
                <div className='h-3 bg-[#e5eeff] rounded-full overflow-hidden'>
                  <div
                    className='h-full bg-[#006e2f] rounded-full transition-all duration-500'
                    style={{ width: `${levelProgress}%` }}
                  />
                </div>
                <div className='flex justify-between mt-2'>
                  <span className='text-xs text-[#6d7b6c] font-jakarta'>
                    {currentPoints.toLocaleString('id-ID')} Exp
                  </span>
                  <span className='text-xs text-[#6d7b6c] font-jakarta'>
                    {nextLevelPoints.toLocaleString('id-ID')} Exp
                  </span>
                </div>
              </div>
            </div>

            {/* Elite Badge Card */}
            <div className='bg-[#006e2f] rounded-3xl p-6 text-white shadow-lg flex flex-col justify-center'>
              <h3 className='text-lg font-bold font-lexend mb-2'>
                Lencana Elite
              </h3>
              <p className='text-sm text-white/80 font-jakarta'>
                {eliteBadge
                  ? 'Kamu masuk ke dalam 5% pengguna teraktif bulan ini!'
                  : 'Selesaikan lebih banyak tugas untuk mendapatkan lencana elite.'}
              </p>
            </div>
          </div>

          {/* Voucher / Riwayat Section — swap berdasarkan showRiwayat */}
          <div className='mb-8'>
            <div className='flex items-center justify-between mb-6'>
              <h2 className='text-xl font-bold text-[#191c20] font-lexend'>
                {showRiwayat ? 'Riwayat Penukaran' : 'Tukarkan Voucher'}
              </h2>

              {/* Action Buttons */}
              <div className='flex items-center gap-2'>
                {/* Filter Dropdown — hanya tampil saat mode voucher */}
                {!showRiwayat && (
                  <div className='relative' ref={filterRef}>
                    <button
                      onClick={() => setFilterOpen((o) => !o)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium font-jakarta border transition-colors ${
                        activeTab !== 'semua'
                          ? 'bg-[#006e2f] text-white border-[#006e2f]'
                          : 'bg-white text-[#6d7b6c] border-[#e5eeff] hover:bg-[#f8f9ff]'
                      }`}
                    >
                      <SlidersHorizontal className='w-4 h-4' />
                      {activeTab === 'semua' ? 'Filter' : activeTab}
                    </button>

                    {filterOpen && (
                      <div className='absolute right-0 mt-2 w-44 bg-white rounded-2xl shadow-lg border border-[#e5eeff] z-10 overflow-hidden'>
                        {VOUCHER_CATEGORIES.map((tab) => (
                          <button
                            key={tab}
                            onClick={() => {
                              setActiveTab(tab);
                              setFilterOpen(false);
                            }}
                            className={`w-full text-left px-4 py-3 text-sm font-jakarta transition-colors flex items-center justify-between ${
                              activeTab === tab
                                ? 'bg-[#e6f4ec] text-[#006e2f] font-semibold'
                                : 'text-[#3d4a3c] hover:bg-[#f8f9ff]'
                            }`}
                          >
                            {tab === 'semua' ? 'Semua' : tab}
                            {activeTab === tab && <Check className='w-4 h-4' />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Riwayat Toggle Button */}
                <button
                  onClick={() => {
                    setShowRiwayat((v) => !v);
                    setFilterOpen(false);
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium font-jakarta border transition-colors ${
                    showRiwayat
                      ? 'bg-[#006e2f] text-white border-[#006e2f]'
                      : 'bg-white text-[#6d7b6c] border-[#e5eeff] hover:bg-[#f8f9ff]'
                  }`}
                >
                  <History className='w-4 h-4' />
                  Riwayat
                </button>
              </div>
            </div>

            {/* Konten: Voucher Grid */}
            {!showRiwayat && (
              <div className='bg-white rounded-3xl p-6 border border-[#e5eeff] min-h-[320px]'>
                {isLoading ? (
                  <div className='flex flex-col items-center justify-center py-16 text-center'>
                    <p className='text-[#6d7b6c] font-jakarta'>
                      Memuat voucher...
                    </p>
                  </div>
                ) : currentVouchers.length === 0 ? (
                  <div className='flex flex-col items-center justify-center py-16 text-center'>
                    <Gift className='w-12 h-12 text-[#c1c9bf] mb-3' />
                    <p className='text-[#6d7b6c] font-jakarta'>
                      Belum ada voucher tersedia.
                    </p>
                  </div>
                ) : (
                  <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                    {currentVouchers.map((voucher) => (
                      <div
                        key={voucher.id}
                        className='bg-[#f8f9ff] rounded-2xl overflow-hidden border border-[#e5eeff]'
                      >
                        <div className='relative h-40'>
                          <img
                            src={voucher.image}
                            alt={voucher.title}
                            className='w-full h-full object-cover'
                          />
                          {voucher.badge && (
                            <div className='absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1'>
                              <BadgeCheck className='w-3 h-3 text-[#006e2f]' />
                              <span className='text-xs font-semibold text-[#006e2f] font-jakarta'>
                                {voucher.badge}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className='p-5'>
                          <h4 className='font-semibold text-[#191c20] font-lexend mb-1'>
                            {voucher.title}
                          </h4>
                          <div className='flex items-center gap-2 mb-3'>
                            <span className='text-2xl font-bold text-[#006e2f] font-lexend'>
                              {voucher.points.toLocaleString('id-ID')}
                            </span>
                            <span className='text-sm text-[#6d7b6c] font-jakarta'>
                              Pts
                            </span>
                          </div>
                          <p className='text-sm text-[#6d7b6c] font-jakarta mb-4 line-clamp-2'>
                            {voucher.description}
                          </p>
                          <button
                            onClick={() => openRedeemModal(voucher)}
                            disabled={
                              totalPoints < voucher.points ||
                              voucher.stockQuantity <= 0
                            }
                            className={`w-full py-3 rounded-xl font-semibold font-jakarta transition-colors ${
                              totalPoints >= voucher.points &&
                              voucher.stockQuantity > 0
                                ? 'bg-[#006e2f] text-white hover:bg-[#005823]'
                                : 'bg-[#e5eeff] text-[#6d7b6c] cursor-not-allowed'
                            }`}
                          >
                            {voucher.stockQuantity <= 0
                              ? 'Stok Habis'
                              : totalPoints >= voucher.points
                                ? 'Tukarkan Sekarang'
                                : 'Poin Tidak Cukup'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Konten: Riwayat Penukaran */}
            {showRiwayat && (
              <div className='bg-white rounded-3xl p-6 border border-[#e5eeff] min-h-[320px]'>
                {riwayat.length === 0 ? (
                  <div className='flex flex-col items-center justify-center py-16 text-center'>
                    <Gift className='w-12 h-12 text-[#c1c9bf] mb-3' />
                    <p className='text-[#6d7b6c] font-jakarta'>
                      Belum ada riwayat penukaran.
                    </p>
                  </div>
                ) : (
                  <div className='overflow-x-auto'>
                    <table className='w-full'>
                      <thead>
                        <tr className='border-b border-[#e5eeff]'>
                          {[
                            'Voucher',
                            'Tanggal',
                            'Poin Digunakan',
                            'Status',
                            'Aksi',
                          ].map((h) => (
                            <th
                              key={h}
                              className='text-left py-3 px-4 text-xs font-semibold text-[#6d7b6c] uppercase tracking-wide font-jakarta'
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {riwayat.map((item) => (
                          <tr
                            key={item.id}
                            className='border-b border-[#e5eeff] last:border-0 hover:bg-[#f8f9ff]'
                          >
                            <td className='py-4 px-4'>
                              <div className='flex items-center gap-3'>
                                <div className='w-10 h-10 bg-[#e5eeff] rounded-xl flex items-center justify-center'>
                                  <Gift className='w-5 h-5 text-[#006e2f]' />
                                </div>
                                <div>
                                  <p className='font-semibold text-[#191c20] font-jakarta'>
                                    {item.voucher}
                                  </p>
                                  <p className='text-xs text-[#6d7b6c] font-jakarta'>
                                    Merchant ID: {item.merchantId}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className='py-4 px-4 text-[#6d7b6c] font-jakarta'>
                              {item.tanggal}
                            </td>
                            <td className='py-4 px-4'>
                              <span className='text-red-500 font-semibold font-lexend'>
                                {item.points.toLocaleString('id-ID')} Pts
                              </span>
                            </td>
                            <td className='py-4 px-4'>
                              <span
                                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold font-jakarta ${
                                  item.status === 'Berhasil'
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-gray-100 text-gray-600'
                                }`}
                              >
                                {item.status === 'Berhasil' && (
                                  <CheckCircle2 className='w-3 h-3' />
                                )}
                                {item.status}
                              </span>
                            </td>
                            <td className='py-4 px-4'>
                              <button
                                className={`text-sm font-semibold font-jakarta ${
                                  item.status === 'Berhasil'
                                    ? 'text-[#006e2f] hover:underline'
                                    : 'text-[#6d7b6c]'
                                }`}
                              >
                                {item.status === 'Berhasil'
                                  ? 'Gunakan'
                                  : 'Detail'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Redeem Confirmation Modal */}
      {showRedeemModal && selectedVoucher && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
          <div className='bg-white rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto'>
            <div className='p-6'>
              <div className='flex items-center justify-between mb-6'>
                <h3 className='text-xl font-bold text-[#191c20] font-lexend'>
                  Konfirmasi Penukaran
                </h3>
                <button
                  onClick={closeRedeemModal}
                  className='w-10 h-10 rounded-xl bg-[#f8f9ff] flex items-center justify-center hover:bg-[#e5eeff] transition-colors'
                >
                  <X className='w-5 h-5 text-[#6d7b6c]' />
                </button>
              </div>
              <div className='rounded-2xl overflow-hidden mb-4'>
                <img
                  src={selectedVoucher.image}
                  alt={selectedVoucher.title}
                  className='w-full h-48 object-cover'
                />
              </div>
              <h4 className='font-semibold text-[#191c20] font-lexend mb-1'>
                {selectedVoucher.title}
              </h4>
              <p className='text-sm text-[#6d7b6c] font-jakarta mb-4'>
                {selectedVoucher.description}
              </p>
              <div className='bg-[#f8f9ff] rounded-xl p-4 mb-6'>
                <div className='flex justify-between items-center'>
                  <span className='text-[#6d7b6c] font-jakarta'>
                    Poin yang akan digunakan:
                  </span>
                  <span className='text-xl font-bold text-[#006e2f] font-lexend'>
                    {selectedVoucher.points.toLocaleString('id-ID')} Pts
                  </span>
                </div>
                <div className='flex justify-between items-center mt-2 pt-2 border-t border-[#e5eeff]'>
                  <span className='text-[#6d7b6c] font-jakarta'>
                    Sisa poin setelahnya:
                  </span>
                  <span className='font-semibold text-[#191c20] font-lexend'>
                    {(totalPoints - selectedVoucher.points).toLocaleString(
                      'id-ID',
                    )}{' '}
                    Pts
                  </span>
                </div>
              </div>
              <div className='flex gap-3'>
                <button
                  onClick={closeRedeemModal}
                  className='flex-1 py-3 border-2 border-[#c1c9bf] text-[#6d7b6c] rounded-xl font-semibold font-jakarta hover:bg-[#f8f9ff] transition-colors'
                >
                  Batal
                </button>
                <button
                  onClick={handleConfirmRedeem}
                  disabled={isRedeeming}
                  className='flex-1 py-3 bg-[#006e2f] text-white rounded-xl font-semibold font-jakarta hover:bg-[#005823] transition-colors'
                >
                  {isRedeeming ? 'Menukar...' : 'Tukar Sekarang'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Redeem Success Modal */}
      {showSuccessModal && redeemedVoucher && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
          <div className='bg-white rounded-3xl w-full max-w-md overflow-hidden'>
            {/* Green Header */}
            <div className='bg-[#006e2f] px-6 pt-10 pb-8 flex flex-col items-center text-center relative'>
              <button
                onClick={closeSuccessModal}
                className='absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors'
              >
                <X className='w-4 h-4 text-white' />
              </button>
              <div className='w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4 shadow-lg'>
                <CheckCircle2 className='w-12 h-12 text-[#006e2f]' />
              </div>
              <div className='flex items-center gap-2 mb-2'>
                <PartyPopper className='w-5 h-5 text-yellow-300' />
                <h3 className='text-2xl font-bold text-white font-lexend'>
                  Penukaran Berhasil!
                </h3>
                <PartyPopper className='w-5 h-5 text-yellow-300 scale-x-[-1]' />
              </div>
              <p className='text-white/80 font-jakarta text-sm'>
                Selamat! Voucher kamu sudah siap digunakan.
              </p>
            </div>

            {/* Body */}
            <div className='p-6'>
              <div className='flex items-center gap-4 mb-5'>
                <div className='w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0'>
                  <img
                    src={redeemedVoucher.image}
                    alt={redeemedVoucher.title}
                    className='w-full h-full object-cover'
                  />
                </div>
                <div>
                  <p className='font-semibold text-[#191c20] font-lexend'>
                    {redeemedVoucher.title}
                  </p>
                  <div className='flex items-center gap-1 mt-1'>
                    <Gift className='w-3.5 h-3.5 text-[#006e2f]' />
                    <span className='text-xs text-[#6d7b6c] font-jakarta'>
                      {redeemedVoucher.category}
                    </span>
                  </div>
                </div>
              </div>

              <div className='bg-[#f0faf4] rounded-2xl p-4 mb-5 flex justify-between items-center'>
                <div>
                  <p className='text-xs text-[#6d7b6c] font-jakarta'>
                    Poin digunakan
                  </p>
                  <p className='text-lg font-bold text-red-500 font-lexend'>
                    -{redeemedVoucher.points.toLocaleString('id-ID')} Pts
                  </p>
                </div>
                <div className='w-px h-10 bg-[#e5eeff]' />
                <div className='text-right'>
                  <p className='text-xs text-[#6d7b6c] font-jakarta'>
                    Sisa poin kamu
                  </p>
                  <p className='text-lg font-bold text-[#006e2f] font-lexend'>
                    {(
                      redeemedVoucher.remainingPoints ?? totalPoints
                    ).toLocaleString('id-ID')}{' '}
                    Pts
                  </p>
                </div>
              </div>

              <div className='mb-6'>
                <p className='text-xs text-[#6d7b6c] font-jakarta mb-2 uppercase tracking-wide font-semibold'>
                  Kode Voucher
                </p>
                <div className='flex items-center gap-2 bg-[#f8f9ff] border-2 border-dashed border-[#006e2f]/30 rounded-xl p-3'>
                  <span className='flex-1 text-center text-lg font-bold text-[#191c20] font-lexend tracking-widest'>
                    {redeemedVoucher.code}
                  </span>
                  <button
                    onClick={handleCopyCode}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold font-jakarta transition-all ${
                      codeCopied
                        ? 'bg-green-100 text-green-700'
                        : 'bg-[#006e2f] text-white hover:bg-[#005823]'
                    }`}
                  >
                    {codeCopied ? (
                      <>
                        <Check className='w-3.5 h-3.5' /> Tersalin
                      </>
                    ) : (
                      <>
                        <Copy className='w-3.5 h-3.5' /> Salin
                      </>
                    )}
                  </button>
                </div>
                <p className='text-xs text-[#6d7b6c] font-jakarta mt-2 text-center'>
                  Tunjukkan kode ini kepada merchant untuk menggunakan voucher.
                </p>
              </div>

              <button
                onClick={closeSuccessModal}
                className='w-full py-3.5 bg-[#006e2f] text-white rounded-xl font-semibold font-jakarta hover:bg-[#005823] transition-colors'
              >
                Kembali ke Pusat Hadiah
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}