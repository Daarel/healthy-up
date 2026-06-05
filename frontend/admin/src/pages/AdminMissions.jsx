import { useState, useEffect, useCallback } from "react";
import {
  CheckCircle, XCircle, Loader2, ImageOff,
  ChevronLeft, ChevronRight, X, RefreshCw, AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { adminApi } from "@/lib/api";

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Konversi data misi dari backend ke shape yang dipakai UI.
 * Backend mengembalikan { ...mission, user: { username, email }, proofImage: string|null }
 */
function mapMission(m) {
  const proofMedia = [];
  if (m.proofImagePath) {
    // Deteksi video berdasarkan ekstensi
    const isVideo = /\.(mp4|webm|ogg|mov)(\?|$)/i.test(m.proofImagePath);
    proofMedia.push({ url: m.proofImagePath, type: isVideo ? "video" : "image" });
  }
  return {
    id: m.id,
    title: m.title,
    description: m.description ?? "",
    category: m.category ?? "",
    difficultyScore: m.difficultyScore ?? 0,
    scheduledDate: m.scheduledDate
      ? new Date(m.scheduledDate).toLocaleDateString("id-ID")
      : m.completedAt
      ? new Date(m.completedAt).toLocaleDateString("id-ID")
      : "-",
    status: m.status,
    verificationStatus: m.verificationStatus,
    rejectionReason: m.rejectionReason ?? null,
    xpReward: m.xpReward ?? 0,
    pointsReward: m.pointsReward ?? 0,
    username: m.user?.username ?? m.user?.email ?? "Unknown",
    proofMedia,
  };
}

// ── Konstanta tampilan ────────────────────────────────────────────────────────

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
  Object.entries(STATUS_LABEL).map(([k, v]) => [k, v.charAt(0) + v.slice(1).toLowerCase()])
);

// ── Komponen MediaCarousel ────────────────────────────────────────────────────

function MediaCarousel({ media }) {
  const [idx, setIdx] = useState(0);

  if (!media || media.length === 0) {
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
      <div className="relative w-full h-64 bg-gray-900 rounded-lg overflow-hidden border border-gray-200">
        {isVideo ? (
          <video key={current.url} src={current.url} controls className="w-full h-full object-contain" />
        ) : (
          <img src={current.url} alt={`Bukti ${idx + 1}`} className="w-full h-full object-cover" />
        )}
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

// ── Modal Detail Misi ─────────────────────────────────────────────────────────

function MissionDetailModal({ mission, onClose, onApprove, onReject, loadingId }) {
  const [rejectMode, setRejectMode] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const isLoading = loadingId === mission.id;

  const handleRejectSubmit = () => {
    onReject(mission.id, rejectReason || null);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">Detail Misi</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          {/* Media Bukti */}
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
              Bukti Media ({mission.proofMedia.length} file)
            </p>
            <MediaCarousel media={mission.proofMedia} />
          </div>

          {/* Info Misi */}
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
            {mission.description && (
              <p className="text-sm text-gray-600">{mission.description}</p>
            )}
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

          {/* Tombol aksi — hanya tampil jika masih pending */}
          {mission.verificationStatus === "pending" && (
            <div className="flex gap-2 pt-1">
              {rejectMode ? (
                <>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={handleRejectSubmit}
                    disabled={isLoading}
                    className="flex-1"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                    Konfirmasi Tolak
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => { setRejectMode(false); setRejectReason(""); }}
                    disabled={isLoading}
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
                    disabled={isLoading}
                    className="flex-1 bg-[#006e2f] hover:bg-[#005823] gap-1.5"
                  >
                    {isLoading ? (
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
                    disabled={isLoading}
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

// ── Halaman Utama ─────────────────────────────────────────────────────────────

export default function AdminMissions() {
  const [missions, setMissions]               = useState([]);
  const [filterStatus, setFilterStatus]       = useState("pending");
  const [loadingId, setLoadingId]             = useState(null);
  const [selectedMission, setSelectedMission] = useState(null);
  const [fetching, setFetching]               = useState(true);
  const [fetchError, setFetchError]           = useState(null);

  // ─── Fetch missions dari backend berdasarkan filter ─────────────────────
  // setFetching(true) TIDAK ada di sini — dipanggil dari event handler agar
  // tidak trigger "setState synchronously in effect" lint error
  const fetchMissions = useCallback(async (status) => {
    try {
      const res = await adminApi.getPendingMissions(status);
      const raw = res?.data?.missions ?? [];
      setMissions(raw.map(mapMission));
      setFetchError(null); // Pindah ke sini agar asinkronus (setelah await)
    } catch (err) {
      setFetchError(err.message || "Gagal mengambil data misi.");
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchMissions(filterStatus);
  }, [fetchMissions, filterStatus]);

  // ─── Handlers verifikasi ─────────────────────────────────────────────────
  const handleApprove = async (id) => {
    setLoadingId(id);
    try {
      await adminApi.verifyMission(id, "approved");
      setMissions((prev) =>
        prev.map((m) => (m.id === id ? { ...m, verificationStatus: "approved" } : m))
      );
      setSelectedMission((prev) =>
        prev?.id === id ? { ...prev, verificationStatus: "approved" } : prev
      );
      // Re-fetch agar konsisten dengan filter aktif
      await fetchMissions(filterStatus);
    } catch (err) {
      alert(`Gagal menyetujui misi: ${err.message}`);
    } finally {
      setLoadingId(null);
    }
  };

  const handleReject = async (id, reason) => {
    setLoadingId(id);
    try {
      await adminApi.verifyMission(id, "rejected", reason);
      setMissions((prev) =>
        prev.map((m) =>
          m.id === id ? { ...m, verificationStatus: "rejected", rejectionReason: reason } : m
        )
      );
      setSelectedMission((prev) =>
        prev?.id === id
          ? { ...prev, verificationStatus: "rejected", rejectionReason: reason }
          : prev
      );
      // Re-fetch agar konsisten dengan filter aktif
      await fetchMissions(filterStatus);
    } catch (err) {
      alert(`Gagal menolak misi: ${err.message}`);
    } finally {
      setLoadingId(null);
    }
  };

  // ─── Derived state ────────────────────────────────────────────────────────
  // missions sudah difilter dari backend; hitung pending count secara terpisah
  const [pendingCount, setPendingCount] = useState(0);

  // Ambil pending count sekali (dan setiap selesai approve/reject)
  useEffect(() => {
    adminApi.getPendingMissions('pending')
      .then(res => setPendingCount(res?.data?.total ?? 0))
      .catch(() => {});
  }, [missions]);

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Verifikasi Misi</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {fetching ? "Memuat..." : `${pendingCount} misi menunggu verifikasi`}
          </p>
        </div>
        <button
          onClick={() => { setFetching(true); fetchMissions(filterStatus); }}
          disabled={fetching}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg px-3 py-1.5 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${fetching ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Error Banner */}
      {fetchError && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700">{fetchError}</p>
          <button
            onClick={() => { setFetching(true); fetchMissions(filterStatus); }}
            className="ml-auto text-sm text-red-600 hover:underline font-medium"
          >
            Coba lagi
          </button>
        </div>
      )}

      {/* Filter Status */}
      <div className="flex gap-1.5 flex-wrap">
        {["all", "pending", "approved", "rejected"].map((s) => (
          <button
            key={s}
            onClick={() => { setFetching(true); setFilterStatus(s); }}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
              filterStatus === s
                ? "bg-[#006e2f] text-white border-[#006e2f]"
                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
            }`}
          >
            {s === "all" ? "Semua" : STATUS_TAB[s]}
            {s === "pending" && pendingCount > 0 && (
              <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                filterStatus === "pending" ? "bg-white/30 text-white" : "bg-yellow-100 text-yellow-700"
              }`}>
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Loading Skeleton */}
      {fetching && (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 animate-pulse">
              <div className="flex gap-4">
                <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-2/3" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                  <div className="h-3 bg-gray-100 rounded w-1/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Daftar Misi */}
      {!fetching && missions.length === 0 && (
        <p className="text-sm text-gray-400 py-8 text-center">
          {fetchError ? "Gagal memuat data." : "Tidak ada misi ditemukan."}
        </p>
      )}

      {!fetching && missions.length > 0 && (
        <div className="space-y-2">
          {missions.map((mission) => (
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

                    {mission.description && (
                      <p className="text-xs text-gray-500 mt-1.5 line-clamp-1">{mission.description}</p>
                    )}

                    <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
                      <span>+{mission.xpReward} XP</span>
                      <span>+{mission.pointsReward} Pts</span>
                      <span>Kesulitan: {mission.difficultyScore}/5</span>
                      {mission.proofMedia.length > 0 && (
                        <span>
                          {mission.proofMedia.filter((m) => m.type === "image").length > 0 &&
                            `${mission.proofMedia.filter((m) => m.type === "image").length} foto`}
                          {mission.proofMedia.filter((m) => m.type === "video").length > 0 &&
                            `, ${mission.proofMedia.filter((m) => m.type === "video").length} video`}
                        </span>
                      )}
                    </div>

                    {/* Alasan penolakan di card */}
                    {mission.verificationStatus === "rejected" && mission.rejectionReason && (
                      <p className="text-xs text-red-500 mt-1 line-clamp-1">
                        Ditolak: {mission.rejectionReason}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal Detail */}
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
