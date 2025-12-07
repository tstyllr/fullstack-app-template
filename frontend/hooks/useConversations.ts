import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

export interface Conversation {
   id: string;
   userId: string;
   title: string | null;
   model: string;
   createdAt: string;
   updatedAt: string;
   messageCount?: number;
   lastMessage?: string;
}

export interface CreateConversationParams {
   model?: string;
   title?: string;
}

// 获取会话列表
export function useConversations(page = 1, limit = 20) {
   return useQuery({
      queryKey: ['conversations', page, limit],
      queryFn: async () => {
         const response = await fetch(
            `${API_URL}/api/chat/conversations?page=${page}&limit=${limit}`,
            {
               credentials: 'include',
            }
         );

         if (!response.ok) {
            throw new Error('Failed to fetch conversations');
         }

         return response.json() as Promise<{
            conversations: Conversation[];
            total: number;
            page: number;
            totalPages: number;
         }>;
      },
   });
}

// 创建新会话
export function useCreateConversation() {
   const queryClient = useQueryClient();

   return useMutation({
      mutationFn: async (params: CreateConversationParams = {}) => {
         const response = await fetch(`${API_URL}/api/chat/conversations`, {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
               model: params.model || 'deepseek/deepseek-chat',
               title: params.title,
            }),
         });

         if (!response.ok) {
            throw new Error('Failed to create conversation');
         }

         return response.json() as Promise<Conversation>;
      },
      onSuccess: () => {
         // 刷新会话列表
         queryClient.invalidateQueries({ queryKey: ['conversations'] });
      },
   });
}

// 删除会话
export function useDeleteConversation() {
   const queryClient = useQueryClient();

   return useMutation({
      mutationFn: async (conversationId: string) => {
         const response = await fetch(
            `${API_URL}/api/chat/conversations/${conversationId}`,
            {
               method: 'DELETE',
               credentials: 'include',
            }
         );

         if (!response.ok) {
            throw new Error('Failed to delete conversation');
         }

         return response.json();
      },
      onSuccess: () => {
         // 刷新会话列表
         queryClient.invalidateQueries({ queryKey: ['conversations'] });
      },
   });
}

// 获取单个会话详情（包含消息）
export function useConversation(conversationId: string | null) {
   return useQuery({
      queryKey: ['conversation', conversationId],
      queryFn: async () => {
         if (!conversationId) return null;

         const response = await fetch(
            `${API_URL}/api/chat/conversations/${conversationId}`,
            {
               credentials: 'include',
            }
         );

         if (!response.ok) {
            throw new Error('Failed to fetch conversation');
         }

         return response.json();
      },
      enabled: !!conversationId,
   });
}
