import bcrypt from 'bcryptjs';
import crypto from 'crypto';

import prisma from '../lib/prisma.js';
import { sendEmail } from '../utils/sendEmail.js';

class AuthService {
  static async registerUser(name, email, password) {
    const userExists = await prisma.user.findUnique({ where: { email } });

    if (userExists) throw new Error('EMAIL_ALREADY_REGISTERED');

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: { username: name, email, password: hashedPassword },
    });

    return user;
  }

  static async loginUser(email, password) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new Error('INVALID_CREDENTIALS');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw new Error('INVALID_CREDENTIALS');

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return user;
  }

  static async processForgotPassword(email) {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) return true;

    const otpCode = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 1 * 60 * 1000); // 1 menit

    await prisma.otpCode.upsert({
      where: { email },
      update: { code: otpCode, expiresAt },
      create: { email, code: otpCode, expiresAt },
    });

    const message = `Kode OTP Anda adalah ${otpCode}. Kode ini akan kadaluwarsa dalam 1 menit. Jangan bagikan kode ini kepada siapa pun.`;
    const htmlMessage = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2>Permintaan Reset Password HealthyUp</h2>
        <p>Kode OTP Anda adalah:</p>
        <h1 style="background: #f4f4f4; padding: 10px; display: inline-block; letter-spacing: 5px;">${otpCode}</h1>
        <p style="color: red; font-size: 12px;">*Kode ini hanya berlaku selama 1 menit.</p>
      </div>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Kode OTP Reset Password - HealthyUp',
        message,
        htmlMessage,
      });
    } catch (err) {
      await prisma.otpCode.delete({ where: { email: user.email } });
      throw new Error('EMAIL_FAILED', { cause: err });
    }
  }

  static async resetUserPassword(email, otp, newPassword) {
    const otpRecord = await prisma.otpCode.findUnique({ where: { email } });

    if (!otpRecord) throw new Error('INVALID_OTP');
    if (otpRecord.code !== otp) throw new Error('INCORRECT_OTP');

    if (new Date() > otpRecord.expiresAt) {
      await prisma.otpCode.delete({ where: { email } });
      throw new Error('EXPIRED_OTP');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await prisma.$transaction([
      prisma.user.update({
        where: { email },
        data: { password: hashedPassword },
      }),
      prisma.otpCode.delete({ where: { email } }),
    ]);
  }
}

export default AuthService;
