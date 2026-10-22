import axios from 'axios';

import prisma from '../lib/prisma.js';
import UserService from './userService.js';

const DEFAULT_CATEGORY_ICON = {
  nutrition: 'utensils',
  physical: 'dumbbell',
  mental: 'brain',
};

const VARIETY_QUEST_POOL = [
  // Nutrition
  {
    quest_name: 'Detoks Gula Tambahan Sehari',
    description: 'Hindari minuman manis kemasan dan ganti dengan air putih atau infused water sepanjang hari.',
    category: 'nutrition',
    icon: 'droplets',
    difficultyScore: 2,
    caloriesImpact: -150,
    xpReward: 50,
    pointsReward: 20,
  },
  {
    quest_name: 'Piring Pelangi Serat Tinggi',
    description: 'Konsumsi minimal 2 warna sayuran berbeda pada makan siang dan makan malam.',
    category: 'nutrition',
    icon: 'salad',
    difficultyScore: 2,
    caloriesImpact: -120,
    xpReward: 60,
    pointsReward: 25,
  },
  {
    quest_name: 'Protein Tanpa Gorengan',
    description: 'Pilih sumber protein yang direbus, dikukus, atau dipanggang tanpa minyak berlebih.',
    category: 'nutrition',
    icon: 'utensils',
    difficultyScore: 3,
    caloriesImpact: -200,
    xpReward: 70,
    pointsReward: 30,
  },
  {
    quest_name: 'Cemilan Kacang & Buah Utuh',
    description: 'Ganti cemilan tepung/keripik dengan buah potong segar atau segenggam kacang panggang.',
    category: 'nutrition',
    icon: 'apple',
    difficultyScore: 1,
    caloriesImpact: -100,
    xpReward: 45,
    pointsReward: 15,
  },
  {
    quest_name: 'Jeda Makan Malam 3 Jam Sebelum Tidur',
    description: 'Selesaikan makan malam minimal 3 jam sebelum waktu tidur agar metabolisme optimal.',
    category: 'nutrition',
    icon: 'utensils',
    difficultyScore: 3,
    caloriesImpact: -180,
    xpReward: 65,
    pointsReward: 25,
  },
  // Physical
  {
    quest_name: 'Jalan Cepat 4.000 Langkah',
    description: 'Lakukan jalan cepat selama 25-30 menit di pagi atau sore hari dengan ritme stabil.',
    category: 'physical',
    icon: 'footprints',
    difficultyScore: 2,
    caloriesImpact: -180,
    xpReward: 60,
    pointsReward: 25,
  },
  {
    quest_name: 'Sesi Kardio Ringan 20 Menit',
    description: 'Lakukan senam aerobik, bersepeda, atau jumping jack ringan selama 20 menit.',
    category: 'physical',
    icon: 'flame',
    difficultyScore: 3,
    caloriesImpact: -220,
    xpReward: 75,
    pointsReward: 30,
  },
  {
    quest_name: 'Latihan Kekuatan Tubuh Inti (Core)',
    description: 'Lakukan kombinasi plank, squat, dan push-up ringan sebanyak 3 set.',
    category: 'physical',
    icon: 'dumbbell',
    difficultyScore: 3,
    caloriesImpact: -190,
    xpReward: 70,
    pointsReward: 30,
  },
  {
    quest_name: 'Peregangan Aktif & Mobilitas Sendi',
    description: 'Lakukan dynamic stretching selama 15 menit untuk menjaga kelenturan otot dan postur.',
    category: 'physical',
    icon: 'bike',
    difficultyScore: 1,
    caloriesImpact: -90,
    xpReward: 45,
    pointsReward: 20,
  },
  // Mental
  {
    quest_name: 'Relaksasi Pernapasan Box Breathing',
    description: 'Lakukan latihan pernapasan 4-4-4-4 selama 10 menit untuk menurunkan hormon stres kortisol.',
    category: 'mental',
    icon: 'wind',
    difficultyScore: 1,
    caloriesImpact: -30,
    xpReward: 50,
    pointsReward: 20,
  },
  {
    quest_name: 'Tidur Berkualitas Tanpa Gadget',
    description: 'Matikan layar HP 30 menit sebelum tidur dan targetkan tidur 7-8 jam malam ini.',
    category: 'mental',
    icon: 'moon',
    difficultyScore: 2,
    caloriesImpact: -50,
    xpReward: 60,
    pointsReward: 25,
  },
  {
    quest_name: 'Jurnal Syukur & Evaluasi Diri',
    description: 'Catat 3 pencapaian sehat hari ini dan perasaanmu untuk menjaga motivasi tetap positif.',
    category: 'mental',
    icon: 'brain',
    difficultyScore: 1,
    caloriesImpact: -25,
    xpReward: 45,
    pointsReward: 20,
  },
  {
    quest_name: 'Meditasi Mindfulness Pagi 10 Menit',
    description: 'Duduk tenang dan fokus pada napas selama 10 menit sebelum memulai aktivitas harian.',
    category: 'mental',
    icon: 'heart',
    difficultyScore: 2,
    caloriesImpact: -35,
    xpReward: 55,
    pointsReward: 20,
  },
];

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

    // Ambil daftar judul misi terakhir user agar generasi berikutnya bisa bervariasi
    const previousMissions = await prisma.mission.findMany({
      where: { userId: userId },
      orderBy: { createdAt: 'desc' },
      take: 14,
      select: { title: true },
    });
    const previousTitles = new Set(
      previousMissions.map((m) => m.title.trim().toLowerCase()),
    );

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
      let ai_analysis = {
        factual_bmi: Number(profile.factualBMI),
      };
      let rawQuests = [];

      try {
        const aiResponse = await axios.post(
          'https://dkarnnd-ai-healthyup.hf.space/api/generate_quests',
          aiPayload,
          { timeout: 15000 },
        );
        if (aiResponse.data?.ai_analysis) {
          ai_analysis = aiResponse.data.ai_analysis;
        }
        rawQuests = aiResponse.data?.gamification_data?.quests || [];
      } catch (aiErr) {
        console.warn(
          'AI endpoint fallback digunakan karena kendala koneksi:',
          aiErr.message,
        );
      }

      // Cek berapa banyak quest dari AI yang sama persis dengan misi sebelumnya
      const duplicateCount = rawQuests.filter((q) =>
        previousTitles.has(String(q.quest_name || '').trim().toLowerCase()),
      ).length;

      let selectedQuests = rawQuests;

      // Jika kosong atau mayoritas sama dengan misi sebelumnya (karena sifat deterministik endpoint AI),
      // variasikan dengan pool misi yang belum pernah didapat user baru-baru ini
      if (
        rawQuests.length === 0 ||
        (previousTitles.size > 0 && duplicateCount >= Math.ceil(rawQuests.length / 2))
      ) {
        const freshFromPool = VARIETY_QUEST_POOL.filter(
          (q) => !previousTitles.has(q.quest_name.toLowerCase()),
        );
        const poolToUse =
          freshFromPool.length >= 6 ? freshFromPool : [...VARIETY_QUEST_POOL];

        // Acak urutan (Fisher-Yates shuffle) agar setiap generate menghasilkan kombinasi segar
        const shuffled = [...poolToUse];
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }

        // Pastikan proporsi kategori seimbang (nutrition, physical, mental)
        const byCat = {
          nutrition: shuffled.filter((q) => q.category === 'nutrition'),
          physical: shuffled.filter((q) => q.category === 'physical'),
          mental: shuffled.filter((q) => q.category === 'mental'),
        };

        const nonDuplicateAi = rawQuests.filter(
          (q) => !previousTitles.has(String(q.quest_name || '').trim().toLowerCase()),
        );

        selectedQuests = [
          ...nonDuplicateAi.slice(0, 2),
          ...byCat.nutrition.slice(0, 3),
          ...byCat.physical.slice(0, 2),
          ...byCat.mental.slice(0, 2),
        ].slice(0, 7);
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const newMissions = selectedQuests.map((quest) => {
        const category = String(quest.category || 'physical').toLowerCase();
        const rawIcon = quest.icon ? String(quest.icon).toLowerCase() : '';
        const resolvedIcon =
          rawIcon && rawIcon !== 'activity'
            ? rawIcon
            : DEFAULT_CATEGORY_ICON[category] || 'activity';

        return {
          userId: userId,
          title: quest.quest_name,
          description: quest.description,
          category,
          icon: resolvedIcon,
          difficultyScore: quest.difficultyScore || 1,
          caloriesImpact: quest.caloriesImpact || 0,
          status: 'assigned',
          scheduledDate: today,
          xpReward: quest.xpReward || 50,
          pointsReward: quest.pointsReward || 20,
        };
      });

      const [, , createdMissions] = await prisma.$transaction(
        [
          prisma.healthProfile.update({
            where: { userId: userId },
            data: {
              factualBMI:
                ai_analysis?.factual_bmi ?? Number(profile.factualBMI),
            },
          }),
          // Hapus misi minggu ini yang masih berstatus 'assigned' agar tidak duplikat saat regenerate
          prisma.mission.deleteMany({
            where: {
              userId: userId,
              status: 'assigned',
              createdAt: {
                gte: sevenDaysAgo,
              },
            },
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
        gamification_data: { quests: selectedQuests },
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

    if (mission.verificationStatus === 'approved') {
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
        rejectionReason:
          newStatus === 'completed' ? null : mission.rejectionReason,
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

        // Hitung akumulasi EXP dan naik level secara otomatis
        const totalExp =
          (mission.user.experiencePoints || 0) + (mission.xpReward || 0);
        const {
          experiencePoints: newExp,
          level: newLevel,
          rankTitle: newRankTitle,
          badges: newBadges,
        } = UserService.calculateLevelAndRank(
          totalExp,
          mission.user.level || 1,
          mission.user.rankTitle || 'pemula',
          mission.user.badges || [],
        );

        const updatedUser = await tx.user.update({
          where: { id: mission.userId },
          data: {
            experiencePoints: newExp,
            rewardPoints: { increment: mission.pointsReward },
            level: newLevel,
            rankTitle: newRankTitle,
            badges: newBadges,
            streakCount: newStreakCount,
            lastStreakUpdateAt: newLastUpdateAt,
          },
          select: {
            experiencePoints: true,
            rewardPoints: true,
            level: true,
            rankTitle: true,
            badges: true,
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
