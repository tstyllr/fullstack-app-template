import { llmClient } from '../llm/client';

type ChatResponse = {
   id: string;
   message: string;
};

// Public interface
export const chatService = {
   async generateTextWithDeepseekClient(
      prompt: string,
      userId: number,
      previousResponseId?: string
   ): Promise<ChatResponse> {
      const response = await llmClient.generateTextWithDeepseekClient({
         model: 'deepseek-chat',
         instructions: '',
         prompt,
         temperature: 0.2,
         maxTokens: 200,
         previousResponseId,
         userId,
      });
      return {
         id: response.id,
         message: response.text,
      };
   },
};
