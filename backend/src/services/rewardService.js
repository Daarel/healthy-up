import crypto from 'crypto';

import prisma from '../lib/prisma.js';

class RewardService {
  static async getActiveRewards(categoryQuery) {
    const whereClause = { isActive: true };

    if (categoryQuery && categoryQuery.toLowerCase() !== 'semua') {
      whereClause.category = categoryQuery.toLowerCase();
    }

    const rewards = await prisma.reward.findMany({
      where: whereClause,
      orderBy: { pointsCost: 'asc' },
    });

    return rewards;
  }

  static async createReward(rewardData) {
    const newReward = await prisma.reward.create({
      data: {
        name: rewardData.name,
        category: rewardData.category,
        pointsCost: rewardData.pointsCost,
        stockQuantity: rewardData.stockQuantity,
        isActive: rewardData.isActive,
        imageUrl: rewardData.imageUrl || null,
      },
    });

    return newReward;
  }

  static async deleteReward(rewardId) {
    const deletedReward = await prisma.reward.delete({
      where: { id: rewardId },
    });

    return deletedReward;
  }

  static async claimReward(userId, rewardId) {
    return await prisma.$transaction(async (tx) => {
      const reward = await tx.reward.findUnique({ where: { id: rewardId } });
      const user = await tx.user.findUnique({ where: { id: userId } });

      if (!reward) throw new Error('REWARD_NOT_FOUND');
      if (!reward.isActive || reward.stockQuantity <= 0) {
        throw new Error('REWARD_OUT_OF_STOCK');
      }
      if (user.rewardPoints < reward.pointsCost) {
        throw new Error('INSUFFICIENT_POINTS');
      }

      const newStock = reward.stockQuantity - 1;
      const isStillActive = newStock > 0;
      const remainingPoints = user.rewardPoints - reward.pointsCost;

      await tx.reward.update({
        where: { id: rewardId },
        data: {
          stockQuantity: newStock,
          isActive: isStillActive,
        },
      });

      await tx.user.update({
        where: { id: userId },
        data: { rewardPoints: remainingPoints },
      });

      const uniqueCode = `HLTY-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

      const userReward = await tx.userReward.create({
        data: {
          userId,
          rewardId,
          redemptionCode: uniqueCode,
        },
        include: {
          reward: { select: { name: true } },
        },
      });

      return { userReward, remainingPoints };
    });
  }

  static async useCouponAtStore(redemptionCode) {
    const userReward = await prisma.userReward.findUnique({
      where: { redemptionCode },
      include: {
        reward: { select: { name: true } },
        user: { select: { username: true } },
      },
    });

    if (!userReward) throw new Error('INVALID_CODE');
    if (userReward.isUsed) throw new Error('COUPON_ALREADY_USED');

    // hanguskan kupon
    const updatedCoupon = await prisma.userReward.update({
      where: { redemptionCode },
      data: {
        isUsed: true,
        usedAt: new Date(),
      },
    });

    return {
      coupon: updatedCoupon,
      rewardName: userReward.reward.name,
      username: userReward.user.username,
    };
  }

  static async getUserRewards(userId, status) {
    const whereClause = { userId };

    if (status === 'active') {
      whereClause.isUsed = false;
    } else if (status === 'used') {
      whereClause.isUsed = true;
    }

    const myRewards = await prisma.userReward.findMany({
      where: whereClause,
      include: {
        reward: {
          select: {
            name: true,
            pointsCost: true,
            imageUrl: true,
          },
        },
      },
      orderBy: { redeemedAt: 'desc' },
    });

    return myRewards;
  }

  static async toggleRewardStatus(rewardId) {
    const reward = await prisma.reward.findUnique({
      where: { id: rewardId },
      select: { isActive: true },
    });

    if (!reward) throw new Error('REWARD_NOT_FOUND');

    const updatedReward = await prisma.reward.update({
      where: { id: rewardId },
      data: {
        isActive: !reward.isActive,
      },
    });

    return updatedReward;
  }
}

export default RewardService;
