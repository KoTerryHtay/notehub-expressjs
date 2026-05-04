-- CreateEnum
CREATE TYPE "PostPrivacy" AS ENUM ('PUBLIC', 'PRIVATE');

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "privacy" "PostPrivacy" NOT NULL DEFAULT 'PUBLIC';
