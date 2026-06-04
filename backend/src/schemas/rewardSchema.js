import { z } from 'zod';

const claimRewardSchema = z.strictObject({
  rewardId: z
    .string({ required_error: 'ID Reward wajib diisi' })
    .uuid('Format ID Reward tidak valid'),
});

export const useCouponSchema = z.strictObject({
  redemptionCode: z
    .string({ required_error: 'Kode penukaran wajib diisi' })
    .trim()
    .min(5, 'Format kode tidak valid'),
});

const getMyRewardsQuerySchema = z.object({
  status: z
    .enum(['active', 'used', 'all'], {
      invalid_type_error: "Status hanya boleh 'active', 'used', atau 'all'",
    })
    .default('all'),
});

const deleteRewardSchema = z.strictObject({
  id: z
    .string({ required_error: 'ID Reward wajib disertakan di URL' })
    .uuid('Format ID Reward tidak valid'),
});

const toggleRewardSchema = z.strictObject({
  id: z
    .string({ required_error: 'ID Reward wajib disertakan di URL' })
    .uuid('Format ID Reward tidak valid'),
});

const createRewardSchema = z.strictObject({
  name: z
    .string({ required_error: 'Nama reward wajib diisi' })
    .trim()
    .min(3, 'Nama reward minimal 3 karakter')
    .max(255, 'Nama maksimal 255 karakter'),
  category: z
    .string({ required_error: 'Kategori wajib diisi' })
    .trim()
    .toLowerCase(),
  pointsCost: z.coerce
    .number({ required_error: 'Harga poin wajib diisi' })
    .int()
    .positive(),
  stockQuantity: z.coerce
    .number({ required_error: 'Stok awal wajib diisi' })
    .int()
    .nonnegative()
    .default(0),
  isActive: z.coerce.boolean().optional().default(true),
});

const getRewardsQuerySchema = z.object({
  category: z.string().optional(),
});

export {
  claimRewardSchema,
  createRewardSchema,
  deleteRewardSchema,
  getMyRewardsQuerySchema,
  getRewardsQuerySchema,
  toggleRewardSchema,
};
