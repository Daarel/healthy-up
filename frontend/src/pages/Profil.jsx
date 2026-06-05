import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Edit2,
  Star,
  ChevronRight,
  User,
  Trash2,
  Flame as FireIcon,
  LogOut,
  Plus,
  TrendingDown,
  TrendingUp,
  Minus,
  CheckCircle2,
  Upload,
  X,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import WeightInputModal from '../components/WeightInputModal';
import Streak from '../components/ui/streak';
import { authApi, userApi, healthApi } from '../lib/api';
import { useAuth } from '../context/AuthContext';

// ─── Konstanta ────────────────────────────────────────────────────────────────
const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'Mei',
  'Jun',
  'Jul',
  'Agu',
  'Sep',
  'Okt',
  'Nov',
  'Des',
];
const fmtDate = (iso) => {
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
};
const titleCase = (value) =>
  String(value || 'Pemula')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());

// SVG chart dimensions
const SVG_W = 600;
const SVG_H = 200;
const PAD_X = 20;
const MAX_PROFILE_PHOTO_SIZE = 3 * 1024 * 1024;

export default function Profile() {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const [user, setProfileUser] = useState({
    name: '',
    email: '',
    joinDate: '',
    level: 1,
    title: 'Pemula',
    avatar: '',
    streak: 0,
    experiencePoints: 0,
    rewardPoints: 0,
    badges: [],
  });
  const [profileError, setProfileError] = useState('');
  const [isProfileLoading, setIsProfileLoading] = useState(true);

  const [caloriesBurnedThisWeek, setCaloriesBurnedThisWeek] = useState(0);
  const [calorieDailyLogs, setCalorieDailyLogs] = useState([]);

  // ─── Weight log state (TODO: fetch GET /api/weight-logs) ──────────────────
  // Struktur tiap item: { id, date (ISO string), weight (number), note (string) }
  const [weightLog, setWeightLog] = useState([]);

  // ─── UI state ─────────────────────────────────────────────────────────────
  const [chartPeriod, setChartPeriod] = useState('mingguan');
  const [showWeightModal, setShowWeightModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLevelingUp, setIsLevelingUp] = useState(false);
  const [isUpdatingPicture, setIsUpdatingPicture] = useState(false);
  const [showPictureModal, setShowPictureModal] = useState(false);
  const [selectedPicture, setSelectedPicture] = useState(null);
  const [selectedPicturePreview, setSelectedPicturePreview] = useState('');
  const [pictureError, setPictureError] = useState('');

  useEffect(() => {
    let ignore = false;

    const loadProfile = async () => {
      setIsProfileLoading(true);
      setProfileError('');
      try {
        const res = await userApi.getMe();
        const backendUser = res.data.user;
        if (ignore) return;

        setProfileUser({
          name: backendUser.username || '',
          email: backendUser.email || '',
          joinDate: '',
          level: backendUser.level ?? 1,
          title: titleCase(backendUser.rankTitle),
          avatar: backendUser.profilePicture || '/profile/avatar.png',
          streak: backendUser.streakCount ?? 0,
          experiencePoints: backendUser.experiencePoints ?? 0,
          rewardPoints: backendUser.rewardPoints ?? 0,
          badges: backendUser.badges ?? [],
        });
        setUser({
          username: backendUser.username,
          email: backendUser.email,
        });
      } catch (err) {
        if (ignore) return;
        setProfileError(err.message || 'Gagal memuat profil.');
      } finally {
        if (!ignore) setIsProfileLoading(false);
      }
    };

    const loadCalorieLogs = async () => {
      try {
        const res = await healthApi.getCalorieLogs();
        if (ignore) return;

        // backend returns: { status, data: { weeklyBurnedFromLog, dailyLogs } }
        const dataKalori = res.data || {};

        setCaloriesBurnedThisWeek(dataKalori.weeklyBurnedFromLog || 0);
        setCalorieDailyLogs(dataKalori.dailyLogs || []);
      } catch (err) {
        if (!ignore) console.error('Gagal memuat data kalori:', err);
      }
    };

    loadCalorieLogs();

    loadProfile();
    return () => {
      ignore = true;
    };
  }, [setUser]);

  useEffect(() => {
    let ignore = false;

    const loadWeightLogs = async () => {
      try {
        // Tentukan parameter range berdasarkan state chartPeriod
        const range = chartPeriod === 'mingguan' ? 'week' : 'month';

        // Memanggil API dengan parameter range yang dinamis
        const resLogs = await healthApi.getWeightLogs(range);
        const rawLogs = resLogs.data?.weightLogs || [];

        if (ignore) return;

        const fetchedLogs = rawLogs
          .filter((log) => log.weight > 0)
          .map((log) => ({
            id: log.id || Math.random().toString(),
            date: log.loggedAt || log.date,
            weight: log.weight,
            note: log.note || '',
          }));

        setWeightLog(fetchedLogs);
      } catch (logErr) {
        if (!ignore) console.error('Gagal memuat riwayat berat badan:', logErr);
      }
    };

    loadWeightLogs();
    return () => {
      ignore = true;
    };
  }, [chartPeriod]);

  // ─── Derived values ───────────────────────────────────────────────────────
  const hasLog = weightLog.length > 0;
  const latestEntry = hasLog ? weightLog[weightLog.length - 1] : null;
  const firstEntry = hasLog ? weightLog[0] : null;
  const prevEntry =
    weightLog.length >= 2 ? weightLog[weightLog.length - 2] : null;
  const currentWeight = latestEntry?.weight ?? 0;
  const weightDiff = prevEntry
    ? +(currentWeight - prevEntry.weight).toFixed(1)
    : 0;

  // ─── Chart helpers ────────────────────────────────────────────────────────
  const chartEntries =
    chartPeriod === 'mingguan' ? weightLog.slice(-7) : weightLog;
  const hasChart = chartEntries.length >= 2;
  const chartMin = hasChart
    ? Math.floor(Math.min(...chartEntries.map((e) => e.weight)) - 2)
    : 0;
  const chartMax = hasChart
    ? Math.ceil(Math.max(...chartEntries.map((e) => e.weight)) + 2)
    : 10;
  const chartRange = chartMax - chartMin || 1;

  const toY = (w) => SVG_H - ((w - chartMin) / chartRange) * (SVG_H - 20) - 10;
  const toX = (i) =>
    PAD_X + (i / Math.max(chartEntries.length - 1, 1)) * (SVG_W - PAD_X * 2);

  const points = chartEntries.map((e, i) => [toX(i), toY(e.weight)]);
  const linePath = points
    .map((p, i) => (i === 0 ? `M ${p[0]} ${p[1]}` : `L ${p[0]} ${p[1]}`))
    .join(' ');
  const areaPath = hasChart
    ? linePath +
      ` L ${points[points.length - 1][0]} ${SVG_H} L ${points[0][0]} ${SVG_H} Z`
    : '';

  // ─── Handlers ─────────────────────────────────────────────────────────────
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await authApi.logout();
    } catch {
      // Tetap logout dari sisi client meski server error
    } finally {
      setIsLoggingOut(false);
      setUser(null);
      navigate('/login');
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'Hapus akun dan seluruh data secara permanen?',
    );
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      await userApi.deleteMe();
    } catch {
      // Tetap keluarkan user karena token client sudah dibersihkan oleh API client.
    } finally {
      setIsDeleting(false);
      setUser(null);
      navigate('/login');
    }
  };

  const handleLevelUp = async () => {
    setIsLevelingUp(true);
    setProfileError('');

    try {
      const res = await userApi.levelUp();
      const updatedUser = res.data.user;
      setProfileUser((prev) => ({
        ...prev,
        name: updatedUser.username || prev.name,
        level: updatedUser.level ?? prev.level,
        title: titleCase(updatedUser.rankTitle || prev.title),
        experiencePoints: updatedUser.experiencePoints ?? prev.experiencePoints,
        badges: updatedUser.badges ?? prev.badges,
      }));
    } catch (err) {
      setProfileError(err.message || 'Gagal memproses kenaikan level.');
    } finally {
      setIsLevelingUp(false);
    }
  };

  const closePictureModal = () => {
    if (isUpdatingPicture) return;
    setShowPictureModal(false);
    setSelectedPicture(null);
    setSelectedPicturePreview('');
    setPictureError('');
  };

  const handlePictureChange = (event) => {
    const file = event.target.files?.[0];
    setSelectedPicture(null);
    setSelectedPicturePreview('');
    setPictureError('');

    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setPictureError('File harus berupa gambar.');
      return;
    }
    if (file.size > MAX_PROFILE_PHOTO_SIZE) {
      setPictureError('Ukuran foto maksimal 3 MB.');
      return;
    }

    setSelectedPicture(file);
    setSelectedPicturePreview(URL.createObjectURL(file));
  };

  const handleUpdatePicture = async () => {
    if (!selectedPicture) {
      setPictureError('Pilih foto dari perangkat terlebih dahulu.');
      return;
    }

    setIsUpdatingPicture(true);
    setProfileError('');
    setPictureError('');

    try {
      const res = await userApi.updatePicture(selectedPicture);
      const updatedUser = res.data.user;
      setProfileUser((prev) => ({
        ...prev,
        name: updatedUser.username || prev.name,
        avatar: updatedUser.profilePicture || prev.avatar,
      }));
      closePictureModal();
    } catch (err) {
      setPictureError(err.message || 'Gagal memperbarui foto profil.');
    } finally {
      setIsUpdatingPicture(false);
    }
  };

  // TODO: ganti dengan POST /api/weight-logs, lalu update weightLog dari response
  const handleWeightSuccess = async (value, note) => {
    try {
      const payload = { weight: value };

      const res = await healthApi.createWeightLog(payload);

      const newLog = res.data?.weightLog || {};
      const today = newLog.loggedAt
        ? new Date(newLog.loggedAt).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0];

      setWeightLog((prev) => [
        ...prev,
        {
          id: newLog.id || Date.now(),
          date: today,
          weight: value,
          note: note ?? '',
        },
      ]);

      setShowWeightModal(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Gagal mencatat berat badan:', error);
      alert(
        error.message ||
          'Gagal mencatat berat badan ke server. Silakan coba lagi.',
      );
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className='min-h-screen bg-[var(--color-bg)]'>
      <Navbar />

      <main className='lg:ml-72 pb-20 lg:pb-0'>
        <div className='p-6 lg:p-8 max-w-6xl mx-auto'>
          {/* Toast sukses */}
          {showSuccess && (
            <div className='fixed top-6 right-6 z-50 flex items-center gap-3 bg-white border border-green-200 shadow-lg rounded-2xl px-5 py-4'>
              <CheckCircle2 className='w-5 h-5 text-[#006e2f] flex-shrink-0' />
              <p className='font-jakarta text-sm text-[#191c20]'>
                Berat badan berhasil dicatat!
              </p>
            </div>
          )}

          {profileError && (
            <div className='mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600 font-jakarta'>
              {profileError}
            </div>
          )}

          {/* Profile Header */}
          <div className='bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgba(34,197,94,0.08)] border border-[#e5eeff] mb-8'>
            <div className='flex flex-col lg:flex-row lg:items-center gap-6'>
              {/* Avatar */}
              <div className='relative'>
                <div className='w-24 h-24 rounded-2xl overflow-hidden border-4 border-[#e5eeff]'>
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className='w-full h-full object-cover'
                  />
                </div>
                <button
                  type='button'
                  onClick={handleUpdatePicture}
                  disabled={isUpdatingPicture}
                  aria-label='Edit foto profil'
                  className='absolute -bottom-2 -right-2 w-8 h-8 bg-[#006e2f] text-white rounded-lg flex items-center justify-center hover:bg-[#005823] transition-colors disabled:opacity-60'
                >
                  <Edit2 className='w-4 h-4' />
                </button>
              </div>

              {/* Info */}
              <div className='flex-1'>
                <div className='flex flex-col lg:flex-row lg:items-center gap-4 lg:gap-6'>
                  <div>
                    <h1 className='text-2xl lg:text-3xl font-bold text-[#191c20] font-lexend'>
                      {isProfileLoading ? 'Memuat profil...' : user.name || '—'}
                    </h1>
                    <p className='text-[#6d7b6c] font-jakarta'>
                      {user.email ||
                        (user.joinDate
                          ? `Bergabung sejak ${user.joinDate}`
                          : '')}
                    </p>
                  </div>
                  <div className='flex items-center gap-2 bg-yellow-50 px-4 py-1 rounded-full w-fit'>
                    <Star className='w-4 h-4 text-yellow-500' />
                    <span className='text-xs font-semibold text-yellow-700 font-jakarta'>
                      Level {user.level} - {user.title}
                    </span>
                  </div>
                  <button
                    type='button'
                    onClick={handleLevelUp}
                    disabled={isLevelingUp}
                    className='px-4 py-2 rounded-xl bg-[#006e2f] text-white text-sm font-semibold font-jakarta hover:bg-[#005823] transition-colors disabled:opacity-60'
                  >
                    {isLevelingUp ? 'Memproses...' : 'Naik Level'}
                  </button>
                </div>
              </div>

              {/* Streak & Actions */}
              <div className='flex flex-col sm:flex-row items-start sm:items-center gap-4'>
                <div className='flex items-center gap-2 bg-orange-50 px-4 py-2 rounded-xl'>
                  <Streak count={user.streak} variant='compact' />
                </div>
                <div className='flex flex-col text-sm font-jakarta text-[#6d7b6c]'>
                  <span>
                    {user.experiencePoints.toLocaleString('id-ID')} EXP
                  </span>
                  <span>
                    {user.rewardPoints.toLocaleString('id-ID')} poin hadiah
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Catat Berat Badan Banner */}
          <div className='bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgba(34,197,94,0.08)] border border-[#e5eeff] mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4'>
            <div>
              <p className='font-semibold text-[#191c20] font-lexend'>
                Catat Berat Badan Minggu Ini
              </p>
              <p className='text-sm text-[#6d7b6c] font-jakarta'>
                {latestEntry ? (
                  <>
                    Terakhir dicatat:{' '}
                    <span className='font-semibold text-[#191c20]'>
                      {currentWeight} kg
                    </span>{' '}
                    pada {fmtDate(latestEntry.date)}
                  </>
                ) : (
                  'Belum ada catatan berat badan.'
                )}
              </p>
            </div>
            <button
              onClick={() => setShowWeightModal(true)}
              data-testid='btn-catat-berat'
              className='flex items-center gap-2 px-5 py-3 bg-[#006e2f] text-white rounded-xl hover:bg-[#005823] transition-colors font-semibold font-jakarta whitespace-nowrap'
            >
              <Plus className='w-4 h-4' />
              Tambah Berat
            </button>
          </div>

          {/* Stats & Chart Section */}
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8'>
            {/* Weight Chart */}
            <div className='lg:col-span-2 bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgba(34,197,94,0.08)] border border-[#e5eeff]'>
              <div className='flex items-center justify-between mb-6'>
                <div>
                  <h3 className='text-lg font-bold text-[#191c20] font-lexend'>
                    Riwayat Berat Badan
                  </h3>
                  <p className='text-sm text-[#6d7b6c] font-jakarta'>
                    {chartEntries.length} entri terakhir
                  </p>
                </div>
                <div className='flex gap-2'>
                  {['mingguan', 'bulanan'].map((period) => (
                    <button
                      key={period}
                      onClick={() => setChartPeriod(period)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium font-jakarta transition-colors ${
                        chartPeriod === period
                          ? 'bg-[#006e2f] text-white'
                          : 'bg-[#f8f9ff] text-[#6d7b6c] hover:bg-[#e5eeff]'
                      }`}
                    >
                      {period === 'mingguan' ? 'Mingguan' : 'Bulanan'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chart */}
              {hasChart ? (
                <div className='relative h-48 mb-6'>
                  <svg
                    viewBox={`0 0 ${SVG_W} ${SVG_H}`}
                    className='w-full h-full'
                    preserveAspectRatio='none'
                  >
                    <defs>
                      <linearGradient
                        id='chartGradient'
                        x1='0%'
                        y1='0%'
                        x2='0%'
                        y2='100%'
                      >
                        <stop
                          offset='0%'
                          stopColor='#22c55e'
                          stopOpacity='0.25'
                        />
                        <stop
                          offset='100%'
                          stopColor='#22c55e'
                          stopOpacity='0.02'
                        />
                      </linearGradient>
                    </defs>
                    <path d={areaPath} fill='url(#chartGradient)' />
                    <path
                      d={linePath}
                      fill='none'
                      stroke='#006e2f'
                      strokeWidth='3'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                    {points.map(([x, y], i) => (
                      <g key={i}>
                        <circle
                          cx={x}
                          cy={y}
                          r='8'
                          fill='#006e2f'
                          stroke='white'
                          strokeWidth='3'
                        />
                        <circle cx={x} cy={y} r='4' fill='white' />
                      </g>
                    ))}
                  </svg>
                  <div className='flex justify-between text-xs text-[#6d7b6c] font-jakarta mt-2 px-1'>
                    {chartEntries.map((e, i) => (
                      <span key={i}>{fmtDate(e.date)}</span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className='flex flex-col items-center justify-center h-48 mb-6 text-center'>
                  <p className='text-[#6d7b6c] font-jakarta text-sm'>
                    Belum cukup data untuk menampilkan grafik.
                  </p>
                </div>
              )}

              {/* Weight Stats */}
              <div className='grid grid-cols-2 gap-4'>
                <div className='text-center p-4 border border-[#e5eeff] rounded-2xl'>
                  <p className='text-xs text-[#6d7b6c] font-jakarta mb-1'>
                    Berat Awal
                  </p>
                  <p className='text-xl font-bold text-[#191c20] font-lexend'>
                    {firstEntry ? `${firstEntry.weight} kg` : '—'}
                  </p>
                </div>
                <div className='text-center p-4 border border-[#e5eeff] rounded-2xl'>
                  <p className='text-xs text-green-600 font-jakarta mb-1'>
                    Sekarang
                  </p>
                  <p className='text-xl font-bold text-green-700 font-lexend'>
                    {latestEntry ? `${currentWeight} kg` : '—'}
                  </p>
                  {prevEntry && (
                    <p
                      className={`text-xs mt-1 font-jakarta flex items-center justify-center gap-0.5 ${
                        weightDiff < 0
                          ? 'text-green-600'
                          : weightDiff > 0
                            ? 'text-orange-500'
                            : 'text-[#6d7b6c]'
                      }`}
                    >
                      {weightDiff < 0 ? (
                        <TrendingDown className='w-3 h-3' />
                      ) : weightDiff > 0 ? (
                        <TrendingUp className='w-3 h-3' />
                      ) : (
                        <Minus className='w-3 h-3' />
                      )}
                      {weightDiff > 0 ? '+' : ''}
                      {weightDiff} kg
                    </p>
                  )}
                </div>
              </div>

              {/* Log Riwayat Terakhir */}
              {hasLog && (
                <div className='mt-6 border-t border-[#e5eeff] pt-4'>
                  <p className='text-sm font-semibold text-[#191c20] font-lexend mb-3'>
                    Catatan Terakhir
                  </p>
                  <div className='space-y-2 max-h-36 overflow-y-auto pr-1'>
                    {[...weightLog].reverse().map((entry) => (
                      <div
                        key={entry.id}
                        className='flex items-center justify-between py-2 px-3 rounded-xl hover:bg-[#f8f9ff] transition-colors'
                      >
                        <div>
                          <p className='text-sm font-semibold text-[#191c20] font-lexend'>
                            {entry.weight} kg
                          </p>
                          {entry.note && (
                            <p className='text-xs text-[#6d7b6c] font-jakarta'>
                              {entry.note}
                            </p>
                          )}
                        </div>
                        <p className='text-xs text-[#6d7b6c] font-jakarta'>
                          {fmtDate(entry.date)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Stats Cards */}
            <div className='space-y-4'>
              {/* Calories Card */}
              <div className='bg-[#006e2f] rounded-3xl p-6 text-white'>
                <div className='w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4'>
                  <FireIcon className='w-6 h-6' />
                </div>
                <h4 className='text-sm font-medium text-white/80 font-jakarta'>
                  Kalori Terbakar
                </h4>
                <p className='text-2xl font-bold font-lexend mt-1'>
                  {caloriesBurnedThisWeek.toLocaleString('id-ID')}
                </p>
                <p className='text-sm text-white/70 font-jakarta mt-1'>
                  Minggu ini
                </p>
              </div>
            </div>
          </div>

          {/* Settings Section */}
          <div className='bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgba(34,197,94,0.08)] border border-[#e5eeff]'>
            <h3 className='text-lg font-bold text-[#191c20] font-lexend mb-4'>
              Pengaturan Akun
            </h3>
            <div className='space-y-1'>
              {/* Informasi Pribadi */}
              <button
                onClick={() => {}}
                className='w-full flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-[#f8f9ff] transition-colors text-left'
              >
                <User className='w-5 h-5 text-[#6d7b6c] flex-shrink-0' />
                <span className='flex-1 font-jakarta text-[#191c20]'>
                  Informasi Pribadi
                </span>
                <ChevronRight className='w-4 h-4 text-[#c1c9bf]' />
              </button>

              {/* Logout */}
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className='w-full flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-orange-50 transition-colors text-left disabled:opacity-60'
              >
                <LogOut className='w-5 h-5 text-orange-500 flex-shrink-0' />
                <span className='flex-1 font-jakarta text-orange-600'>
                  {isLoggingOut ? 'Keluar...' : 'Keluar'}
                </span>
                <ChevronRight className='w-4 h-4 text-orange-300' />
              </button>

              {/* Hapus Akun */}
              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className='w-full flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-red-50 transition-colors text-left disabled:opacity-60'
              >
                <Trash2 className='w-5 h-5 text-red-500 flex-shrink-0' />
                <span className='flex-1 font-jakarta text-red-500'>
                  {isDeleting ? 'Menghapus akun...' : 'Hapus Akun'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Weight Input Modal */}
      <WeightInputModal
        isOpen={showWeightModal}
        onClose={() => setShowWeightModal(false)}
        onSuccess={handleWeightSuccess}
        currentWeight={currentWeight}
        allowNote={true}
        allowMultiplePerDay={true}
      />

      {showPictureModal && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4'>
          <div className='w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl'>
            <div className='mb-5 flex items-start justify-between gap-4'>
              <div>
                <h2 className='font-lexend text-xl font-bold text-[#191c20]'>
                  Tambah Foto Profil
                </h2>
                <p className='mt-1 font-jakarta text-sm text-[#6d7b6c]'>
                  Pilih foto dari file lokal perangkatmu. Foto maksimal 3 MB.
                </p>
              </div>
              <button
                type='button'
                onClick={closePictureModal}
                disabled={isUpdatingPicture}
                aria-label='Tutup modal foto profil'
                className='rounded-xl p-2 text-[#6d7b6c] transition-colors hover:bg-[#f8f9ff] disabled:opacity-60'
              >
                <X className='h-5 w-5' />
              </button>
            </div>

            <label className='flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#c8d8c7] bg-[#f8f9ff] px-5 py-8 text-center transition-colors hover:border-[#006e2f] hover:bg-green-50'>
              {selectedPicturePreview ? (
                <img
                  src={selectedPicturePreview}
                  alt='Preview foto profil'
                  className='mb-4 h-28 w-28 rounded-2xl object-cover'
                />
              ) : (
                <div className='mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[#006e2f] shadow-sm'>
                  <Upload className='h-6 w-6' />
                </div>
              )}
              <span className='font-jakarta text-sm font-semibold text-[#191c20]'>
                {selectedPicture
                  ? selectedPicture.name
                  : 'Klik untuk pilih foto'}
              </span>
              <span className='mt-1 font-jakarta text-xs text-[#6d7b6c]'>
                Format gambar, maksimal 3 MB
              </span>
              <input
                type='file'
                accept='image/*'
                onChange={handlePictureChange}
                className='sr-only'
              />
            </label>

            {pictureError && (
              <p className='mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 font-jakarta text-sm text-red-600'>
                {pictureError}
              </p>
            )}

            <div className='mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end'>
              <button
                type='button'
                onClick={closePictureModal}
                disabled={isUpdatingPicture}
                className='rounded-xl border border-[#e5eeff] px-5 py-3 font-jakarta text-sm font-semibold text-[#191c20] transition-colors hover:bg-[#f8f9ff] disabled:opacity-60'
              >
                Batal
              </button>
              <button
                type='button'
                onClick={handleUpdatePicture}
                disabled={isUpdatingPicture || !selectedPicture}
                className='rounded-xl bg-[#006e2f] px-5 py-3 font-jakarta text-sm font-semibold text-white transition-colors hover:bg-[#005823] disabled:opacity-60'
              >
                {isUpdatingPicture ? 'Menyimpan...' : 'Simpan Foto'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
