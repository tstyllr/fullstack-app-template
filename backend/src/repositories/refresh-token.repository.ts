import { PrismaClient } from '../../generated/prisma/index.js';

const prisma = new PrismaClient();

export const refreshTokenRepository = {
   async createRefreshToken(userId: number, token: string, expiresAt: Date) {
      return await prisma.refreshToken.create({
         data: {
            userId,
            token,
            expiresAt,
         },
      });
   },

   async findValidToken(token: string) {
      return await prisma.refreshToken.findFirst({
         where: {
            token,
            isRevoked: false,
            expiresAt: {
               gt: new Date(),
            },
         },
         include: {
            user: true,
         },
      });
   },

   async revokeToken(token: string) {
      return await prisma.refreshToken.updateMany({
         where: { token },
         data: { isRevoked: true },
      });
   },

   async revokeAllUserTokens(userId: number) {
      return await prisma.refreshToken.updateMany({
         where: { userId },
         data: { isRevoked: true },
      });
   },

   async cleanupExpiredTokens() {
      return await prisma.refreshToken.deleteMany({
         where: {
            OR: [{ isRevoked: true }, { expiresAt: { lt: new Date() } }],
         },
      });
   },

   async countUserTokens(userId: number) {
      return await prisma.refreshToken.count({
         where: {
            userId,
            isRevoked: false,
            expiresAt: {
               gt: new Date(),
            },
         },
      });
   },
};
