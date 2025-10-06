import type { Response } from 'express';
import { chatService } from '../services/chat.service';
import z from 'zod';
import type { AuthRequest } from '@/types/auth';

// Implementation detail
const chatSchema = z.object({
   prompt: z
      .string()
      .trim()
      .min(1, 'Prompt is required.')
      .max(1000, 'Prompt is too long (max 1000 characters'),
   previousResponseId: z.string().optional(),
});

// Public interface
export const chatController = {
   async sendMessage(req: AuthRequest, res: Response) {
      if (!req.user) {
         return res.status(401).json({ error: 'Unauthorized' });
      }

      const parseResult = chatSchema.safeParse(req.body);
      if (!parseResult.success) {
         res.status(400).json(parseResult.error.format());
         return;
      }

      // Set SSE headers
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      try {
         const { prompt, previousResponseId } = req.body;
         const stream = chatService.generateTextWithDeepseekClient(
            prompt,
            req.user.id,
            previousResponseId
         );

         // Stream the response
         for await (const event of stream) {
            if (event.type === 'chunk') {
               res.write(`data: ${JSON.stringify({ chunk: event.text })}\n\n`);
            } else if (event.type === 'done') {
               res.write(
                  `data: ${JSON.stringify({ done: true, responseId: event.responseId })}\n\n`
               );
            }
         }

         res.end();
      } catch (error) {
         res.write(
            `data: ${JSON.stringify({ error: 'Failed to generate a response.' })}\n\n`
         );
         res.end();
      }
   },
};
