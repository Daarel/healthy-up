import { z } from 'zod';

import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from '../schemas/authSchema.js';
import AuthService from '../services/AuthService.js';
import { generateToken } from '../utils/generateToken.js';

class AuthController {
  /**
   * * @desc    Sign up user account
   * ! @route   POST /api/v1/auth/register
   * ? @access  Public
   */
  static async register(req, res) {
    try {
      const { name, email, password } = registerSchema.parse(req.body);

      const user = await AuthService.registerUser(name, email, password);
      const token = generateToken(user.id, res);

      res.status(201).json({
        status: 'success',
        data: {
          user: {
            id: user.id,
            name: name,
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
            name: user.name,
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
      const { email, otp, newPassword } = resetPasswordSchema.parse(req.body);

      await AuthService.resetUserPassword(email, otp, newPassword);

      return res.status(200).json({
        status: 'success',
        message: 'Password has successfully changed',
      });
    } catch (err) {
      if (err instanceof z.ZodError)
        return AuthController.handleZodError(err, res);

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

  // helper method
  static handleZodError(err, res) {
    return res.status(400).json({
      status: 'fail',
      errors: err.errors.map((e) => ({
        field: e.path[0],
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
