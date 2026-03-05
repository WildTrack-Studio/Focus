/*
  Warnings:

  - You are about to drop the column `role` on the `project_users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[projectId,userId]` on the table `project_users` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "project_users_userId_projectId_key";

-- AlterTable
ALTER TABLE "detections" ADD COLUMN     "projectId" TEXT;

-- AlterTable
ALTER TABLE "project_users" DROP COLUMN "role";

-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "endDate" TIMESTAMP(3),
ADD COLUMN     "startDate" TIMESTAMP(3),
ALTER COLUMN "location" SET DATA TYPE TEXT;

-- CreateIndex
CREATE INDEX "detections_projectId_idx" ON "detections"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "project_users_projectId_userId_key" ON "project_users"("projectId", "userId");

-- AddForeignKey
ALTER TABLE "detections" ADD CONSTRAINT "detections_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;
