/*
  Warnings:

  - Added the required column `age` to the `HealthProfile` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "HealthProfile" ADD COLUMN     "age" INTEGER NOT NULL;
