/* eslint-disable no-unused-vars */

import { useEffect, useRef, useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Star,
  Upload,
  Eye,
  Circle,
  Inbox,
  HelpCircle,
  X,
  CloudUpload,
  Camera,
  Clapperboard,
  Lightbulb,
  ClipboardList,
  // icon misi dari backend
  Brain,
  Dumbbell,
  UtensilsCrossed,
  Apple,
  Footprints,
  Moon,
  Droplets,
  Activity,
  Flame,
  Heart,
  Wind,
  Bike,
  Salad,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import SetupTargetModal from '../components/SetupTargetModal';
import { missionApi, healthApi } from '../lib/api';

// Map nama icon dari backend → Lucide component
const ICON_MAP = {
  brain: Brain,
  'biceps-flexed': Dumbbell,
  dumbbell: Dumbbell,
  utensils: UtensilsCrossed,
  apple: Apple,
  footprints: Footprints,
  moon: Moon,
  droplets: Droplets,
  activity: Activity,
  flame: Flame,
  heart: Heart,
  wind: Wind,
  bike: Bike,
  salad: Salad,
};

// Warna icon berdasarkan kategori
const CATEGORY_ICON_COLOR = {
  physical: 'text-orange-500',
  mental: 'text-purple-500',
  nutrition: 'text-green-600',
};

function getTaskIcon(iconName, category) {
  return ICON_MAP[iconName?.toLowerCase()] ?? ICON_MAP[category] ?? Activity;
}

export default function Tugas() {
  // Baca dari localStorage — key yang sama dengan Dashboard
  const [setupDone, setSetupDone] = useState(() => {
    try {
      return localStorage.getItem('healthyup:setupDone') === 'true';
    } catch {
      return false;
    }
  });

  const [weightData] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('healthyup:weightLog'));
      const onboardingWeight =
        JSON.parse(sessionStorage.getItem('healthyup:register'))?.weight ?? 0;
      return {
        currentWeight: stored?.currentWeight ?? onboardingWeight,
        targetWeight: stored?.targetWeight ?? 0,
      };
    } catch {
      return { currentWeight: 0, targetWeight: 0 };
    }
  });

  // --- State dari API ---
  const [tasks, setTasks] = useState([]); // flat array dari backend
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const hasFetched = useRef(false);

  // Fetch misi saat komponen mount
  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    missionApi
      .getAll()
      .then((res) => setTasks(res.data.missions))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const hasTasks = tasks.length > 0;

  const [showSetupModal, setShowSetupModal] = useState(false);

  // Setelah setup selesai: simpan health profile ke backend, lalu generate misi via AI
  const handleSetupConfirm = async ({
    gender,
    age,
    height,
    currentWeight: newWeight,
    targetWeight: newTarget,
  }) => {
    // Simpan ke localStorage dulu
    try {
      localStorage.setItem('healthyup:setupDone', 'true');
      localStorage.removeItem('healthyup:newUser');
      const stored =
        JSON.parse(localStorage.getItem('healthyup:weightLog')) ?? {};
      localStorage.setItem(
        'healthyup:weightLog',
        JSON.stringify({
          ...stored,
          currentWeight: newWeight,
          previousWeight: stored.currentWeight ?? newWeight,
          targetWeight: newTarget,
        }),
      );
    } catch (err) {
      console.error(err);
    }

    setSetupDone(true);
    setLoading(true);
    setError(null);

    try {
      // 1. Simpan health profile ke backend dulu
      await healthApi.createProfile({
        gender,
        age,
        heightCm: height,
        weightKg: newWeight,
        goalWeight: newTarget,
      });
    } catch (profileErr) {
      // Jika profil sudah ada (PROFILE_ALREADY_EXISTS), abaikan dan lanjut generate
      // Jika error lain, tampilkan ke user
      const isAlreadyExists =
        profileErr.message?.toLowerCase().includes('sudah') ||
        profileErr.message?.toLowerCase().includes('already');
      if (!isAlreadyExists) {
        setError(`Gagal menyimpan profil: ${profileErr.message}`);
        setLoading(false);
        return;
      }
    }

    try {
      // 2. Generate misi via AI
      await missionApi.generate();
      // 3. Ambil misi yang baru dibuat
      const res = await missionApi.getAll();
      setTasks(res.data.missions);
      return res.data.missions;
    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const [activeTab, setActiveTab] = useState('hari-ini');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [guideModalOpen, setGuideModalOpen] = useState(false);
  const [guidePage, setGuidePage] = useState(0);
  const [selectedTask, setSelectedTask] = useState(null);
  const [uploadedProofs, setUploadedProofs] = useState({});
  const [previewMedia, setPreviewMedia] = useState([]);
  const [notes, setNotes] = useState('');

  // --- Detail Drawer ---
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailTask, setDetailTask] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const openDetail = async (task) => {
    setDetailTask(task); // tampilkan data ringkas dulu
    setDetailOpen(true);
    setDetailLoading(true);
    try {
      const res = await missionApi.getById(task.id);
      setDetailTask(res.data.mission);
    } catch (err) {
      console.error(err);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetail = () => {
    setDetailOpen(false);
    setDetailTask(null);
  };

  // Semua tugas dari API (flat array)
  const currentTasks = tasks;
  const completedCount = currentTasks.filter(
    (t) => t.status === 'completed',
  ).length;
  const totalPoints = currentTasks
    .filter((t) => t.status === 'completed')
    .reduce((sum, t) => sum + (t.pointsReward ?? 0), 0);
  const totalXp = currentTasks
    .filter((t) => t.status === 'completed')
    .reduce((sum, t) => sum + (t.xpReward ?? 0), 0);

  // Tandai tugas selesai secara optimistic (UI langsung berubah, konfirmasi via upload bukti)
  const toggleTask = (taskId) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              status: t.status === 'completed' ? 'assigned' : 'completed',
            }
          : t,
      ),
    );
  };

  const openUploadModal = (task) => {
    setSelectedTask(task);
    setUploadModalOpen(true);
    setPreviewMedia([]);
    setNotes('');
  };

  const closeUploadModal = () => {
    setUploadModalOpen(false);
    setSelectedTask(null);
    setPreviewMedia([]);
    setNotes('');
  };

  const handleFileChange = (e) => {
    Array.from(e.target.files).forEach((file) => {
      const isVideo = file.type.startsWith('video/');
      const isImage = file.type.startsWith('image/');
      if (!isVideo && !isImage) return;

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewMedia((prev) => [
          ...prev,
          {
            id: Date.now() + Math.random(),
            src: reader.result,
            type: isVideo ? 'video' : 'image',
            name: file.name,
            file, // simpan raw File untuk dikirim ke API
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeMedia = (id) => {
    setPreviewMedia((prev) => prev.filter((m) => m.id !== id));
  };

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const handleSubmitProof = async () => {
    if (!selectedTask || previewMedia.length === 0) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      // Kirim file pertama sebagai bukti ke backend
      const proofFile = previewMedia[0]?.file ?? null;
      await missionApi.updateStatus(selectedTask.id, 'completed', proofFile);

      // Update state lokal setelah berhasil
      setUploadedProofs((prev) => ({
        ...prev,
        [selectedTask.id]: {
          media: previewMedia,
          notes,
          timestamp: new Date().toLocaleString('id-ID'),
        },
      }));

      // Optimistic update status di state
      setTasks((prev) =>
        prev.map((t) =>
          t.id === selectedTask.id ? { ...t, status: 'completed' } : t,
        ),
      );

      closeUploadModal();
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProof = (taskId) => {
    setUploadedProofs((prev) => {
      const next = { ...prev };
      delete next[taskId];
      return next;
    });
    // Batalkan status selesai jika bukti dihapus (hanya di UI lokal)
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: 'assigned' } : t)),
    );
    closeUploadModal();
  };

  const hasProof = (taskId) => Boolean(uploadedProofs[taskId]);

  return (
    <div className='min-h-screen bg-[var(--color-bg)]'>
      <Navbar />

      {/* Main Content */}
      <main className='lg:ml-72 pb-20 lg:pb-0'>
        <div className='p-6 lg:p-8 max-w-5xl mx-auto'>
          {/* Header */}
          <div className='flex items-center justify-between mb-8'>
            <div>
              <h1 className='text-2xl lg:text-3xl font-bold text-[#191c20] font-lexend'>
                Tugas & Tantangan
              </h1>
              <p className='text-[#6d7b6c] font-jakarta mt-1'>
                Selesaikan tugas mingguan untuk mendapatkan poin dan capai
                target
              </p>
            </div>
            <div className='hidden sm:flex items-center gap-2 bg-white border border-[#e5eeff] rounded-2xl px-4 py-2 shadow-sm'>
              <Clock className='w-4 h-4 text-[#006e2f]' />
              <span className='text-xs text-[#6d7b6c] font-jakarta'>
                Diperbarui setiap minggu
              </span>
            </div>
          </div>

          {/* Konten utama atau empty state */}
          {loading ? (
            // Loading skeleton
            <div className='flex flex-col items-center justify-center py-20 text-center'>
              <div className='w-12 h-12 border-4 border-[#006e2f] border-t-transparent rounded-full animate-spin mb-4' />
              <p className='text-[#6d7b6c] font-jakarta'>Memuat tugas...</p>
            </div>
          ) : error ? (
            // Error state
            <div className='flex flex-col items-center justify-center py-20 text-center'>
              <div className='w-20 h-20 rounded-3xl bg-red-50 flex items-center justify-center mb-5'>
                <ClipboardList className='w-10 h-10 text-red-400' />
              </div>
              <h2 className='text-xl font-bold text-[#191c20] font-lexend mb-2'>
                Gagal memuat tugas
              </h2>
              <p className='text-[#6d7b6c] font-jakarta max-w-xs leading-relaxed'>
                {error}
              </p>
              <button
                onClick={() => {
                  setLoading(true);
                  setError(null);
                  missionApi
                    .getAll()
                    .then((r) => setTasks(r.data.missions))
                    .catch((e) => setError(e.message))
                    .finally(() => setLoading(false));
                }}
                className='mt-6 px-6 py-3 bg-[#006e2f] text-white rounded-xl font-semibold font-lexend hover:bg-[#005823] transition-colors'
              >
                Coba Lagi
              </button>
            </div>
          ) : !hasTasks ? (
            <div className='flex flex-col items-center justify-center py-20 text-center'>
              <div className='w-20 h-20 rounded-3xl bg-gray-100 flex items-center justify-center mb-5'>
                <ClipboardList className='w-10 h-10 text-[#006e2f]' />
              </div>
              <h2 className='text-xl font-bold text-[#191c20] font-lexend mb-2'>
                Belum ada tugas minggu ini
              </h2>
              <p className='text-[#6d7b6c] font-jakarta max-w-xs leading-relaxed'>
                Tugas mingguan akan muncul setelah kamu mengatur target &amp;
                profil kesehatanmu.
              </p>
              <button
                onClick={() => setShowSetupModal(true)}
                className='mt-6 px-6 py-3 bg-[#006e2f] text-white rounded-xl font-semibold font-lexend hover:bg-[#005823] transition-colors'
              >
                Atur Target Sekarang
              </button>
            </div>
          ) : (
            <>
              {/* Stats Cards */}
              <div className='grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8'>
                <div className='bg-white rounded-2xl p-4 shadow-[0_8px_30px_rgba(34,197,94,0.08)] border border-[#e5eeff]'>
                  <div className='flex items-center gap-3'>
                    <CheckCircle2 className='w-5 h-5 text-[#006e2f]' />
                    <div>
                      <p className='text-xl font-bold text-[#191c20] font-lexend'>
                        {completedCount}
                      </p>
                      <p className='text-xs text-[#6d7b6c] font-jakarta'>
                        Tugas Selesai
                      </p>
                    </div>
                  </div>
                </div>
                <div className='bg-white rounded-2xl p-4 shadow-[0_8px_30px_rgba(34,197,94,0.08)] border border-[#e5eeff]'>
                  <div className='flex items-center gap-3'>
                    <Clock className='w-5 h-5 text-orange-500' />
                    <div>
                      <p className='text-2xl font-bold text-[#191c20] font-lexend'>
                        {currentTasks.length - completedCount}
                      </p>
                      <p className='text-xs text-[#6d7b6c] font-jakarta'>
                        Tugas Tersisa
                      </p>
                    </div>
                  </div>
                </div>
                <div className='bg-white rounded-2xl p-4 shadow-[0_8px_30px_rgba(34,197,94,0.08)] border border-[#e5eeff]'>
                  <div className='flex items-center gap-3'>
                    <Star className='w-5 h-5 text-yellow-500' />
                    <div>
                      <p className='text-2xl font-bold text-[#191c20] font-lexend'>
                        {totalPoints}
                      </p>
                      <p className='text-xs text-[#6d7b6c] font-jakarta'>
                        Poin yang Akan Didapatkan
                      </p>
                    </div>
                  </div>
                </div>
                <div className='bg-white rounded-2xl p-4 shadow-[0_8px_30px_rgba(34,197,94,0.08)] border border-[#e5eeff]'>
                  <div className='flex items-center gap-3'>
                    <Flame className='w-5 h-5 text-purple-500' />
                    <div>
                      <p className='text-2xl font-bold text-[#191c20] font-lexend'>
                        {totalXp}
                      </p>
                      <p className='text-xs text-[#6d7b6c] font-jakarta'>
                        EXP yang Akan Didapatkan
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tasks List — langsung tanpa tab */}

              {/* Tasks List */}
              <div className='bg-white rounded-3xl shadow-[0_8px_30px_rgba(34,197,94,0.08)] border border-[#e5eeff] overflow-hidden'>
                {currentTasks.map((task, index) => (
                  <div
                    key={task.id}
                    className={`flex items-center gap-4 p-5 hover:bg-[#f8f9ff] transition-colors cursor-pointer ${
                      index !== currentTasks.length - 1
                        ? 'border-b border-[#e5eeff]'
                        : ''
                    }`}
                    onClick={() => openDetail(task)}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleTask(task.id);
                      }}
                      aria-label={
                        task.status === 'completed'
                          ? 'Batalkan tugas'
                          : 'Tandai selesai'
                      }
                      className={`w-12 h-12 flex-shrink-0 rounded-xl flex items-center justify-center transition-colors ${
                        task.status === 'completed'
                          ? 'bg-[#006e2f] text-white hover:bg-[#005823]'
                          : 'bg-[#e5eeff] hover:bg-[#dce9ff]'
                      }`}
                    >
                      {task.status === 'completed' ? (
                        <CheckCircle2 className='w-6 h-6' />
                      ) : (
                        (() => {
                          const IconComp = getTaskIcon(
                            task.icon,
                            task.category,
                          );
                          const colorClass =
                            CATEGORY_ICON_COLOR[task.category] ??
                            'text-[#006e2f]';
                          return (
                            <IconComp className={`w-6 h-6 ${colorClass}`} />
                          );
                        })()
                      )}
                    </button>
                    <div className='flex-1 min-w-0'>
                      <p
                        className={`font-medium font-jakarta ${
                          task.status === 'completed'
                            ? 'text-[#6d7b6c] line-through'
                            : 'text-[#191c20]'
                        }`}
                      >
                        {task.title}
                      </p>
                      {/* Kategori + Difficulty */}
                      <div className='flex items-center gap-2 mb-1'>
                        <p className='text-xs text-[#6d7b6c] font-jakarta capitalize'>
                          {task.category}
                        </p>
                        {task.difficultyScore > 0 && (
                          <span className='flex items-center gap-0.5'>
                            {Array.from({ length: 5 }).map((_, i) => (
                              <span
                                key={i}
                                className={`w-1.5 h-1.5 rounded-full ${
                                  i < task.difficultyScore
                                    ? 'bg-[#006e2f]'
                                    : 'bg-[#e5eeff]'
                                }`}
                              />
                            ))}
                          </span>
                        )}
                      </div>
                      {task.description && (
                        <p className='text-xs text-[#8f9d8e] font-jakarta leading-relaxed line-clamp-2'>
                          {task.description}
                        </p>
                      )}
                      {hasProof(task.id) && (
                        <div className='flex items-center gap-1 mt-1'>
                          <CheckCircle2 className='w-4 h-4 text-green-500' />
                          <span className='text-xs text-green-600 font-jakarta'>
                            {uploadedProofs[task.id].media.length} bukti
                            diupload
                          </span>
                        </div>
                      )}
                    </div>
                    <div className='flex flex-col items-end gap-1.5'>
                      {/* Points badge */}
                      <div className='flex items-center gap-1 bg-yellow-50 px-2.5 py-1 rounded-full'>
                        <Star className='w-3.5 h-3.5 text-yellow-500' />
                        <span className='text-xs font-semibold text-yellow-700 font-lexend'>
                          +{task.pointsReward ?? 0}
                        </span>
                      </div>
                      {/* XP badge */}
                      <div className='flex items-center gap-1 bg-purple-50 px-2.5 py-1 rounded-full'>
                        <Flame className='w-3.5 h-3.5 text-purple-500' />
                        <span className='text-xs font-semibold text-purple-700 font-lexend'>
                          +{task.xpReward ?? 0} XP
                        </span>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openUploadModal(task);
                        }}
                        disabled={task.status === 'completed'}
                        className={`flex items-center gap-1 px-3 py-2 rounded-xl font-medium text-sm font-jakarta transition-colors ${
                          task.status === 'completed'
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : hasProof(task.id)
                              ? 'bg-green-100 text-green-700 hover:bg-green-200'
                              : 'bg-[#006e2f] text-white hover:bg-[#005823]'
                        }`}
                      >
                        {hasProof(task.id) ? (
                          <Eye className='w-4 h-4' />
                        ) : (
                          <Upload className='w-4 h-4' />
                        )}
                        {hasProof(task.id) ? 'Lihat' : 'Upload'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Empty State */}
              {currentTasks.length === 0 && (
                <div className='text-center py-12'>
                  <Inbox className='w-16 h-16 text-[#c1c9bf] mx-auto mb-4' />
                  <p className='text-[#6d7b6c] font-jakarta'>
                    Tidak ada tugas di kategori ini
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* ─── Mission Detail Drawer ─── */}
      {detailOpen && detailTask && (
        <div className='fixed inset-0 z-50 flex' onClick={closeDetail}>
          {/* Backdrop */}
          <div className='absolute inset-0 bg-black/40 backdrop-blur-sm' />

          {/* Drawer dari kanan */}
          <div
            className='relative ml-auto w-full max-w-md h-full bg-white shadow-2xl overflow-y-auto flex flex-col'
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className='sticky top-0 z-10 bg-white border-b border-[#e5eeff] px-6 py-4 flex items-center justify-between'>
              <h2 className='text-lg font-bold text-[#191c20] font-lexend'>
                Detail Misi
              </h2>
              <button
                onClick={closeDetail}
                className='w-9 h-9 rounded-xl bg-[#f8f9ff] flex items-center justify-center hover:bg-[#e5eeff] transition-colors'
              >
                <X className='w-5 h-5 text-[#6d7b6c]' />
              </button>
            </div>

            {detailLoading ? (
              <div className='flex-1 flex items-center justify-center'>
                <div className='w-10 h-10 border-4 border-[#006e2f] border-t-transparent rounded-full animate-spin' />
              </div>
            ) : (
              (() => {
                const IconComp = getTaskIcon(
                  detailTask.icon,
                  detailTask.category,
                );
                const iconColor =
                  CATEGORY_ICON_COLOR[detailTask.category] ?? 'text-[#006e2f]';
                const iconBg =
                  {
                    physical: 'bg-orange-50',
                    mental: 'bg-purple-50',
                    nutrition: 'bg-green-50',
                  }[detailTask.category] ?? 'bg-[#f8f9ff]';

                const STATUS_LABEL = {
                  assigned: {
                    label: 'Belum Selesai',
                    cls: 'bg-[#e5eeff] text-[#006e2f]',
                  },
                  completed: {
                    label: 'Selesai',
                    cls: 'bg-green-100 text-green-700',
                  },
                  skipped: {
                    label: 'Dilewati',
                    cls: 'bg-gray-100 text-gray-600',
                  },
                };
                const VERIFY_LABEL = {
                  pending: {
                    label: 'Menunggu Verifikasi',
                    cls: 'bg-yellow-50 text-yellow-700',
                  },
                  approved: {
                    label: 'Disetujui',
                    cls: 'bg-green-100 text-green-700',
                  },
                  rejected: { label: 'Ditolak', cls: 'bg-red-50 text-red-600' },
                };
                const statusInfo =
                  STATUS_LABEL[detailTask.status] ?? STATUS_LABEL.assigned;
                const verifyInfo =
                  VERIFY_LABEL[detailTask.verificationStatus] ??
                  VERIFY_LABEL.pending;

                const fmtDate = (iso) =>
                  iso
                    ? new Date(iso).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })
                    : '-';
                const fmtDateTime = (iso) =>
                  iso
                    ? new Date(iso).toLocaleString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : '-';

                return (
                  <div className='flex-1 px-6 py-6 space-y-6'>
                    {/* Hero: icon + title */}
                    <div className='flex items-start gap-4'>
                      <div
                        className={`w-16 h-16 rounded-2xl ${iconBg} flex items-center justify-center flex-shrink-0`}
                      >
                        <IconComp className={`w-8 h-8 ${iconColor}`} />
                      </div>
                      <div className='flex-1'>
                        <h3 className='text-xl font-bold text-[#191c20] font-lexend leading-snug'>
                          {detailTask.title}
                        </h3>
                        <p className='text-sm text-[#6d7b6c] font-jakarta capitalize mt-1'>
                          {detailTask.category}
                        </p>
                      </div>
                    </div>

                    {/* Status badges */}
                    <div className='flex flex-wrap gap-2'>
                      <span
                        className={`text-xs font-semibold px-3 py-1 rounded-full font-jakarta ${statusInfo.cls}`}
                      >
                        {statusInfo.label}
                      </span>
                      <span
                        className={`text-xs font-semibold px-3 py-1 rounded-full font-jakarta ${verifyInfo.cls}`}
                      >
                        {verifyInfo.label}
                      </span>
                    </div>

                    {/* Description */}
                    {detailTask.description && (
                      <div className='bg-[#f8f9ff] rounded-2xl p-4 border border-[#e5eeff]'>
                        <p className='text-xs font-semibold text-[#6d7b6c] font-lexend mb-2 uppercase tracking-wide'>
                          Deskripsi
                        </p>
                        <p className='text-sm text-[#3d4a3c] font-jakarta leading-relaxed'>
                          {detailTask.description}
                        </p>
                      </div>
                    )}

                    {/* Info Grid */}
                    <div className='grid grid-cols-2 gap-3'>
                      <div className='bg-white border border-[#e5eeff] rounded-2xl p-4'>
                        <p className='text-xs text-[#6d7b6c] font-jakarta mb-1'>
                          Tingkat Kesulitan
                        </p>
                        <div className='flex items-center gap-1'>
                          {Array.from({ length: 5 }).map((_, i) => (
                            <span
                              key={i}
                              className={`w-2.5 h-2.5 rounded-full ${i < (detailTask.difficultyScore ?? 0) ? 'bg-[#006e2f]' : 'bg-[#e5eeff]'}`}
                            />
                          ))}
                          <span className='text-sm font-bold text-[#191c20] font-lexend ml-1'>
                            {detailTask.difficultyScore ?? 0}/5
                          </span>
                        </div>
                      </div>
                      <div className='bg-white border border-[#e5eeff] rounded-2xl p-4'>
                        <p className='text-xs text-[#6d7b6c] font-jakarta mb-1'>
                          Dampak Kalori
                        </p>
                        <p
                          className={`text-sm font-bold font-lexend ${(detailTask.caloriesImpact ?? 0) < 0 ? 'text-orange-500' : 'text-blue-500'}`}
                        >
                          {(detailTask.caloriesImpact ?? 0) < 0 ? '' : '+'}
                          {detailTask.caloriesImpact ?? 0} kkal
                        </p>
                      </div>
                      <div className='bg-white border border-[#e5eeff] rounded-2xl p-4'>
                        <p className='text-xs text-[#6d7b6c] font-jakarta mb-1'>
                          Tanggal Dijadwalkan
                        </p>
                        <p className='text-sm font-bold text-[#191c20] font-lexend'>
                          {fmtDate(detailTask.scheduledDate)}
                        </p>
                      </div>
                      <div className='bg-white border border-[#e5eeff] rounded-2xl p-4'>
                        <p className='text-xs text-[#6d7b6c] font-jakarta mb-1'>
                          Selesai Pada
                        </p>
                        <p className='text-sm font-bold text-[#191c20] font-lexend'>
                          {fmtDateTime(detailTask.completedAt)}
                        </p>
                      </div>
                    </div>

                    {/* Rewards */}
                    <div>
                      <p className='text-xs font-semibold text-[#6d7b6c] font-lexend mb-3 uppercase tracking-wide'>
                        Hadiah
                      </p>
                      <div className='grid grid-cols-2 gap-3'>
                        <div className='bg-yellow-50 border border-yellow-100 rounded-2xl p-4 flex items-center gap-3'>
                          <Star className='w-5 h-5 text-yellow-500' />
                          <div>
                            <p className='text-xl font-bold text-yellow-700 font-lexend'>
                              +{detailTask.pointsReward ?? 0}
                            </p>
                            <p className='text-xs text-yellow-600 font-jakarta'>
                              Poin
                            </p>
                          </div>
                        </div>
                        <div className='bg-purple-50 border border-purple-100 rounded-2xl p-4 flex items-center gap-3'>
                          <Flame className='w-5 h-5 text-purple-500' />
                          <div>
                            <p className='text-xl font-bold text-purple-700 font-lexend'>
                              +{detailTask.xpReward ?? 0}
                            </p>
                            <p className='text-xs text-purple-600 font-jakarta'>
                              EXP
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Rejection reason */}
                    {detailTask.rejectionReason && (
                      <div className='bg-red-50 rounded-2xl p-4 border border-red-100'>
                        <p className='text-xs font-semibold text-red-600 font-lexend mb-1'>
                          Alasan Penolakan
                        </p>
                        <p className='text-sm text-red-700 font-jakarta'>
                          {detailTask.rejectionReason}
                        </p>
                      </div>
                    )}

                    {/* Proof image */}
                    {detailTask.proofImagePath && (
                      <div>
                        <p className='text-xs font-semibold text-[#6d7b6c] font-lexend mb-2 uppercase tracking-wide'>
                          Bukti Upload
                        </p>
                        <img
                          src={detailTask.proofImagePath}
                          alt='Bukti misi'
                          className='w-full rounded-2xl border border-[#e5eeff] object-cover max-h-56'
                        />
                      </div>
                    )}

                    {/* Timestamps */}
                    <div className='border-t border-[#e5eeff] pt-4 space-y-1'>
                      <p className='text-xs text-[#9ca3af] font-jakarta'>
                        Dibuat: {fmtDateTime(detailTask.createdAt)}
                      </p>
                      <p className='text-xs text-[#9ca3af] font-jakarta'>
                        Diperbarui: {fmtDateTime(detailTask.updatedAt)}
                      </p>
                    </div>

                    {/* Action button */}
                    <button
                      onClick={() => {
                        closeDetail();
                        openUploadModal(detailTask);
                      }}
                      disabled={detailTask.status === 'completed'}
                      className={`w-full py-4 rounded-2xl font-semibold font-lexend flex items-center justify-center gap-2 transition-colors ${
                        detailTask.status === 'completed'
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-[#006e2f] text-white hover:bg-[#005823]'
                      }`}
                    >
                      <Upload className='w-5 h-5' />
                      {hasProof(detailTask.id)
                        ? 'Lihat / Ganti Bukti'
                        : 'Upload Bukti'}
                    </button>
                  </div>
                );
              })()
            )}
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {uploadModalOpen && selectedTask && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
          <div className='bg-white rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto'>
            {/* Modal Header */}
            <div className='flex items-center justify-between p-6 border-b border-[#e5eeff]'>
              <div>
                <h3 className='text-xl font-bold text-[#191c20] font-lexend'>
                  {hasProof(selectedTask.id) ? 'Bukti Tugas' : 'Upload Bukti'}
                </h3>
                <p className='text-sm text-[#6d7b6c] font-jakarta'>
                  {selectedTask.title}
                </p>
              </div>
              <div className='flex items-center gap-2'>
                {!hasProof(selectedTask.id) && (
                  <button
                    onClick={() => setGuideModalOpen(true)}
                    className='flex items-center gap-1 px-3 py-2 rounded-xl bg-gray-100 text-blue-600 hover:bg-blue-100 transition-colors text-sm font-medium font-jakarta'
                    title='Lihat Panduan Upload'
                  >
                    <HelpCircle className='w-4 h-4' />
                    Panduan
                  </button>
                )}
                <button
                  onClick={closeUploadModal}
                  className='w-10 h-10 rounded-xl bg-[#f8f9ff] flex items-center justify-center hover:bg-[#e5eeff] transition-colors'
                >
                  <X className='w-5 h-5 text-[#6d7b6c]' />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className='p-6'>
              {hasProof(selectedTask.id) ? (
                // View Mode - Show uploaded proof
                <div className='space-y-4'>
                  <div className='grid grid-cols-2 gap-2'>
                    {uploadedProofs[selectedTask.id].media.map((item, idx) => (
                      <div
                        key={idx}
                        className='rounded-2xl overflow-hidden border border-[#e5eeff]'
                      >
                        {item.type === 'video' ? (
                          <video
                            src={item.src}
                            controls
                            className='w-full h-32 object-cover'
                          />
                        ) : (
                          <img
                            src={item.src}
                            alt={`Bukti ${idx + 1}`}
                            className='w-full h-32 object-cover'
                          />
                        )}
                      </div>
                    ))}
                  </div>
                  {uploadedProofs[selectedTask.id].notes && (
                    <div className='bg-[#f8f9ff] rounded-xl p-4'>
                      <p className='text-sm text-[#6d7b6c] font-jakarta mb-1'>
                        Catatan:
                      </p>
                      <p className='text-[#191c20] font-jakarta'>
                        {uploadedProofs[selectedTask.id].notes}
                      </p>
                    </div>
                  )}
                  <div className='flex items-center gap-2 text-sm text-[#6d7b6c] font-jakarta'>
                    <Clock className='w-4 h-4' />
                    Diupload pada {uploadedProofs[selectedTask.id].timestamp}
                  </div>
                  <button
                    onClick={() => handleDeleteProof(selectedTask.id)}
                    className='w-full py-3 border-2 border-red-200 text-red-600 rounded-xl font-medium hover:bg-red-50 transition-colors font-jakarta'
                  >
                    Hapus Bukti
                  </button>
                </div>
              ) : (
                // Upload Mode
                <div className='space-y-4'>
                  {/* Media Upload Area */}
                  <div>
                    <label className='block text-sm font-semibold text-[#191c20] mb-2 font-lexend'>
                      Foto atau Video Bukti
                    </label>

                    {/* Preview Grid */}
                    {previewMedia.length > 0 && (
                      <div className='grid grid-cols-2 gap-2 mb-3'>
                        {previewMedia.map((item) => (
                          <div
                            key={item.id}
                            className='relative rounded-2xl overflow-hidden border border-[#e5eeff]'
                          >
                            {item.type === 'video' ? (
                              <video
                                src={item.src}
                                controls
                                className='w-full h-24 object-cover'
                              />
                            ) : (
                              <img
                                src={item.src}
                                alt={item.name}
                                className='w-full h-24 object-cover'
                              />
                            )}
                            <button
                              onClick={() => removeMedia(item.id)}
                              className='absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors'
                            >
                              <X className='w-4 h-4' />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <label className='flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-[#c1c9bf] rounded-2xl bg-[#f8f9ff] cursor-pointer hover:border-[#006e2f] hover:bg-green-50 transition-colors'>
                      <CloudUpload className='w-10 h-10 text-[#6d7b6c] mb-2' />
                      <p className='text-sm text-[#6d7b6c] font-jakarta'>
                        Klik untuk upload foto/video
                      </p>
                      <p className='text-xs text-[#9ca3af] font-jakarta mt-1'>
                        Bisa pilih lebih dari 1 file
                      </p>
                      <input
                        type='file'
                        accept='image/*,video/*'
                        multiple
                        onChange={handleFileChange}
                        className='hidden'
                      />
                    </label>
                  </div>



                  {/* Submit Error */}
                  {submitError && (
                    <p className='text-sm text-red-600 font-jakarta text-center'>
                      {submitError}
                    </p>
                  )}

                  {/* Submit Button */}
                  <button
                    onClick={handleSubmitProof}
                    disabled={previewMedia.length === 0 || submitting}
                    className={`w-full py-4 rounded-xl font-semibold font-lexend flex items-center justify-center gap-2 transition-colors ${
                      previewMedia.length > 0 && !submitting
                        ? 'bg-[#006e2f] text-white hover:bg-[#005823]'
                        : 'bg-[#e5eeff] text-[#6d7b6c] cursor-not-allowed'
                    }`}
                  >
                    {submitting ? (
                      <>
                        <span className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin' />
                        Mengirim...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className='w-5 h-5' />
                        Kirim Bukti ({previewMedia.length} file)
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Guide Modal */}
      {guideModalOpen &&
        (() => {
          const GUIDE_PAGES = [
            {
              title: 'Panduan Foto',
              icon: Camera,
              iconBg: 'bg-gray-100',
              iconColor: 'text-blue-500',
              tips: [
                'Pastikan pencahayaan cukup terang, hindari backlight',
                'Foto dari sudut yang jelas dan tidak blur',
                'Objek utama berada di tengah frame',
                'Resolusi minimal 720p agar detail terlihat',
              ],
            },
            {
              title: 'Panduan Video',
              icon: Clapperboard,
              iconBg: 'bg-gray-100',
              iconColor: 'text-purple-500',
              tips: [
                'Durasi minimal 10 detik, maksimal 60 detik',
                'Rekam dengan posisi landscape (horizontal)',
                'Pastikan suara dan gerakan terlihat jelas',
              ],
            },
            {
              title: 'Tips Tambahan',
              icon: Lightbulb,
              iconBg: 'bg-gray-100',
              iconColor: 'text-yellow-500',
              tips: [
                'Bisa upload lebih dari 1 foto/video untuk bukti yang lebih kuat',
                'Tambahkan catatan untuk menjelaskan konteks',
              ],
            },
          ];

          const page = GUIDE_PAGES[guidePage];
          const Icon = page.icon;
          const isFirst = guidePage === 0;
          const isLast = guidePage === GUIDE_PAGES.length - 1;

          return (
            <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
              <div className='bg-white rounded-3xl w-full max-w-md shadow-xl'>
                {/* Header */}
                <div className='flex items-center justify-between p-6 border-b border-[#e5eeff]'>
                  <div>
                    <h3 className='text-xl font-bold text-[#191c20] font-lexend'>
                      Panduan Upload Bukti
                    </h3>
                    <p className='text-sm text-[#6d7b6c] font-jakarta'>
                      Tips agar bukti diterima
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setGuideModalOpen(false);
                      setGuidePage(0);
                    }}
                    className='w-10 h-10 rounded-xl bg-[#f8f9ff] flex items-center justify-center hover:bg-[#e5eeff] transition-colors'
                  >
                    <X className='w-5 h-5 text-[#6d7b6c]' />
                  </button>
                </div>

                {/* Dot Indicator */}
                <div className='flex items-center justify-center gap-2 pt-5 px-6'>
                  {GUIDE_PAGES.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setGuidePage(i)}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        i === guidePage
                          ? 'w-8 bg-[#006e2f]'
                          : 'w-2 bg-[#e5eeff]'
                      }`}
                      aria-label={`Halaman ${i + 1}`}
                    />
                  ))}
                </div>

                {/* Body */}
                <div className='p-6 min-h-[260px] flex flex-col justify-between'>
                  <div>
                    {/* Topic Header */}
                    <div className='flex items-center gap-4 mb-6'>
                      <div
                        className={`w-14 h-14 rounded-2xl ${page.iconBg} flex items-center justify-center flex-shrink-0`}
                      >
                        <Icon className={`w-7 h-7 ${page.iconColor}`} />
                      </div>
                      <h4 className='text-2xl font-bold text-[#191c20] font-lexend'>
                        {page.title}
                      </h4>
                    </div>

                    {/* Tips */}
                    <ul className='space-y-4'>
                      {page.tips.map((tip, i) => (
                        <li key={i} className='flex items-start gap-3'>
                          <span className='mt-0.5 w-6 h-6 rounded-full bg-gray-100 text-[#006e2f] flex items-center justify-center text-sm font-bold font-lexend flex-shrink-0'>
                            {i + 1}
                          </span>
                          <span className='text-base text-[#3d4a3c] font-jakarta leading-relaxed'>
                            {tip}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Navigation */}
                  <div className='flex gap-3 mt-8'>
                    {!isFirst && (
                      <button
                        onClick={() => setGuidePage((p) => p - 1)}
                        className='flex-1 py-3 border-2 border-[#e5eeff] text-[#6d7b6c] rounded-xl font-semibold hover:bg-[#f8f9ff] transition-colors font-lexend'
                      >
                        ← Sebelumnya
                      </button>
                    )}
                    <button
                      onClick={() => {
                        if (isLast) {
                          setGuideModalOpen(false);
                          setGuidePage(0);
                        } else setGuidePage((p) => p + 1);
                      }}
                      className='flex-1 py-3 bg-[#006e2f] text-white rounded-xl font-semibold hover:bg-[#005823] transition-colors font-lexend'
                    >
                      {isLast ? 'Oke' : 'Selanjutnya →'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
      {/* Setup Target Modal */}
      <SetupTargetModal
        isOpen={showSetupModal}
        onClose={() => setShowSetupModal(false)}
        initialWeight={weightData.currentWeight}
        initialTarget={weightData.targetWeight}
        onConfirm={handleSetupConfirm}
      />
    </div>
  );
}
