import { z } from 'zod';

const missionIdParamSchema = z.strictObject({
  id: z
    .string({ required_error: 'ID Misi wajib disertakan di URL' })
    .uuid('Format ID Misi tidak valid'),
});

const updateMissionStatusSchema = z.strictObject({
  status: z.enum(['completed', 'failed'], {
    invalid_type_error: "Status hanya boleh 'completed', atau 'failed'",
    required_error: 'Status misi wajib diisi',
  }),
  proofImagePath: z.string().url('Format URL gambar tidak valid').optional(),
});

const verifyMissionSchema = z.strictObject({
  verificationStatus: z.enum(['approved', 'rejected'], {
    required_error: 'Status verifikasi wajib diisi',
    invalid_type_error: "Status hanya boleh 'approved' atau 'rejected'",
  }),
  rejectionReason: z
    .string()
    .trim()
    .max(500, 'Alasan penolakan maksimal 500 karakter')
    .optional(),
});

export { missionIdParamSchema, updateMissionStatusSchema, verifyMissionSchema };
