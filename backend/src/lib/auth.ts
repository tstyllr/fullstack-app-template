import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { phoneNumber } from 'better-auth/plugins';
import { PrismaClient } from '../../generated/prisma/index.js';
import { smsService } from '../services/sms.service.js';
import { logger } from '../utils/logger.js';

const prisma = new PrismaClient();

/**
 * Generate temporary email from phone number
 * Format: {phoneNumber}@phone.local
 * Example: +8613800138000@phone.local
 */
function generateTempEmail(phoneNumber: string): string {
   // Remove + and spaces from phone number for email
   const cleanPhone = phoneNumber.replace(/[\s+]/g, '');
   return `${cleanPhone}@phone.local`;
}

/**
 * Better Auth instance with phone number authentication
 *
 * Features:
 * - Phone number + SMS OTP login (passwordless)
 * - Phone number + password login
 * - Auto user registration on first OTP verification
 * - Temporary email generation for phone-only users
 */
export const auth = betterAuth({
   database: prismaAdapter(prisma, {
      provider: 'mysql',
   }),

   // Base URL for auth endpoints
   baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3000',

   // Secret for session encryption
   secret:
      process.env.BETTER_AUTH_SECRET || 'your-secret-key-change-in-production',

   // Enable email/password authentication
   emailAndPassword: {
      enabled: true,
      requireEmailVerification: false, // We're using phone verification instead
   },

   // Session configuration
   session: {
      expiresIn: 60 * 60 * 24 * 30, // 30 days
      updateAge: 60 * 60 * 24, // Update session every 24 hours
   },

   // User configuration
   user: {
      additionalFields: {
         role: {
            type: 'string',
            required: false,
            defaultValue: 'USER',
            input: false, // Role cannot be set by users
         },
         isSuspended: {
            type: 'boolean',
            required: false,
            defaultValue: false,
            input: false,
         },
      },
   },

   // Rate limiting configuration
   rateLimit: {
      enabled: true,
      window: 60, // 60 seconds
      max: 100, // Max 100 requests per minute globally
      storage: 'database', // Use database for distributed environments
      customRules: {
         // Sign-in endpoint: more restrictive
         '/sign-in/email': {
            window: 60,
            max: 5,
         },
         '/sign-in/phone-number': {
            window: 60,
            max: 5,
         },
         // OTP verification: very restrictive
         '/verify-phone': {
            window: 60,
            max: 3,
         },
         // Sign-up: restrictive
         '/sign-up/email': {
            window: 60,
            max: 3,
         },
         // Password reset: very restrictive
         '/reset-password': {
            window: 300, // 5 minutes
            max: 3,
         },
         '/forget-password': {
            window: 300,
            max: 3,
         },
         // Session checks: very permissive (no limit)
         '/get-session': false,
      },
   },

   // Plugins
   plugins: [
      // Phone number authentication
      phoneNumber({
         // OTP configuration
         otpLength: 6,
         expiresIn: 300, // 5 minutes
         allowedAttempts: 3,

         // Send OTP via Tencent Cloud SMS
         sendOTP: async ({ phoneNumber, code }, ctx) => {
            try {
               logger.info('Sending OTP via Better Auth', {
                  phoneNumber,
                  code,
               });

               await smsService.sendVerificationCode(phoneNumber, code);

               logger.info('OTP sent successfully', { phoneNumber });
            } catch (error) {
               logger.error('Failed to send OTP', {
                  phoneNumber,
                  error:
                     error instanceof Error ? error.message : 'Unknown error',
               });
               throw error;
            }
         },

         // Auto sign-up on verification
         signUpOnVerification: {
            // Generate temporary email from phone number
            getTempEmail: (phoneNumber) => {
               const tempEmail = generateTempEmail(phoneNumber);
               logger.info('Generated temp email for phone user', {
                  phoneNumber,
                  tempEmail,
               });
               return tempEmail;
            },
            // Optional: set default name from phone number
            getTempName: (phoneNumber) => {
               // Extract last 4 digits for display name
               const lastFour = phoneNumber.slice(-4);
               return `用户${lastFour}`;
            },
         },

         // Callback after successful phone verification
         callbackOnVerification: async ({ phoneNumber, user }, ctx) => {
            logger.info('Phone number verified successfully', {
               phoneNumber,
               userId: user.id,
               userName: user.name,
            });
         },
      }),
   ],

   // Advanced configuration
   advanced: {
      // Use secure cookies in production
      useSecureCookies: process.env.NODE_ENV === 'production',
      // Cookie prefix
      cookiePrefix: 'better-auth',
      // Disable origin check in development to support mobile apps, Postman, etc.
      // that don't send Origin headers
      disableOriginCheck: process.env.NODE_ENV !== 'production',
   },
});
