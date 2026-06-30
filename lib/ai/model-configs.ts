import type { AIModel, AIModelConfig } from '@/types/ai'

/**
 * Configuration for available AI models
 * All are active free/low-cost models verified on OpenRouter
 */
export const AI_MODEL_CONFIGS: Record<string, AIModelConfig> = {
  'meta-llama/llama-3.3-70b-instruct:free': {
    value: 'meta-llama/llama-3.3-70b-instruct:free',
    label: 'Llama 3.3 70B',
    provider: 'Meta',
    description: 'High intelligence - Free',
    icon: '🚀',
    recommended: true
  },
  'qwen/qwen3-coder:free': {
    value: 'qwen/qwen3-coder:free',
    label: 'Qwen3 Coder',
    provider: 'Qwen',
    description: 'Extremely fast code & text - Free',
    icon: '⚡',
    recommended: true
  },
  'nvidia/nemotron-nano-9b-v2:free': {
    value: 'nvidia/nemotron-nano-9b-v2:free',
    label: 'Nemotron Nano',
    provider: 'NVIDIA',
    description: 'Fast response - Free',
    icon: '🟢',
    recommended: true
  },
  'openai/gpt-oss-20b:free': {
    value: 'openai/gpt-oss-20b:free',
    label: 'GPT OSS 20B',
    provider: 'OpenAI (Community)',
    description: 'Reliable and creative - Free',
    icon: '🔷'
  },
  'google/gemini-2.5-flash': {
    value: 'google/gemini-2.5-flash',
    label: 'Gemini 2.5 Flash',
    provider: 'Google',
    description: 'Highly intelligent and cheap',
    icon: '💎'
  },
  'deepseek/deepseek-chat': {
    value: 'deepseek/deepseek-chat',
    label: 'DeepSeek Chat',
    provider: 'DeepSeek',
    description: 'Reliable paid chat option',
    icon: '💬'
  }
}

/**
 * List of all available models
 */
export const AI_MODEL_OPTIONS = Object.values(AI_MODEL_CONFIGS)

/**
 * Default AI model to use (fastest and most reliable)
 */
export const DEFAULT_AI_MODEL: AIModel = 'meta-llama/llama-3.3-70b-instruct:free'

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
