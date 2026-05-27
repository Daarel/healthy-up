import prisma from '../lib/prisma.js';

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

export { deleteProfile, getUserProfile };
