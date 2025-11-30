import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../types/auth.js';
import { Role } from '../types/auth.js';
import { logger } from '@/utils/logger.js';

/**
 * Moderator middleware - Requires MODERATOR or ADMIN role
 *
 * Checks if the authenticated user has moderator or admin privileges.
 * Moderators have elevated permissions but not full admin access.
 *
 * IMPORTANT: This middleware must be used AFTER the auth middleware
 *
 * @example
 * router.post('/moderate-content', auth, moderator, handler);
 */
export function moderator(req: AuthRequest, res: Response, next: NextFunction) {
   // Ensure user is authenticated
   if (!req.user) {
      logger.error('Moderator middleware called without auth middleware', {
         path: req.path,
         method: req.method,
      });
      return res.status(401).json({
         error: 'Unauthorized',
         message: 'Authentication required',
      });
   }

   // Check for moderator or admin role
   const hasModeratorAccess =
      req.user.role === Role.MODERATOR || req.user.role === Role.ADMIN;

   if (!hasModeratorAccess) {
      logger.warn('Access denied: Moderator privileges required', {
         userId: req.user.id,
         userRole: req.user.role,
         path: req.path,
         method: req.method,
      });
      return res.status(403).json({
         error: 'Forbidden',
         message: 'Access denied. Moderator or admin privileges required.',
      });
   }

   logger.debug('Moderator access granted', {
      userId: req.user.id,
      userRole: req.user.role,
      path: req.path,
   });

   next();
}
