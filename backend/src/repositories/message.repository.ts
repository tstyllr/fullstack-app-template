import { prisma } from '../startup/db.js';
import type {
   Message,
   ConversationUsage,
} from '../../generated/prisma/index.js';

export const messageRepository = {
   async createMessage(data: {
      conversationId: string;
      role: string;
      content: string;
      tokenCount?: number;
   }): Promise<Message> {
      return await prisma.message.create({
         data,
      });
   },

   async createMessages(
      messages: {
         conversationId: string;
         role: string;
         content: string;
         tokenCount?: number;
      }[]
   ): Promise<number> {
      const result = await prisma.message.createMany({
         data: messages,
      });
      return result.count;
   },

   async getConversationMessages(conversationId: string): Promise<Message[]> {
      return await prisma.message.findMany({
         where: { conversationId },
         orderBy: {
            createdAt: 'asc',
         },
      });
   },

   async searchMessages(
      userId: string,
      query: string,
      options?: {
         skip?: number;
         take?: number;
      }
   ) {
      // Full-text search in MySQL
      const messages = await prisma.$queryRaw<
         {
            id: string;
            conversationId: string;
            role: string;
            content: string;
            createdAt: Date;
            conversationTitle: string | null;
         }[]
      >`
      SELECT
        m.id,
        m.conversation_id as conversationId,
        m.role,
        m.content,
        m.created_at as createdAt,
        c.title as conversationTitle
      FROM messages m
      INNER JOIN conversations c ON m.conversation_id = c.id
      WHERE c.user_id = ${userId}
      AND MATCH(m.content) AGAINST(${query} IN NATURAL LANGUAGE MODE)
      ORDER BY m.created_at DESC
      LIMIT ${options?.take || 20}
      OFFSET ${options?.skip || 0}
    `;

      return messages;
   },

   async recordUsage(data: {
      conversationId: string;
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
      cost?: number;
   }): Promise<ConversationUsage> {
      return await prisma.conversationUsage.create({
         data,
      });
   },

   async getConversationUsage(
      conversationId: string
   ): Promise<ConversationUsage[]> {
      return await prisma.conversationUsage.findMany({
         where: { conversationId },
         orderBy: {
            createdAt: 'desc',
         },
      });
   },

   async getUserTotalUsage(userId: string) {
      const result = await prisma.conversationUsage.findMany({
         where: {
            conversation: {
               userId,
            },
         },
         select: {
            promptTokens: true,
            completionTokens: true,
            totalTokens: true,
            cost: true,
            conversation: {
               select: {
                  model: true,
               },
            },
         },
      });

      // Aggregate total stats
      const totalStats = result.reduce(
         (acc, curr) => ({
            totalTokens: acc.totalTokens + curr.totalTokens,
            totalCost: acc.totalCost + (curr.cost || 0),
         }),
         { totalTokens: 0, totalCost: 0 }
      );

      // Group by model
      const usageByModel = result.reduce(
         (acc, curr) => {
            const model = curr.conversation.model;
            if (!acc[model]) {
               acc[model] = {
                  model,
                  count: 0,
                  tokens: 0,
                  cost: 0,
               };
            }
            acc[model].count++;
            acc[model].tokens += curr.totalTokens;
            acc[model].cost += curr.cost || 0;
            return acc;
         },
         {} as Record<
            string,
            {
               model: string;
               count: number;
               tokens: number;
               cost: number;
            }
         >
      );

      return {
         ...totalStats,
         usageByModel: Object.values(usageByModel),
      };
   },

   async countUserMessages(userId: string): Promise<number> {
      return await prisma.message.count({
         where: {
            conversation: {
               userId,
            },
         },
      });
   },
};
