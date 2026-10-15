-- AlterTable
ALTER TABLE "users" ADD COLUMN     "appearancePrefs" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "notificationPrefs" JSONB NOT NULL DEFAULT '{}';

