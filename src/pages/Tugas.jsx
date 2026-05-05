import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function Tugas() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("hari-ini");
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [guideModalOpen, setGuideModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [uploadedProofs, setUploadedProofs] = useState({});
  const [previewMedia, setPreviewMedia] = useState([]);
  const [notes, setNotes] = useState("");

  const tasks = {
    "hari-ini": [
      { id: 1, title: "Minum air 8 gelas", category: "Hidrasi", completed: true, icon: "water_drop", points: 10 },
      { id: 2, title: "Makan sayur 3 porsi", category: "Nutrisi", completed: false, icon: "nutrition", points: 15 },
      { id: 3, title: "Jalan kaki 30 menit", category: "Olahraga", completed: false, icon: "directions_walk", points: 20 },
      { id: 4, title: "Tidur 8 jam", category: "Istirahat", completed: false, icon: "bedtime", points: 10 },
      { id: 5, title: "Makan protein tinggi", category: "Nutrisi", completed: false, icon: "restaurant", points: 15 },
      { id: 6, title: "Stretching pagi", category: "Olahraga", completed: true, icon: "self_improvement", points: 10 },
    ],
    "minggu-ini": [
      { id: 7, title: "Workout 4x seminggu", category: "Olahraga", completed: false, icon: "fitness_center", points: 50 },
      { id: 8, title: "Tidur teratur 7 hari", category: "Istirahat", completed: false, icon: "schedule", points: 30 },
      { id: 9, title: "Minum air cukup 7 hari", category: "Hidrasi", completed: true, icon: "water_drop", points: 40 },
    ],
    "tantangan": [
      { id: 10, title: "Turun 1kg minggu ini", category: "Tantangan", completed: false, icon: "emoji_events", points: 100 },
      { id: 11, title: "Olahraga 30 hari berturut-turut", category: "Tantangan", completed: false, icon: "local_fire_department", points: 200 },
    ],
  };

  const currentTasks = tasks[activeTab] || [];
  const completedCount = currentTasks.filter(t => t.completed).length;
  const totalPoints = currentTasks.filter(t => t.completed).reduce((sum, t) => sum + t.points, 0);

  const openUploadModal = (task) => {
    setSelectedTask(task);
    setUploadModalOpen(true);
    setPreviewMedia([]);
    setNotes("");
  };

  const openGuideModal = () => {
    setGuideModalOpen(true);
  };

  const closeUploadModal = () => {
    setUploadModalOpen(false);
    setSelectedTask(null);
    setPreviewMedia([]);
    setNotes("");
  };

  const closeGuideModal = () => {
    setGuideModalOpen(false);
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      files.forEach(file => {
        const isVideo = file.type.startsWith("video/");
        const isImage = file.type.startsWith("image/");
        
        if (!isVideo && !isImage) {
          alert("Hanya file gambar (PNG, JPG, JPEG) atau video (MP4) yang diizinkan");
          return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewMedia(prev => [...prev, {
            id: Date.now() + Math.random(),
            src: reader.result,
            type: isVideo ? "video" : "image",
            name: file.name
          }]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeMedia = (id) => {
    setPreviewMedia(prev => prev.filter(m => m.id !== id));
  };

  const handleSubmitProof = () => {
    if (selectedTask && previewMedia.length > 0) {
      setUploadedProofs({
        ...uploadedProofs,
        [selectedTask.id]: {
          media: previewMedia,
          notes: notes,
          timestamp: new Date().toLocaleString('id-ID'),
        }
      });
      closeUploadModal();
    }
  };

  const hasProof = (taskId) => uploadedProofs[taskId];

  return (
    <div className="min-h-screen bg-[#f8f9ff]">
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
                Selesaikan tugas untuk mendapatkan poin dan capai target
              </p>
            </div>
            
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-2xl p-4 shadow-[0_8px_30px_rgba(34,197,94,0.08)] border border-[#e5eeff]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-[#006e2f]">check_circle</span>
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#191c20] font-lexend">{completedCount}</p>
                  <p className="text-xs text-[#6d7b6c] font-jakarta">Selesai</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-[0_8px_30px_rgba(34,197,94,0.08)] border border-[#e5eeff]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-orange-500">pending</span>
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#191c20] font-lexend">{currentTasks.length - completedCount}</p>
                  <p className="text-xs text-[#6d7b6c] font-jakarta">Tersisa</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-[0_8px_30px_rgba(34,197,94,0.08)] border border-[#e5eeff]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-purple-500">stars</span>
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#191c20] font-lexend">{totalPoints}</p>
                  <p className="text-xs text-[#6d7b6c] font-jakarta">Poin</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar">
            {[
              { id: "hari-ini", label: "Hari Ini", icon: "today" },
              { id: "minggu-ini", label: "Minggu Ini", icon: "date_range" },
              { id: "tantangan", label: "Tantangan", icon: "emoji_events" },
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
                <span className="material-symbols-outlined">{tab.icon}</span>
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
                  className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                    task.completed
                      ? "bg-[#006e2f] text-white"
                      : "bg-[#e5eeff] text-[#6d7b6c] hover:bg-[#dce9ff]"
                  }`}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontVariationSettings: task.completed ? "'FILL' 1" : "" }}
                  >
                    {task.completed ? "check" : task.icon}
                  </span>
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
                      <span className="material-symbols-outlined text-xs text-green-500">check_circle</span>
                      <span className="text-xs text-green-600 font-jakarta">
                        {uploadedProofs[task.id].media.length} bukti diupload
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1 rounded-full">
                    <span className="material-symbols-outlined text-yellow-500 text-sm">stars</span>
                    <span className="text-sm font-semibold text-yellow-700 font-lexend">+{task.points}</span>
                  </div>
                  
                  {/* Upload Button */}
                  <button
                    onClick={() => openUploadModal(task)}
                    className={`flex items-center gap-1 px-3 py-2 rounded-xl font-medium text-sm font-jakarta transition-colors ${
                      hasProof(task.id)
                        ? "bg-green-100 text-green-700 hover:bg-green-200"
                        : "bg-[#006e2f] text-white hover:bg-[#005823]"
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">
                      {hasProof(task.id) ? "visibility" : "upload"}
                    </span>
                    {hasProof(task.id) ? "Lihat" : "Upload"}
                  </button>
                  
                  <span
                    className={`material-symbols-outlined ${
                      task.completed ? "text-[#006e2f]" : "text-[#c1c9bf]"
                    }`}
                    style={{ fontVariationSettings: task.completed ? "'FILL' 1" : "" }}
                  >
                    {task.completed ? "check_circle" : "radio_button_unchecked"}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {currentTasks.length === 0 && (
            <div className="text-center py-12">
              <span className="material-symbols-outlined text-6xl text-[#c1c9bf] mb-4">inbox</span>
              <p className="text-[#6d7b6c] font-jakarta">Tidak ada tugas di kategori ini</p>
            </div>
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
                    onClick={openGuideModal}
                    className="flex items-center gap-1 px-3 py-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors text-sm font-medium font-jakarta"
                    title="Lihat Panduan Upload"
                  >
                    <span className="material-symbols-outlined text-sm">help_outline</span>
                    Panduan
                  </button>
                )}
                <button
                  onClick={closeUploadModal}
                  className="w-10 h-10 rounded-xl bg-[#f8f9ff] flex items-center justify-center hover:bg-[#e5eeff] transition-colors"
                >
                  <span className="material-symbols-outlined text-[#6d7b6c]">close</span>
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
                    <span className="material-symbols-outlined text-sm">schedule</span>
                    Diupload pada {uploadedProofs[selectedTask.id].timestamp}
                  </div>
                  <button
                    onClick={() => {
                      setPreviewMedia([]);
                      setNotes("");
                      setUploadedProofs({ ...uploadedProofs, [selectedTask.id]: null });
                    }}
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
                              <span className="material-symbols-outlined text-xs">close</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-[#c1c9bf] rounded-2xl bg-[#f8f9ff] cursor-pointer hover:border-[#006e2f] hover:bg-green-50 transition-colors">
                      <span className="material-symbols-outlined text-4xl text-[#6d7b6c] mb-2">cloud_upload</span>
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
                    <span className="material-symbols-outlined">check</span>
                    Kirim Bukti ({previewMedia.length} file)
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Guide Modal */}
      {guideModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#e5eeff]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-blue-600">menu_book</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#191c20] font-lexend">Panduan Upload Bukti</h3>
                  <p className="text-sm text-[#6d7b6c] font-jakarta">Tips agar bukti diterima</p>
                </div>
              </div>
              <button
                onClick={closeGuideModal}
                className="w-10 h-10 rounded-xl bg-[#f8f9ff] flex items-center justify-center hover:bg-[#e5eeff] transition-colors"
              >
                <span className="material-symbols-outlined text-[#6d7b6c]">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Panduan Foto */}
              <div className="bg-green-50 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined text-green-600">photo_camera</span>
                  <h4 className="font-bold text-green-800 font-lexend">Panduan Foto</h4>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-green-600 text-sm mt-0.5">check_circle</span>
                    <span className="text-sm text-green-800 font-jakarta">Pastikan pencahayaan cukup terang, hindari backlight</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-green-600 text-sm mt-0.5">check_circle</span>
                    <span className="text-sm text-green-800 font-jakarta">Foto dari sudut yang jelas dan tidak blur</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-green-600 text-sm mt-0.5">check_circle</span>
                    <span className="text-sm text-green-800 font-jakarta">Objek utama berada di tengah frame</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-green-600 text-sm mt-0.5">check_circle</span>
                    <span className="text-sm text-green-800 font-jakarta">Resolusi minimal 720p agar detail terlihat</span>
                  </li>
                </ul>
              </div>

              {/* Panduan Video */}
              <div className="bg-purple-50 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined text-purple-600">videocam</span>
                  <h4 className="font-bold text-purple-800 font-lexend">Panduan Video</h4>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-purple-600 text-sm mt-0.5">check_circle</span>
                    <span className="text-sm text-purple-800 font-jakarta">Durasi minimal 10 detik, maksimal 60 detik</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-purple-600 text-sm mt-0.5">check_circle</span>
                    <span className="text-sm text-purple-800 font-jakarta">Rekam dengan posisi landscape (horizontal)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-purple-600 text-sm mt-0.5">check_circle</span>
                    <span className="text-sm text-purple-800 font-jakarta">Pastikan suara dan gerakan terlihat jelas</span>
                  </li>
                </ul>
              </div>

              {/* Tips */}
              <div className="bg-blue-50 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined text-blue-600">lightbulb</span>
                  <h4 className="font-bold text-blue-800 font-lexend">Tips Tambahan</h4>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-blue-600 text-sm mt-0.5">info</span>
                    <span className="text-sm text-blue-800 font-jakarta">Bisa upload lebih dari 1 foto/video untuk bukti yang lebih kuat</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-blue-600 text-sm mt-0.5">info</span>
                    <span className="text-sm text-blue-800 font-jakarta">Tambahkan catatan untuk menjelaskan konteks</span>
                  </li>
                </ul>
              </div>

              {/* Button */}
              <button
                onClick={closeGuideModal}
                className="w-full py-4 bg-[#006e2f] text-white rounded-xl font-semibold hover:bg-[#005823] transition-colors font-lexend"
              >
                Mengerti, Lanjut Upload
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
