import type { Response } from 'express';
import type { AuthRequest } from '../types/auth.js';
import { conversationService } from '../services/conversation.service.js';
import { chatService } from '../services/chat.service.js';
import { logger } from '../utils/logger.js';
import { z } from 'zod';
import { isSupportedModel } from '../lib/openrouter.js';

// Validation schemas
const createConversationSchema = z.object({
   model: z.string().min(1),
   title: z.string().max(255).optional(),
});

// AI SDK UIMessage format schema
// Using z.any() for messages since UIMessage is a complex discriminated union type
const sendMessageSchema = z.object({
   messages: z.array(z.any()).min(1),
});

const updateConversationSchema = z.object({
   title: z.string().min(1).max(255),
});

const searchMessagesSchema = z.object({
   q: z.string().min(1),
   page: z.string().regex(/^\d+$/).optional(),
   limit: z.string().regex(/^\d+$/).optional(),
});

const getPaginationSchema = z.object({
   page: z.string().regex(/^\d+$/).optional(),
   limit: z.string().regex(/^\d+$/).optional(),
});

export const chatController = {
   /**
    * Create a new conversation
    * POST /api/chat/conversations
    */
   async createConversation(req: AuthRequest, res: Response) {
      if (!req.user) {
         return res.status(401).json({ error: 'Unauthorized' });
      }

      try {
         const body = createConversationSchema.parse(req.body);

         // Validate model
         if (!isSupportedModel(body.model)) {
            return res.status(400).json({
               error: 'Unsupported model',
               message: 'The specified model is not supported',
            });
         }

         const conversation = await conversationService.createConversation(
            req.user.id,
            body.model,
            body.title
         );

         res.status(201).json(conversation);
      } catch (error) {
         if (error instanceof z.ZodError) {
            return res.status(400).json({
               error: 'Validation error',
               details: error.errors,
            });
         }

         logger.error('Failed to create conversation', {
            userId: req.user.id,
            error: error instanceof Error ? error.message : 'Unknown error',
         });
         res.status(500).json({ error: 'Internal server error' });
      }
   },

   /**
    * Get user's conversations with pagination
    * GET /api/chat/conversations?page=1&limit=20
    */
   async getConversations(req: AuthRequest, res: Response) {
      if (!req.user) {
         return res.status(401).json({ error: 'Unauthorized' });
      }

      try {
         const query = getPaginationSchema.parse(req.query);
         const page = query.page ? parseInt(query.page) : 1;
         const limit = query.limit ? parseInt(query.limit) : 20;

         const result = await conversationService.getUserConversations(
            req.user.id,
            page,
            limit
         );

         res.json(result);
      } catch (error) {
         if (error instanceof z.ZodError) {
            return res.status(400).json({
               error: 'Validation error',
               details: error.errors,
            });
         }

         logger.error('Failed to get conversations', {
            userId: req.user.id,
            error: error instanceof Error ? error.message : 'Unknown error',
         });
         res.status(500).json({ error: 'Internal server error' });
      }
   },

   /**
    * Get a specific conversation with messages
    * GET /api/chat/conversations/:id
    */
   async getConversation(req: AuthRequest, res: Response) {
      if (!req.user) {
         return res.status(401).json({ error: 'Unauthorized' });
      }

      try {
         const { id } = req.params;
         const conversation = await conversationService.getConversation(
            id!,
            req.user.id
         );

         res.json(conversation);
      } catch (error) {
         if (error instanceof Error) {
            if (
               error.message === 'Conversation not found' ||
               error.message === 'Unauthorized access to conversation'
            ) {
               return res.status(404).json({ error: error.message });
            }
         }

         logger.error('Failed to get conversation', {
            userId: req.user.id,
            conversationId: req.params.id,
            error: error instanceof Error ? error.message : 'Unknown error',
         });
         res.status(500).json({ error: 'Internal server error' });
      }
   },

   /**
    * Update a conversation
    * PUT /api/chat/conversations/:id
    */
   async updateConversation(req: AuthRequest, res: Response) {
      if (!req.user) {
         return res.status(401).json({ error: 'Unauthorized' });
      }

      try {
         const { id } = req.params;
         const body = updateConversationSchema.parse(req.body);

         const updated = await conversationService.updateConversation(
            id!,
            req.user.id,
            {
               title: body.title,
            }
         );

         res.json(updated);
      } catch (error) {
         if (error instanceof z.ZodError) {
            return res.status(400).json({
               error: 'Validation error',
               details: error.errors,
            });
         }

         if (error instanceof Error) {
            if (
               error.message === 'Conversation not found' ||
               error.message === 'Unauthorized access to conversation'
            ) {
               return res.status(404).json({ error: error.message });
            }
         }

         logger.error('Failed to update conversation', {
            userId: req.user.id,
            conversationId: req.params.id,
            error: error instanceof Error ? error.message : 'Unknown error',
         });
         res.status(500).json({ error: 'Internal server error' });
      }
   },

   /**
    * Delete a conversation
    * DELETE /api/chat/conversations/:id
    */
   async deleteConversation(req: AuthRequest, res: Response) {
      if (!req.user) {
         return res.status(401).json({ error: 'Unauthorized' });
      }

      try {
         const { id } = req.params;
         await conversationService.deleteConversation(id!, req.user.id);

         res.json({ success: true });
      } catch (error) {
         if (error instanceof Error) {
            if (
               error.message === 'Conversation not found' ||
               error.message === 'Unauthorized access to conversation'
            ) {
               return res.status(404).json({ error: error.message });
            }
         }

         logger.error('Failed to delete conversation', {
            userId: req.user.id,
            conversationId: req.params.id,
            error: error instanceof Error ? error.message : 'Unknown error',
         });
         res.status(500).json({ error: 'Internal server error' });
      }
   },

   /**
    * Send a message and get streaming response
    * POST /api/chat/conversations/:id/messages
    */
   async sendMessage(req: AuthRequest, res: Response) {
      if (!req.user) {
         return res.status(401).json({ error: 'Unauthorized' });
      }

      try {
         const { id } = req.params;
         const body = sendMessageSchema.parse(req.body);

         // Validate that there are messages
         if (body.messages.length === 0) {
            return res.status(400).json({ error: 'Messages array is empty' });
         }

         // Validate that the last message is from the user
         const lastMessage = body.messages[body.messages.length - 1];
         if (!lastMessage || lastMessage.role !== 'user') {
            return res.status(400).json({
               error: 'Last message must be from user',
            });
         }

         // Extract content from the last message
         // Support both AI SDK formats:
         // 1. Standard format: { content: string | array }
         // 2. AI SDK 4.2+ format: { parts: [{ type: 'text', text: string }] }
         let content = '';

         if (lastMessage.content) {
            // Standard format with content field
            content =
               typeof lastMessage.content === 'string'
                  ? lastMessage.content
                  : lastMessage.content?.[0]?.text || '';
         } else if (lastMessage.parts) {
            // AI SDK 4.2+ format with parts array
            content = lastMessage.parts
               .filter((part: any) => part.type === 'text')
               .map((part: any) => part.text)
               .join('');
         }

         // Validate message length
         if (!content || content.length === 0) {
            return res
               .status(400)
               .json({ error: 'Message content is required' });
         }

         if (content.length > 10000) {
            return res.status(400).json({
               error: 'Message content exceeds maximum length of 10000 characters',
            });
         }

         // Get conversation to verify ownership and get model
         const conversation = await conversationService.getConversation(
            id!,
            req.user.id
         );

         // Stream chat completion with full message history
         const result = await chatService.streamChatCompletion(
            id!,
            req.user.id,
            body.messages,
            conversation.model
         );

         // Pipe the stream to the response
         result.pipeUIMessageStreamToResponse(res);
      } catch (error) {
         if (error instanceof z.ZodError) {
            return res.status(400).json({
               error: 'Validation error',
               details: error.errors,
            });
         }

         if (error instanceof Error) {
            if (
               error.message === 'Conversation not found' ||
               error.message === 'Unauthorized access to conversation'
            ) {
               return res.status(404).json({ error: error.message });
            }
         }

         logger.error('Failed to send message', {
            userId: req.user.id,
            conversationId: req.params.id,
            error: error instanceof Error ? error.message : 'Unknown error',
         });
         res.status(500).json({ error: 'Internal server error' });
      }
   },

   /**
    * Search messages across all conversations
    * GET /api/chat/messages/search?q=keyword&page=1&limit=20
    */
   async searchMessages(req: AuthRequest, res: Response) {
      if (!req.user) {
         return res.status(401).json({ error: 'Unauthorized' });
      }

      try {
         const query = searchMessagesSchema.parse(req.query);
         const page = query.page ? parseInt(query.page) : 1;
         const limit = query.limit ? parseInt(query.limit) : 20;

         const results = await conversationService.searchMessages(
            req.user.id,
            query.q,
            page,
            limit
         );

         res.json(results);
      } catch (error) {
         if (error instanceof z.ZodError) {
            return res.status(400).json({
               error: 'Validation error',
               details: error.errors,
            });
         }

         logger.error('Failed to search messages', {
            userId: req.user.id,
            error: error instanceof Error ? error.message : 'Unknown error',
         });
         res.status(500).json({ error: 'Internal server error' });
      }
   },

   /**
    * Get user's usage statistics
    * GET /api/chat/usage
    */
   async getUsageStats(req: AuthRequest, res: Response) {
      if (!req.user) {
         return res.status(401).json({ error: 'Unauthorized' });
      }

      try {
         const stats = await conversationService.getUserUsageStats(req.user.id);
         res.json(stats);
      } catch (error) {
         logger.error('Failed to get usage stats', {
            userId: req.user.id,
            error: error instanceof Error ? error.message : 'Unknown error',
         });
         res.status(500).json({ error: 'Internal server error' });
      }
   },
};
