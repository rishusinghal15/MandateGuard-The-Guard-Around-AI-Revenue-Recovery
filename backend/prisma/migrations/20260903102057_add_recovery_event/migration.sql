-- CreateTable
CREATE TABLE `RecoveryEvent` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `eventId` VARCHAR(191) NOT NULL,
    `eventType` VARCHAR(191) NOT NULL,
    `customerId` VARCHAR(191) NOT NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `failureReason` VARCHAR(191) NOT NULL,
    `timestamp` DATETIME(3) NOT NULL,
    `recoverable` BOOLEAN NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'new',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `RecoveryEvent_eventId_key`(`eventId`),
    INDEX `RecoveryEvent_customerId_idx`(`customerId`),
    INDEX `RecoveryEvent_status_idx`(`status`),
    INDEX `RecoveryEvent_timestamp_idx`(`timestamp`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
