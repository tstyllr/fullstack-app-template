import type { Request, Response } from 'express';
import { chatService } from '../services/chat.service';
import z from 'zod';

// Implementation detail
const chatSchema = z.object({
   prompt: z
      .string()
      .trim()
      .min(1, 'Prompt is required.')
      .max(1000, 'Prompt is too long (max 1000 characters'),
   previousResponseId: z.string().uuid().optional(),
});

// Public interface
export const chatController = {
   async sendMessage(req: Request, res: Response) {
      const parseResult = chatSchema.safeParse(req.body);
      if (!parseResult.success) {
         res.status(400).json(parseResult.error.format());
         return;
      }

      try {
         const { prompt, previousResponseId } = req.body;
         const response = await chatService.sendMessage(
            prompt,
            previousResponseId
         );

         res.json({ message: response.message, responseId: response.id });
      } catch (error) {
         res.status(500).json({ error: 'Failed to generate a response.' });
      }
   },
};
