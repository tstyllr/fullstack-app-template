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

const sendMessageSchema = z.object({
   message: z.string().min(1).max(10000),
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

         // Get conversation to determine model
         const conversation = await conversationService.getConversation(
            id!,
            req.user.id
         );

         // Stream chat completion
         const result = await chatService.streamChatCompletion(
            id!,
            req.user.id,
            body.message,
            conversation.model
         );

         // Convert to streaming response
         return result.toUIMessageStreamResponse();
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
