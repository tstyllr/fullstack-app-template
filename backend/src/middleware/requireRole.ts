import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../types/auth.js';
import { Role } from '../types/auth.js';
import { logger } from '@/utils/logger.js';

/**
 * Middleware factory for role-based access control
 *
 * Creates middleware that checks if the authenticated user has one of the required roles
 *
 * @param allowedRoles - Array of roles that are allowed to access the route
 * @returns Express middleware function
 *
 * @example
 * // Allow only admins
 * router.get('/admin-only', auth, requireRole([Role.ADMIN]), handler);
 *
 * @example
 * // Allow admins and moderators
 * router.get('/moderation', auth, requireRole([Role.ADMIN, Role.MODERATOR]), handler);
 */
export function requireRole(allowedRoles: Role[]) {
   return (req: AuthRequest, res: Response, next: NextFunction) => {
      // Ensure user is authenticated (should be set by auth middleware)
      if (!req.user) {
         logger.error('requireRole middleware called without auth middleware', {
            path: req.path,
            method: req.method,
         });
         return res.status(401).json({
            error: 'Unauthorized',
            message: 'Authentication required',
         });
      }

      // Check if user has one of the allowed roles
      if (!allowedRoles.includes(req.user.role)) {
         logger.warn('Access denied: Insufficient role', {
            userId: req.user.id,
            userRole: req.user.role,
            requiredRoles: allowedRoles,
            path: req.path,
            method: req.method,
         });
         return res.status(403).json({
            error: 'Forbidden',
            message: `Access denied. Required roles: ${allowedRoles.join(' or ')}`,
         });
      }

      // User has required role
      logger.debug('Role check passed', {
         userId: req.user.id,
         userRole: req.user.role,
         path: req.path,
      });

      next();
   };
}

/**
 * Middleware to require admin role
 * Shorthand for requireRole([Role.ADMIN])
 */
export const requireAdmin = requireRole([Role.ADMIN]);

/**
 * Middleware to require moderator or admin role
 * Shorthand for requireRole([Role.ADMIN, Role.MODERATOR])
 */
export const requireModerator = requireRole([Role.ADMIN, Role.MODERATOR]);

/**
 * Middleware to require any authenticated user (not guest)
 * Shorthand for requireRole([Role.ADMIN, Role.MODERATOR, Role.USER])
 */
export const requireAuthenticatedUser = requireRole([
   Role.ADMIN,
   Role.MODERATOR,
   Role.USER,
]);
