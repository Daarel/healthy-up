/*
  Warnings:

  - You are about to drop the `CalorieLog` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "CalorieLog" DROP CONSTRAINT "CalorieLog_userId_fkey";

-- DropTable
DROP TABLE "CalorieLog";

-- CreateTable
CREATE TABLE "calorieLogs" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "calories" INTEGER NOT NULL,
    "loggedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "calorieLogs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "calorieLogs_userId_idx" ON "calorieLogs"("userId");

-- AddForeignKey
ALTER TABLE "calorieLogs" ADD CONSTRAINT "calorieLogs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
