/*
  Warnings:

  - The `rankTitle` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Title" AS ENUM ('pemula', 'penggerak', 'pejuang_sehat', 'kesatria_bugar', 'master_vitalitas', 'legenda');

-- AlterTable
ALTER TABLE "User" DROP COLUMN "rankTitle",
ADD COLUMN     "rankTitle" "Title" NOT NULL DEFAULT 'pemula';
