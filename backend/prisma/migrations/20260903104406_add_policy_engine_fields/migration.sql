-- AlterTable
ALTER TABLE `RecoveryEvent` ADD COLUMN `policyChecks` JSON NULL,
    ADD COLUMN `policyDecision` VARCHAR(191) NULL,
    ADD COLUMN `policyFailedChecks` JSON NULL,
    ADD COLUMN `safeAlternative` TEXT NULL;
