import { z } from 'zod';

import cloudinary from '../config/cloudinary.js';
import {
  deleteUserByAdminSchema,
  getAllUsersSchema,
} from '../schemas/userSchema.js';
import UserService from '../services/userService.js';

class UserController {
  /**
   * * @desc    Get User Information
   * ! @route   GET /api/v1/users/profile
   * ? @access  Private
   */
  static async getUserProfile(req, res) {
    try {
      const userId = req.user.id;
      const userProfile = await UserService.getUserProfile(userId);

      return res.status(200).json({
        status: 'success',
        data: { user: userProfile },
      });
    } catch (err) {
      if (err.message === 'USER_NOT_FOUND') {
        return res.status(404).json({
          status: 'error',
          message: 'Pengguna tidak ditemukan',
        });
      }
      return UserController.handleServerError(
        err,
        res,
        'Terjadi kesalahan saat mengambil profil',
      );
    }
  }

  /**
   * * @desc    DELETE User Information
   * ! @route   DELETE /api/v1/users/profile
   * ? @access  Private
   */
  static async deleteProfile(req, res) {
    try {
      const userId = req.user.id;
      await UserService.deleteUserProfile(userId);

      res.cookie('jwt', '', {
        httpOnly: true,
        expires: new Date(0),
      });

      return res.status(200).json({
        status: 'success',
        message: 'Akun dan seluruh data Anda telah dihapus secara permanen.',
        action: 'redirect_to_login',
      });
    } catch (err) {
      return UserController.handleServerError(
        err,
        res,
        'Terjadi kesalahan saat menghapus akun',
      );
    }
  }

  /**
   * * @desc    DELETE User by Admin
   * ! @route   DELETE /api/v1/users/:id
   * ? @access  Private (Admin Only)
   */
  static async deleteUserByAdmin(req, res) {
    try {
      const { id: targetUserId } = deleteUserByAdminSchema.parse(req.params);

      if (req.user.id === targetUserId) {
        return res.status(400).json({
          status: 'error',
          message:
            'Anda tidak bisa menghapus akun Anda sendiri melalui endpoint ini. Gunakan rute penghapusan profil pribadi.',
        });
      }

      await UserService.deleteUserProfile(targetUserId);

      return res.status(200).json({
        status: 'success',
        message:
          'Akun pengguna tersebut beserta seluruh datanya telah berhasil dihapus.',
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return UserController.handleZodError(err, res);
      }

      if (err.code === 'P2025') {
        return res.status(404).json({
          status: 'error',
          message: 'Pengguna yang ingin dihapus tidak ditemukan.',
        });
      }

      return UserController.handleServerError(
        err,
        res,
        'Terjadi kesalahan saat admin menghapus akun',
      );
    }
  }

  /**
   * * @desc    Get All User Information
   * ! @route   GET /api/v1/users/all-users
   * ? @access  Admin
   */
  static async getAllUsers(req, res) {
    try {
      const { page, limit } = getAllUsersSchema.parse(req.query);

      const result = await UserService.getAllUsersWithPagination(page, limit);

      return res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (err) {
      if (err instanceof z.ZodError)
        return UserController.handleZodError(err, res);
      return UserController.handleServerError(err, res);
    }
  }

  /**
   * * @desc    Update User Profile Picture
   * ! @route   PATCH /api/v1/users/profile/picture
   * ? @access  Private
   */
  static async updatePicture(req, res) {
    try {
      const userId = req.user.id;

      if (!req.file) {
        return res.status(400).json({
          status: 'error',
          message: 'Harap pilih file gambar terlebih dahulu',
        });
      }

      const fileBase64 = req.file.buffer.toString('base64');
      const fileUrl = `data:${req.file.mimetype};base64,${fileBase64}`;

      // 3. Tembak ke Cloudinary
      const uploadResponse = await cloudinary.uploader.upload(fileUrl, {
        folder: 'healthyup/profiles',
        allowed_formats: ['jpg', 'png', 'jpeg'],
        transformation: [
          { width: 200, height: 200, crop: 'fill', gravity: 'face' },
        ],
      });

      const cdnImageUrl = uploadResponse.secure_url;

      const updatedUser = await UserService.updateProfilePicture(
        userId,
        cdnImageUrl,
      );

      return res.status(200).json({
        status: 'success',
        message: 'Foto profil berhasil diperbarui',
        data: { user: updatedUser },
      });
    } catch (err) {
      console.error('Cloudinary Upload Error:', err);
      return res.status(500).json({
        status: 'error',
        message: 'Gagal memperbarui foto profil di server',
      });
    }
  }

  /**
   * * @desc    Level Up User and Update Title
   * ! @route   POST /api/v1/users/level-up
   * ? @access  Private
   */
  static async levelUp(req, res) {
    try {
      const userId = req.user.id;
      const updatedUser = await UserService.processLevelUp(userId);

      const isGotNewBadge = [10, 20, 30].includes(updatedUser.level);
      const extraMessage = isGotNewBadge
        ? ' dan Anda mendapatkan lencana baru!'
        : '!';

      return res.status(200).json({
        status: 'success',
        message: `Selamat! Anda berhasil naik ke Level ${updatedUser.level}${extraMessage}`,
        data: { user: updatedUser },
      });
    } catch (err) {
      if (err.message === 'USER_NOT_FOUND') {
        return res
          .status(404)
          .json({ status: 'error', message: 'Pengguna tidak ditemukan' });
      }
      if (err.message === 'INSUFFICIENT_EXP') {
        return res.status(400).json({
          status: 'error',
          message: 'EXP Anda belum cukup untuk naik level',
        });
      }

      if (err.message === 'MAX_LEVEL_REACHED') {
        return res.status(400).json({
          status: 'error',
          message:
            'Anda sudah mencapai level maksimal (Level 30). Terus pertahankan gaya hidup sehat Anda!',
        });
      }

      return UserController.handleServerError(
        err,
        res,
        'Gagal memproses kenaikan level',
      );
    }
  }

  // helper methods
  static handleZodError(err, res) {
    const validationIssues = err.issues || err.errors || [];
    return res.status(400).json({
      status: 'fail',
      errors: validationIssues.map((e) => ({
        field: e.path[0] || 'payload',
        message: e.message,
      })),
    });
  }

  static handleServerError(err, res) {
    console.error('Terjadi Kesalahan di Controller:', err);

    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
}

export default UserController;
