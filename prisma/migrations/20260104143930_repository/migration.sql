-- CreateEnum
CREATE TYPE "RepositoryStatus" AS ENUM ('Indexing', 'Indexed', 'Failed');

-- DropIndex
DROP INDEX "repository_userId_idx";

-- AlterTable
ALTER TABLE "repository" ADD COLUMN     "status" "RepositoryStatus" NOT NULL DEFAULT 'Indexing';

-- CreateIndex
CREATE INDEX "repository_userId_githubId_idx" ON "repository"("userId", "githubId");
