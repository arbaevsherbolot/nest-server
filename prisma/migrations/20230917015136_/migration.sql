/*
  Warnings:

  - You are about to drop the `Feedback` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Topic` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Video` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Feedback" DROP CONSTRAINT "Feedback_videoId_fkey";

-- DropForeignKey
ALTER TABLE "Video" DROP CONSTRAINT "Video_authorEmail_fkey";

-- DropForeignKey
ALTER TABLE "Video" DROP CONSTRAINT "Video_topicId_fkey";

-- DropTable
DROP TABLE "Feedback";

-- DropTable
DROP TABLE "Topic";

-- DropTable
DROP TABLE "Video";

-- CreateTable
CREATE TABLE "Image" (
    "id" SERIAL NOT NULL,
    "authorEmail" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Image_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_authorEmail_fkey" FOREIGN KEY ("authorEmail") REFERENCES "User"("email") ON DELETE RESTRICT ON UPDATE CASCADE;
