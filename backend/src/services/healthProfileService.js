import prisma from '../lib/prisma.js';

class HealthProfileService {
  static async createProfile(userId, profileData) {
    const heightInMeters = profileData.heightCm / 100;

    const calculatedBMI =
      profileData.weightKg / (heightInMeters * heightInMeters);

    const factualBMI = parseFloat(calculatedBMI.toFixed(2));

    const savedProfile = await prisma.healthProfile.upsert({
      where: { userId },
      update: {
        factualBMI,
        ...profileData,
      },
      create: {
        userId,
        factualBMI,
        ...profileData,
      },
    });

    return savedProfile;
  }

  static async getCalorieLog(userId) {
    const endDate = new Date();
    const startDate = new Date();

    startDate.setDate(endDate.getDate() - 6);

    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    const rawLogs = await prisma.calorieLog.findMany({
      where: {
        userId: userId,
        loggedAt: { gte: startDate, lte: endDate },
      },
    });

    const physicalMissions = await prisma.mission.findMany({
      where: {
        userId: userId,
        category: 'physical',
        status: 'completed',
        completedAt: { gte: startDate, lte: endDate },
      },
    });

    const logMap = {};
    rawLogs.forEach((log) => {
      const dateString = log.loggedAt.toISOString().split('T')[0];
      logMap[dateString] = (logMap[dateString] || 0) + log.calories;
    });

    physicalMissions.forEach((mission) => {
      if (mission.completedAt && mission.caloriesImpact) {
        const dateString = mission.completedAt.toISOString().split('T')[0];
        logMap[dateString] =
          (logMap[dateString] || 0) + Math.abs(mission.caloriesImpact);
      }
    });

    const filledLogs = [];
    let currentDate = new Date(startDate);
    let weeklyTotal = 0;

    while (currentDate <= endDate) {
      const dateString = currentDate.toISOString().split('T')[0];
      const dailyCalories = logMap[dateString] || 0;

      filledLogs.push({
        date: dateString,
        calories: dailyCalories,
      });

      weeklyTotal += dailyCalories;

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return {
      weeklyBurnedFromLog: weeklyTotal,
      dailyLogs: filledLogs,
    };
  }

  static async createCalorieLog(userId, calories) {
    const newCalorieLog = await prisma.calorieLog.create({
      data: {
        userId,
        calories,
      },
    });

    return newCalorieLog;
  }

  static getStartOfCurrentWeek() {
    const now = new Date();
    const day = now.getDay(); // 0 (Sun) - 6 (Sat)
    const diffToMonday = day === 0 ? -6 : 1 - day;
    const monday = new Date(now);
    monday.setDate(now.getDate() + diffToMonday);
    monday.setHours(0, 0, 0, 0);
    return monday;
  }

  static async getWeightLogs(userId, range) {
    const limit = range === 'week' ? 7 : 30;

    const rawLogs = await prisma.weightLog.findMany({
      where: {
        userId: userId,
      },
      orderBy: { loggedAt: 'desc' },
      take: limit,
    });

    // Urutkan kembali secara kronologis (terlama ke terbaru) untuk grafik & perhitungan selisih
    const chronologicalLogs = rawLogs.reverse().map((log) => ({
      id: log.id,
      date: log.loggedAt.toISOString().split('T')[0],
      loggedAt: log.loggedAt,
      weight: log.weight,
    }));

    return chronologicalLogs;
  }

  static async createWeightLogAndUpdateProfile(userId, weight) {
    const startOfWeek = HealthProfileService.getStartOfCurrentWeek();

    const existingThisWeek = await prisma.weightLog.findFirst({
      where: {
        userId,
        loggedAt: {
          gte: startOfWeek,
        },
      },
    });

    if (existingThisWeek) {
      throw new Error('WEIGHT_ALREADY_LOGGED_THIS_WEEK');
    }

    const [newWeightLog] = await prisma.$transaction([
      prisma.weightLog.create({
        data: { userId, weight },
      }),
      prisma.healthProfile.updateMany({
        where: { userId },
        data: { weightKg: weight },
      }),
    ]);

    return { newWeightLog, updatedHealthProfile: { weightKg: weight } };
  }

  static async getMyProfile(userId) {
    const profile = await prisma.healthProfile.findUnique({
      where: { userId: userId },
    });

    if (!profile) {
      throw new Error('PROFILE_NOT_FOUND');
    }

    return profile;
  }
}

export default HealthProfileService;
