/*
  Warnings:

  - The primary key for the `OtpCode` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Changed the type of `id` on the `OtpCode` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "OtpCode" DROP CONSTRAINT "OtpCode_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" UUID NOT NULL,
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMPTZ,
ADD CONSTRAINT "OtpCode_pkey" PRIMARY KEY ("id");

-- AddForeignKey
ALTER TABLE "OtpCode" ADD CONSTRAINT "OtpCode_email_fkey" FOREIGN KEY ("email") REFERENCES "User"("email") ON DELETE CASCADE ON UPDATE CASCADE;
