import { z } from 'zod';

const createHealthProfileSchema = z.strictObject({
  gender: z.enum(['MALE', 'FEMALE'], {
    required_error: 'Jenis kelamin wajib dipilih',
    invalid_type_error: 'Format jenis kelamin tidak valid',
  }),
  age: z
    .number({ required_error: 'Usia wajib diisi' })
    .int({ message: 'Usia harus berupa angka bulat' })
    .min(1, { message: 'Usia minimal 1 tahun' })
    .max(120, { message: 'Usia tidak valid' }),
  heightCm: z
    .number({ required_error: 'Tinggi badan wajib diisi' })
    .min(50, { message: 'Tinggi badan minimal 50 cm' })
    .max(250, { message: 'Tinggi badan maksimal 250 cm' }),
  weightKg: z
    .number({ required_error: 'Berat badan wajib diisi' })
    .min(10, { message: 'Berat badan minimal 10 kg' })
    .max(300, { message: 'Berat badan maksimal 300 kg' }),
  goalWeight: z
    .number({ required_error: 'Target berat badan wajib diisi' })
    .min(10, { message: 'Target berat badan minimal 10 kg' })
    .max(300, { message: 'Target berat badan maksimal 300 kg' }),
});

const createWeightLogsSchema = z.strictObject({
  weight: z
    .number({
      required_error: 'Berat badan wajib diisi',
      invalid_type_error: 'Berat badan harus berupa angka (misal: 65.5)',
    })
    .positive({ message: 'Berat badan harus bernilai positif' })
    .min(20, { message: 'Berat badan minimal 20 kg' })
    .max(300, { message: 'Berat badan maksimal 300 kg' }),
});

export { createHealthProfileSchema, createWeightLogsSchema };
