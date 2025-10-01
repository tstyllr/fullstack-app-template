import { PrismaClient } from '../../generated/prisma';
import { logger } from '../utils/logger.js';

const prisma = new PrismaClient();

export default async function () {
   try {
      await prisma.$connect();
      logger.info('Connected to MySQL database via Prisma');
   } catch (error) {
      logger.error('Could not connect to database:', error);
      process.exit(1);
   }
}

export { prisma };
