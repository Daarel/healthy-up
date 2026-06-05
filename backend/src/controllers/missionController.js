import { z } from 'zod';

import cloudinary from '../config/cloudinary.js';
import {
  missionIdParamSchema,
  updateMissionStatusSchema,
  verifyMissionSchema,
} from '../schemas/missionSchema.js';
import MissionService from '../services/missionService.js';

class MissionController {
  /**
   * * @desc    Get Weekly Mission Progress Percentage
   * ! @route   GET /api/v1/missions/progress/weekly
   * ? @access  Private
   */
  static async getWeeklyProgress(req, res) {
    try {
      const userId = req.user.id;

      const progressData = await MissionService.getWeeklyProgress(userId);

      return res.status(200).json({
        status: 'success',
        data: progressData,
      });
    } catch (err) {
      return MissionController.handleServerError(
        err,
        res,
        'Gagal mengambil progress misi mingguan',
      );
    }
  }

  /**
   * * @desc    Generate Quests using AI & Update Profile
   * ! @route   POST /api/v1/missions/generate
   * ? @access  Private
   */
  static async generateMissions(req, res) {
    try {
      const userId = req.user.id;

      const result = await MissionService.generateAndSaveQuests(userId);

      return res.status(201).json({
        status: 'success',
        message: 'Misi selama 7 hari berhasil dibuat oleh AI!',
        data: result,
      });
    } catch (err) {
      if (err.message === 'PROFILE_NOT_FOUND') {
        return res.status(404).json({
          status: 'error',
          message:
            'Profil kesehatan belum diisi. Harap lengkapi profil terlebih dahulu.',
        });
      }

      if (err.message === 'MISSIONS_ALREADY_GENERATED') {
        return res.status(400).json({
          status: 'error',
          message:
            'Anda sudah membuat misi dalam 7 hari terakhir. Selesaikan misi yang ada dan kembali lagi nanti!',
        });
      }

      if (err.message === 'AI_GENERATION_FAILED') {
        return res.status(502).json({
          status: 'error',
          message:
            'Gagal menghubungi server AI untuk membuat misi. Coba beberapa saat lagi.',
        });
      }

      console.error('Terjadi Kesalahan di MissionController:', err);
      return res.status(500).json({
        status: 'error',
        message: 'Internal server error',
      });
    }
  }

  /**
   * * @desc    Get Specific Mission Detail
   * ! @route   GET /api/v1/missions/:id
   * ? @access  Private
   */
  static async getMissionById(req, res) {
    try {
      const { id } = missionIdParamSchema.parse(req.params);
      const userId = req.user.id;

      const mission = await MissionService.getMissionById(id, userId);

      return res.status(200).json({
        status: 'success',
        data: { mission },
      });
    } catch (err) {
      if (err instanceof z.ZodError)
        return MissionController.handleZodError(err, res);

      if (err.message === 'MISSION_NOT_FOUND') {
        return res
          .status(404)
          .json({ status: 'error', message: 'Misi tidak ditemukan' });
      }

      return MissionController.handleServerError(
        err,
        res,
        'Gagal mengambil detail misi',
      );
    }
  }

  /**
   * * @desc    Update Mission Status (Complete Mission)
   * ! @route   PATCH /api/v1/missions/:id/status
   * ? @access  Private
   */
  static async updateMissionStatus(req, res) {
    try {
      const { id } = missionIdParamSchema.parse(req.params);
      const { status: newStatus } = updateMissionStatusSchema.parse(req.body);
      const userId = req.user.id;

      let proofMediaUrl = null;

      if (req.file) {
        const fileBase64 = req.file.buffer.toString('base64');
        const fileUri = `data:${req.file.mimetype};base64,${fileBase64}`;

        const uploadResponse = await cloudinary.uploader.upload(fileUri, {
          folder: 'healthyup/mission-proofs',
          resource_type: 'auto',
        });

        proofMediaUrl = uploadResponse.secure_url;
      }

      const result = await MissionService.updateMissionStatus(
        id,
        userId,
        newStatus,
        proofMediaUrl,
      );

      let message = 'Status misi berhasil diperbarui';
      if (newStatus === 'completed') {
        message =
          'Bukti misi berhasil dikirim! Menunggu verifikasi dari admin.';
      }

      return res.status(200).json({
        status: 'success',
        message,
        data: result,
      });
    } catch (err) {
      if (err instanceof z.ZodError)
        return MissionController.handleZodError(err, res);

      if (err.message === 'MISSION_NOT_FOUND') {
        return res
          .status(404)
          .json({ status: 'error', message: 'Misi tidak ditemukan' });
      }
      if (err.message === 'MISSION_ALREADY_COMPLETED') {
        return res.status(400).json({
          status: 'error',
          message: 'Misi ini sudah diselesaikan sebelumnya',
        });
      }

      if (err.http_code) {
        console.error('Cloudinary Upload Error:', err);
        return res.status(500).json({
          status: 'error',
          message: 'Gagal mengunggah file bukti ke server cloud',
        });
      }

      return MissionController.handleServerError(
        err,
        res,
        'Gagal memperbarui status misi',
      );
    }
  }

  /**
   * * @desc    Verify Mission Submission (Approve/Reject)
   * ! @route   PATCH /api/v1/missions/:id/verify
   * ? @access  Private (Admin Only)
   */
  static async verifyMission(req, res) {
    try {
      const { id } = missionIdParamSchema.parse(req.params);
      const { verificationStatus, rejectionReason } = verifyMissionSchema.parse(
        req.body,
      );

      const result = await MissionService.verifyMission(
        id,
        verificationStatus,
        rejectionReason,
      );

      const message =
        verificationStatus === 'approved'
          ? 'Bukti misi disetujui. XP dan Poin telah diberikan kepada user.'
          : 'Misi ditolak. Alasan penolakan telah dicatat.';

      return res.status(200).json({
        status: 'success',
        message,
        data: result,
      });
    } catch (err) {
      if (err instanceof z.ZodError)
        return MissionController.handleZodError(err, res);

      if (err.message === 'MISSION_NOT_FOUND') {
        return res
          .status(404)
          .json({ status: 'error', message: 'Misi tidak ditemukan' });
      }
      if (err.message === 'MISSION_ALREADY_VERIFIED') {
        return res.status(400).json({
          status: 'error',
          message:
            'Misi ini sudah pernah diverifikasi (disetujui/ditolak) sebelumnya.',
        });
      }

      return MissionController.handleServerError(
        err,
        res,
        'Gagal memverifikasi misi',
      );
    }
  }

  /**
   * * @desc    Get List of User Missions (Optional: filter by date & status)
   * ! @route   GET /api/v1/missions
   * ? @access  Private
   */
  static async getUserMissions(req, res) {
    try {
      const userId = req.user.id;
      const { date, status } = req.query;

      const missions = await MissionService.getUserMissions(
        userId,
        date,
        status,
      );

      return res.status(200).json({
        status: 'success',
        data: {
          total: missions.length,
          missions,
        },
      });
    } catch (err) {
      return MissionController.handleServerError(
        err,
        res,
        'Gagal mengambil daftar misi',
      );
    }
  }

  /**
   * * @desc    Get All Missions for Admin Review (filter by verificationStatus)
   * ! @route   GET /api/v1/missions/admin/pending?verificationStatus=pending|approved|rejected|all
   * ? @access  Private (Admin Only)
   */
  static async getPendingVerifications(req, res) {
    try {
      const { verificationStatus = 'pending' } = req.query;

      const missions = await MissionService.getPendingVerifications(verificationStatus);

      return res.status(200).json({
        status: 'success',
        message: 'Berhasil mengambil daftar misi',
        data: {
          total: missions.length,
          missions,
        },
      });
    } catch (err) {
      return MissionController.handleServerError(
        err,
        res,
        'Gagal mengambil daftar antrean misi',
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

export default MissionController;
