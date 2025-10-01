import { logger } from '../utils/logger.js';

export default function () {
   if (!process.env.JWT_PRIVATE_KEY) {
      throw new Error('FATAL ERROR: JWT_PRIVATE_KEY is not defined.');
   }

   if (!process.env.DATABASE_URL) {
      throw new Error('FATAL ERROR: DATABASE_URL is not defined.');
   }

   logger.info('Configuration validated');
}
