-- AlterTable
ALTER TABLE `recoveryevent` ADD COLUMN `executedAt` DATETIME(3) NULL,
    ADD COLUMN `executionReference` VARCHAR(191) NULL,
    ADD COLUMN `executionStatus` VARCHAR(191) NULL DEFAULT 'not_executed';

-- CreateTable
CREATE TABLE `AuditLog` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `eventId` VARCHAR(191) NOT NULL,
    `action` VARCHAR(191) NOT NULL,
    `decision` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `reason` TEXT NULL,
    `safeAlternative` TEXT NULL,
    `metadata` JSON NULL,
    `timestamp` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `AuditLog_eventId_idx`(`eventId`),
    INDEX `AuditLog_timestamp_idx`(`timestamp`),
    INDEX `AuditLog_decision_idx`(`decision`),
    INDEX `AuditLog_action_idx`(`action`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `RecoveryEvent_executionStatus_idx` ON `RecoveryEvent`(`executionStatus`);
