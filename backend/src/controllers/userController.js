import { z } from 'zod';

import prisma from '../lib/prisma.js';
import { getAllUsersSchema } from '../schemas/userSchema.js';

/**
 * * @desc    Get User Information
 * ! @route   GET /api/v1/users/profile
 * ? @access  Private
 */
const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const userProfile = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        username: true,
        email: true,
        rankTitle: true,
        level: true,
        experiencePoints: true,
        rewardPoints: true,
        streakCount: true,
        profilePictures: true
      },
    });

    if (!userProfile) {
      return res.status(404).json({
        status: 'error',
        message: 'Pengguna tidak ditemukan',
      });
    }

    return res.status(200).json({
      status: 'success',
      data: {
        user: userProfile,
      },
    });
  } catch (err) {
    console.error('Gagal mendapat informasi user', err);
    return res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server saat mengambil data profil',
    });
  }
};

/**
 * * @desc    DELETE User Information
 * ! @route   DELETE /api/v1/users/profile
 * ? @access  Private
 */
const deleteProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    await prisma.user.delete({
      where: { id: userId },
    });

    res.cookie('jwt', '', {
      httpOnly: true,
      expires: new Date(0),
    });

    return res.status(200).json({
      status: 'success',
      message: 'Akun dan seluruh data Anda telah dihapus secara permanen.',
      action: 'redirect_to_login',
    });
  } catch (error) {
    console.error('Error deleting user profile:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Terjadi kesalahan pada server saat menghapus akun',
    });
  }
};

const handleZodError = (err, res) => {
  return res.status(400).json({
    status: 'fail',
    errors: err.errors.map((e) => ({ field: e.path[0], message: e.message })),
  });
};

const handleServerError = (
  err,
  res,
  customMessage = 'Internal server error',
) => {
  console.error('UserController Error:', err);
  return res.status(500).json({ status: 'error', message: customMessage });
};

/**
 * * @desc    Get All User Information
 * ! @route   GET /api/v1/users/all-users
 * ? @access  Public
 */
const getAllUsers = async (req, res) => {
  try {
    const { page, limit } = getAllUsersSchema.parse(req.body);
    const skip = (page - 1) * limit;

    const [users, totalData] = await prisma.$transaction([
      prisma.user.findMany({
        skip: skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          username: true,
          email: true,
          rankTitle: true,
          level: true,
          streakCount: true,
          createdAt: true,
        },
      }),
      prisma.user.count(),
    ]);

    const totalPages = Math.ceil(totalData / limit);

    return res.status(200).json({
      status: 'success',
      data: {
        users,
        pagination: {
          totalData,
          totalPages,
          currentPage: page,
          limit,
        },
      },
    });
  } catch (err) {
    if (err instanceof z.ZodError) return handleZodError(err, res);
    return handleServerError(err, res);
  }
};

export { deleteProfile, getAllUsers, getUserProfile };
