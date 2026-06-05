import { useEffect, useRef, useState } from "react";
import { Plus, Trash2, Loader2, ToggleLeft, ToggleRight, X, ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { adminApi } from "@/lib/api";

const EMPTY_FORM = {
  name: "",
  category: "kesehatan",
  pointsCost: "",
  stockQuantity: "",
  isActive: true,
  imageUrl: null,    // URL string (dari server nanti)
  imagePreview: null, // base64 preview lokal
  imageFile: null,    // File object untuk upload
};

export default function AdminRewards() {
  const [rewards, setRewards] = useState([]);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [togglingId, setTogglingId] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    let ignore = false;
    const loadRewards = async () => {
      setIsLoading(true);
      setError("");
      try {
        const res = await adminApi.getRewards("semua");
        if (!ignore) setRewards(res.data.rewards || []);
      } catch (err) {
        if (!ignore) setError(err.message || "Gagal memuat reward.");
      } finally {
        if (!ignore) setIsLoading(false);
      }
    };

    loadRewards();
    return () => { ignore = true; };
  }, []);

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setErrors({});
    setModal("add");
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validasi tipe file
    if (!file.type.startsWith("image/")) {
      setErrors((er) => ({ ...er, image: "File harus berupa gambar." }));
      return;
    }
    // Validasi ukuran (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setErrors((er) => ({ ...er, image: "Ukuran gambar maksimal 2MB." }));
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      setForm((f) => ({
        ...f,
        imageFile: file,
        imagePreview: ev.target.result,
      }));
      setErrors((er) => ({ ...er, image: undefined }));
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setForm((f) => ({ ...f, imageFile: null, imagePreview: null, imageUrl: null }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Nama reward wajib diisi.";
    if (!form.category.trim()) e.category = "Kategori reward wajib diisi.";
    if (!form.pointsCost || isNaN(Number(form.pointsCost)) || Number(form.pointsCost) <= 0)
      e.pointsCost = "Harga poin harus angka positif.";
    if (form.stockQuantity === "" || isNaN(Number(form.stockQuantity)) || Number(form.stockQuantity) < 0)
      e.stockQuantity = "Stok harus angka ≥ 0.";
    return e;
  };

  const handleSave = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setIsSaving(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("name", form.name.trim());
      formData.append("category", form.category.trim().toLowerCase());
      formData.append("pointsCost", Number(form.pointsCost));
      formData.append("stockQuantity", Number(form.stockQuantity));
      formData.append("isActive", form.isActive);
      if (form.imageFile) {
        formData.append("image", form.imageFile);
      }
      const res = await adminApi.createReward(formData);
      const newReward = res.data.reward;
      setRewards((prev) => newReward.isActive ? [newReward, ...prev] : prev);
      setModal(null);
    } catch (err) {
      setError(err.message || "Gagal menyimpan reward.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (id) => {
    setTogglingId(id);
    setError("");
    try {
      const res = await adminApi.toggleReward(id);
      const updatedReward = res.data.reward;
      setRewards((prev) => updatedReward.isActive
        ? prev.map((r) => (r.id === id ? updatedReward : r))
        : prev.filter((r) => r.id !== id)
      );
    } catch (err) {
      setError(err.message || "Gagal mengubah status reward.");
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    setError("");
    try {
      await adminApi.deleteReward(id);
      setRewards((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      setError(err.message || "Gagal menghapus reward.");
    } finally {
      setDeletingId(null);
      setConfirmDelete(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Manajemen Reward</h1>
          <p className="text-sm text-gray-500 mt-0.5">{rewards.length} reward aktif tersedia</p>
        </div>
        <Button size="sm" onClick={openAdd} className="bg-[#006e2f] hover:bg-[#005823] gap-1.5">
          <Plus className="w-4 h-4" />
          Tambah Reward
        </Button>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">{error}</p>
      )}

      {/* Tabel */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 font-medium text-gray-600 w-16">Gambar</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Nama Reward</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Harga (Poin)</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Stok</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Dibuat</th>
                  <th className="px-4 py-3 w-24" />
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-gray-400">
                      <Loader2 className="w-5 h-5 animate-spin inline mr-2" /> Memuat reward...
                    </td>
                  </tr>
                ) : rewards.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-gray-400">Belum ada reward.</td>
                  </tr>
                ) : (
                  rewards.map((reward) => (
                    <tr key={reward.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      {/* Gambar */}
                      <td className="px-4 py-3">
                        <div className="w-10 h-10 rounded-md overflow-hidden bg-gray-100 border border-gray-200 flex-shrink-0">
                          {reward.imageUrl ? (
                            <img
                              src={reward.imageUrl}
                              alt={reward.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImagePlus className="w-4 h-4 text-gray-300" />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-800">{reward.name}</td>
                      <td className="px-4 py-3 text-gray-600">{reward.pointsCost.toLocaleString("id-ID")}</td>
                      <td className="px-4 py-3">
                        <span className={reward.stockQuantity === 0 ? "text-red-500 font-medium" : "text-gray-600"}>
                          {reward.stockQuantity}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleToggleActive(reward.id)}
                          disabled={togglingId === reward.id}
                          className="flex items-center gap-1.5 text-xs"
                        >
                          {togglingId === reward.id ? (
                            <><Loader2 className="w-4 h-4 animate-spin text-gray-400" /><span className="text-gray-400">Memproses</span></>
                          ) : reward.isActive ? (
                            <>
                              <ToggleRight className="w-5 h-5 text-[#006e2f]" />
                              <span className="text-green-700">Aktif</span>
                            </>
                          ) : (
                            <>
                              <ToggleLeft className="w-5 h-5 text-gray-400" />
                              <span className="text-gray-400">Nonaktif</span>
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {new Date(reward.createdAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 justify-end">
                          {confirmDelete === reward.id ? (
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-gray-500">Yakin?</span>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDelete(reward.id)}
                                disabled={deletingId === reward.id}
                                className="h-7 px-2 text-xs"
                              >
                                {deletingId === reward.id ? <Loader2 className="w-3 h-3 animate-spin" /> : "Hapus"}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setConfirmDelete(null)}
                                className="h-7 px-2 text-xs"
                              >
                                Batal
                              </Button>
                            </div>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setConfirmDelete(reward.id)}
                              className="h-8 px-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Modal tambah */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-sm shadow-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800">
                Tambah Reward
              </h3>
              <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-5 py-4 space-y-4">
              {/* Upload gambar */}
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1.5">
                  Gambar Reward
                </label>

                {form.imagePreview ? (
                  /* Preview gambar yang sudah dipilih */
                  <div className="relative w-full h-40 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                    <img
                      src={form.imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  /* Area upload */
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-[#006e2f] hover:bg-green-50 transition-colors group"
                  >
                    <ImagePlus className="w-6 h-6 text-gray-400 group-hover:text-[#006e2f]" />
                    <span className="text-xs text-gray-500 group-hover:text-[#006e2f]">
                      Klik untuk upload gambar
                    </span>
                    <span className="text-xs text-gray-400">PNG, JPG, WEBP · Maks 2MB</span>
                  </button>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                {errors.image && <p className="text-xs text-red-500 mt-1">{errors.image}</p>}
              </div>

              {/* Nama */}
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">Nama Reward</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => {
                    setForm((f) => ({ ...f, name: e.target.value }));
                    setErrors((er) => ({ ...er, name: undefined }));
                  }}
                  placeholder="Contoh: Voucher Gym 1 Bulan"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#006e2f]"
                />
                {errors.name && <p className="text-xs text-red-500 mt-0.5">{errors.name}</p>}
              </div>

              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">Kategori</label>
                <input
                  type="text"
                  value={form.category}
                  onChange={(e) => {
                    setForm((f) => ({ ...f, category: e.target.value }));
                    setErrors((er) => ({ ...er, category: undefined }));
                  }}
                  placeholder="kesehatan"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#006e2f]"
                />
                {errors.category && <p className="text-xs text-red-500 mt-0.5">{errors.category}</p>}
              </div>

              {/* Harga poin */}
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">Harga (Poin)</label>
                <input
                  type="number"
                  min="1"
                  value={form.pointsCost}
                  onChange={(e) => {
                    setForm((f) => ({ ...f, pointsCost: e.target.value }));
                    setErrors((er) => ({ ...er, pointsCost: undefined }));
                  }}
                  placeholder="500"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#006e2f]"
                />
                {errors.pointsCost && <p className="text-xs text-red-500 mt-0.5">{errors.pointsCost}</p>}
              </div>

              {/* Stok */}
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">Stok</label>
                <input
                  type="number"
                  min="0"
                  value={form.stockQuantity}
                  onChange={(e) => {
                    setForm((f) => ({ ...f, stockQuantity: e.target.value }));
                    setErrors((er) => ({ ...er, stockQuantity: undefined }));
                  }}
                  placeholder="10"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#006e2f]"
                />
                {errors.stockQuantity && <p className="text-xs text-red-500 mt-0.5">{errors.stockQuantity}</p>}
              </div>

              {/* Status aktif */}
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-gray-700">Status Aktif</label>
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, isActive: !f.isActive }))}
                  className="flex items-center gap-1.5"
                >
                  {form.isActive ? (
                    <>
                      <ToggleRight className="w-6 h-6 text-[#006e2f]" />
                      <span className="text-green-700 text-xs">Aktif</span>
                    </>
                  ) : (
                    <>
                      <ToggleLeft className="w-6 h-6 text-gray-400" />
                      <span className="text-gray-400 text-xs">Nonaktif</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="flex gap-2 px-5 pb-5 justify-end">
              <Button variant="outline" size="sm" onClick={() => setModal(null)}>Batal</Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={isSaving}
                className="bg-[#006e2f] hover:bg-[#005823]"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                Simpan
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
