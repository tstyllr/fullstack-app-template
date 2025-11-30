import { prisma } from '../startup/db.js';
import { type User, type Role } from '../../generated/prisma';

export const userRepository = {
   async createUser(data: {
      phoneNumber: string;
      email: string;
      name?: string;
      password?: string;
      role?: Role;
   }): Promise<User> {
      return await prisma.user.create({
         data,
      });
   },

   async getUserByPhone(phoneNumber: string): Promise<User | null> {
      return await prisma.user.findUnique({
         where: { phoneNumber },
      });
   },

   async getUserById(id: string): Promise<User | null> {
      return await prisma.user.findUnique({
         where: { id },
      });
   },

   async getAdmin(): Promise<User | null> {
      return await prisma.user.findFirst({
         where: {
            role: 'ADMIN',
         },
      });
   },

   async updateUser(
      id: string,
      data: { name?: string; password?: string }
   ): Promise<User> {
      return await prisma.user.update({
         where: { id },
         data,
      });
   },

   async getAllUsers(): Promise<Omit<User, 'password'>[]> {
      return await prisma.user.findMany({
         select: {
            id: true,
            phoneNumber: true,
            phoneNumberVerified: true,
            email: true,
            emailVerified: true,
            name: true,
            image: true,
            role: true,
            isSuspended: true,
            suspendedAt: true,
            suspendedReason: true,
            createdAt: true,
            updatedAt: true,
         },
      });
   },

   async updateUserRole(id: string, role: Role): Promise<User> {
      return await prisma.user.update({
         where: { id },
         data: {
            role,
         },
      });
   },

   async suspendUser(id: string, reason?: string): Promise<User> {
      return await prisma.user.update({
         where: { id },
         data: {
            isSuspended: true,
            suspendedAt: new Date(),
            suspendedReason: reason,
         },
      });
   },

   async unsuspendUser(id: string): Promise<User> {
      return await prisma.user.update({
         where: { id },
         data: {
            isSuspended: false,
            suspendedAt: null,
            suspendedReason: null,
         },
      });
   },

   async deleteUser(id: string): Promise<User> {
      return await prisma.user.delete({
         where: { id },
      });
   },

   async getUsersByRole(role: Role): Promise<Omit<User, 'password'>[]> {
      return await prisma.user.findMany({
         where: { role },
         select: {
            id: true,
            phoneNumber: true,
            phoneNumberVerified: true,
            email: true,
            emailVerified: true,
            name: true,
            image: true,
            role: true,
            isSuspended: true,
            suspendedAt: true,
            suspendedReason: true,
            createdAt: true,
            updatedAt: true,
         },
      });
   },

   async getSuspendedUsers(): Promise<Omit<User, 'password'>[]> {
      return await prisma.user.findMany({
         where: { isSuspended: true },
         select: {
            id: true,
            phoneNumber: true,
            phoneNumberVerified: true,
            email: true,
            emailVerified: true,
            name: true,
            image: true,
            role: true,
            isSuspended: true,
            suspendedAt: true,
            suspendedReason: true,
            createdAt: true,
            updatedAt: true,
         },
      });
   },
};
