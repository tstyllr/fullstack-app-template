import { logger } from '../utils/logger.js';

export default function () {
   // Handle uncaught exceptions
   process.on('uncaughtException', (error: Error) => {
      logger.error('Uncaught Exception:', error);
      process.exit(1);
   });

   // Handle unhandled promise rejections
   process.on('unhandledRejection', (reason: any) => {
      logger.error('Unhandled Rejection:', reason);
      throw reason;
   });

   logger.info('Logging initialized');
}
