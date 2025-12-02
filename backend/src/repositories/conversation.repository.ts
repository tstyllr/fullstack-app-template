import { prisma } from '../startup/db.js';
import type { Conversation, Message } from '../../generated/prisma/index.js';

export const conversationRepository = {
   async createConversation(data: {
      userId: string;
      model: string;
      title?: string;
   }): Promise<Conversation> {
      return await prisma.conversation.create({
         data,
      });
   },

   async getConversationById(id: string): Promise<Conversation | null> {
      return await prisma.conversation.findUnique({
         where: { id },
      });
   },

   async getConversationWithMessages(
      id: string
   ): Promise<(Conversation & { messages: Message[] }) | null> {
      return await prisma.conversation.findUnique({
         where: { id },
         include: {
            messages: {
               orderBy: {
                  createdAt: 'asc',
               },
            },
         },
      });
   },

   async getUserConversations(
      userId: string,
      options?: {
         skip?: number;
         take?: number;
      }
   ): Promise<Conversation[]> {
      return await prisma.conversation.findMany({
         where: { userId },
         orderBy: {
            updatedAt: 'desc',
         },
         skip: options?.skip,
         take: options?.take,
      });
   },

   async getUserConversationsWithLastMessage(
      userId: string,
      options?: {
         skip?: number;
         take?: number;
      }
   ) {
      const conversations = await prisma.conversation.findMany({
         where: { userId },
         orderBy: {
            updatedAt: 'desc',
         },
         skip: options?.skip,
         take: options?.take,
         include: {
            messages: {
               orderBy: {
                  createdAt: 'desc',
               },
               take: 1,
               select: {
                  content: true,
               },
            },
            _count: {
               select: {
                  messages: true,
               },
            },
         },
      });

      return conversations.map((conv) => ({
         id: conv.id,
         userId: conv.userId,
         title: conv.title,
         model: conv.model,
         createdAt: conv.createdAt,
         updatedAt: conv.updatedAt,
         messageCount: conv._count.messages,
         lastMessage: conv.messages[0]?.content,
      }));
   },

   async updateConversation(
      id: string,
      data: {
         title?: string;
         model?: string;
      }
   ): Promise<Conversation> {
      return await prisma.conversation.update({
         where: { id },
         data,
      });
   },

   async deleteConversation(id: string): Promise<Conversation> {
      return await prisma.conversation.delete({
         where: { id },
      });
   },

   async countUserConversations(userId: string): Promise<number> {
      return await prisma.conversation.count({
         where: { userId },
      });
   },

   async deleteOldConversations(daysOld: number): Promise<number> {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const result = await prisma.conversation.deleteMany({
         where: {
            updatedAt: {
               lt: cutoffDate,
            },
         },
      });

      return result.count;
   },
};
