import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../types/auth.js';
import { Role } from '../types/auth.js';
import { logger } from '@/utils/logger.js';

/**
 * Admin middleware - Requires ADMIN role
 *
 * Checks if the authenticated user has admin privileges.
 *
 * IMPORTANT: This middleware must be used AFTER the auth middleware
 *
 * @example
 * router.get('/admin-only', auth, admin, handler);
 */
export function admin(req: AuthRequest, res: Response, next: NextFunction) {
   // Ensure user is authenticated
   if (!req.user) {
      logger.error('Admin middleware called without auth middleware', {
         path: req.path,
         method: req.method,
      });
      return res.status(401).json({
         error: 'Unauthorized',
         message: 'Authentication required',
      });
   }

   // Check for admin role
   const hasAdminAccess = req.user.role === Role.ADMIN;

   if (!hasAdminAccess) {
      logger.warn('Access denied: Admin privileges required', {
         userId: req.user.id,
         userRole: req.user.role,
         path: req.path,
         method: req.method,
      });
      return res.status(403).json({
         error: 'Forbidden',
         message: 'Access denied. Admin privileges required.',
      });
   }

   logger.debug('Admin access granted', {
      userId: req.user.id,
      path: req.path,
   });

   next();
}
