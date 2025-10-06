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

export type StreamChunk = {
   type: 'chunk';
   text: string;
};

export type StreamDone = {
   type: 'done';
   responseId: string;
};

export type StreamEvent = StreamChunk | StreamDone;

const deepseekClient = new OpenAI({
   baseURL: 'https://api.deepseek.com',
   apiKey: process.env.DEEPSEEK_API_KEY,
});

export const llmClient = {
   async *generateTextWithDeepseekClient({
      model = 'deepseek-chat',
      prompt,
      instructions,
      temperature = 0.2,
      maxTokens = 300,
      previousResponseId,
      userId,
   }: GenerateTextOptions): AsyncGenerator<StreamEvent> {
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

      // 调用 DeepSeek API with streaming
      const stream = await deepseekClient.chat.completions.create({
         messages,
         model,
         temperature,
         max_completion_tokens: maxTokens,
         stream: true,
      });

      let assistantResponse = '';

      // 流式读取并 yield 每个 chunk
      for await (const chunk of stream) {
         const content = chunk.choices[0]?.delta?.content || '';
         if (content) {
            assistantResponse += content;
            yield { type: 'chunk', text: content };
         }
      }

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

      // 发送完成信号
      yield { type: 'done', responseId: savedAssistantMessage.id };
   },

   // other interfaces
   //    async summarizeReviews(reviews: string) {},
};
