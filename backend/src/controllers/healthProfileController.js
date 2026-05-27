import { z } from 'zod';

import prisma from '../lib/prisma.js';
import {
  createHealthProfileSchema,
  createWeightLogsSchema,
} from '../schemas/healthProfileSchema.js';

/**
 * * @desc    Add Health Profile Data User
 * ! @route   POST /api/v1/health-profiles/
 * ? @access  Private
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
 * ! @route   GET /api/v1/health-profiles/calories-summary
 * ? @access  Private
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
 * * @desc    Get User Daily Weight Loss
 * ! @route   GET /api/v1/health-profiles/weight-logs
 * ? @access  Private
 */
const getWeightLog = async (req, res) => {
  try {
    const userId = req.user.id;

    const weightLogs = await prisma.weightLog.findMany({
      where: {
        userId: userId,
      },
      orderBy: {
        loggedAt: 'desc',
      },
      select: {
        id: true,
        weight: true,
        loggedAt: true,
      },
    });

    return res.status(200).json({
      status: 'success',
      data: {
        weightLogs: weightLogs,
      },
    });
  } catch (err) {
    console.error('Gagal fetch weight logs:', err);
    return res.status(500).json({
      status: 'error',
      message: 'Gagal mengambil eiwayat berat badan',
    });
  }
};

/**
 * * @desc    Add User Daily Weight Loss
 * ! @route   POST /api/v1/health-profiles/weight-logs
 * ? @access  Private
 */
const createWeightLog = async (req, res) => {
  try {
    const validatedData = createWeightLogsSchema.parse(req.body);
    const userId = req.user.id;

    const [newWeightLog, updatedHealthProfile] = await prisma.$transaction([
      // Kueri 1: Buat riwayat log berat badan baru
      prisma.weightLog.create({
        data: {
          userId: userId,
          weight: validatedData.weight,
        },
      }),

      prisma.healthProfile.update({
        where: { userId: userId },
        data: { weight: validatedData.weight },
      }),
    ]);

    return res.status(201).json({
      status: 'success',
      message: 'Berat badan berhasil dicatat dan profil kesehatan telah diperbarui!',
      data: {
        weightLog: newWeightLog,
        currentWeight: updatedHealthProfile.weight,
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

    if (err.code === 'P2025') {
      return res.status(404).json({
        status: 'error',
        message: 'Profil kesehatan belum dibuat untuk pengguna ini.',
      });
    }

    console.error('Error creating weight log:', err);
    return res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server saat menyimpan data',
    });
  }
};

export { createProfile, createWeightLog, getCaloriesSummary, getWeightLog };
