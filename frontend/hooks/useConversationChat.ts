import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { fetch as expoFetch } from 'expo/fetch';
import { useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

export interface Message {
   id: string;
   role: 'user' | 'assistant' | 'system';
   content: string;
   createdAt?: string;
}

export function useConversationChat(conversationId: string | null) {
   const queryClient = useQueryClient();

   // 使用 useMemo 动态创建 transport，当 conversationId 变化时会重新创建
   const transport = useMemo(() => {
      if (!conversationId) return undefined;

      return new DefaultChatTransport({
         fetch: expoFetch as unknown as typeof globalThis.fetch,
         api: `${API_URL}/api/chat/conversations/${conversationId}/messages`,
         credentials: 'include',
      });
   }, [conversationId]);

   const chat = useChat({
      id: conversationId ?? undefined, // 关键：通过 id 参数告诉 useChat 切换对话
      transport,
      onFinish: () => {
         // 消息发送完成后，刷新会话列表（更新最后消息和时间）
         queryClient.invalidateQueries({ queryKey: ['conversations'] });
         queryClient.invalidateQueries({
            queryKey: ['conversation', conversationId],
         });
      },
      onError: (error) => {
         console.error('Chat error:', error);
      },
   });

   return {
      ...chat,
      isReady: !!conversationId,
   };
}
