import { llmClient, type StreamEvent } from '../llm/client';

// Public interface
export const chatService = {
   async *generateTextWithDeepseekClient(
      prompt: string,
      userId: number,
      previousResponseId?: string
   ): AsyncGenerator<StreamEvent> {
      const stream = llmClient.generateTextWithDeepseekClient({
         model: 'deepseek-chat',
         instructions: '',
         prompt,
         temperature: 0.2,
         maxTokens: 200,
         previousResponseId,
         userId,
      });

      for await (const event of stream) {
         yield event;
      }
   },
};
