import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

import { PrismaClient } from '../../generated/prisma/client.js';

const connectionString = process.env.DATABASE_URL;

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prismaClientSingleton = () => {
  return new PrismaClient({ adapter });
};

const globalForPrisma = global;
const prisma = globalForPrisma.prisma || prismaClientSingleton();
export default prisma;
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
