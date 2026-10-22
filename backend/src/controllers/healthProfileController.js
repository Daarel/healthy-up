import { z } from 'zod';

import {
  createCalorieLogSchema,
  createHealthProfileSchema,
  createWeightLogsSchema,
  getWeightLogsQuerySchema,
} from '../schemas/healthProfileSchema.js';
import HealthProfileService from '../services/healthProfileService.js';

class HealthProfileController {
  /**
   * * @desc    Add Health Profile Data User
   * ! @route   POST /api/v1/health-profiles/
   * ? @access  Private
   */
  static async createProfile(req, res) {
    try {
      const validatedData = createHealthProfileSchema.parse(req.body);
      const userId = req.user.id;

      const newProfile = await HealthProfileService.createProfile(
        userId,
        validatedData,
      );

      return res.status(201).json({
        status: 'success',
        message: 'Profil kesehatan berhasil disimpan',
        data: { profile: newProfile },
      });
    } catch (err) {
      if (err instanceof z.ZodError)
        return HealthProfileController.handleZodError(err, res);

      if (err.message === 'PROFILE_ALREADY_EXISTS') {
        return res.status(400).json({
          status: 'error',
          message: 'Profil kesehatan untuk pengguna ini sudah ada',
        });
      }

      return HealthProfileController.handleServerError(
        err,
        res,
        'Error at createProfile',
      );
    }
  }

  /**
   * * @desc    Get User Calories Data
   * ! @route   GET /api/v1/health-profiles/calories
   * ? @access  Private
   */
  static async getCalorieLog(req, res) {
    try {
      const userId = req.user.id;
      const summaryData = await HealthProfileService.getCalorieLog(userId);

      return res.status(200).json({
        status: 'success',
        data: summaryData,
      });
    } catch (err) {
      return HealthProfileController.handleServerError(
        err,
        res,
        'Gagal mengambil data dashboard summary',
      );
    }
  }

  /**
   * * @desc    Create User Calories Data
   * ! @route   POST /api/v1/health-profiles/calories
   * ? @access  Private
   */
  static async createCalorieLog(req, res) {
    try {
      const userId = req.user.id;
      const { calories } = createCalorieLogSchema.parse(req.body);

      const newCalorieLog = await HealthProfileService.createCalorieLog(
        userId,
        calories,
      );

      return res.status(201).json({
        status: 'success',
        message: 'Asupan kalori berhasil dicatat!',
        data: { calorieLog: newCalorieLog },
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return HealthProfileController.handleZodError(err, res);
      }
      return HealthProfileController.handleServerError(
        err,
        res,
        'Error creating calorie log',
      );
    }
  }

  /**
   * * @desc    Get User Weight Logs (Week/Month Range)
   * ! @route   GET /api/v1/health-profiles/weight-logs?range=week
   * ? @access  Private
   */
  static async getWeightLog(req, res) {
    try {
      const userId = req.user.id;
      const { range } = getWeightLogsQuerySchema.parse(req.query);

      const weightLogs = await HealthProfileService.getWeightLogs(
        userId,
        range,
      );

      return res.status(200).json({
        status: 'success',
        data: {
          totalDays: weightLogs.length,
          weightLogs,
        },
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return HealthProfileController.handleZodError(err, res);
      }
      return HealthProfileController.handleServerError(
        err,
        res,
        'Gagal fetch weight logs',
      );
    }
  }

  /**
   * * @desc    Add User Daily Weight Loss
   * ! @route   POST /api/v1/health-profiles/weight-logs
   * ? @access  Private
   */
  static async createWeightLog(req, res) {
    try {
      const { weight } = createWeightLogsSchema.parse(req.body);
      const userId = req.user.id;

      const { newWeightLog, updatedHealthProfile } =
        await HealthProfileService.createWeightLogAndUpdateProfile(
          userId,
          weight,
        );

      return res.status(201).json({
        status: 'success',
        message:
          'Berat badan berhasil dicatat dan profil kesehatan telah diperbarui!',
        data: {
          weightLog: newWeightLog,
          currentWeight: updatedHealthProfile.weightKg,
        },
      });
    } catch (err) {
      if (err instanceof z.ZodError)
        return HealthProfileController.handleZodError(err, res);

      if (err.message === 'WEIGHT_ALREADY_LOGGED_THIS_WEEK') {
        return res.status(400).json({
          status: 'error',
          message:
            'Berat badan sudah dicatat minggu ini. Pencatatan hanya dapat dilakukan 1 kali per minggu.',
        });
      }

      if (err.code === 'P2025') {
        return res.status(404).json({
          status: 'error',
          message: 'Profil kesehatan belum dibuat untuk pengguna ini.',
        });
      }

      return HealthProfileController.handleServerError(
        err,
        res,
        'Error creating weight log',
      );
    }
  }

  /**
   * * @desc    Get User's Health Profile
   * ! @route   GET /api/v1/health-profiles
   * ? @access  Private
   */
  static async getMyProfile(req, res) {
    try {
      const userId = req.user.id;
      const profile = await HealthProfileService.getMyProfile(userId);

      return res.status(200).json({
        status: 'success',
        data: { profile },
      });
    } catch (err) {
      if (err.message === 'PROFILE_NOT_FOUND') {
        return res.status(404).json({
          status: 'error',
          message: 'Profil kesehatan belum dibuat',
        });
      }
      return res.status(500).json({
        status: 'error',
        message: 'Internal server error',
      });
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

export default HealthProfileController;
