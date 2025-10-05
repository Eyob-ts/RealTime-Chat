/*
  Warnings:

  - A unique constraint covering the columns `[inviteCode]` on the table `ChatRoom` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "ChatRoom" ADD COLUMN     "inviteCode" TEXT,
ADD COLUMN     "isPublic" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "name" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "password" DROP DEFAULT;

-- CreateIndex
CREATE UNIQUE INDEX "ChatRoom_inviteCode_key" ON "ChatRoom"("inviteCode");
