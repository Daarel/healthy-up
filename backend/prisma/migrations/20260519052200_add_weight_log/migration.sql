/*
  Warnings:

  - You are about to drop the column `dateOfBirth` on the `HealthProfile` table. All the data in the column will be lost.
  - You are about to drop the column `medicalHistory` on the `HealthProfile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "HealthProfile" DROP COLUMN "dateOfBirth",
DROP COLUMN "medicalHistory";

-- CreateTable
CREATE TABLE "WeightLog" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "loggedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WeightLog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "WeightLog" ADD CONSTRAINT "WeightLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
