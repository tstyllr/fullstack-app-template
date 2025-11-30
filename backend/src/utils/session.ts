import type { Response, NextFunction } from 'express';
import type { AuthRequest, UserPayload, Permission } from '../types/auth.js';
import { Role } from '../types/auth.js';
import { auth as betterAuth } from '@/lib/auth.js';
import { PrismaClient } from '../../generated/prisma/index.js';
import { logger } from './logger.js';

const prisma = new PrismaClient();

/**
 * Check if a user has a specific permission
 *
 * @param user - The user payload
 * @param resource - The resource to check (e.g., 'user', 'post', 'comment')
 * @param action - The action to check (e.g., 'create', 'read', 'update', 'delete')
 * @returns True if user has permission, false otherwise
 */
export function hasPermission(
   user: UserPayload,
   resource: string,
   action: string
): boolean {
   // Admin has all permissions
   if (user.role === Role.ADMIN) {
      return true;
   }

   // Check if user has the specific permission
   if (user.permissions && user.permissions[resource]) {
      return user.permissions[resource].includes(action);
   }

   return false;
}

/**
 * Check if a user has any of the specified permissions
 *
 * @param user - The user payload
 * @param permissions - Array of permissions to check
 * @returns True if user has at least one permission, false otherwise
 */
export function hasAnyPermission(
   user: UserPayload,
   permissions: Permission[]
): boolean {
   return permissions.some((perm) =>
      hasPermission(user, perm.resource, perm.action)
   );
}

/**
 * Check if a user has all of the specified permissions
 *
 * @param user - The user payload
 * @param permissions - Array of permissions to check
 * @returns True if user has all permissions, false otherwise
 */
export function hasAllPermissions(
   user: UserPayload,
   permissions: Permission[]
): boolean {
   return permissions.every((perm) =>
      hasPermission(user, perm.resource, perm.action)
   );
}

/**
 * Middleware factory for permission-based access control
 *
 * Creates middleware that checks if the authenticated user has specific permissions
 *
 * @param resource - The resource to check
 * @param action - The action to check
 * @returns Express middleware function
 *
 * @example
 * router.post('/users', auth, requirePermission('user', 'create'), createUser);
 */
export function requirePermission(resource: string, action: string) {
   return (req: AuthRequest, res: Response, next: NextFunction) => {
      if (!req.user) {
         return res.status(401).json({
            error: 'Unauthorized',
            message: 'Authentication required',
         });
      }

      if (!hasPermission(req.user, resource, action)) {
         logger.warn('Access denied: Insufficient permissions', {
            userId: req.user.id,
            userRole: req.user.role,
            requiredPermission: { resource, action },
            path: req.path,
         });
         return res.status(403).json({
            error: 'Forbidden',
            message: `Access denied. Required permission: ${resource}.${action}`,
         });
      }

      next();
   };
}

/**
 * Middleware factory for multiple permissions check (requires ANY)
 *
 * @param permissions - Array of permissions (user needs at least one)
 * @returns Express middleware function
 */
export function requireAnyPermission(permissions: Permission[]) {
   return (req: AuthRequest, res: Response, next: NextFunction) => {
      if (!req.user) {
         return res.status(401).json({
            error: 'Unauthorized',
            message: 'Authentication required',
         });
      }

      if (!hasAnyPermission(req.user, permissions)) {
         logger.warn('Access denied: No matching permissions', {
            userId: req.user.id,
            userRole: req.user.role,
            requiredPermissions: permissions,
            path: req.path,
         });
         return res.status(403).json({
            error: 'Forbidden',
            message: 'Access denied. Insufficient permissions.',
         });
      }

      next();
   };
}

/**
 * Middleware factory for multiple permissions check (requires ALL)
 *
 * @param permissions - Array of permissions (user needs all of them)
 * @returns Express middleware function
 */
export function requireAllPermissions(permissions: Permission[]) {
   return (req: AuthRequest, res: Response, next: NextFunction) => {
      if (!req.user) {
         return res.status(401).json({
            error: 'Unauthorized',
            message: 'Authentication required',
         });
      }

      if (!hasAllPermissions(req.user, permissions)) {
         logger.warn('Access denied: Missing required permissions', {
            userId: req.user.id,
            userRole: req.user.role,
            requiredPermissions: permissions,
            path: req.path,
         });
         return res.status(403).json({
            error: 'Forbidden',
            message: 'Access denied. Insufficient permissions.',
         });
      }

      next();
   };
}

/**
 * Invalidate all sessions for a specific user
 *
 * Useful for:
 * - User logout from all devices
 * - Security incident response
 * - Role/permission changes requiring re-authentication
 *
 * @param userId - The user ID whose sessions to invalidate
 * @returns Number of sessions deleted
 */
export async function invalidateUserSessions(userId: string): Promise<number> {
   try {
      const result = await prisma.session.deleteMany({
         where: { userId },
      });

      logger.info('User sessions invalidated', {
         userId,
         sessionCount: result.count,
      });

      return result.count;
   } catch (error) {
      logger.error('Failed to invalidate user sessions', {
         userId,
         error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
   }
}

/**
 * Invalidate a specific session by token
 *
 * @param token - The session token to invalidate
 * @returns True if session was deleted, false if not found
 */
export async function invalidateSession(token: string): Promise<boolean> {
   try {
      const result = await prisma.session.deleteMany({
         where: { token },
      });

      logger.info('Session invalidated', {
         token: token.substring(0, 10) + '...',
         found: result.count > 0,
      });

      return result.count > 0;
   } catch (error) {
      logger.error('Failed to invalidate session', {
         error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
   }
}

/**
 * Get all active sessions for a user
 *
 * @param userId - The user ID
 * @returns Array of session information
 */
export async function getUserSessions(userId: string) {
   try {
      const sessions = await prisma.session.findMany({
         where: {
            userId,
            expiresAt: {
               gt: new Date(), // Only active sessions
            },
         },
         select: {
            id: true,
            token: true,
            expiresAt: true,
            ipAddress: true,
            userAgent: true,
            createdAt: true,
            updatedAt: true,
         },
         orderBy: {
            updatedAt: 'desc',
         },
      });

      return sessions;
   } catch (error) {
      logger.error('Failed to get user sessions', {
         userId,
         error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
   }
}

/**
 * Clean up expired sessions from database
 *
 * Should be run periodically (e.g., daily cron job)
 *
 * @returns Number of sessions deleted
 */
export async function cleanupExpiredSessions(): Promise<number> {
   try {
      const result = await prisma.session.deleteMany({
         where: {
            expiresAt: {
               lt: new Date(),
            },
         },
      });

      logger.info('Expired sessions cleaned up', {
         sessionCount: result.count,
      });

      return result.count;
   } catch (error) {
      logger.error('Failed to clean up expired sessions', {
         error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
   }
}
