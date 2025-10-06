import OpenAI from 'openai';
import { chatMessageRepository } from '../repositories/chatMessage.repository.js';

type GenerateTextOptions = {
   model?: string;
   prompt: string;
   instructions?: string;
   temperature?: number;
   maxTokens?: number;
   previousResponseId?: string;
   userId: number;
};

type GenerateTextResult = {
   id: string;
   text: string;
};

const deepseekClient = new OpenAI({
   baseURL: 'https://api.deepseek.com',
   apiKey: process.env.DEEPSEEK_API_KEY,
});

export const llmClient = {
   async generateTextWithDeepseekClient({
      model = 'deepseek-chat',
      prompt,
      instructions,
      temperature = 0.2,
      maxTokens = 300,
      previousResponseId,
      userId,
   }: GenerateTextOptions): Promise<GenerateTextResult> {
      let conversationId: string;
      let messages: Array<
         | { role: 'system'; content: string }
         | { role: 'user'; content: string }
         | { role: 'assistant'; content: string }
      > = [];

      // 如果有 previousResponseId，获取历史对话
      if (previousResponseId) {
         const previousMessage =
            await chatMessageRepository.getMessageById(previousResponseId);

         if (previousMessage) {
            conversationId = previousMessage.conversationId;

            // 获取完整的对话历史
            const history =
               await chatMessageRepository.getConversationHistory(
                  conversationId
               );

            // 构建 messages 数组
            messages = history.map((msg) => ({
               role: msg.role as 'system' | 'user' | 'assistant',
               content: msg.content,
            }));
         } else {
            // previousResponseId 无效，创建新对话
            conversationId = crypto.randomUUID();
         }
      } else {
         // 新对话
         conversationId = crypto.randomUUID();
      }

      // 添加 system message（如果有且不在历史中）
      if (instructions && messages.length === 0) {
         messages.push({ role: 'system', content: instructions });
      }

      // 添加当前用户消息
      messages.push({
         role: 'user',
         content: prompt,
      });

      // 调用 DeepSeek API
      const completion = await deepseekClient.chat.completions.create({
         messages,
         model,
         temperature,
         max_completion_tokens: maxTokens,
      });

      const assistantResponse = completion.choices[0]?.message.content || '';

      // 保存用户消息
      await chatMessageRepository.createMessage({
         conversationId,
         role: 'user',
         content: prompt,
         userId,
      });

      // 保存 assistant 响应
      const savedAssistantMessage = await chatMessageRepository.createMessage({
         conversationId,
         role: 'assistant',
         content: assistantResponse,
         userId,
      });

      return {
         id: savedAssistantMessage.id,
         text: assistantResponse,
      };
   },

   // other interfaces
   //    async summarizeReviews(reviews: string) {},
};
