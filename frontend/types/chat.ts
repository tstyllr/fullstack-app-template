// Send message
export interface SendMessageRequest {
   prompt: string;
   previousResponseId?: string;
}

export interface SendMessageResponse {
   message: string;
   responseId: string;
}
