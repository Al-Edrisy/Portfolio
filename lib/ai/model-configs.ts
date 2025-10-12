import type { AIModel, AIModelConfig } from '@/types/ai'

/**
 * Configuration for available AI models
 * All are FAST models tested and verified (Jan 2025)
 * NO thinking/reasoning models (they're too slow)
 */
export const AI_MODEL_CONFIGS: Record<AIModel, AIModelConfig> = {
  'meta-llama/llama-3.3-8b-instruct:free': {
    value: 'meta-llama/llama-3.3-8b-instruct:free',
    label: 'Llama 3.3 8B',
    provider: 'Meta',
    description: 'Fastest - 1.4s response time',
    icon: '🚀',
    recommended: true
  },
  'mistralai/mistral-7b-instruct:free': {
    value: 'mistralai/mistral-7b-instruct:free',
    label: 'Mistral 7B',
    provider: 'Mistral AI',
    description: 'Very fast and creative - 1.4s',
    icon: '⚡',
    recommended: true
  },
  'google/gemini-2.0-flash-exp:free': {
    value: 'google/gemini-2.0-flash-exp:free',
    label: 'Gemini 2.0 Flash',
    provider: 'Google',
    description: 'Fast multimodal - 1.5s',
    icon: '💎',
    recommended: true
  },
  'google/gemma-3-12b-it:free': {
    value: 'google/gemma-3-12b-it:free',
    label: 'Gemma 3 12B',
    provider: 'Google',
    description: 'Balanced speed and quality - 2s',
    icon: '🔷'
  },
  'nvidia/nemotron-nano-9b-v2:free': {
    value: 'nvidia/nemotron-nano-9b-v2:free',
    label: 'Nemotron Nano',
    provider: 'NVIDIA',
    description: 'Efficient and accurate - 2.4s',
    icon: '🟢'
  },
  'mistralai/mistral-small-24b-instruct-2501:free': {
    value: 'mistralai/mistral-small-24b-instruct-2501:free',
    label: 'Mistral Small 3',
    provider: 'Mistral AI',
    description: 'High quality, bit slower - 4s',
    icon: '🌟'
  },
  'deepseek/deepseek-chat': {
    value: 'deepseek/deepseek-chat',
    label: 'DeepSeek Chat',
    provider: 'DeepSeek',
    description: 'Reliable backup option',
    icon: '💬'
  },
  'qwen/qwen3-14b:free': {
    value: 'qwen/qwen3-14b:free',
    label: 'Qwen3 14B',
    provider: 'Qwen',
    description: 'Alternative option',
    icon: '🔸'
  }
}

/**
 * List of all available models
 */
export const AI_MODEL_OPTIONS = Object.values(AI_MODEL_CONFIGS)

/**
 * Default AI model to use (fastest and most reliable)
 */
export const DEFAULT_AI_MODEL: AIModel = 'meta-llama/llama-3.3-8b-instruct:free'

/**
 * Get recommended models (top 3 most reliable)
 */
export const RECOMMENDED_MODELS = AI_MODEL_OPTIONS.filter(model => model.recommended)

/**
 * Helper to get model config by value
 */
export function getModelConfig(model: AIModel): AIModelConfig {
  return AI_MODEL_CONFIGS[model] || AI_MODEL_CONFIGS[DEFAULT_AI_MODEL]
}

