import { conversationRepository } from '../repositories/conversation.repository.js';
import { messageRepository } from '../repositories/message.repository.js';
import { logger } from '../utils/logger.js';
import type {
   ConversationSummary,
   ConversationWithMessages,
   UserUsageStats,
} from '../types/chat.js';

export class ConversationService {
   /**
    * Create a new conversation
    */
   static async createConversation(
      userId: string,
      model: string,
      title?: string
   ) {
      try {
         const conversation = await conversationRepository.createConversation({
            userId,
            model,
            title,
         });

         logger.info('Conversation created', {
            conversationId: conversation.id,
            userId,
            model,
         });

         return conversation;
      } catch (error) {
         logger.error('Failed to create conversation', {
            userId,
            model,
            error: error instanceof Error ? error.message : 'Unknown error',
         });
         throw error;
      }
   }

   /**
    * Get conversation by ID with authorization check
    */
   static async getConversation(
      conversationId: string,
      userId: string
   ): Promise<ConversationWithMessages> {
      try {
         const conversation =
            await conversationRepository.getConversationWithMessages(
               conversationId
            );

         if (!conversation) {
            throw new Error('Conversation not found');
         }

         // Authorization check - ensure user owns the conversation
         if (conversation.userId !== userId) {
            throw new Error('Unauthorized access to conversation');
         }

         return conversation;
      } catch (error) {
         logger.error('Failed to get conversation', {
            conversationId,
            userId,
            error: error instanceof Error ? error.message : 'Unknown error',
         });
         throw error;
      }
   }

   /**
    * Get user's conversations with pagination
    */
   static async getUserConversations(
      userId: string,
      page: number = 1,
      limit: number = 20
   ): Promise<{
      conversations: ConversationSummary[];
      total: number;
      page: number;
      totalPages: number;
   }> {
      try {
         const skip = (page - 1) * limit;

         const [conversations, total] = await Promise.all([
            conversationRepository.getUserConversationsWithLastMessage(userId, {
               skip,
               take: limit,
            }),
            conversationRepository.countUserConversations(userId),
         ]);

         return {
            conversations,
            total,
            page,
            totalPages: Math.ceil(total / limit),
         };
      } catch (error) {
         logger.error('Failed to get user conversations', {
            userId,
            page,
            limit,
            error: error instanceof Error ? error.message : 'Unknown error',
         });
         throw error;
      }
   }

   /**
    * Update conversation (e.g., change title)
    */
   static async updateConversation(
      conversationId: string,
      userId: string,
      updates: {
         title?: string;
      }
   ) {
      try {
         // Check authorization
         const conversation =
            await conversationRepository.getConversationById(conversationId);

         if (!conversation) {
            throw new Error('Conversation not found');
         }

         if (conversation.userId !== userId) {
            throw new Error('Unauthorized access to conversation');
         }

         const updated = await conversationRepository.updateConversation(
            conversationId,
            updates
         );

         logger.info('Conversation updated', {
            conversationId,
            userId,
            updates,
         });

         return updated;
      } catch (error) {
         logger.error('Failed to update conversation', {
            conversationId,
            userId,
            error: error instanceof Error ? error.message : 'Unknown error',
         });
         throw error;
      }
   }

   /**
    * Delete conversation
    */
   static async deleteConversation(conversationId: string, userId: string) {
      try {
         // Check authorization
         const conversation =
            await conversationRepository.getConversationById(conversationId);

         if (!conversation) {
            throw new Error('Conversation not found');
         }

         if (conversation.userId !== userId) {
            throw new Error('Unauthorized access to conversation');
         }

         await conversationRepository.deleteConversation(conversationId);

         logger.info('Conversation deleted', {
            conversationId,
            userId,
         });

         return { success: true };
      } catch (error) {
         logger.error('Failed to delete conversation', {
            conversationId,
            userId,
            error: error instanceof Error ? error.message : 'Unknown error',
         });
         throw error;
      }
   }

   /**
    * Search messages across user's conversations
    */
   static async searchMessages(
      userId: string,
      query: string,
      page: number = 1,
      limit: number = 20
   ) {
      try {
         const skip = (page - 1) * limit;

         const results = await messageRepository.searchMessages(userId, query, {
            skip,
            take: limit,
         });

         return {
            results,
            page,
            query,
         };
      } catch (error) {
         logger.error('Failed to search messages', {
            userId,
            query,
            error: error instanceof Error ? error.message : 'Unknown error',
         });
         throw error;
      }
   }

   /**
    * Get user's total usage statistics
    */
   static async getUserUsageStats(userId: string): Promise<UserUsageStats> {
      try {
         const [totalConversations, totalMessages, usageData] =
            await Promise.all([
               conversationRepository.countUserConversations(userId),
               messageRepository.countUserMessages(userId),
               messageRepository.getUserTotalUsage(userId),
            ]);

         return {
            totalConversations,
            totalMessages,
            totalTokens: usageData.totalTokens,
            totalCost: usageData.totalCost,
            usageByModel: usageData.usageByModel,
         };
      } catch (error) {
         logger.error('Failed to get user usage stats', {
            userId,
            error: error instanceof Error ? error.message : 'Unknown error',
         });
         throw error;
      }
   }

   /**
    * Clean up old conversations (30+ days)
    */
   static async cleanupOldConversations(daysOld: number = 30): Promise<number> {
      try {
         const deletedCount =
            await conversationRepository.deleteOldConversations(daysOld);

         logger.info('Old conversations cleaned up', {
            deletedCount,
            daysOld,
         });

         return deletedCount;
      } catch (error) {
         logger.error('Failed to cleanup old conversations', {
            daysOld,
            error: error instanceof Error ? error.message : 'Unknown error',
         });
         throw error;
      }
   }
}

export const conversationService = ConversationService;
