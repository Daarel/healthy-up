import axios from 'axios';

import prisma from '../lib/prisma.js';

class MissionService {
  static async getWeeklyProgress(userId) {
    const curr = new Date();

    const sevenDaysAgo = new Date(curr.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [totalMissions, completedMissions] = await prisma.$transaction([
      prisma.mission.count({
        where: {
          userId: userId,
          createdAt: {
            gte: sevenDaysAgo,
          },
        },
      }),
      prisma.mission.count({
        where: {
          userId: userId,
          createdAt: {
            gte: sevenDaysAgo,
          },
          status: 'completed',
          verificationStatus: 'approved',
        },
      }),
    ]);

    let percentage = 0;
    if (totalMissions > 0) {
      percentage = Math.round((completedMissions / totalMissions) * 100);
    }

    return {
      percentage,
      completedMissions,
      totalMissions,
      period: {
        start: sevenDaysAgo,
        end: curr,
      },
    };
  }

  static async generateAndSaveQuests(userId) {
    const profile = await prisma.healthProfile.findUnique({
      where: { userId: userId },
      include: {
        user: { select: { username: true } },
      },
    });

    if (!profile) throw new Error('PROFILE_NOT_FOUND');

    const curr = new Date();
    const sevenDaysAgo = new Date(curr.getTime() - 7 * 24 * 60 * 60 * 1000);

    const existingMissionsThisWeek = await prisma.mission.count({
      where: {
        userId: userId,
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
    });

    if (existingMissionsThisWeek > 0) {
      throw new Error('MISSIONS_ALREADY_GENERATED');
    }

    const aiPayload = {
      username: profile.user.username,
      goalWeight: Number(profile.goalWeight),
      factualBMI: Number(profile.factualBMI),
      heightCm: Number(profile.heightCm),
      weightKg: Number(profile.weightKg),
      gender: profile.gender === 'male' ? 'Male' : 'Female',
      age: profile.age,
    };

    try {
      const aiResponse = await axios.post(
        'https://dkarnnd-ai-healthyup.hf.space/api/generate_quests',
        aiPayload,
      );

      const { ai_analysis, gamification_data } = aiResponse.data;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const newMissions = [];

      gamification_data.quests.forEach((quest) => {
        newMissions.push({
          userId: userId,
          title: quest.quest_name,
          description: quest.description,
          category: quest.category.toLowerCase(),
          icon: quest.icon || 'activity',
          difficultyScore: quest.difficultyScore || 1,
          caloriesImpact: quest.caloriesImpact || 0,
          status: 'assigned',
          scheduledDate: today,
          xpReward: quest.xpReward,
          pointsReward: quest.pointsReward,
        });
      });

      const [, createdMissions] = await prisma.$transaction(
        [
          prisma.healthProfile.update({
            where: { userId: userId },
            data: { factualBMI: ai_analysis.factual_bmi },
          }),
          prisma.mission.createMany({
            data: newMissions,
          }),
        ],
        {
          maxWait: 25000,
          timeout: 30000,
        },
      );

      return {
        ai_analysis,
        total_quests_generated: createdMissions.count,
        gamification_data,
      };
    } catch (error) {
      console.error(
        'AI Service Error:',
        error?.response?.data || error.message,
      );
      throw new Error('AI_GENERATION_FAILED', { cause: error });
    }
  }

  static async getMissionById(missionId, userId) {
    const mission = await prisma.mission.findFirst({
      where: {
        id: missionId,
        userId: userId,
      },
    });

    if (!mission) throw new Error('MISSION_NOT_FOUND');
    return mission;
  }

  static async updateMissionStatus(
    missionId,
    userId,
    newStatus,
    proofImagePath,
  ) {
    const mission = await prisma.mission.findFirst({
      where: { id: missionId, userId: userId },
    });

    if (!mission) throw new Error('MISSION_NOT_FOUND');

    if (mission.status === 'completed') {
      throw new Error('MISSION_ALREADY_COMPLETED');
    }

    const updatedMission = await prisma.mission.update({
      where: { id: missionId },
      data: {
        status: newStatus,
        completedAt: newStatus === 'completed' ? new Date() : null,
        proofImagePath: proofImagePath || mission.proofImagePath,
        verificationStatus:
          newStatus === 'completed' ? 'pending' : mission.verificationStatus,
      },
    });

    return { mission: updatedMission, userStats: null };
  }

  static async verifyMission(missionId, verificationStatus, rejectionReason) {
    const mission = await prisma.mission.findUnique({
      where: { id: missionId },
      include: { user: true },
    });

    if (!mission) throw new Error('MISSION_NOT_FOUND');
    if (mission.verificationStatus !== 'pending') {
      throw new Error('MISSION_ALREADY_VERIFIED');
    }

    return await prisma.$transaction(async (tx) => {
      if (verificationStatus === 'approved') {
        const approvedMission = await tx.mission.update({
          where: { id: missionId },
          data: { verificationStatus: 'approved' },
        });

        if (mission.caloriesImpact && mission.caloriesImpact !== 0) {
          await tx.calorieLog.create({
            data: {
              userId: mission.userId,
              calories: Math.abs(mission.caloriesImpact),
            },
          });
        }

        // Streak Logic
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];
        const lastUpdate = mission.user.lastStreakUpdateAt;
        const lastUpdateStr = lastUpdate
          ? lastUpdate.toISOString().split('T')[0]
          : null;

        let newStreakCount = mission.user.streakCount;
        let newLastUpdateAt = lastUpdate;

        if (lastUpdateStr !== todayStr) {
          const yesterday = new Date(now);
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split('T')[0];

          if (lastUpdateStr === yesterdayStr) {
            newStreakCount += 1;
          } else {
            newStreakCount = 1; // reset or first time
          }
          newLastUpdateAt = now;
        }

        const updatedUser = await tx.user.update({
          where: { id: mission.userId },
          data: {
            experiencePoints: { increment: mission.xpReward },
            rewardPoints: { increment: mission.pointsReward },
            streakCount: newStreakCount,
            lastStreakUpdateAt: newLastUpdateAt,
          },
          select: {
            experiencePoints: true,
            rewardPoints: true,
            level: true,
            streakCount: true,
          },
        });

        return { mission: approvedMission, userStats: updatedUser };
      }

      if (verificationStatus === 'rejected') {
        const rejectedMission = await tx.mission.update({
          where: { id: missionId },
          data: {
            status: 'failed',
            verificationStatus: 'rejected',
            rejectionReason: rejectionReason || null,
          },
        });

        return { mission: rejectedMission, userStats: null };
      }
    });
  }

  static async getUserMissions(userId, dateString, statusFilter) {
    let endDate = new Date();

    if (dateString) {
      endDate = new Date(dateString);
      endDate.setHours(23, 59, 59, 999);
    }

    const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
    startDate.setHours(0, 0, 0, 0);

    const whereClause = {
      userId: userId,
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    };

    if (statusFilter) {
      whereClause.status = statusFilter;
    }

    const missions = await prisma.mission.findMany({
      where: whereClause,
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
    });

    return missions;
  }

  static async getPendingVerifications(verificationStatus = 'pending') {
    const VALID_STATUSES = ['pending', 'approved', 'rejected'];

    const whereClause = {};

    if (verificationStatus === 'all') {
      whereClause.OR = [
        { status: 'completed' },
        { verificationStatus: 'rejected' },
      ];
    } else if (verificationStatus === 'rejected') {
      whereClause.verificationStatus = 'rejected';
    } else if (VALID_STATUSES.includes(verificationStatus)) {
      whereClause.status = 'completed';
      whereClause.verificationStatus = verificationStatus;
    }

    const missions = await prisma.mission.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            username: true,
            email: true,
          },
        },
      },
      orderBy: {
        completedAt: 'asc',
      },
    });

    return missions;
  }
}

export default MissionService;
