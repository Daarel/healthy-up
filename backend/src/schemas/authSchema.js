import { z } from 'zod';

const registerSchema = z.strictObject({
  name: z
    .string({ required_error: 'Nama pengguna wajib diisi' })
    .trim()
    .min(2, 'Nama pengguna minimal 2 karakter')
    .max(100, 'Nama pengguna maksimal 100 karakter'),
  email: z
    .email({
      pattern: z.regexes.html5Email,
      required_error: 'Email wajib diisi',
    })
    .trim()
    .toLowerCase()
    .max(70, 'Email maksimal 70 karakter'),
  password: z
    .string({ required_error: 'Password wajib diisi' })
    .min(8, 'Password minimal 8 karakter')
    .max(30, 'Password maksimal 30 karakter'),
});

const loginSchema = z.strictObject({
  email: z
    .email({
      pattern: z.regexes.html5Email,
      required_error: 'Email wajib diisi',
    })
    .trim()
    .toLowerCase()
    .max(70, 'Email maksimal 70 karakter'),
  password: z
    .string({ required_error: 'Password wajib diisi' })
    .min(1, 'Password tidak boleh kosong')
    .max(30, 'Password maksimal 30 karakter'),
});

const forgotPasswordSchema = z.strictObject({
  email: z
    .email({
      pattern: z.regexes.html5Email,
      required_error: 'Email wajib diisi',
    })
    .trim()
    .toLowerCase()
    .max(70, 'Email maksimal 70 karakter'),
});

const resetPasswordSchema = z
  .strictObject({
    email: z
      .email({
        pattern: z.regexes.html5Email,
        required_error: 'Email wajib diisi',
      })
      .trim()
      .toLowerCase()
      .max(70, 'Email maksimal 70 karakter'),
    otp: z
      .string({ required_error: 'OTP wajib diisi' })
      .length(6, 'Format OTP tidak valid'),
    newPassword: z
      .string({ required_error: 'Password baru wajib diisi' })
      .min(8, 'Password minimal 8 karakter')
      .max(30, 'Password maksimal 30 karakter'),
    confirmedPassword: z.string({
      required_error: 'Konfirmasi password wajib diisi',
    }),
  })
  .refine((data) => data.newPassword === data.confirmedPassword, {
    message: 'Password dan konfirmasi password tidak cocok',
    path: ['confirmedPassword'],
  });

export {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
};
