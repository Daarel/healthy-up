import { z } from 'zod';

import {
  claimRewardSchema,
  createRewardSchema,
  deleteRewardSchema,
  getMyRewardsQuerySchema,
  getRewardsQuerySchema,
  toggleRewardSchema,
  useCouponSchema,
} from '../schemas/rewardSchema.js';
import RewardService from '../services/rewardService.js';

class RewardController {
  /**
   * * @desc    Get All Active Rewards (with Category Filter)
   * ! @route   GET /api/v1/rewards?category=makanan
   * ? @access  Private
   */
  static async getRewards(req, res) {
    try {
      // Ambil nilai category dari URL query, misal: ?category=kesehatan
      const { category } = getRewardsQuerySchema.parse(req.query);

      const rewards = await RewardService.getActiveRewards(category);

      return res.status(200).json({
        status: 'success',
        data: {
          total: rewards.length,
          rewards,
        },
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return RewardController.handleZodError(err, res);
      }
      return RewardController.handleServerError(
        err,
        res,
        'Gagal mengambil daftar reward',
      );
    }
  }

  /**
   * * @desc    Create New Reward Catalog
   * ! @route   POST /api/v1/rewards
   * ? @access  Private (Admin Only)
   */
  static async createReward(req, res) {
    try {
      const validatedData = createRewardSchema.parse(req.body);

      let imageUrl = null;

      if (req.file) {
        const fileBase64 = req.file.buffer.toString('base64');
        const fileUri = `data:${req.file.mimetype};base64,${fileBase64}`;

        const uploadResponse = await cloudinary.uploader.upload(fileUri, {
          folder: 'healthyup/rewards',
          resource_type: 'auto',
        });

        imageUrl = uploadResponse.secure_url;
      }

      const newReward = await RewardService.createReward({
        ...validatedData,
        imageUrl,
      });

      return res.status(201).json({
        status: 'success',
        message: 'Katalog reward baru berhasil ditambahkan!',
        data: { reward: newReward },
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return RewardController.handleZodError(err, res);
      }

      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          status: 'error',
          message: 'Ukuran file terlalu besar. Maksimal 3 MB.',
        });
      }

      return RewardController.handleServerError(
        err,
        res,
        'Gagal membuat reward baru',
      );
    }
  }

  /**
   * * @desc    Delete a Reward Catalog
   * ! @route   DELETE /api/v1/rewards/:id
   * ? @access  Private (Admin Only)
   */
  static async deleteReward(req, res) {
    try {
      // Perhatikan: Kita mengambil ID dari req.params, bukan req.body
      const { id } = deleteRewardSchema.parse(req.params);

      await RewardService.deleteReward(id);

      return res.status(200).json({
        status: 'success',
        message: 'Katalog reward berhasil dihapus secara permanen',
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return RewardController.handleZodError(err, res);
      }

      // P2025: Record to delete does not exist.
      if (err.code === 'P2025') {
        return res.status(404).json({
          status: 'error',
          message: 'Katalog reward tidak ditemukan',
        });
      }

      // P2003: Foreign key constraint failed on the field: `rewardId`
      if (err.code === 'P2003') {
        return res.status(400).json({
          status: 'error',
          message:
            'Reward ini sudah pernah diklaim oleh pengguna sehingga tidak bisa dihapus permanen. Silakan nonaktifkan (isActive: false) reward ini sebagai gantinya.',
        });
      }

      return RewardController.handleServerError(
        err,
        res,
        'Gagal menghapus reward',
      );
    }
  }

  /**
   * * @desc    Toggle Reward Active Status
   * ! @route   PATCH /api/v1/rewards/:id/toggle
   * ? @access  Private (Admin Only)
   */
  static async toggleRewardStatus(req, res) {
    try {
      const { id } = toggleRewardSchema.parse(req.params);

      const updatedReward = await RewardService.toggleRewardStatus(id);

      // Buat pesan dinamis berdasarkan status terbaru
      const statusText = updatedReward.isActive
        ? 'diaktifkan'
        : 'dinonaktifkan';

      return res.status(200).json({
        status: 'success',
        message: `Katalog reward berhasil ${statusText}`,
        data: {
          reward: updatedReward,
        },
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return RewardController.handleZodError(err, res);
      }

      if (err.message === 'REWARD_NOT_FOUND') {
        return res.status(404).json({
          status: 'error',
          message: 'Katalog reward tidak ditemukan',
        });
      }

      return RewardController.handleServerError(
        err,
        res,
        'Gagal mengubah status reward',
      );
    }
  }

  /**
   * * @desc    Claim / Redeem a Reward
   * ! @route   POST /api/v1/rewards/claim
   * ? @access  Private
   */
  static async claimReward(req, res) {
    try {
      const { rewardId } = claimRewardSchema.parse(req.body);
      const userId = req.user.id;

      const { userReward, remainingPoints } = await RewardService.claimReward(
        userId,
        rewardId,
      );

      return res.status(201).json({
        status: 'success',
        message: `Berhasil menukarkan kupon: ${userReward.reward.name}`,
        data: {
          redemptionCode: userReward.redemptionCode,
          remainingPoints,
        },
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return RewardController.handleZodError(err, res);
      }

      if (err.message === 'REWARD_NOT_FOUND') {
        return res
          .status(404)
          .json({ status: 'error', message: 'Kupon tidak ditemukan' });
      }
      if (err.message === 'REWARD_OUT_OF_STOCK') {
        return res.status(400).json({
          status: 'error',
          message: 'Maaf, kupon ini sudah habis atau tidak aktif',
        });
      }
      if (err.message === 'INSUFFICIENT_POINTS') {
        return res.status(400).json({
          status: 'error',
          message: 'Poin Anda tidak cukup untuk menukarkan kupon ini',
        });
      }

      return RewardController.handleServerError(
        err,
        res,
        'Gagal memproses klaim kupon',
      );
    }
  }

  /**
   * * @desc    Use/Verify Coupon at Physical Store
   * ! @route   POST /api/v1/rewards/verify
   * ? @access  Private (Bisa untuk Admin Toko atau User langsung)
   */
  static async verifyAndUseCoupon(req, res) {
    try {
      const { redemptionCode } = useCouponSchema.parse(req.body);

      const { rewardName, username } =
        await RewardService.useCouponAtStore(redemptionCode);

      return res.status(200).json({
        status: 'success',
        message: 'Kupon berhasil diverifikasi dan dihanguskan!',
        data: {
          rewardName,
          username,
          redemptionCode,
        },
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return RewardController.handleZodError(err, res);
      }

      if (err.message === 'INVALID_CODE') {
        return res.status(404).json({
          status: 'error',
          message: 'Kode kupon tidak valid atau tidak ditemukan',
        });
      }
      if (err.message === 'COUPON_ALREADY_USED') {
        return res.status(400).json({
          status: 'error',
          message: 'Kupon ini sudah pernah digunakan sebelumnya!',
        });
      }

      return RewardController.handleServerError(
        err,
        res,
        'Gagal memverifikasi kupon',
      );
    }
  }

  /**
   * * @desc    Get User's Claimed Rewards (My Coupons)
   * ! @route   GET /api/v1/rewards/my-rewards
   * ? @access  Private
   */
  static async getMyRewards(req, res) {
    try {
      const { status } = getMyRewardsQuerySchema.parse(req.query);
      const userId = req.user.id;

      const myRewards = await RewardService.getUserRewards(userId, status);

      return res.status(200).json({
        status: 'success',
        data: {
          total: myRewards.length,
          myRewards,
        },
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return RewardController.handleZodError(err, res);
      }
      return RewardController.handleServerError(
        err,
        res,
        'Gagal mengambil daftar kupon Anda',
      );
    }
  }

  // helper methods
  static handleZodError(err, res) {
    const validationIssues = err.issues || err.errors || [];
    return res.status(400).json({
      status: 'fail',
      errors: validationIssues.map((e) => ({
        field: e.path[0] || 'payload',
        message: e.message,
      })),
    });
  }

  static handleServerError(err, res) {
    console.error('Terjadi Kesalahan di Controller:', err);

    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
}

export default RewardController;
