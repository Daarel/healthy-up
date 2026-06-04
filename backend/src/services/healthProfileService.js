import prisma from '../lib/prisma.js';

class HealthProfileService {
  static async createProfile(userId, profileData) {
    const profileExists = await prisma.healthProfile.findUnique({
      where: { userId },
    });

    if (profileExists) {
      throw new Error('PROFILE_ALREADY_EXISTS');
    }

    const heightInMeters = profileData.heightCm / 100;

    const calculatedBMI =
      profileData.weightKg / (heightInMeters * heightInMeters);

    const factualBMI = parseFloat(calculatedBMI.toFixed(2));

    const newProfile = await prisma.healthProfile.create({
      data: {
        userId,
        factualBMI,
        ...profileData,
      },
    });

    return newProfile;
  }

  static async getCalorieLog(userId) {
    // const now = new Date();
    // const startOfToday = new Date(
    //   now.getFullYear(),
    //   now.getMonth(),
    //   now.getDate(),
    // );

    // const startOfWeek = new Date(startOfToday);
    // startOfWeek.setDate(startOfWeek.getDate() - 7);

    // const [weeklyLog, weeklyPhysicalMissions] = await Promise.all([
    //   prisma.calorieLog.aggregate({
    //     _sum: { calories: true },
    //     where: {
    //       userId,
    //       loggedAt: { gte: startOfWeek },
    //     },
    //   }),

    //   prisma.mission.aggregate({
    //     _sum: { caloriesImpact: true },
    //     where: {
    //       userId,
    //       category: 'physical',
    //       status: 'completed',
    //       completedAt: { gte: startOfWeek },
    //     },
    //   }),
    // ]);

    // const burnedFromLog = weeklyLog._sum.calories || 0;

    // const burnedFromMissions = Math.abs(
    //   weeklyPhysicalMissions._sum.caloriesImpact || 0,
    // );

    // return {
    //   status: 'success',
    //   data: {
    //     weeklyBurnedFromLog: burnedFromLog,
    //     weeklyBurnedFromMissions: burnedFromMissions,
    //   },
    // };
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
  
    const logMap = {};
    rawLogs.forEach((log) => {
      const dateString = log.loggedAt.toISOString().split('T')[0];
    
      logMap[dateString] = (logMap[dateString] || 0) + log.calories;
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

  static async getWeightLogs(userId, range) {
    const endDate = new Date();
    const startDate = new Date();

    if (range === 'week') {
      startDate.setDate(endDate.getDate() - 6);
    } else if (range === 'month') {
      startDate.setDate(endDate.getDate() - 29);
    }
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    const rawLogs = await prisma.weightLog.findMany({
      where: {
        userId: userId,
        loggedAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { loggedAt: 'asc' },
    });

    const logMap = {};
    rawLogs.forEach((log) => {
      const dateString = log.loggedAt.toISOString().split('T')[0];
      logMap[dateString] = log.weight;
    });

    const filledLogs = [];
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dateString = currentDate.toISOString().split('T')[0];

      filledLogs.push({
        date: dateString,
        weight: logMap[dateString] || 0,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return filledLogs;
  }

  static async createWeightLogAndUpdateProfile(userId, weight) {
    const [newWeightLog, updatedHealthProfile] = await prisma.$transaction([
      prisma.weightLog.create({
        data: { userId, weight },
      }),
      prisma.healthProfile.update({
        where: { userId },
        data: { weightKg: weight },
      }),
    ]);

    return { newWeightLog, updatedHealthProfile };
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
