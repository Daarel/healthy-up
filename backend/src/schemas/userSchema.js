import { z } from 'zod';

const getAllUsersSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(20),
});

export { getAllUsersSchema };
