/*
  Warnings:

  - Added the required column `topicTitle` to the `Video` table without a default value. This is not possible if the table is not empty.
  - Made the column `cover` on table `Video` required. This step will fail if there are existing NULL values in that column.
  - Made the column `transcript` on table `Video` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Video" ADD COLUMN     "topicTitle" TEXT NOT NULL,
ALTER COLUMN "cover" SET NOT NULL,
ALTER COLUMN "transcript" SET NOT NULL;
