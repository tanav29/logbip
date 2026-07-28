/*
  Warnings:

  - You are about to drop the column `isPublic` on the `paths` table. All the data in the column will be lost.
  - You are about to drop the `Post` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_authorId_fkey";

-- AlterTable
ALTER TABLE "paths" DROP COLUMN "isPublic";

-- DropTable
DROP TABLE "Post";
