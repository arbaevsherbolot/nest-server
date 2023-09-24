/*
  Warnings:

  - You are about to drop the column `last_request` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `requset` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "last_request",
DROP COLUMN "requset",
ADD COLUMN     "lastRequest" TIMESTAMP(3),
ADD COLUMN     "requests" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "resetPasswordSecret" TEXT;

-- CreateTable
CREATE TABLE "Topic" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT,
    "date" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Topic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Video" (
    "id" SERIAL NOT NULL,
    "vimeoId" TEXT,
    "authorEmail" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "cover" TEXT,
    "transcript" TEXT,
    "averageScore" TEXT,
    "averageScoreColor" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "topicId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Video_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Feedback" (
    "id" SERIAL NOT NULL,
    "videoId" INTEGER,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "improve" TEXT[],
    "score" INTEGER NOT NULL,
    "scoreColor" TEXT NOT NULL,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Topic_title_key" ON "Topic"("title");

-- AddForeignKey
ALTER TABLE "Video" ADD CONSTRAINT "Video_authorEmail_fkey" FOREIGN KEY ("authorEmail") REFERENCES "User"("email") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Video" ADD CONSTRAINT "Video_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE SET NULL ON UPDATE CASCADE;
