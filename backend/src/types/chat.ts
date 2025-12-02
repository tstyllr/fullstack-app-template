// Chat-related type definitions

export enum MessageRole {
   USER = 'user',
   ASSISTANT = 'assistant',
   SYSTEM = 'system',
}

export enum AIModel {
   GPT_4O = 'openai/gpt-4o',
   GPT_4O_MINI = 'openai/gpt-4o-mini',
   CLAUDE_35_SONNET = 'anthropic/claude-3.5-sonnet',
   CLAUDE_35_HAIKU = 'anthropic/claude-3.5-haiku',
   DEEPSEEK_CHAT = 'deepseek/deepseek-chat',
}

export interface ChatMessage {
   role: MessageRole;
   content: string;
}

export interface ConversationSummary {
   id: string;
   userId: string;
   title: string | null;
   model: string;
   createdAt: Date;
   updatedAt: Date;
   messageCount?: number;
   lastMessage?: string;
}

export interface ConversationWithMessages {
   id: string;
   userId: string;
   title: string | null;
   model: string;
   createdAt: Date;
   updatedAt: Date;
   messages: {
      id: string;
      role: string;
      content: string;
      tokenCount: number | null;
      createdAt: Date;
   }[];
}

export interface UsageStats {
   promptTokens: number;
   completionTokens: number;
   totalTokens: number;
   cost?: number;
}

export interface UserUsageStats {
   totalConversations: number;
   totalMessages: number;
   totalTokens: number;
   totalCost: number;
   usageByModel: {
      model: string;
      count: number;
      tokens: number;
      cost: number;
   }[];
}

export interface SearchResult {
   conversationId: string;
   conversationTitle: string | null;
   messageId: string;
   messageRole: string;
   messageContent: string;
   messageCreatedAt: Date;
}
