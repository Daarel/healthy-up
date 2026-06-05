import { z } from 'zod';

import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resendOtpSchema,
  resetPasswordSchema,
} from '../schemas/authSchema.js';
import AuthService from '../services/authService.js';
import { generateToken } from '../utils/generateToken.js';

// test
class AuthController {
  /**
   * * @desc    Sign up user account
   * ! @route   POST /api/v1/auth/register
   * ? @access  Public
   */
  static async register(req, res) {
    try {
      const { username, email, password } = registerSchema.parse(req.body);

      const user = await AuthService.registerUser(username, email, password);
      const token = generateToken(user.id, res);

      res.status(201).json({
        status: 'success',
        data: {
          user: {
            id: user.id,
            username: username,
            email: email,
          },
          token,
        },
      });
    } catch (err) {
      if (err instanceof z.ZodError)
        return AuthController.handleZodError(err, res);
      if (err.message === 'EMAIL_ALREADY_REGISTERED') {
        return res
          .status(400)
          .json({ status: 'error', message: 'Email is already registered' });
      }
      if (err.message === 'USERNAME_ALREADY_TAKEN') {
        return res.status(400).json({
          status: 'error',
          message: 'Username sudah digunakan, silakan pilih nama lain',
        });
      }
      return AuthController.handleServerError(err, res);
    }
  }

  /**
   * * @desc    Sign in user account
   * ! @route   POST /api/v1/auth/login
   * ? @access  Public
   */
  static async login(req, res) {
    try {
      const { email, password } = loginSchema.parse(req.body);

      const user = await AuthService.loginUser(email, password);
      const token = generateToken(user.id, res);

      res.status(200).json({
        status: 'success',
        data: {
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
          },
          token,
        },
      });
    } catch (err) {
      if (err instanceof z.ZodError)
        return AuthController.handleZodError(err, res);
      if (err.message === 'INVALID_CREDENTIALS') {
        return res
          .status(401)
          .json({ status: 'error', message: 'Invalid email and password' });
      }
      return AuthController.handleServerError(err, res);
    }
  }

  /**
   * * @desc    log out user account
   * ! @route   POST /api/v1/auth/logout
   * ? @access  Public
   */
  static async logout(req, res) {
    try {
      res.cookie('jwt', '', {
        httpOnly: true,
        expires: new Date(0),
      });

      res.status(200).json({
        status: 'success',
        message: 'berhasil log out',
      });
    } catch (err) {
      return AuthController.handleServerError(err, res);
    }
  }

  /**
   * * @desc    Request OTP for password reset
   * ! @route   POST /api/v1/auth/forgot-password
   * ? @access  Public
   */
  static async forgotPassword(req, res) {
    try {
      const { email } = forgotPasswordSchema.parse(req.body);

      await AuthService.processForgotPassword(email);

      return res.status(200).json({
        status: 'success',
        message:
          'Jika email terdaftar di sistem kami, kode OTP telah dikirimkan',
      });
    } catch (err) {
      if (err instanceof z.ZodError)
        return AuthController.handleZodError(err, res);
      if (err.message === 'EMAIL_FAILED') {
        return res.status(500).json({
          status: 'error',
          message: 'Gagal mengirim email OTP, silakan coba lagi nanti.',
        });
      }
      return AuthController.handleServerError(err, res);
    }
  }

  /**
   * * @desc    Verify OTP and reset password
   * ! @route   POST /api/v1/auth/reset-password
   * ? @access  Public
   */
  static async resetPassword(req, res) {
    try {
      const { email, otp, newPassword, confirmedPassword } =
        resetPasswordSchema.parse(req.body);

      await AuthService.resetUserPassword(
        email,
        otp,
        newPassword,
        confirmedPassword,
      );

      return res.status(200).json({
        status: 'success',
        message: 'Password has successfully changed',
      });
    } catch (err) {
      console.log(err);
      if (err instanceof z.ZodError)
        return AuthController.handleZodError(err, res);

      if (err.message === 'INCONSISTENT_PASSWORD')
        return res.status(400).json({
          status: 'error',
          message: 'Inconsistent input of new password',
        });
      if (err.message === 'INVALID_OTP')
        return res
          .status(400)
          .json({ status: 'error', message: 'Invalid or missing OTP' });
      if (err.message === 'INCORRECT_OTP')
        return res
          .status(400)
          .json({ status: 'error', message: 'Incorrect OTP code' });
      if (err.message === 'EXPIRED_OTP')
        return res.status(400).json({
          status: 'error',
          message: 'OTP has expired. Please request a new one.',
        });

      return AuthController.handleServerError(err, res);
    }
  }

  /**
   * * @desc    Resend OTP
   * ! @route   POST /api/v1/auth/resend-otp
   * ? @access  Public
   */
  static async resendOtp(req, res) {
    try {
      const { email } = resendOtpSchema.parse(req.body);

      await AuthService.processForgotPassword(email);

      return res.status(200).json({
        status: 'success',
        message: 'Kode OTP baru telah berhasil dikirimkan ke email Anda',
      });
    } catch (err) {
      if (err instanceof z.ZodError)
        return AuthController.handleZodError(err, res);

      if (err.message === 'EMAIL_FAILED') {
        return res.status(500).json({
          status: 'error',
          message: 'Gagal mengirim ulang email OTP, silakan coba lagi nanti.',
        });
      }
      return AuthController.handleServerError(err, res);
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

export default AuthController;
