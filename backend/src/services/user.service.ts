import { userRepository } from '../repositories/user.repository.js';
import { auditService } from './audit.service.js';
import { invalidateUserSessions } from '../utils/session.js';
import { AuditAction, Role } from '../types/auth.js';
import { logger } from '../utils/logger.js';
import type { Role as PrismaRole } from '../../generated/prisma';

export class UserService {
   /**
    * Change user's role
    *
    * @param actorId - ID of admin performing the action
    * @param targetUserId - ID of user whose role is being changed
    * @param newRole - New role to assign
    * @param ipAddress - IP address of the request
    * @param userAgent - User agent of the request
    * @returns Updated user
    */
   static async changeUserRole(
      actorId: string,
      targetUserId: string,
      newRole: PrismaRole,
      ipAddress?: string,
      userAgent?: string
   ) {
      try {
         // Prevent users from changing their own role
         if (actorId === targetUserId) {
            throw new Error('Cannot change your own role');
         }

         // Get current user data
         const currentUser = await userRepository.getUserById(targetUserId);
         if (!currentUser) {
            throw new Error('User not found');
         }

         const oldRole = currentUser.role;

         // Update role
         const updatedUser = await userRepository.updateUserRole(
            targetUserId,
            newRole
         );

         // Log audit event
         await auditService.log({
            actorId,
            targetId: targetUserId,
            action: AuditAction.USER_ROLE_CHANGED,
            resource: 'user',
            details: {
               oldRole,
               newRole,
               userName: currentUser.name,
            },
            ipAddress,
            userAgent,
         });

         // Invalidate user sessions to force re-authentication with new role
         await invalidateUserSessions(targetUserId);

         logger.info('User role changed', {
            actorId,
            targetUserId,
            oldRole,
            newRole,
         });

         return updatedUser;
      } catch (error) {
         logger.error('Failed to change user role', {
            actorId,
            targetUserId,
            newRole,
            error: error instanceof Error ? error.message : 'Unknown error',
         });
         throw error;
      }
   }

   /**
    * Suspend a user
    *
    * @param actorId - ID of admin performing the action
    * @param targetUserId - ID of user to suspend
    * @param reason - Reason for suspension
    * @param ipAddress - IP address of the request
    * @param userAgent - User agent of the request
    * @returns Suspended user
    */
   static async suspendUser(
      actorId: string,
      targetUserId: string,
      reason?: string,
      ipAddress?: string,
      userAgent?: string
   ) {
      try {
         // Prevent users from suspending themselves
         if (actorId === targetUserId) {
            throw new Error('Cannot suspend yourself');
         }

         // Get current user data
         const currentUser = await userRepository.getUserById(targetUserId);
         if (!currentUser) {
            throw new Error('User not found');
         }

         // Prevent suspending admins (only admins can be suspended by other admins)
         // This is a business rule - adjust as needed
         if (currentUser.role === 'ADMIN') {
            throw new Error('Cannot suspend admin users');
         }

         // Suspend user
         const suspendedUser = await userRepository.suspendUser(
            targetUserId,
            reason
         );

         // Log audit event
         await auditService.log({
            actorId,
            targetId: targetUserId,
            action: AuditAction.USER_SUSPENDED,
            resource: 'user',
            details: {
               reason,
               userName: currentUser.name,
            },
            ipAddress,
            userAgent,
         });

         // Invalidate all user sessions
         await invalidateUserSessions(targetUserId);

         logger.info('User suspended', {
            actorId,
            targetUserId,
            reason,
         });

         return suspendedUser;
      } catch (error) {
         logger.error('Failed to suspend user', {
            actorId,
            targetUserId,
            error: error instanceof Error ? error.message : 'Unknown error',
         });
         throw error;
      }
   }

   /**
    * Unsuspend a user
    *
    * @param actorId - ID of admin performing the action
    * @param targetUserId - ID of user to unsuspend
    * @param ipAddress - IP address of the request
    * @param userAgent - User agent of the request
    * @returns Unsuspended user
    */
   static async unsuspendUser(
      actorId: string,
      targetUserId: string,
      ipAddress?: string,
      userAgent?: string
   ) {
      try {
         // Get current user data
         const currentUser = await userRepository.getUserById(targetUserId);
         if (!currentUser) {
            throw new Error('User not found');
         }

         // Unsuspend user
         const unsuspendedUser =
            await userRepository.unsuspendUser(targetUserId);

         // Log audit event
         await auditService.log({
            actorId,
            targetId: targetUserId,
            action: AuditAction.USER_UNSUSPENDED,
            resource: 'user',
            details: {
               userName: currentUser.name,
            },
            ipAddress,
            userAgent,
         });

         logger.info('User unsuspended', {
            actorId,
            targetUserId,
         });

         return unsuspendedUser;
      } catch (error) {
         logger.error('Failed to unsuspend user', {
            actorId,
            targetUserId,
            error: error instanceof Error ? error.message : 'Unknown error',
         });
         throw error;
      }
   }

   /**
    * Delete a user
    *
    * @param actorId - ID of admin performing the action
    * @param targetUserId - ID of user to delete
    * @param ipAddress - IP address of the request
    * @param userAgent - User agent of the request
    * @returns Deleted user
    */
   static async deleteUser(
      actorId: string,
      targetUserId: string,
      ipAddress?: string,
      userAgent?: string
   ) {
      try {
         // Prevent users from deleting themselves
         if (actorId === targetUserId) {
            throw new Error('Cannot delete yourself');
         }

         // Get current user data before deletion
         const currentUser = await userRepository.getUserById(targetUserId);
         if (!currentUser) {
            throw new Error('User not found');
         }

         // Prevent deleting admins
         if (currentUser.role === 'ADMIN') {
            throw new Error('Cannot delete admin users');
         }

         // Delete user
         const deletedUser = await userRepository.deleteUser(targetUserId);

         // Log audit event
         await auditService.log({
            actorId,
            targetId: targetUserId,
            action: AuditAction.USER_DELETED,
            resource: 'user',
            details: {
               userName: currentUser.name,
               userEmail: currentUser.email,
               userPhone: currentUser.phoneNumber,
            },
            ipAddress,
            userAgent,
         });

         logger.info('User deleted', {
            actorId,
            targetUserId,
         });

         return deletedUser;
      } catch (error) {
         logger.error('Failed to delete user', {
            actorId,
            targetUserId,
            error: error instanceof Error ? error.message : 'Unknown error',
         });
         throw error;
      }
   }

   /**
    * Get all users with optional filtering
    */
   static async getAllUsers(options?: {
      role?: PrismaRole;
      suspended?: boolean;
   }) {
      try {
         if (options?.role) {
            return await userRepository.getUsersByRole(options.role);
         }

         if (options?.suspended) {
            return await userRepository.getSuspendedUsers();
         }

         return await userRepository.getAllUsers();
      } catch (error) {
         logger.error('Failed to get users', {
            error: error instanceof Error ? error.message : 'Unknown error',
         });
         throw error;
      }
   }
}

export const userService = UserService;
