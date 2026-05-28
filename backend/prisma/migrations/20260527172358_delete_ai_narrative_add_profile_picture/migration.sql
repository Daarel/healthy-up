/*
  Warnings:

  - You are about to drop the column `aiNarrative` on the `Mission` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Mission" DROP COLUMN "aiNarrative";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "profilePicture" TEXT NOT NULL DEFAULT 'https://ui-avatars.com/api/?name=New+User&background=random&color=fff';
