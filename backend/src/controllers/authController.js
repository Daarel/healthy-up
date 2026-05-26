import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { z } from 'zod';

import prisma from '../lib/prisma.js';
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from '../schemas/authSchema.js';
import { generateToken } from '../utils/generateToken.js';
import { sendEmail } from '../utils/sendEmail.js';

/**
 * * @desc    Sign up user account
 * ! @route   POST /api/v1/auth/register
 * ? @access  Public
 */
const register = async (req, res) => {
  try {
    const validatedData = registerSchema.parse(req.body);
    const { name, email, password } = validatedData;

    const userExists = await prisma.user.findUnique({
      where: { email: email },
    });

    if (userExists) {
      return res.status(400).json({
        status: 'error',
        message: 'Email is already registered',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

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
    if (err instanceof z.ZodError) {
      return res.status(400).json({
        status: 'fail',
        errors: err.errors.map((e) => ({
          field: e.path[0],
          message: e.message,
        })),
      });
    }

    console.error('Error at register', err);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

/**
 * * @desc    Sign in user account
 * ! @route   POST /api/v1/auth/login
 * ? @access  Public
 */
const login = async (req, res) => {
  try {
    const validatedData = loginSchema.parse(req.body);
    const { email, password } = validatedData;

    const user = await prisma.user.findUnique({
      where: { email: email },
    });

    if (!user) {
      return res
        .status(401)
        .json({ status: 'error', message: 'Invalid email and password' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ status: 'error', message: 'Invalid email and password' });
    }

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
    if (err instanceof z.ZodError) {
      return res.status(400).json({
        status: 'fail',
        errors: err.errors.map((e) => ({
          field: e.path[0],
          message: e.message,
        })),
      });
    }

    console.error('Error at login', err);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

/**
 * * @desc    log out user account
 * ! @route   POST /api/v1/auth/logout
 * ? @access  Public
 */
const logout = async (req, res) => {
  try {
    res.cookie('jwt', '', {
      httpOnly: true,
      expires: new Date(0),
    });

    res.status(200).json({
      status: 'success',
      message: 'logged out successfully',
    });
  } catch (err) {
    console.error('Error at logged out', err);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

/**
 * * @desc    Request OTP for password reset
 * ! @route   POST /api/v1/auth/forgot-password
 * ? @access  Public
 */
const forgotPassword = async (req, res) => {
  try {
    const validatedData = forgotPasswordSchema.parse(req.body);
    const { email } = validatedData;

    const user = await prisma.user.findUnique({ where: { email } });

    const successMessage =
      'Jika email terdaftar di sistem kami, kode OTP telah dikirimkan';

    if (!user) {
      return res.status(200).json({
        status: 'success',
        message: successMessage,
      });
    }

    const otpCode = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 1 * 60 * 1000);

    await prisma.otpCode.upsert({
      where: { email: email },
      update: {
        code: otpCode,
        expiresAt: expiresAt,
      },
      create: {
        email: email,
        code: otpCode,
        expiresAt: expiresAt,
      },
    });

    const message = `Kode OTP Anda adalah ${otpCode}. Kode ini akan kadaluwarsa dalam 1 menit. Jangan bagikan kode ini kepada siapa pun.`;

    const htmlMessage = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2>Permintaan Reset Password HealthyUp</h2>
        <p>Anda menerima email ini karena ada permintaan untuk mereset password akun Anda.</p>
        <p>Kode OTP Anda adalah:</p>
        <h1 style="background: #f4f4f4; padding: 10px; display: inline-block; letter-spacing: 5px;">${otpCode}</h1>
        <p style="color: red; font-size: 12px;">*Kode ini hanya berlaku selama 1 menit.</p>
        <p>Jika Anda tidak meminta reset password, abaikan email ini.</p>
      </div>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Kode OTP Reset Password - HealthyUp',
        message: message,
        htmlMessage: htmlMessage,
      });
      res.status(200).json({
        status: 'success',
        message: successMessage,
      });
    } catch (emailErr) {
      console.error('Email gagal dikirim:', emailErr);

      await prisma.otpCode.delete({
        where: { email: user.email },
      });

      return res.status(500).json({
        status: 'error',
        message: 'Gagal mengirim email OTP, silakan coba lagi nanti.',
      });
    }
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

    console.error('Error at forgotPassword', err);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

/**
 * * @desc    Verify OTP and reset password
 * ! @route   POST /api/v1/auth/reset-password
 * ? @access  Public
 */
const resetPassword = async (req, res) => {
  try {
    const validatedData = resetPasswordSchema.parse(req.body);

    const { email, otp, newPassword } = validatedData;

    const otpRecord = await prisma.otpCode.findUnique({
      where: { email: email },
    });

    if (!otpRecord) {
      return res
        .status(400)
        .json({ status: 'error', message: 'Invalid or missing OTP' });
    }

    if (otpRecord.code !== otp) {
      return res
        .status(400)
        .json({ status: 'error', message: 'Incorrect OTP code' });
    }

    if (new Date() > otpRecord.expiresAt) {
      // Hapus OTP yang sudah basi agar database bersih
      await prisma.otpCode.delete({ where: { email: email } });

      return res.status(400).json({
        status: 'error',
        message: 'OTP has expired. Please request a new one.',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await prisma.$transaction([
      prisma.user.update({
        where: { email: email },
        data: { password: hashedPassword },
      }),

      prisma.otpCode.delete({
        where: { email: email },
      }),
    ]);

    res.status(200).json({
      status: 'success',
      message: 'Password has successfully changed',
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

    console.error('Error at resetPassword', err);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

export { forgotPassword, login, logout, register, resetPassword };
