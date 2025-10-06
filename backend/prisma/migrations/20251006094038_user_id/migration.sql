/*
  Warnings:

  - Made the column `userId` on table `chat_messages` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `chat_messages` DROP FOREIGN KEY `chat_messages_userId_fkey`;

-- AlterTable
ALTER TABLE `chat_messages` MODIFY `userId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `chat_messages` ADD CONSTRAINT `chat_messages_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
