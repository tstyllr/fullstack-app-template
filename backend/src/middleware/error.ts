import type { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';

export function errorHandler(
   err: Error,
   req: Request,
   res: Response,
   next: NextFunction
) {
   logger.error(err.message, { error: err, stack: err.stack });

   res.status(500).json({
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? err.message : undefined,
   });
}
