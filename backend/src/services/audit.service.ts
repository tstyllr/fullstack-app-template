import { PrismaClient } from '../../generated/prisma/index.js';
import { logger } from '../utils/logger.js';
import type { AuditAction } from '../types/auth.js';

const prisma = new PrismaClient();

/**
 * Audit logging service
 *
 * Tracks administrative actions and security events for compliance and monitoring
 */
export class AuditService {
   /**
    * Log an audit event
    *
    * @param params - Audit log parameters
    * @returns Created audit log entry
    */
   static async log(params: {
      actorId: string;
      targetId?: string;
      action: AuditAction | string;
      resource: string;
      details?: string | object;
      ipAddress?: string;
      userAgent?: string;
   }) {
      try {
         const auditLog = await prisma.auditLog.create({
            data: {
               actorId: params.actorId,
               targetId: params.targetId,
               action: params.action,
               resource: params.resource,
               details:
                  typeof params.details === 'string'
                     ? params.details
                     : JSON.stringify(params.details),
               ipAddress: params.ipAddress,
               userAgent: params.userAgent,
            },
         });

         logger.info('Audit log created', {
            auditId: auditLog.id,
            actorId: params.actorId,
            action: params.action,
            resource: params.resource,
         });

         return auditLog;
      } catch (error) {
         logger.error('Failed to create audit log', {
            error: error instanceof Error ? error.message : 'Unknown error',
            params,
         });
         throw error;
      }
   }

   /**
    * Get audit logs with pagination and filtering
    *
    * @param options - Query options
    * @returns Paginated audit logs
    */
   static async getLogs(options: {
      actorId?: string;
      targetId?: string;
      action?: string;
      resource?: string;
      startDate?: Date;
      endDate?: Date;
      limit?: number;
      offset?: number;
   }) {
      try {
         const where: any = {};

         if (options.actorId) where.actorId = options.actorId;
         if (options.targetId) where.targetId = options.targetId;
         if (options.action) where.action = options.action;
         if (options.resource) where.resource = options.resource;

         if (options.startDate || options.endDate) {
            where.createdAt = {};
            if (options.startDate) where.createdAt.gte = options.startDate;
            if (options.endDate) where.createdAt.lte = options.endDate;
         }

         const [logs, total] = await Promise.all([
            prisma.auditLog.findMany({
               where,
               include: {
                  actor: {
                     select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                     },
                  },
                  target: {
                     select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                     },
                  },
               },
               orderBy: {
                  createdAt: 'desc',
               },
               take: options.limit || 50,
               skip: options.offset || 0,
            }),
            prisma.auditLog.count({ where }),
         ]);

         return {
            logs,
            total,
            limit: options.limit || 50,
            offset: options.offset || 0,
         };
      } catch (error) {
         logger.error('Failed to get audit logs', {
            error: error instanceof Error ? error.message : 'Unknown error',
            options,
         });
         throw error;
      }
   }

   /**
    * Get audit logs for a specific user (as actor)
    *
    * @param userId - User ID
    * @param limit - Number of logs to return
    * @returns User's audit logs
    */
   static async getUserLogs(userId: string, limit: number = 50) {
      return this.getLogs({ actorId: userId, limit });
   }

   /**
    * Get audit logs where user was the target
    *
    * @param userId - User ID
    * @param limit - Number of logs to return
    * @returns Audit logs targeting the user
    */
   static async getLogsForTarget(userId: string, limit: number = 50) {
      return this.getLogs({ targetId: userId, limit });
   }

   /**
    * Get recent audit logs
    *
    * @param limit - Number of logs to return
    * @returns Recent audit logs
    */
   static async getRecentLogs(limit: number = 100) {
      return this.getLogs({ limit });
   }

   /**
    * Delete old audit logs (for GDPR compliance or storage management)
    *
    * @param olderThan - Date threshold (logs older than this will be deleted)
    * @returns Number of logs deleted
    */
   static async deleteOldLogs(olderThan: Date): Promise<number> {
      try {
         const result = await prisma.auditLog.deleteMany({
            where: {
               createdAt: {
                  lt: olderThan,
               },
            },
         });

         logger.info('Old audit logs deleted', {
            count: result.count,
            olderThan: olderThan.toISOString(),
         });

         return result.count;
      } catch (error) {
         logger.error('Failed to delete old audit logs', {
            error: error instanceof Error ? error.message : 'Unknown error',
         });
         throw error;
      }
   }

   /**
    * Get audit statistics
    *
    * @param startDate - Start date for statistics
    * @param endDate - End date for statistics
    * @returns Audit statistics
    */
   static async getStatistics(startDate?: Date, endDate?: Date) {
      try {
         const where: any = {};

         if (startDate || endDate) {
            where.createdAt = {};
            if (startDate) where.createdAt.gte = startDate;
            if (endDate) where.createdAt.lte = endDate;
         }

         const [totalLogs, actionCounts, resourceCounts, topActors] =
            await Promise.all([
               prisma.auditLog.count({ where }),
               prisma.auditLog.groupBy({
                  by: ['action'],
                  where,
                  _count: true,
                  orderBy: {
                     _count: {
                        action: 'desc',
                     },
                  },
                  take: 10,
               }),
               prisma.auditLog.groupBy({
                  by: ['resource'],
                  where,
                  _count: true,
                  orderBy: {
                     _count: {
                        resource: 'desc',
                     },
                  },
                  take: 10,
               }),
               prisma.auditLog.groupBy({
                  by: ['actorId'],
                  where,
                  _count: true,
                  orderBy: {
                     _count: {
                        actorId: 'desc',
                     },
                  },
                  take: 10,
               }),
            ]);

         return {
            totalLogs,
            actionCounts: actionCounts.map((a) => ({
               action: a.action,
               count: a._count,
            })),
            resourceCounts: resourceCounts.map((r) => ({
               resource: r.resource,
               count: r._count,
            })),
            topActors: topActors.map((t) => ({
               actorId: t.actorId,
               count: t._count,
            })),
         };
      } catch (error) {
         logger.error('Failed to get audit statistics', {
            error: error instanceof Error ? error.message : 'Unknown error',
         });
         throw error;
      }
   }
}

// Export singleton instance
export const auditService = AuditService;
