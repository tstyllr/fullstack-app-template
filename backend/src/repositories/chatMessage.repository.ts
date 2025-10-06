import { prisma } from '../startup/db.js';
import { type ChatMessage } from '../../generated/prisma';

export const chatMessageRepository = {
   async createMessage(data: {
      id?: string;
      conversationId: string;
      role: string;
      content: string;
      userId: number;
   }): Promise<ChatMessage> {
      return await prisma.chatMessage.create({
         data,
      });
   },

   async getMessageById(id: string): Promise<ChatMessage | null> {
      return await prisma.chatMessage.findUnique({
         where: { id },
      });
   },

   async getConversationHistory(
      conversationId: string
   ): Promise<ChatMessage[]> {
      return await prisma.chatMessage.findMany({
         where: { conversationId },
         orderBy: { createdAt: 'asc' },
      });
   },

   async getMessagesByIds(ids: string[]): Promise<ChatMessage[]> {
      return await prisma.chatMessage.findMany({
         where: {
            id: {
               in: ids,
            },
         },
         orderBy: { createdAt: 'asc' },
      });
   },
};
