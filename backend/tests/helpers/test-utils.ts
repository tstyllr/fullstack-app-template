import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import type { UserPayload } from '../../src/types/auth';
import { PrismaClient } from '../../generated/prisma/index.js';

const prisma = new PrismaClient();

/**
 * Generate a valid JWT token for testing
 */
export function generateToken(payload?: Partial<UserPayload>): string {
   const defaultPayload: UserPayload = {
      id: 2,
      phone: '15989142942',
      isAdmin: true,
      name: 'Test User',
   };

   const tokenPayload = { ...defaultPayload, ...payload };

   return jwt.sign(tokenPayload, process.env.JWT_PRIVATE_KEY!, {
      expiresIn: (process.env.ACCESS_TOKEN_EXPIRY || '15Minutes') as any,
   });
}

/**
 * Generate a refresh token for testing
 */
export function generateRefreshToken(userId: number): string {
   return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET!, {
      expiresIn: (process.env.REFRESH_TOKEN_EXPIRY || '30Days') as any,
   });
}

/**
 * Create a test user in the database
 */
export async function createTestUser(data?: {
   phone?: string;
   name?: string;
   password?: string;
   isAdmin?: boolean;
}) {
   const phone =
      data?.phone || `1${Math.floor(Math.random() * 9000000000 + 1000000000)}`;
   const hashedPassword = data?.password
      ? await bcrypt.hash(data.password, 10)
      : null;

   const user = await prisma.user.create({
      data: {
         phone,
         name: data?.name || 'Test User',
         password: hashedPassword,
         isAdmin: data?.isAdmin || false,
      },
   });

   return user;
}

/**
 * Create a verification code for testing
 */
export async function createVerificationCode(
   phone: string,
   code: string = '123456',
   expiresInMinutes: number = 5
) {
   const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);

   return await prisma.verificationCode.create({
      data: {
         phone,
         code,
         expiresAt,
         isUsed: false,
      },
   });
}

/**
 * Create a refresh token in the database
 */
export async function createRefreshToken(userId: number) {
   const token = generateRefreshToken(userId);
   const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

   await prisma.refreshToken.create({
      data: {
         token,
         userId,
         expiresAt,
         isRevoked: false,
      },
   });

   return token;
}

/**
 * Clean up test data from database
 */
export async function cleanupTestData() {
   // Delete in correct order to respect foreign key constraints
   await prisma.refreshToken.deleteMany({});
   await prisma.verificationCode.deleteMany({});
   await prisma.chatMessage.deleteMany({});
   await prisma.user.deleteMany({});
}

/**
 * Mock SMS service - prevents actual SMS from being sent during tests
 */
export const mockSmsService = {
   sendVerificationCode: async (_phone: string, _code: string) => {
      // Mock implementation - do nothing
      return Promise.resolve();
   },
   generateCode: () => {
      return '123456'; // Fixed code for testing
   },
};
