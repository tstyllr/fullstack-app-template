import { prisma } from '../startup/db.js';
import { type User } from '../../generated/prisma';

export const userRepository = {
   async createUser(data: {
      phone: string;
      name?: string;
      password?: string;
      isAdmin?: boolean;
   }): Promise<User> {
      return await prisma.user.create({
         data,
      });
   },

   async getUserByPhone(phone: string): Promise<User | null> {
      return await prisma.user.findUnique({
         where: { phone },
      });
   },

   async getUserById(id: number): Promise<User | null> {
      return await prisma.user.findUnique({
         where: { id },
      });
   },

   async getAdmin(): Promise<User | null> {
      return await prisma.user.findFirst({
         where: { isAdmin: true },
      });
   },

   async updateUser(
      id: number,
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
            phone: true,
            name: true,
            isAdmin: true,
            createdAt: true,
            updatedAt: true,
         },
      });
   },
};
