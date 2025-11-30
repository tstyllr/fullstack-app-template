import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../types/auth.js';
import { Role } from '../types/auth.js';
import { userRepository } from '@/repositories/user.repository.js';
import { logger } from '@/utils/logger.js';
import { auth as betterAuth } from '@/lib/auth.js';

/**
 * Authentication middleware
 * Validates session using better-auth and populates req.user with authenticated user data
 *
 * Features:
 * - Session validation via better-auth
 * - Role-based access control (RBAC)
 * - Suspended user blocking
 * - Development bypass mode
 * - Comprehensive error handling and logging
 */
export async function auth(
   req: AuthRequest,
   res: Response,
   next: NextFunction
) {
   try {
      // Development mode: bypass authentication
      if (process.env.REQUIRES_AUTH === 'false') {
         logger.warn('Authentication bypassed (REQUIRES_AUTH=false)');
         const user = await userRepository.getAdmin();
         if (user) {
            req.user = {
               id: user.id,
               phone: user.phoneNumber,
               email: user.email,
               name: user.name || undefined,
               role: user.role as Role,
               isSuspended: user.isSuspended,
            };
         }
         return next();
      }

      // Validate session with better-auth
      const session = await betterAuth.api.getSession({
         headers: req.headers as any, // Better-auth accepts Express headers
      });

      // No valid session found
      if (!session) {
         logger.warn('Authentication failed: No valid session', {
            path: req.path,
            method: req.method,
            ip: req.ip,
         });
         return res.status(401).json({
            error: 'Unauthorized',
            message: 'Valid session required. Please sign in.',
         });
      }

      // Extract user data from session
      const { user } = session;

      // Check if user is suspended
      if (user.isSuspended) {
         logger.warn('Suspended user attempted access', {
            userId: user.id,
            path: req.path,
            method: req.method,
         });
         return res.status(403).json({
            error: 'Forbidden',
            message: 'Your account has been suspended. Please contact support.',
         });
      }

      // Populate req.user with authenticated user data
      req.user = {
         id: user.id,
         phone: user.phoneNumber || '',
         email: user.email,
         name: user.name || undefined,
         role: (user.role as Role) || Role.USER,
         isSuspended: user.isSuspended || false,
      };

      // Log successful authentication
      logger.debug('User authenticated successfully', {
         userId: user.id,
         role: user.role,
         path: req.path,
      });

      next();
   } catch (error) {
      logger.error('Authentication error', {
         error: error instanceof Error ? error.message : 'Unknown error',
         stack: error instanceof Error ? error.stack : undefined,
         path: req.path,
         method: req.method,
      });

      return res.status(401).json({
         error: 'Unauthorized',
         message: 'Authentication failed. Please try again.',
      });
   }
}
