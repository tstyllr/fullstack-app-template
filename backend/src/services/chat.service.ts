import { streamText, generateText } from 'ai';
import {
   createModelWithUsage,
   getTitleGenerationModel,
} from '../lib/openrouter.js';
import { conversationRepository } from '../repositories/conversation.repository.js';
import { messageRepository } from '../repositories/message.repository.js';
import { logger } from '../utils/logger.js';
import type { ChatMessage, MessageRole } from '../types/chat.js';

export class ChatService {
   /**
    * Stream chat completion
    * Returns a streamText result that can be converted to a Response
    */
   static async streamChatCompletion(
      conversationId: string,
      userId: string,
      userMessage: string,
      model: string
   ) {
      try {
         // Verify conversation ownership
         const conversation =
            await conversationRepository.getConversationById(conversationId);

         if (!conversation) {
            throw new Error('Conversation not found');
         }

         if (conversation.userId !== userId) {
            throw new Error('Unauthorized access to conversation');
         }

         // Get conversation history
         const messages =
            await messageRepository.getConversationMessages(conversationId);

         // Build message history for AI
         const chatHistory: ChatMessage[] = messages.map((msg) => ({
            role: msg.role as MessageRole,
            content: msg.content,
         }));

         // Add new user message to history
         chatHistory.push({
            role: 'user' as MessageRole,
            content: userMessage,
         });

         // Create model with usage tracking
         const aiModel = createModelWithUsage(model);

         // Stream the response
         const result = streamText({
            model: aiModel,
            messages: chatHistory,
            maxOutputTokens: 4096,
         });

         // Save user message immediately
         await messageRepository.createMessage({
            conversationId,
            role: 'user',
            content: userMessage,
         });

         // Handle completion in background
         this.handleStreamCompletion(
            result,
            conversationId,
            userId,
            messages.length
         );

         logger.info('Chat stream initiated', {
            conversationId,
            userId,
            model,
            messageCount: chatHistory.length,
         });

         return result;
      } catch (error) {
         logger.error('Failed to stream chat completion', {
            conversationId,
            userId,
            error: error instanceof Error ? error.message : 'Unknown error',
         });
         throw error;
      }
   }

   /**
    * Handle stream completion - save assistant response and usage data
    */
   private static async handleStreamCompletion(
      result: Awaited<ReturnType<typeof streamText>>,
      conversationId: string,
      userId: string,
      previousMessageCount: number
   ) {
      try {
         // Wait for stream to complete
         const [text, usage] = await Promise.all([result.text, result.usage]);

         // Save assistant response
         await messageRepository.createMessage({
            conversationId,
            role: 'assistant',
            content: text,
            tokenCount: usage.outputTokens,
         });

         // Record usage statistics
         await messageRepository.recordUsage({
            conversationId,
            promptTokens: usage.inputTokens ?? 0,
            completionTokens: usage.outputTokens ?? 0,
            totalTokens:
               usage.totalTokens ??
               (usage.inputTokens ?? 0) + (usage.outputTokens ?? 0),
         });

         logger.info('Chat stream completed', {
            conversationId,
            userId,
            usage: {
               promptTokens: usage.inputTokens,
               completionTokens: usage.outputTokens,
               totalTokens: usage.totalTokens,
            },
         });

         // Auto-generate title if this is one of the first messages
         if (previousMessageCount >= 1 && previousMessageCount <= 3) {
            this.generateConversationTitle(conversationId).catch((error) => {
               logger.error('Failed to generate conversation title', {
                  conversationId,
                  error:
                     error instanceof Error ? error.message : 'Unknown error',
               });
            });
         }
      } catch (error) {
         logger.error('Failed to handle stream completion', {
            conversationId,
            userId,
            error: error instanceof Error ? error.message : 'Unknown error',
         });
      }
   }

   /**
    * Generate a conversation title based on the first few messages
    */
   private static async generateConversationTitle(conversationId: string) {
      try {
         const conversation =
            await conversationRepository.getConversationWithMessages(
               conversationId
            );

         if (!conversation || conversation.title) {
            return; // Skip if conversation not found or already has a title
         }

         // Get first few messages
         const messages = conversation.messages.slice(0, 4);
         if (messages.length < 2) {
            return; // Need at least user + assistant message
         }

         // Build conversation context
         const context = messages
            .map((msg) => `${msg.role}: ${msg.content}`)
            .join('\n\n');

         // Generate title using cheaper model
         const titleModel = getTitleGenerationModel();
         const { text } = await generateText({
            model: titleModel,
            prompt: `Based on the following conversation, generate a short, descriptive title (max 60 characters, no quotes, in the same language as the conversation):

${context}

Title:`,
            maxOutputTokens: 50,
         });

         const title = text.trim().replace(/^["']|["']$/g, ''); // Remove quotes

         // Update conversation with generated title
         await conversationRepository.updateConversation(conversationId, {
            title: title.substring(0, 255), // Ensure it fits in DB
         });

         logger.info('Conversation title generated', {
            conversationId,
            title,
         });
      } catch (error) {
         // Don't throw - title generation is non-critical
         logger.error('Failed to generate title', {
            conversationId,
            error: error instanceof Error ? error.message : 'Unknown error',
         });
      }
   }

   /**
    * Get conversation messages formatted for AI
    */
   static async getConversationHistory(
      conversationId: string,
      userId: string
   ): Promise<ChatMessage[]> {
      try {
         // Verify ownership
         const conversation =
            await conversationRepository.getConversationById(conversationId);

         if (!conversation) {
            throw new Error('Conversation not found');
         }

         if (conversation.userId !== userId) {
            throw new Error('Unauthorized access to conversation');
         }

         const messages =
            await messageRepository.getConversationMessages(conversationId);

         return messages.map((msg) => ({
            role: msg.role as MessageRole,
            content: msg.content,
         }));
      } catch (error) {
         logger.error('Failed to get conversation history', {
            conversationId,
            userId,
            error: error instanceof Error ? error.message : 'Unknown error',
         });
         throw error;
      }
   }
}

export const chatService = ChatService;
