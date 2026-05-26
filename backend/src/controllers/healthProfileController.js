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

export { createProfile };
