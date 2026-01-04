-- AlterTable
ALTER TABLE "repository" ADD COLUMN     "codeReviewPersonality" TEXT NOT NULL DEFAULT 'Professional',
ADD COLUMN     "codeReviewTheme" TEXT NOT NULL DEFAULT 'Standard';
