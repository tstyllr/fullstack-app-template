import type { Response } from 'express';
import type { AuthRequest } from '../types/auth.js';
import { userRepository } from '../repositories/user.repository.js';
import { userService } from '../services/user.service.js';
import { auditService } from '../services/audit.service.js';
import { logger } from '../utils/logger.js';
import { z } from 'zod';
import type { Role } from '../../generated/prisma';

// Validation schemas
const changeRoleSchema = z.object({
   role: z.enum(['ADMIN', 'MODERATOR', 'USER', 'GUEST']),
});

const suspendUserSchema = z.object({
   reason: z.string().optional(),
});

const getUsersQuerySchema = z.object({
   role: z.enum(['ADMIN', 'MODERATOR', 'USER', 'GUEST']).optional(),
   suspended: z.enum(['true', 'false']).optional(),
});

export const userController = {
   /**
    * Get current user's profile
    * GET /api/users/me
    */
   async getCurrentUser(req: AuthRequest, res: Response) {
      if (!req.user) {
         return res.status(401).json({ error: 'Unauthorized' });
      }

      try {
         const user = await userRepository.getUserById(req.user.id);
         if (!user) {
            return res.status(404).json({ error: 'User not found' });
         }

         res.json({
            id: user.id,
            phoneNumber: user.phoneNumber,
            email: user.email,
            name: user.name,
            role: user.role,
            isSuspended: user.isSuspended,
            createdAt: user.createdAt,
         });
      } catch (error) {
         logger.error('Failed to get current user', {
            userId: req.user.id,
            error: error instanceof Error ? error.message : 'Unknown error',
         });
         res.status(500).json({ error: 'Internal server error' });
      }
   },

   /**
    * Get all users with optional filtering
    * GET /api/users?role=ADMIN&suspended=true
    */
   async getAllUsers(req: AuthRequest, res: Response) {
      try {
         const query = getUsersQuerySchema.parse(req.query);

         const users = await userService.getAllUsers({
            role: query.role as Role | undefined,
            suspended: query.suspended === 'true' ? true : undefined,
         });

         res.json(users);
      } catch (error) {
         if (error instanceof z.ZodError) {
            return res.status(400).json({
               error: 'Validation error',
               details: error.errors,
            });
         }

         logger.error('Failed to get all users', {
            error: error instanceof Error ? error.message : 'Unknown error',
         });
         res.status(500).json({ error: 'Internal server error' });
      }
   },

   /**
    * Change user's role
    * PUT /api/users/:id/role
    */
   async changeUserRole(req: AuthRequest, res: Response) {
      if (!req.user) {
         return res.status(401).json({ error: 'Unauthorized' });
      }

      try {
         const { id } = req.params;
         const body = changeRoleSchema.parse(req.body);

         const updatedUser = await userService.changeUserRole(
            req.user.id,
            id!,
            body.role as Role,
            req.ip as string | undefined,
            req.get('user-agent') || undefined
         );

         res.json({
            id: updatedUser.id,
            phoneNumber: updatedUser.phoneNumber,
            email: updatedUser.email,
            name: updatedUser.name,
            role: updatedUser.role,
         });
      } catch (error) {
         if (error instanceof z.ZodError) {
            return res.status(400).json({
               error: 'Validation error',
               details: error.errors,
            });
         }

         if (error instanceof Error) {
            if (error.message === 'Cannot change your own role') {
               return res.status(400).json({ error: error.message });
            }
            if (error.message === 'User not found') {
               return res.status(404).json({ error: error.message });
            }
         }

         logger.error('Failed to change user role', {
            actorId: req.user.id,
            targetId: req.params.id,
            error: error instanceof Error ? error.message : 'Unknown error',
         });
         res.status(500).json({ error: 'Internal server error' });
      }
   },

   /**
    * Suspend a user
    * POST /api/users/:id/suspend
    */
   async suspendUser(req: AuthRequest, res: Response) {
      if (!req.user) {
         return res.status(401).json({ error: 'Unauthorized' });
      }

      try {
         const { id } = req.params;
         const body = suspendUserSchema.parse(req.body);

         const suspendedUser = await userService.suspendUser(
            req.user.id,
            id!,
            body.reason,
            req.ip as string | undefined,
            req.get('user-agent') || undefined
         );

         res.json({
            id: suspendedUser.id,
            phoneNumber: suspendedUser.phoneNumber,
            email: suspendedUser.email,
            name: suspendedUser.name,
            isSuspended: suspendedUser.isSuspended,
            suspendedAt: suspendedUser.suspendedAt,
            suspendedReason: suspendedUser.suspendedReason,
         });
      } catch (error) {
         if (error instanceof z.ZodError) {
            return res.status(400).json({
               error: 'Validation error',
               details: error.errors,
            });
         }

         if (error instanceof Error) {
            if (
               error.message === 'Cannot suspend yourself' ||
               error.message === 'Cannot suspend admin users'
            ) {
               return res.status(400).json({ error: error.message });
            }
            if (error.message === 'User not found') {
               return res.status(404).json({ error: error.message });
            }
         }

         logger.error('Failed to suspend user', {
            actorId: req.user.id,
            targetId: req.params.id,
            error: error instanceof Error ? error.message : 'Unknown error',
         });
         res.status(500).json({ error: 'Internal server error' });
      }
   },

   /**
    * Unsuspend a user
    * POST /api/users/:id/unsuspend
    */
   async unsuspendUser(req: AuthRequest, res: Response) {
      if (!req.user) {
         return res.status(401).json({ error: 'Unauthorized' });
      }

      try {
         const { id } = req.params;

         const unsuspendedUser = await userService.unsuspendUser(
            req.user.id,
            id!,
            req.ip as string | undefined,
            req.get('user-agent') || undefined
         );

         res.json({
            id: unsuspendedUser.id,
            phoneNumber: unsuspendedUser.phoneNumber,
            email: unsuspendedUser.email,
            name: unsuspendedUser.name,
            isSuspended: unsuspendedUser.isSuspended,
         });
      } catch (error) {
         if (error instanceof Error && error.message === 'User not found') {
            return res.status(404).json({ error: error.message });
         }

         logger.error('Failed to unsuspend user', {
            actorId: req.user.id,
            targetId: req.params.id,
            error: error instanceof Error ? error.message : 'Unknown error',
         });
         res.status(500).json({ error: 'Internal server error' });
      }
   },

   /**
    * Delete a user
    * DELETE /api/users/:id
    */
   async deleteUser(req: AuthRequest, res: Response) {
      if (!req.user) {
         return res.status(401).json({ error: 'Unauthorized' });
      }

      try {
         const { id } = req.params;

         await userService.deleteUser(
            req.user.id,
            id!,
            req.ip as string | undefined,
            req.get('user-agent') || undefined
         );

         res.status(204).send();
      } catch (error) {
         if (error instanceof Error) {
            if (
               error.message === 'Cannot delete yourself' ||
               error.message === 'Cannot delete admin users'
            ) {
               return res.status(400).json({ error: error.message });
            }
            if (error.message === 'User not found') {
               return res.status(404).json({ error: error.message });
            }
         }

         logger.error('Failed to delete user', {
            actorId: req.user.id,
            targetId: req.params.id,
            error: error instanceof Error ? error.message : 'Unknown error',
         });
         res.status(500).json({ error: 'Internal server error' });
      }
   },

   /**
    * Get audit logs
    * GET /api/users/audit-logs
    */
   async getAuditLogs(req: AuthRequest, res: Response) {
      try {
         const limit = req.query.limit
            ? parseInt(req.query.limit as string)
            : 50;
         const offset = req.query.offset
            ? parseInt(req.query.offset as string)
            : 0;

         const result = await auditService.getLogs({ limit, offset });

         res.json(result);
      } catch (error) {
         logger.error('Failed to get audit logs', {
            error: error instanceof Error ? error.message : 'Unknown error',
         });
         res.status(500).json({ error: 'Internal server error' });
      }
   },
};
