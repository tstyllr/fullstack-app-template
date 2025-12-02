import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { logger } from '@/utils/logger.js';

if (!process.env.OPENROUTER_API_KEY) {
   logger.warn(
      'OPENROUTER_API_KEY not found. Chat functionality will be unavailable.'
   );
}

// Create OpenRouter instance with API key
export const openrouter = createOpenRouter({
   apiKey: process.env.OPENROUTER_API_KEY || '',
});

// Helper function to create a model with usage tracking enabled
export function createModelWithUsage(modelId: string) {
   return openrouter(modelId, {
      usage: {
         include: true,
      },
   });
}

// Supported models list
export const SUPPORTED_MODELS = [
   'openai/gpt-4o',
   'openai/gpt-4o-mini',
   'anthropic/claude-3.5-sonnet',
   'anthropic/claude-3.5-haiku',
   'deepseek/deepseek-chat',
] as const;

export type SupportedModel = (typeof SUPPORTED_MODELS)[number];

// Validate if a model is supported
export function isSupportedModel(model: string): model is SupportedModel {
   return SUPPORTED_MODELS.includes(model as SupportedModel);
}

// Get model for title generation (using cheaper model)
export function getTitleGenerationModel() {
   return createModelWithUsage('openai/gpt-4o-mini');
}
