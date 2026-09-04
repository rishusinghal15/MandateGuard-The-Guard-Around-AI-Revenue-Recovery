-- AlterTable
ALTER TABLE `RecoveryEvent` ADD COLUMN `messageAction` VARCHAR(191) NULL,
    ADD COLUMN `messageChannel` VARCHAR(191) NULL,
    ADD COLUMN `messageTone` VARCHAR(191) NULL,
    ADD COLUMN `recoveryMessage` TEXT NULL;
