import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../types/auth.js';
import { logger } from '@/utils/logger.js';
import { prisma } from '@/startup/db.js';

// Rate limit configuration
const CHAT_RATE_LIMITS = {
   perMinute: 10, // Max 10 messages per minute
   perHour: 100, // Max 100 messages per hour
};

/**
 * Chat rate limiting middleware
 * Prevents abuse of chat endpoints by limiting requests per user
 */
export async function chatRateLimit(
   req: AuthRequest,
   res: Response,
   next: NextFunction
) {
   if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
   }

   try {
      const userId = req.user.id;
      const now = Date.now();

      // Check per-minute rate limit
      const minuteKey = `chat:${userId}:minute`;
      const minuteLimit = await checkRateLimit(
         minuteKey,
         CHAT_RATE_LIMITS.perMinute,
         60 * 1000 // 1 minute
      );

      if (!minuteLimit.allowed) {
         logger.warn('Chat rate limit exceeded (per minute)', {
            userId,
            ip: req.ip,
            path: req.path,
         });

         return res.status(429).json({
            error: 'Rate limit exceeded',
            message: `Too many requests. Please try again in ${Math.ceil(minuteLimit.resetIn / 1000)} seconds.`,
            retryAfter: Math.ceil(minuteLimit.resetIn / 1000),
         });
      }

      // Check per-hour rate limit
      const hourKey = `chat:${userId}:hour`;
      const hourLimit = await checkRateLimit(
         hourKey,
         CHAT_RATE_LIMITS.perHour,
         60 * 60 * 1000 // 1 hour
      );

      if (!hourLimit.allowed) {
         logger.warn('Chat rate limit exceeded (per hour)', {
            userId,
            ip: req.ip,
            path: req.path,
         });

         return res.status(429).json({
            error: 'Rate limit exceeded',
            message: `Hourly limit reached. Please try again in ${Math.ceil(hourLimit.resetIn / 60000)} minutes.`,
            retryAfter: Math.ceil(hourLimit.resetIn / 1000),
         });
      }

      // Add rate limit headers
      res.setHeader('X-RateLimit-Limit-Minute', CHAT_RATE_LIMITS.perMinute);
      res.setHeader('X-RateLimit-Remaining-Minute', minuteLimit.remaining);
      res.setHeader('X-RateLimit-Limit-Hour', CHAT_RATE_LIMITS.perHour);
      res.setHeader('X-RateLimit-Remaining-Hour', hourLimit.remaining);

      next();
   } catch (error) {
      logger.error('Rate limit check failed', {
         userId: req.user.id,
         error: error instanceof Error ? error.message : 'Unknown error',
      });
      // On error, allow the request to proceed (fail open)
      next();
   }
}

/**
 * Check rate limit for a given key
 */
async function checkRateLimit(
   key: string,
   maxRequests: number,
   windowMs: number
): Promise<{
   allowed: boolean;
   remaining: number;
   resetIn: number;
}> {
   const now = Date.now();

   // Get or create rate limit record
   const record = await prisma.rateLimit.findUnique({
      where: { key },
   });

   if (!record) {
      // First request - create new record
      await prisma.rateLimit.create({
         data: {
            key,
            count: 1,
            lastRequest: BigInt(now),
         },
      });

      return {
         allowed: true,
         remaining: maxRequests - 1,
         resetIn: windowMs,
      };
   }

   const lastRequest = Number(record.lastRequest);
   const timeSinceLastRequest = now - lastRequest;

   // Reset counter if window has passed
   if (timeSinceLastRequest >= windowMs) {
      await prisma.rateLimit.update({
         where: { key },
         data: {
            count: 1,
            lastRequest: BigInt(now),
         },
      });

      return {
         allowed: true,
         remaining: maxRequests - 1,
         resetIn: windowMs,
      };
   }

   // Check if limit exceeded
   if (record.count >= maxRequests) {
      return {
         allowed: false,
         remaining: 0,
         resetIn: windowMs - timeSinceLastRequest,
      };
   }

   // Increment counter
   await prisma.rateLimit.update({
      where: { key },
      data: {
         count: record.count + 1,
         lastRequest: BigInt(now),
      },
   });

   return {
      allowed: true,
      remaining: maxRequests - record.count - 1,
      resetIn: windowMs - timeSinceLastRequest,
   };
}
