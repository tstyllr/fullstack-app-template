import { getAccessToken } from '@/lib/storage/token-storage';
import type { SendMessageRequest } from '../../types/chat';

type StreamChunk = {
   chunk: string;
};

type StreamDone = {
   done: true;
   responseId: string;
};

type StreamError = {
   error: string;
};

type StreamEvent = StreamChunk | StreamDone | StreamError;

/**
 * Send a message to the chat API with streaming support
 * POST /api/chat/send-message
 */
export async function* sendMessage(
   data: SendMessageRequest
): AsyncGenerator<StreamEvent> {
   const token = await getAccessToken();
   const baseURL =
      process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

   const response = await fetch(`${baseURL}/chat/send-message`, {
      method: 'POST',
      headers: {
         'Content-Type': 'application/json',
         ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(data),
   });

   if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
   }

   if (!response.body) {
      throw new Error('Response body is null');
   }

   const reader = response.body.getReader();
   const decoder = new TextDecoder();
   let buffer = '';

   try {
      while (true) {
         const { done, value } = await reader.read();

         if (done) break;

         buffer += decoder.decode(value, { stream: true });
         const lines = buffer.split('\n');

         // Keep the last incomplete line in the buffer
         buffer = lines.pop() || '';

         for (const line of lines) {
            if (line.startsWith('data: ')) {
               const data = line.slice(6); // Remove 'data: ' prefix
               if (data.trim()) {
                  try {
                     const event = JSON.parse(data) as StreamEvent;
                     yield event;
                  } catch (e) {
                     console.error('Failed to parse SSE data:', data, e);
                  }
               }
            }
         }
      }
   } finally {
      reader.releaseLock();
   }
}
