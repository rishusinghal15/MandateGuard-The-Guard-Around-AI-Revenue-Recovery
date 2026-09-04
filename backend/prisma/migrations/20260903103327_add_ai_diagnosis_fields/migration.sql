-- AlterTable
ALTER TABLE `RecoveryEvent` ADD COLUMN `confidence` DOUBLE NULL,
    ADD COLUMN `evidence` JSON NULL,
    ADD COLUMN `recommendedAction` VARCHAR(191) NULL,
    ADD COLUMN `rootCause` TEXT NULL;
