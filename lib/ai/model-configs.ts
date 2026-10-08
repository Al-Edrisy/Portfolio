import type { AIModel, AIModelConfig } from '@/types/ai'

/**
 * Configuration for available AI models
 * All are active free / low-cost verified models on OpenRouter
 */
export const AI_MODEL_CONFIGS: Record<string, AIModelConfig> = {
  'openrouter/free': {
    value: 'openrouter/free',
    label: 'OpenRouter Auto (Free)',
    provider: 'OpenRouter',
    description: 'Dynamic healthy free model router - Free',
    icon: '⚡',
    recommended: true
  },
  'openai/gpt-4o-mini': {
    value: 'openai/gpt-4o-mini',
    label: 'GPT-4o Mini',
    provider: 'OpenAI',
    description: 'High intelligence & fast response',
    icon: '🧠',
    recommended: true
  },
  'google/gemini-2.5-flash': {
    value: 'google/gemini-2.5-flash',
    label: 'Gemini 2.5 Flash',
    provider: 'Google',
    description: 'Highly intelligent and efficient',
    icon: '💎',
    recommended: true
  },
  'deepseek/deepseek-chat': {
    value: 'deepseek/deepseek-chat',
    label: 'DeepSeek Chat',
    provider: 'DeepSeek',
    description: 'Strong coding and analytical reasoning',
    icon: '💬'
  },
  'meta-llama/llama-3.3-70b-instruct': {
    value: 'meta-llama/llama-3.3-70b-instruct',
    label: 'Llama 3.3 70B',
    provider: 'Meta',
    description: 'High capacity open weights model',
    icon: '🚀'
  },
  'nvidia/nemotron-3.5-lightning:free': {
    value: 'nvidia/nemotron-3.5-lightning:free',
    label: 'Nemotron 3.5 Lightning',
    provider: 'NVIDIA',
    description: 'Fast response - Free',
    icon: '🟢'
  }
}

/**
 * List of all available models
 */
export const AI_MODEL_OPTIONS = Object.values(AI_MODEL_CONFIGS)

/**
 * Default AI model to use (fast, auto-routes to healthy free models on OpenRouter)
 */
export const DEFAULT_AI_MODEL: AIModel = 'openrouter/free'

/**
 * Get recommended models (top recommended)
 */
export const RECOMMENDED_MODELS = AI_MODEL_OPTIONS.filter(model => model.recommended)

/**
 * Helper to get model config by value
 */
export function getModelConfig(model: AIModel): AIModelConfig {
  return AI_MODEL_CONFIGS[model] || AI_MODEL_CONFIGS[DEFAULT_AI_MODEL]
}
