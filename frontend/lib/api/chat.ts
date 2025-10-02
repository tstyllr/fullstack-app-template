import apiClient from './client';
import type { SendMessageRequest, SendMessageResponse } from '../../types/chat';

/**
 * Send a message to the chat API
 * POST /api/chat/send-message
 */
export const sendMessage = async (
   data: SendMessageRequest
): Promise<SendMessageResponse> => {
   const response = await apiClient.post<SendMessageResponse>(
      '/chat/send-message',
      data
   );
   return response.data;
};
