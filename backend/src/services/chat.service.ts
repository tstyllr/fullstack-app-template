import { llmClient } from '../llm/client';

type ChatResponse = {
   id: string;
   message: string;
};

// Public interface
export const chatService = {
   async sendMessage(
      prompt: string,
      previousResponseId?: string
   ): Promise<ChatResponse> {
      const response = await llmClient.generateText({
         model: 'deepseek-chat',
         instructions: '',
         prompt,
         temperature: 0.2,
         maxTokens: 200,
         previousResponseId,
      });
      return {
         id: response.id,
         message: response.text,
      };
   },
};
