/*
  Warnings:

  - You are about to drop the `chat_messages` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `refresh_tokens` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `verification_codes` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `chat_messages` DROP FOREIGN KEY `chat_messages_userId_fkey`;

-- DropForeignKey
ALTER TABLE `refresh_tokens` DROP FOREIGN KEY `refresh_tokens_userId_fkey`;

-- DropForeignKey
ALTER TABLE `verification_codes` DROP FOREIGN KEY `verification_codes_userId_fkey`;

-- DropTable
DROP TABLE `chat_messages`;

-- DropTable
DROP TABLE `refresh_tokens`;

-- DropTable
DROP TABLE `verification_codes`;
