import { z } from 'zod';

import prisma from '../lib/prisma.js';
import { createHealthProfileSchema } from '../schemas/healthProfileSchema.js';

/**
 * * @desc    Add Health Profile Data User
 * ! @route   POST /api/v1/health-profiles/
 * ? @access  Public
 */
const createProfile = async (req, res) => {
  try {
    const validatedData = createHealthProfileSchema.parse(req.body);
    const { gender, age, heightCm, weightKg, goalWeight } = validatedData;

    const userId = req.user.id;

    const profileExists = await prisma.healthProfile.findUnique({
      where: { userId },
    });

    if (profileExists) {
      return res.status(400).json({
        status: 'error',
        message: 'Profil kesehatan untuk pengguna ini sudah ada',
      });
    }

    const newProfile = await prisma.healthProfile.create({
      data: {
        userId,
        gender,
        age,
        heightCm,
        weightKg,
        goalWeight,
      },
    });

    return res.status(201).json({
      status: 'success',
      message: 'Profil kesehatan berhasil disimpan',
      data: {
        profile: newProfile,
      },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({
        status: 'fail',
        errors: err.errors.map((e) => ({
          field: e.path[0],
          message: e.message,
        })),
      });
    }

    console.error('Error at createProfile:', err);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

/**
 * * @desc    Get User Calories Data
 * ! @route   GET /api/v1/health-profiles/caloriesSummary
 * ? @access  Public
 */
const getCaloriesSummary = async (req, res) => {
  try {
    const userId = req.user.id;

    const now = new Date();

    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );

    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(startOfWeek.getDate() - 7);

    const [dailyPhysical, weeklyPhysical, healthProfile] = await Promise.all([
      // Kalori terbakar hari ini
      prisma.mission.aggregate({
        _sum: { caloriesImpact: true },
        where: {
          userId,
          category: 'physical',
          status: 'completed',
          completedAt: { gte: startOfToday },
        },
      }),

      // Kalori terbakar minggu ini
      prisma.mission.aggregate({
        _sum: { caloriesImpact: true },
        where: {
          userId,
          category: 'physical',
          status: 'completed',
          completedAt: { gte: startOfWeek },
        },
      }),

      prisma.healthProfile.findUnique({
        where: { userId },
        select: { goalWeight: true },
      }),
    ]);

    const burnedToday = dailyPhysical._sum.caloriesImpact || 0;
    const burnedWeekly = weeklyPhysical._sum.caloriesImpact || 0;

    return res.status(200).json({
      status: 'success',
      data: {
        calories: {
          burnedToday,
          burnedWeekly,
        },
        profile: healthProfile,
      },
    });
  } catch (err) {
    console.error('Error fetching dashboard summary:', err);
    return res.status(500).json({
      status: 'error',
      message: 'Gagal mengambil data dashboard',
    });
  }
};

/**
 * * @desc    Add User Daily Weight Loss
 * ! @route   GET /api/v1/health-profiles/getWeightLog
 * ? @access  Public
 */


export { createProfile, getCaloriesSummary };
