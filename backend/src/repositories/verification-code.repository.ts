import { prisma } from '../startup/db.js';

export const verificationCodeRepository = {
   async createCode(
      phone: string,
      code: string,
      expiresAt: Date,
      userId?: number
   ) {
      return await prisma.verificationCode.create({
         data: {
            phone,
            code,
            expiresAt,
            userId,
         },
      });
   },

   async findValidCode(phone: string, code: string) {
      return await prisma.verificationCode.findFirst({
         where: {
            phone,
            code,
            isUsed: false,
            expiresAt: {
               gt: new Date(),
            },
         },
         orderBy: {
            createdAt: 'desc',
         },
      });
   },

   async markCodeAsUsed(id: number) {
      return await prisma.verificationCode.update({
         where: { id },
         data: { isUsed: true },
      });
   },

   async invalidatePhoneCodes(phone: string) {
      return await prisma.verificationCode.updateMany({
         where: {
            phone,
            isUsed: false,
         },
         data: { isUsed: true },
      });
   },

   async cleanupExpiredCodes() {
      return await prisma.verificationCode.deleteMany({
         where: {
            OR: [{ isUsed: true }, { expiresAt: { lt: new Date() } }],
         },
      });
   },

   async getRecentCodeCount(phone: string, minutesAgo: number) {
      const timeThreshold = new Date(Date.now() - minutesAgo * 60 * 1000);
      return await prisma.verificationCode.count({
         where: {
            phone,
            createdAt: {
               gte: timeThreshold,
            },
         },
      });
   },
};
