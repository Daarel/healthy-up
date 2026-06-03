import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Trash2, Loader2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { adminApi } from "@/lib/api";

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between py-2 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-800">{value ?? "-"}</span>
    </div>
  );
}

export default function AdminUserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let ignore = false;

    const loadUser = async () => {
      setIsLoading(true);
      setError("");
      try {
        const res = await adminApi.getUsers({ page: 1, limit: 100 });
        const foundUser = (res.data.users || []).find((item) => item.id === id);
        if (!ignore) setUser(foundUser || null);
      } catch (err) {
        if (!ignore) setError(err.message || "Gagal memuat detail user.");
      } finally {
        if (!ignore) setIsLoading(false);
      }
    };

    loadUser();
    return () => { ignore = true; };
  }, [id]);

  if (isLoading) {
    return <p className="text-gray-500 text-sm">Memuat detail user...</p>;
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={() => navigate("/admin/users")} className="gap-1">
          <ArrowLeft className="w-4 h-4" /> Kembali
        </Button>
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">{error}</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={() => navigate("/admin/users")} className="gap-1">
          <ArrowLeft className="w-4 h-4" /> Kembali
        </Button>
        <p className="text-gray-500 text-sm">User tidak ditemukan.</p>
      </div>
    );
  }

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await adminApi.deleteUser(id);
      navigate("/admin/users");
    } catch (err) {
      setError(err.message || "Gagal menghapus user.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-5 max-w-3xl">
      {/* Back + actions */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => navigate("/admin/users")} className="gap-1 -ml-2">
          <ArrowLeft className="w-4 h-4" /> Kembali
        </Button>

        {confirmDelete ? (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Hapus akun ini?</span>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
              Ya, Hapus
            </Button>
            <Button variant="outline" size="sm" onClick={() => setConfirmDelete(false)}>
              Batal
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setConfirmDelete(true)}
            className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 gap-1.5"
          >
            <Trash2 className="w-4 h-4" />
            Hapus Akun
          </Button>
        )}
      </div>

      {/* Header user */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
          <User className="w-5 h-5 text-[#006e2f]" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-gray-800">{user.username}</h1>
          <p className="text-sm text-gray-500">{user.email}</p>
        </div>
        <span className="ml-auto inline-block px-2.5 py-0.5 rounded-full text-xs bg-green-50 text-green-700 border border-green-200">
          {user.rankTitle}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Info akun */}
        <Card>
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-semibold text-gray-700">Info Akun</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <InfoRow label="Level" value={user.level} />
            <InfoRow label="XP" value={user.experiencePoints ? `${user.experiencePoints} poin` : "-"} />
            <InfoRow label="Reward Points" value={user.rewardPoints ? `${user.rewardPoints} poin` : "-"} />
            <InfoRow label="Streak" value={`${user.streakCount} hari`} />
            <InfoRow
              label="Bergabung"
              value={user.createdAt ? new Date(user.createdAt).toLocaleDateString("id-ID") : "-"}
            />
          </CardContent>
        </Card>

        {/* Profil kesehatan */}
        <Card>
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-semibold text-gray-700">Profil Kesehatan</CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <p className="text-sm text-gray-400 py-2">Detail profil kesehatan belum tersedia dari endpoint admin user.</p>
          </CardContent>
        </Card>
      </div>

      {/* Riwayat berat badan */}
      <Card>
        <CardHeader className="pb-2 pt-4 px-4">
          <CardTitle className="text-sm font-semibold text-gray-700">Riwayat Berat Badan</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          <p className="text-sm text-gray-400">Riwayat berat badan belum tersedia dari endpoint admin user.</p>
        </CardContent>
      </Card>
    </div>
  );
}
