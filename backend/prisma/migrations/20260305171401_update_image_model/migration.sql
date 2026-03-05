/*
  Warnings:

  - You are about to drop the column `altitude` on the `images` table. All the data in the column will be lost.
  - You are about to drop the column `cameraTrapId` on the `images` table. All the data in the column will be lost.
  - You are about to drop the column `errorMessage` on the `images` table. All the data in the column will be lost.
  - You are about to drop the column `filename` on the `images` table. All the data in the column will be lost.
  - You are about to drop the column `latitude` on the `images` table. All the data in the column will be lost.
  - You are about to drop the column `longitude` on the `images` table. All the data in the column will be lost.
  - You are about to drop the column `metadata` on the `images` table. All the data in the column will be lost.
  - You are about to drop the column `s3Key` on the `images` table. All the data in the column will be lost.
  - You are about to drop the column `s3Url` on the `images` table. All the data in the column will be lost.
  - Added the required column `filePath` to the `images` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fileSize` to the `images` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mimeType` to the `images` table without a default value. This is not possible if the table is not empty.
  - Added the required column `originalName` to the `images` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "images_s3Key_key";

-- AlterTable
ALTER TABLE "images" DROP COLUMN "altitude",
DROP COLUMN "cameraTrapId",
DROP COLUMN "errorMessage",
DROP COLUMN "filename",
DROP COLUMN "latitude",
DROP COLUMN "longitude",
DROP COLUMN "metadata",
DROP COLUMN "s3Key",
DROP COLUMN "s3Url",
ADD COLUMN     "description" TEXT,
ADD COLUMN     "exifData" JSONB,
ADD COLUMN     "filePath" TEXT NOT NULL,
ADD COLUMN     "fileSize" INTEGER NOT NULL,
ADD COLUMN     "gpsLocation" JSONB,
ADD COLUMN     "height" INTEGER,
ADD COLUMN     "mimeType" TEXT NOT NULL,
ADD COLUMN     "originalName" TEXT NOT NULL,
ADD COLUMN     "width" INTEGER;
