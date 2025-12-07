import { streamText, generateText, convertToModelMessages } from 'ai';
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
    * Returns a streamText result that can be converted to a UIMessageStreamResponse
    */
   static async streamChatCompletion(
      conversationId: string,
      userId: string,
      messages: any[], // UIMessage type is complex, using any for flexibility
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

         // Get previous message count for title generation
         const previousMessages =
            await messageRepository.getConversationMessages(conversationId);
         const previousMessageCount = previousMessages.length;

         // Convert UIMessages to model messages format
         const modelMessages = convertToModelMessages(messages);

         // Create model with usage tracking
         const aiModel = createModelWithUsage(model);

         // Stream the response
         const result = streamText({
            model: aiModel,
            messages: modelMessages,
            maxOutputTokens: 4096,
            onFinish: async ({ text, usage, response }) => {
               // Save all messages from the conversation
               await this.saveMessages(conversationId, messages, text, usage);

               // Auto-generate title if this is one of the first messages
               if (previousMessageCount >= 1 && previousMessageCount <= 3) {
                  this.generateConversationTitle(conversationId).catch(
                     (error) => {
                        logger.error('Failed to generate conversation title', {
                           conversationId,
                           error:
                              error instanceof Error
                                 ? error.message
                                 : 'Unknown error',
                        });
                     }
                  );
               }

               logger.info('Chat stream completed', {
                  conversationId,
                  userId,
                  usage: {
                     promptTokens: usage.inputTokens,
                     completionTokens: usage.outputTokens,
                     totalTokens: usage.totalTokens,
                  },
               });
            },
         });

         logger.info('Chat stream initiated', {
            conversationId,
            userId,
            model,
            messageCount: messages.length,
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
    * Save messages to database after streaming completes
    */
   private static async saveMessages(
      conversationId: string,
      uiMessages: any[],
      assistantResponse: string,
      usage: any
   ) {
      try {
         // Get existing messages to avoid duplicates
         const existingMessages =
            await messageRepository.getConversationMessages(conversationId);
         const existingCount = existingMessages.length;

         // Only save new user messages (those not already in DB)
         const newUserMessages = uiMessages
            .filter((msg) => msg.role === 'user')
            .slice(existingCount / 2); // Assuming alternating user/assistant pattern

         // Save new user messages
         for (const msg of newUserMessages) {
            // Extract content from UIMessage
            // Support both AI SDK formats:
            // 1. Standard format: { content: string | array }
            // 2. AI SDK 4.2+ format: { parts: [{ type: 'text', text: string }] }
            let content = '';

            if (msg.content) {
               // Standard format with content field
               content =
                  typeof msg.content === 'string'
                     ? msg.content
                     : msg.content?.[0]?.text || '';
            } else if (msg.parts) {
               // AI SDK 4.2+ format with parts array
               content = msg.parts
                  .filter((part: any) => part.type === 'text')
                  .map((part: any) => part.text)
                  .join('');
            }

            if (content) {
               await messageRepository.createMessage({
                  conversationId,
                  role: 'user',
                  content,
               });
            }
         }

         // Save assistant response
         await messageRepository.createMessage({
            conversationId,
            role: 'assistant',
            content: assistantResponse,
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
      } catch (error) {
         logger.error('Failed to save messages', {
            conversationId,
            error: error instanceof Error ? error.message : 'Unknown error',
         });
         throw error;
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
