import { useState } from "react";
import { CheckCircle, XCircle, Loader2, ImageOff, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

// Data dummy — nanti diganti dengan fetch ke API
// proofMedia: array of { url: string, type: "image" | "video" }
const DUMMY_MISSIONS = [
  {
    id: "m1",
    userId: "1",
    username: "ghifari123",
    title: "Jalan kaki 30 menit",
    description: "Lakukan jalan kaki selama minimal 30 menit di luar ruangan.",
    difficultyScore: 2,
    scheduledDate: "2026-05-24",
    status: "completed",
    verificationStatus: "pending",
    proofMedia: [
      { url: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&h=600&fit=crop", type: "image" },
      { url: "https://www.w3schools.com/html/mov_bbb.mp4", type: "video" },
      { url: "https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=800&h=600&fit=crop", type: "image" },
    ],
    xpReward: 100,
    pointsReward: 50,
  },
  {
    id: "m2",
    userId: "2",
    username: "siti_sehat",
    title: "Meditasi 15 menit",
    description: "Lakukan meditasi atau pernapasan dalam selama 15 menit.",
    difficultyScore: 1,
    scheduledDate: "2026-05-24",
    status: "completed",
    verificationStatus: "pending",
    proofMedia: [],
    xpReward: 75,
    pointsReward: 30,
  },
  {
    id: "m3",
    userId: "3",
    username: "budi_fit",
    title: "Makan sayur 3 porsi",
    description: "Konsumsi sayuran minimal 3 porsi dalam sehari.",
    difficultyScore: 1,
    scheduledDate: "2026-05-23",
    status: "completed",
    verificationStatus: "pending",
    proofMedia: [
      { url: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=600&fit=crop", type: "image" },
    ],
    xpReward: 60,
    pointsReward: 25,
  },
  {
    id: "m4",
    userId: "1",
    username: "ghifari123",
    title: "Push-up 20 kali",
    description: "Lakukan push-up sebanyak 20 repetisi.",
    difficultyScore: 3,
    scheduledDate: "2026-05-22",
    status: "completed",
    verificationStatus: "approved",
    proofMedia: [
      { url: "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=800&h=600&fit=crop", type: "image" },
      { url: "https://www.w3schools.com/html/movie.mp4", type: "video" },
    ],
    xpReward: 150,
    pointsReward: 75,
  },
  {
    id: "m5",
    userId: "4",
    username: "rina_wellness",
    title: "Tidur 8 jam",
    description: "Tidur selama minimal 8 jam malam ini.",
    difficultyScore: 1,
    scheduledDate: "2026-05-21",
    status: "completed",
    verificationStatus: "rejected",
    rejectionReason: "Bukti tidak relevan dengan misi.",
    proofMedia: [
      { url: "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=800&h=600&fit=crop", type: "image" },
    ],
    xpReward: 60,
    pointsReward: 20,
  },
];

// Warna status — teks berwarna, capitalize, tanpa badge
const STATUS_STYLE = {
  pending:  "text-yellow-600 font-semibold",
  approved: "text-green-600 font-semibold",
  rejected: "text-red-600 font-semibold",
};

const STATUS_LABEL = {
  pending:  "MENUNGGU",
  approved: "DISETUJUI",
  rejected: "DITOLAK",
};

const STATUS_TAB = Object.fromEntries(
  Object.entries(STATUS_LABEL).map(([key, value]) => [
    key,
    value.charAt(0) + value.slice(1).toLowerCase()
  ])
);

// ── Komponen carousel media di dalam modal detail ──────────────────────────
function MediaCarousel({ media }) {
  const [idx, setIdx] = useState(0);

  if (media.length === 0) {
    return (
      <div className="w-full h-56 bg-gray-100 rounded-lg flex flex-col items-center justify-center gap-2 border border-gray-200">
        <ImageOff className="w-8 h-8 text-gray-300" />
        <span className="text-sm text-gray-400">Tidak ada media bukti</span>
      </div>
    );
  }

  const current = media[idx];
  const isVideo = current.type === "video";

  return (
    <div className="space-y-2">
      {/* Media utama */}
      <div className="relative w-full h-64 bg-gray-900 rounded-lg overflow-hidden border border-gray-200">
        {isVideo ? (
          <video
            key={current.url} // re-mount saat ganti video
            src={current.url}
            controls
            className="w-full h-full object-contain"
          />
        ) : (
          <img
            src={current.url}
            alt={`Bukti ${idx + 1}`}
            className="w-full h-full object-cover"
          />
        )}

        {/* Navigasi prev/next */}
        {media.length > 1 && (
          <>
            <button
              onClick={() => setIdx((i) => (i - 1 + media.length) % media.length)}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-1 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIdx((i) => (i + 1) % media.length)}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-1 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <span className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full">
              {idx + 1} / {media.length}
            </span>
          </>
        )}
      </div>

      {/* Thumbnail strip */}
      {media.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {media.map((item, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className={`flex-shrink-0 w-14 h-14 rounded-md overflow-hidden border-2 transition-colors relative bg-gray-900 ${
                i === idx ? "border-[#006e2f]" : "border-transparent"
              }`}
            >
              {item.type === "video" ? (
                /* Thumbnail video — tampilkan ikon play di atas bg gelap */
                <div className="w-full h-full flex items-center justify-center bg-gray-800">
                  <svg className="w-5 h-5 text-white opacity-80" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              ) : (
                <img src={item.url} alt={`Thumb ${i + 1}`} className="w-full h-full object-cover" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Modal detail misi ──────────────────────────────────────────────────────
function MissionDetailModal({ mission, onClose, onApprove, onReject, loadingId }) {
  const [rejectMode, setRejectMode] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const handleRejectSubmit = () => {
    onReject(mission.id, rejectReason);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header modal */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">Detail Misi</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          {/* Media bukti */}
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
              Bukti Media ({mission.proofMedia.length} file)
            </p>
            <MediaCarousel media={mission.proofMedia} />
          </div>

          {/* Info misi */}
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-2">
              <h4 className="font-semibold text-gray-800">{mission.title}</h4>
              <span className={`text-sm flex-shrink-0 ${STATUS_STYLE[mission.verificationStatus]}`}>
                {STATUS_LABEL[mission.verificationStatus]}
              </span>
            </div>
            <p className="text-sm text-gray-500">
              oleh <span className="font-medium text-gray-700">{mission.username}</span>
              {" · "}{mission.scheduledDate}
            </p>
            <p className="text-sm text-gray-600">{mission.description}</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-400 mb-0.5">XP</p>
              <p className="font-semibold text-gray-800 text-sm">+{mission.xpReward}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-400 mb-0.5">Poin</p>
              <p className="font-semibold text-gray-800 text-sm">+{mission.pointsReward}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-400 mb-0.5">Kesulitan</p>
              <p className="font-semibold text-gray-800 text-sm">{mission.difficultyScore}/5</p>
            </div>
          </div>

          {/* Alasan penolakan jika sudah ditolak */}
          {mission.verificationStatus === "rejected" && mission.rejectionReason && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              <p className="text-xs font-medium text-red-600 mb-0.5">Alasan Penolakan</p>
              <p className="text-sm text-red-700">{mission.rejectionReason}</p>
            </div>
          )}

          {/* Form reject */}
          {rejectMode && (
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-700 block">
                Alasan Penolakan <span className="text-gray-400">(opsional)</span>
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Contoh: Bukti foto tidak jelas..."
                rows={3}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
              />
            </div>
          )}

          {/* Aksi — hanya jika pending */}
          {mission.verificationStatus === "pending" && (
            <div className="flex gap-2 pt-1">
              {rejectMode ? (
                <>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={handleRejectSubmit}
                    disabled={loadingId === mission.id}
                    className="flex-1"
                  >
                    {loadingId === mission.id ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                    Konfirmasi Tolak
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => { setRejectMode(false); setRejectReason(""); }}
                    className="flex-1"
                  >
                    Batal
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    size="sm"
                    onClick={() => onApprove(mission.id)}
                    disabled={loadingId === mission.id}
                    className="flex-1 bg-[#006e2f] hover:bg-[#005823] gap-1.5"
                  >
                    {loadingId === mission.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4" />
                    )}
                    Setujui
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setRejectMode(true)}
                    disabled={loadingId === mission.id}
                    className="flex-1 text-red-600 border-red-200 hover:bg-red-50 gap-1.5"
                  >
                    <XCircle className="w-4 h-4" />
                    Tolak
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Halaman utama ──────────────────────────────────────────────────────────
export default function AdminMissions() {
  const [missions, setMissions] = useState(DUMMY_MISSIONS);
  const [filterStatus, setFilterStatus] = useState("pending");
  const [loadingId, setLoadingId] = useState(null);
  const [selectedMission, setSelectedMission] = useState(null);

  const filtered = missions.filter(
    (m) => filterStatus === "all" || m.verificationStatus === filterStatus
  );

  const handleApprove = async (id) => {
    setLoadingId(id);
    try {
      // TODO: ganti dengan API call
      // await adminApi.approveMission(id);
      await new Promise((r) => setTimeout(r, 600));
      setMissions((prev) =>
        prev.map((m) => (m.id === id ? { ...m, verificationStatus: "approved" } : m))
      );
      setSelectedMission((prev) =>
        prev?.id === id ? { ...prev, verificationStatus: "approved" } : prev
      );
    } finally {
      setLoadingId(null);
    }
  };

  const handleReject = async (id, reason) => {
    setLoadingId(id);
    try {
      // TODO: ganti dengan API call
      // await adminApi.rejectMission(id, reason);
      await new Promise((r) => setTimeout(r, 600));
      setMissions((prev) =>
        prev.map((m) =>
          m.id === id
            ? { ...m, verificationStatus: "rejected", rejectionReason: reason }
            : m
        )
      );
      setSelectedMission((prev) =>
        prev?.id === id
          ? { ...prev, verificationStatus: "rejected", rejectionReason: reason }
          : prev
      );
    } finally {
      setLoadingId(null);
    }
  };

  const pendingCount = missions.filter((m) => m.verificationStatus === "pending").length;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-gray-800">Verifikasi Misi</h1>
        <p className="text-sm text-gray-500 mt-0.5">{pendingCount} misi menunggu verifikasi</p>
      </div>

      {/* Filter status */}
      <div className="flex gap-1.5 flex-wrap">
        {["all", "pending", "approved", "rejected"].map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
              filterStatus === s
                ? "bg-[#006e2f] text-white border-[#006e2f]"
                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
            }`}
          >
            {s === "all" ? "Semua" : STATUS_TAB[s]}
          </button>
        ))}
      </div>

      {/* Daftar misi */}
      {filtered.length === 0 ? (
        <p className="text-sm text-gray-400 py-8 text-center">Tidak ada misi ditemukan.</p>
      ) : (
        <div className="space-y-2">
          {filtered.map((mission) => (
            <Card
              key={mission.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setSelectedMission(mission)}
            >
              <CardContent className="p-4">
                <div className="flex gap-4 items-start">
                  {/* Thumbnail media pertama */}
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-200 relative">
                    {mission.proofMedia.length > 0 ? (
                      <>
                        {mission.proofMedia[0].type === "video" ? (
                          <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                            <svg className="w-6 h-6 text-white opacity-80" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </div>
                        ) : (
                          <img
                            src={mission.proofMedia[0].url}
                            alt="Bukti"
                            className="w-full h-full object-cover"
                          />
                        )}
                        {mission.proofMedia.length > 1 && (
                          <span className="absolute bottom-0.5 right-0.5 bg-black/60 text-white text-[10px] px-1 rounded">
                            +{mission.proofMedia.length - 1}
                          </span>
                        )}
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageOff className="w-5 h-5 text-gray-300" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-medium text-gray-800 text-sm truncate">{mission.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          oleh <span className="font-medium">{mission.username}</span>
                          {" · "}{mission.scheduledDate}
                        </p>
                      </div>
                      <span className={`text-sm flex-shrink-0 ${STATUS_STYLE[mission.verificationStatus]}`}>
                        {STATUS_LABEL[mission.verificationStatus]}
                      </span>
                    </div>

                    <p className="text-xs text-gray-500 mt-1.5 line-clamp-1">{mission.description}</p>

                    <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
                      <span>+{mission.xpReward} XP</span>
                      <span>+{mission.pointsReward} Pts</span>
                      <span>Kesulitan: {mission.difficultyScore}/5</span>
                      {mission.proofMedia.length > 0 && (
                        <span className="text-gray-400">
                          {mission.proofMedia.filter(m => m.type === "image").length} foto
                          {mission.proofMedia.filter(m => m.type === "video").length > 0 &&
                            `, ${mission.proofMedia.filter(m => m.type === "video").length} video`}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal detail */}
      {selectedMission && (
        <MissionDetailModal
          mission={selectedMission}
          onClose={() => setSelectedMission(null)}
          onApprove={handleApprove}
          onReject={handleReject}
          loadingId={loadingId}
        />
      )}
    </div>
  );
}
