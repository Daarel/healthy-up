import { useEffect, useState } from "react";
import { Plus, Trash2, Loader2, ToggleLeft, ToggleRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { adminApi } from "@/lib/api";

const EMPTY_FORM = {
  name: "",
  category: "kesehatan",
  pointsCost: "",
  stockQuantity: "",
  isActive: true,
};

export default function AdminRewards() {
  const [rewards, setRewards] = useState([]);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [togglingId, setTogglingId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [apiError, setApiError] = useState("");

  const loadRewards = async () => {
    setIsLoading(true);
    setApiError("");
    try {
      const res = await adminApi.getRewards();
      setRewards(res.data?.rewards ?? []);
    } catch (err) {
      setApiError(err.message || "Gagal memuat data reward.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(loadRewards, 0);
    return () => clearTimeout(timeoutId);
  }, []);

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setErrors({});
    setModal("add");
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Nama reward wajib diisi.";
    if (!form.category.trim()) e.category = "Kategori wajib diisi.";
    if (!form.pointsCost || isNaN(Number(form.pointsCost)) || Number(form.pointsCost) <= 0)
      e.pointsCost = "Harga poin harus angka positif.";
    if (form.stockQuantity === "" || isNaN(Number(form.stockQuantity)) || Number(form.stockQuantity) < 0)
      e.stockQuantity = "Stok harus angka >= 0.";
    return e;
  };

  const handleSave = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setIsSaving(true);
    setApiError("");
    try {
      const res = await adminApi.createReward({
        name: form.name.trim(),
        category: form.category.trim().toLowerCase(),
        pointsCost: Number(form.pointsCost),
        stockQuantity: Number(form.stockQuantity),
        isActive: form.isActive,
      });

      const reward = res.data?.reward;
      if (reward) setRewards((prev) => [reward, ...prev]);
      setModal(null);
    } catch (err) {
      setApiError(err.message || "Gagal menyimpan reward.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (id) => {
    setTogglingId(id);
    setApiError("");
    try {
      const res = await adminApi.toggleReward(id);
      const updatedReward = res.data?.reward;
      if (updatedReward) {
        setRewards((prev) => prev.map((reward) => (reward.id === id ? updatedReward : reward)));
      }
    } catch (err) {
      setApiError(err.message || "Gagal mengubah status reward.");
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    setApiError("");
    try {
      await adminApi.deleteReward(id);
      setRewards((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      setApiError(err.message || "Gagal menghapus reward.");
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
          <p className="text-sm text-gray-500 mt-0.5">{rewards.length} reward tersedia</p>
        </div>
        <Button size="sm" onClick={openAdd} className="bg-[#006e2f] hover:bg-[#005823] gap-1.5">
          <Plus className="w-4 h-4" />
          Tambah Reward
        </Button>
      </div>

      {apiError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {apiError}
        </div>
      )}

      {/* Tabel */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Nama Reward</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Kategori</th>
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
                      <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
                      Memuat reward...
                    </td>
                  </tr>
                ) : rewards.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-gray-400">Belum ada reward.</td>
                  </tr>
                ) : (
                  rewards.map((reward) => (
                    <tr key={reward.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-800">{reward.name}</td>
                      <td className="px-4 py-3 text-gray-600 capitalize">{reward.category || "-"}</td>
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
                            <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
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
                      <td className="px-4 py-3 text-gray-500">{reward.createdAt}</td>
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

      {/* Modal tambah / edit */}
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

              {/* Kategori */}
              <div>
                <label className="text-xs font-medium text-gray-700 block mb-1">Kategori</label>
                <select
                  value={form.category}
                  onChange={(e) => {
                    setForm((f) => ({ ...f, category: e.target.value }));
                    setErrors((er) => ({ ...er, category: undefined }));
                  }}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#006e2f]"
                >
                  <option value="kesehatan">Kesehatan</option>
                  <option value="makanan">Makanan</option>
                  <option value="gym">Gym</option>
                </select>
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
