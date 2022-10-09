/*
  Warnings:

  - You are about to drop the column `firsName` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "firsName",
ADD COLUMN     "firstName" TEXT;
