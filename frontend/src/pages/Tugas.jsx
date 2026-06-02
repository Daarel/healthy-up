import { useState } from "react";
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
} from "lucide-react";
import Navbar from "../components/Navbar";
import SetupTargetModal from "../components/SetupTargetModal";

const INITIAL_TASKS = {
  "hari-ini": [],
  "tantangan": [
    { id: 10, title: "Turun 1kg minggu ini",            category: "Tantangan", completed: false, points: 100 },
    { id: 11, title: "Olahraga 30 hari berturut-turut", category: "Tantangan", completed: false, points: 200 },
  ],
};

export default function Tugas() {
  // Baca dari localStorage — key yang sama dengan Dashboard
  const [setupDone, setSetupDone] = useState(() => {
    try { return localStorage.getItem("healthyup:setupDone") === "true"; }
    catch { return false; }
  });

  const [weightData] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("healthyup:weightLog"));
      const onboardingWeight = JSON.parse(sessionStorage.getItem("healthyup:register"))?.weight ?? 0;
      return {
        currentWeight: stored?.currentWeight ?? onboardingWeight,
        targetWeight:  stored?.targetWeight  ?? 0,
      };
    } catch {
      return { currentWeight: 0, targetWeight: 0 };
    }
  });

  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const hasTasks = setupDone && (tasks["hari-ini"]?.length ?? 0) > 0;

  const [showSetupModal, setShowSetupModal] = useState(false);

  // Setelah setup selesai, tandai done dan isi tugas
  const handleSetupConfirm = ({ gender, age, height, currentWeight: newWeight, targetWeight: newTarget, tasks: newTasks }) => {
    try {
      localStorage.setItem("healthyup:setupDone", "true");
      localStorage.removeItem("healthyup:newUser");
      const stored = JSON.parse(localStorage.getItem("healthyup:weightLog")) ?? {};
      localStorage.setItem("healthyup:weightLog", JSON.stringify({
        ...stored,
        currentWeight: newWeight,
        previousWeight: stored.currentWeight ?? newWeight,
        targetWeight: newTarget,
      }));
    } catch {}
    setTasks(prev => ({
      ...prev,
      "hari-ini": newTasks.map(t => ({
        id: t.id,
        title: t.title,
        category: t.category,
        completed: false,
        points: t.points,
      })),
    }));
    setSetupDone(true);
    setShowSetupModal(false);
  };

  const [activeTab, setActiveTab] = useState("hari-ini");
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [guideModalOpen, setGuideModalOpen] = useState(false);
  const [guidePage, setGuidePage] = useState(0);
  const [selectedTask, setSelectedTask] = useState(null);
  const [uploadedProofs, setUploadedProofs] = useState({});
  const [previewMedia, setPreviewMedia] = useState([]);
  const [notes, setNotes] = useState("");

  const currentTasks = tasks[activeTab] || [];
  const completedCount = currentTasks.filter(t => t.completed).length;
  const totalPoints = currentTasks.filter(t => t.completed).reduce((sum, t) => sum + t.points, 0);

  // Tandai tugas selesai / batalkan
  const toggleTask = (taskId) => {
    setTasks(prev => ({
      ...prev,
      [activeTab]: prev[activeTab].map(t =>
        t.id === taskId ? { ...t, completed: !t.completed } : t
      ),
    }));
  };

  const openUploadModal = (task) => {
    setSelectedTask(task);
    setUploadModalOpen(true);
    setPreviewMedia([]);
    setNotes("");
  };

  const closeUploadModal = () => {
    setUploadModalOpen(false);
    setSelectedTask(null);
    setPreviewMedia([]);
    setNotes("");
  };

  const handleFileChange = (e) => {
    Array.from(e.target.files).forEach(file => {
      const isVideo = file.type.startsWith("video/");
      const isImage = file.type.startsWith("image/");
      if (!isVideo && !isImage) return;

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewMedia(prev => [...prev, {
          id: Date.now() + Math.random(),
          src: reader.result,
          type: isVideo ? "video" : "image",
          name: file.name,
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeMedia = (id) => {
    setPreviewMedia(prev => prev.filter(m => m.id !== id));
  };

  const handleSubmitProof = () => {
    if (!selectedTask || previewMedia.length === 0) return;

    // Simpan bukti
    setUploadedProofs(prev => ({
      ...prev,
      [selectedTask.id]: {
        media: previewMedia,
        notes,
        timestamp: new Date().toLocaleString("id-ID"),
      },
    }));

    // Tandai tugas otomatis selesai
    setTasks(prev => ({
      ...prev,
      [activeTab]: prev[activeTab].map(t =>
        t.id === selectedTask.id ? { ...t, completed: true } : t
      ),
    }));

    closeUploadModal();
  };

  const handleDeleteProof = (taskId) => {
    setUploadedProofs(prev => {
      const next = { ...prev };
      delete next[taskId];
      return next;
    });
    // Batalkan status selesai jika bukti dihapus
    setTasks(prev => ({
      ...prev,
      [activeTab]: prev[activeTab].map(t =>
        t.id === taskId ? { ...t, completed: false } : t
      ),
    }));
    closeUploadModal();
  };

  const hasProof = (taskId) => Boolean(uploadedProofs[taskId]);

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <Navbar />

      {/* Main Content */}
      <main className="lg:ml-72 pb-20 lg:pb-0">
        <div className="p-6 lg:p-8 max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-[#191c20] font-lexend">
                Tugas & Tantangan
              </h1>
              <p className="text-[#6d7b6c] font-jakarta mt-1">
                Selesaikan tugas mingguan untuk mendapatkan poin dan capai target
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-2 bg-white border border-[#e5eeff] rounded-2xl px-4 py-2 shadow-sm">
              <Clock className="w-4 h-4 text-[#006e2f]" />
              <span className="text-xs text-[#6d7b6c] font-jakarta">Diperbarui setiap minggu</span>
            </div>
          </div>

          {/* Konten utama atau empty state */}
          {!hasTasks ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 rounded-3xl bg-gray-100 flex items-center justify-center mb-5">
                <ClipboardList className="w-10 h-10 text-[#006e2f]" />
              </div>
              <h2 className="text-xl font-bold text-[#191c20] font-lexend mb-2">
                Belum ada tugas minggu ini
              </h2>
              <p className="text-[#6d7b6c] font-jakarta max-w-xs leading-relaxed">
                Tugas mingguan akan muncul setelah kamu mengatur target & profil kesehatanmu di Dashboard.
              </p>
              <button
                onClick={() => setShowSetupModal(true)}
                className="mt-6 px-6 py-3 bg-[#006e2f] text-white rounded-xl font-semibold font-lexend hover:bg-[#005823] transition-colors"
              >
                Atur Target Sekarang
              </button>
            </div>
          ) : (
          <>
          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-2xl p-4 shadow-[0_8px_30px_rgba(34,197,94,0.08)] border border-[#e5eeff]">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#006e2f]" />
                <div>
                  <p className="text-xl font-bold text-[#191c20] font-lexend">{completedCount}</p>
                  <p className="text-xs text-[#6d7b6c] font-jakarta">Tugas Selesai</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-[0_8px_30px_rgba(34,197,94,0.08)] border border-[#e5eeff]">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-orange-500" />
                <div>
                  <p className="text-2xl font-bold text-[#191c20] font-lexend">{currentTasks.length - completedCount}</p>
                  <p className="text-xs text-[#6d7b6c] font-jakarta">Tugas Tersisa</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-[0_8px_30px_rgba(34,197,94,0.08)] border border-[#e5eeff]">
              <div className="flex items-center gap-3">
                <Star className="w-5 h-5 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold text-[#191c20] font-lexend">{totalPoints}</p>
                  <p className="text-xs text-[#6d7b6c] font-jakarta">Poin Yang Akan Didapatkan</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar">
            {[
              { id: "hari-ini",   label: "Tugas Minggu Ini" },
              { id: "tantangan",  label: "Tantangan"         },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium font-jakarta whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? "bg-[#006e2f] text-white"
                    : "bg-white text-[#6d7b6c] hover:bg-[#e5eeff]"
                }`}
              >
                
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tasks List */}
          <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgba(34,197,94,0.08)] border border-[#e5eeff] overflow-hidden">
            {currentTasks.map((task, index) => (
              <div
                key={task.id}
                className={`flex items-center gap-4 p-5 hover:bg-[#f8f9ff] transition-colors ${
                  index !== currentTasks.length - 1 ? "border-b border-[#e5eeff]" : ""
                }`}
              >
                <button
                  onClick={() => toggleTask(task.id)}
                  aria-label={task.completed ? "Batalkan tugas" : "Tandai selesai"}
                  className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                    task.completed
                      ? "bg-[#006e2f] text-white hover:bg-[#005823]"
                      : "bg-[#e5eeff] text-[#6d7b6c] hover:bg-[#dce9ff]"
                  }`}
                >
                  {task.completed ? (
                    <CheckCircle2 className="w-6 h-6" />
                  ) : (
                    <Circle className="w-6 h-6" />
                  )}
                </button>
                <div className="flex-1">
                  <p
                    className={`font-medium font-jakarta ${
                      task.completed ? "text-[#6d7b6c] line-through" : "text-[#191c20]"
                    }`}
                  >
                    {task.title}
                  </p>
                  <p className="text-sm text-[#6d7b6c] font-jakarta">{task.category}</p>
                  {hasProof(task.id) && (
                    <div className="flex items-center gap-1 mt-1">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <span className="text-xs text-green-600 font-jakarta">
                        {uploadedProofs[task.id].media.length} bukti diupload
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1 rounded-full">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm font-semibold text-yellow-700 font-lexend">+{task.points}</span>
                  </div>

                  <button
                    onClick={() => openUploadModal(task)}
                    className={`flex items-center gap-1 px-3 py-2 rounded-xl font-medium text-sm font-jakarta transition-colors ${
                      hasProof(task.id)
                        ? "bg-green-100 text-green-700 hover:bg-green-200"
                        : "bg-[#006e2f] text-white hover:bg-[#005823]"
                    }`}
                  >
                    {hasProof(task.id) ? (
                      <Eye className="w-4 h-4" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                    {hasProof(task.id) ? "Lihat" : "Upload"}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {currentTasks.length === 0 && (
            <div className="text-center py-12">
              <Inbox className="w-16 h-16 text-[#c1c9bf] mx-auto mb-4" />
              <p className="text-[#6d7b6c] font-jakarta">Tidak ada tugas di kategori ini</p>
            </div>
          )}
          </>
          )}
        </div>
      </main>

      {/* Upload Modal */}
      {uploadModalOpen && selectedTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#e5eeff]">
              <div>
                <h3 className="text-xl font-bold text-[#191c20] font-lexend">
                  {hasProof(selectedTask.id) ? "Bukti Tugas" : "Upload Bukti"}
                </h3>
                <p className="text-sm text-[#6d7b6c] font-jakarta">{selectedTask.title}</p>
              </div>
              <div className="flex items-center gap-2">
                {!hasProof(selectedTask.id) && (
                  <button
                    onClick={() => setGuideModalOpen(true)}
                    className="flex items-center gap-1 px-3 py-2 rounded-xl bg-gray-100 text-blue-600 hover:bg-blue-100 transition-colors text-sm font-medium font-jakarta"
                    title="Lihat Panduan Upload"
                  >
                    <HelpCircle className="w-4 h-4" />
                    Panduan
                  </button>
                )}
                <button
                  onClick={closeUploadModal}
                  className="w-10 h-10 rounded-xl bg-[#f8f9ff] flex items-center justify-center hover:bg-[#e5eeff] transition-colors"
                >
                  <X className="w-5 h-5 text-[#6d7b6c]" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {hasProof(selectedTask.id) ? (
                // View Mode - Show uploaded proof
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    {uploadedProofs[selectedTask.id].media.map((item, idx) => (
                      <div key={idx} className="rounded-2xl overflow-hidden border border-[#e5eeff]">
                        {item.type === "video" ? (
                          <video src={item.src} controls className="w-full h-32 object-cover" />
                        ) : (
                          <img src={item.src} alt={`Bukti ${idx + 1}`} className="w-full h-32 object-cover" />
                        )}
                      </div>
                    ))}
                  </div>
                  {uploadedProofs[selectedTask.id].notes && (
                    <div className="bg-[#f8f9ff] rounded-xl p-4">
                      <p className="text-sm text-[#6d7b6c] font-jakarta mb-1">Catatan:</p>
                      <p className="text-[#191c20] font-jakarta">{uploadedProofs[selectedTask.id].notes}</p>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-[#6d7b6c] font-jakarta">
                    <Clock className="w-4 h-4" />
                    Diupload pada {uploadedProofs[selectedTask.id].timestamp}
                  </div>
                  <button
                    onClick={() => handleDeleteProof(selectedTask.id)}
                    className="w-full py-3 border-2 border-red-200 text-red-600 rounded-xl font-medium hover:bg-red-50 transition-colors font-jakarta"
                  >
                    Hapus Bukti
                  </button>
                </div>
              ) : (
                // Upload Mode
                <div className="space-y-4">
                  {/* Media Upload Area */}
                  <div>
                    <label className="block text-sm font-semibold text-[#191c20] mb-2 font-lexend">
                      Foto atau Video Bukti
                    </label>
                    
                    {/* Preview Grid */}
                    {previewMedia.length > 0 && (
                      <div className="grid grid-cols-2 gap-2 mb-3">
                        {previewMedia.map((item) => (
                          <div key={item.id} className="relative rounded-2xl overflow-hidden border border-[#e5eeff]">
                            {item.type === "video" ? (
                              <video src={item.src} controls className="w-full h-24 object-cover" />
                            ) : (
                              <img src={item.src} alt={item.name} className="w-full h-24 object-cover" />
                            )}
                            <button
                              onClick={() => removeMedia(item.id)}
                              className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-[#c1c9bf] rounded-2xl bg-[#f8f9ff] cursor-pointer hover:border-[#006e2f] hover:bg-green-50 transition-colors">
                      <CloudUpload className="w-10 h-10 text-[#6d7b6c] mb-2" />
                      <p className="text-sm text-[#6d7b6c] font-jakarta">Klik untuk upload foto/video</p>
                      <p className="text-xs text-[#9ca3af] font-jakarta mt-1">Bisa pilih lebih dari 1 file</p>
                      <input
                        type="file"
                        accept="image/*,video/*"
                        multiple
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-semibold text-[#191c20] mb-2 font-lexend">
                      Catatan (Opsional)
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Tambahkan catatan tentang tugas ini..."
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl border border-[#c1c9bf] bg-white focus:outline-none focus:ring-2 focus:ring-[#006e2f] focus:border-transparent font-jakarta resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    onClick={handleSubmitProof}
                    disabled={previewMedia.length === 0}
                    className={`w-full py-4 rounded-xl font-semibold font-lexend flex items-center justify-center gap-2 transition-colors ${
                      previewMedia.length > 0
                        ? "bg-[#006e2f] text-white hover:bg-[#005823]"
                        : "bg-[#e5eeff] text-[#6d7b6c] cursor-not-allowed"
                    }`}
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    Kirim Bukti ({previewMedia.length} file)
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Guide Modal */}
      {guideModalOpen && (() => {
        const GUIDE_PAGES = [
          {
            title: "Panduan Foto",
            icon: Camera,
            iconBg: "bg-gray-100",
            iconColor: "text-blue-500",
            tips: [
              "Pastikan pencahayaan cukup terang, hindari backlight",
              "Foto dari sudut yang jelas dan tidak blur",
              "Objek utama berada di tengah frame",
              "Resolusi minimal 720p agar detail terlihat",
            ],
          },
          {
            title: "Panduan Video",
            icon: Clapperboard,
            iconBg: "bg-gray-100",
            iconColor: "text-purple-500",
            tips: [
              "Durasi minimal 10 detik, maksimal 60 detik",
              "Rekam dengan posisi landscape (horizontal)",
              "Pastikan suara dan gerakan terlihat jelas",
            ],
          },
          {
            title: "Tips Tambahan",
            icon: Lightbulb,
            iconBg: "bg-gray-100",
            iconColor: "text-yellow-500",
            tips: [
              "Bisa upload lebih dari 1 foto/video untuk bukti yang lebih kuat",
              "Tambahkan catatan untuk menjelaskan konteks",
            ],
          },
        ];

        const page = GUIDE_PAGES[guidePage];
        const Icon = page.icon;
        const isFirst = guidePage === 0;
        const isLast = guidePage === GUIDE_PAGES.length - 1;

        return (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl w-full max-w-md shadow-xl">

              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-[#e5eeff]">
                <div>
                  <h3 className="text-xl font-bold text-[#191c20] font-lexend">Panduan Upload Bukti</h3>
                  <p className="text-sm text-[#6d7b6c] font-jakarta">Tips agar bukti diterima</p>
                </div>
                <button
                  onClick={() => { setGuideModalOpen(false); setGuidePage(0); }}
                  className="w-10 h-10 rounded-xl bg-[#f8f9ff] flex items-center justify-center hover:bg-[#e5eeff] transition-colors"
                >
                  <X className="w-5 h-5 text-[#6d7b6c]" />
                </button>
              </div>

              {/* Dot Indicator */}
              <div className="flex items-center justify-center gap-2 pt-5 px-6">
                {GUIDE_PAGES.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setGuidePage(i)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      i === guidePage ? "w-8 bg-[#006e2f]" : "w-2 bg-[#e5eeff]"
                    }`}
                    aria-label={`Halaman ${i + 1}`}
                  />
                ))}
              </div>

              {/* Body */}
              <div className="p-6 min-h-[260px] flex flex-col justify-between">
                <div>
                  {/* Topic Header */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className={`w-14 h-14 rounded-2xl ${page.iconBg} flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-7 h-7 ${page.iconColor}`} />
                    </div>
                    <h4 className="text-2xl font-bold text-[#191c20] font-lexend">{page.title}</h4>
                  </div>

                  {/* Tips */}
                  <ul className="space-y-4">
                    {page.tips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="mt-0.5 w-6 h-6 rounded-full bg-gray-100 text-[#006e2f] flex items-center justify-center text-sm font-bold font-lexend flex-shrink-0">
                          {i + 1}
                        </span>
                        <span className="text-base text-[#3d4a3c] font-jakarta leading-relaxed">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Navigation */}
                <div className="flex gap-3 mt-8">
                  {!isFirst && (
                    <button
                      onClick={() => setGuidePage(p => p - 1)}
                      className="flex-1 py-3 border-2 border-[#e5eeff] text-[#6d7b6c] rounded-xl font-semibold hover:bg-[#f8f9ff] transition-colors font-lexend"
                    >
                      ← Sebelumnya
                    </button>
                  )}
                  <button
                    onClick={() => {
                      if (isLast) { setGuideModalOpen(false); setGuidePage(0); }
                      else setGuidePage(p => p + 1);
                    }}
                    className="flex-1 py-3 bg-[#006e2f] text-white rounded-xl font-semibold hover:bg-[#005823] transition-colors font-lexend"
                  >
                    {isLast ? "Oke" : "Selanjutnya →"}
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