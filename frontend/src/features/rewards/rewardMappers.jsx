const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=600&h=400&fit=crop";

function formatCategory(category) {
  if (!category) return "Umum";
  return category.charAt(0).toUpperCase() + category.slice(1);
}

export function mapReward(reward) {
  return {
    id: reward.id,
    title: reward.name,
    points: reward.pointsCost,
    image: reward.imageUrl || FALLBACK_IMAGE,
    category: formatCategory(reward.category),
    description: reward.description || `Stok tersedia: ${reward.stockQuantity ?? 0}`,
    stockQuantity: reward.stockQuantity ?? 0,
  };
}

export function mapUserReward(item) {
  return {
    id: item.id,
    voucher: item.reward?.name || "Voucher",
    merchantId: item.redemptionCode,
    tanggal: item.redeemedAt ? new Date(item.redeemedAt).toLocaleDateString("id-ID") : "-",
    points: item.reward?.pointsCost || 0,
    status: item.isUsed ? "Terpakai" : "Berhasil",
    code: item.redemptionCode,
  };
}