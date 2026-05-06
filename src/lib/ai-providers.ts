import { OpenAI } from 'openai';

// Supported AI Providers
export type AIProvider = 'openai' | 'groq' | 'anthropic' | 'mistral' | 'together' | 'openrouter' | 'perplexity' | 'fireworks';

export interface AIProviderConfig {
  id: AIProvider;
  name: string;
  description: string;
  baseUrl?: string;
  defaultModel: string;
  models: string[];
  placeholder: string;
}

export const AI_PROVIDERS: Record<AIProvider, AIProviderConfig> = {
  openai: {
    id: 'openai',
    name: 'OpenAI',
    description: 'GPT-5.5, GPT-5.4, GPT-4o and more',
    defaultModel: 'gpt-5.4',
    models: ['gpt-5.5', 'gpt-5.5-pro', 'gpt-5.4', 'gpt-5.4-mini', 'gpt-5.4-nano', 'gpt-4o', 'gpt-4o-mini'],
    placeholder: 'sk-...',
  },
  groq: {
    id: 'groq',
    name: 'Groq',
    description: 'Ultra-fast inference with LLaMA 3.3, Mixtral',
    baseUrl: 'https://api.groq.com/openai/v1',
    defaultModel: 'llama-3.3-70b-versatile',
    models: ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768', 'gemma2-9b-it', 'openai/gpt-oss-120b', 'openai/gpt-oss-20b'],
    placeholder: 'gsk_...',
  },
  anthropic: {
    id: 'anthropic',
    name: 'Anthropic',
    description: 'Claude Opus 4.7, Sonnet 4.6, Haiku 4.5',
    baseUrl: 'https://api.anthropic.com/v1',
    defaultModel: 'claude-sonnet-4-6',
    models: ['claude-opus-4-7', 'claude-sonnet-4-6', 'claude-haiku-4-5-20251001', 'claude-opus-4-6', 'claude-sonnet-4-5-20250929'],
    placeholder: 'sk-ant-...',
  },
  mistral: {
    id: 'mistral',
    name: 'Mistral AI',
    description: 'Mistral Large, Mistral Medium, Codestral',
    baseUrl: 'https://api.mistral.ai/v1',
    defaultModel: 'mistral-large-latest',
    models: ['mistral-large-latest', 'mistral-medium-latest', 'mistral-small-latest', 'codestral-latest', 'open-mixtral-8x7b'],
    placeholder: 'your-mistral-api-key',
  },
  together: {
    id: 'together',
    name: 'Together AI',
    description: 'Open source models at scale',
    baseUrl: 'https://api.together.xyz/v1',
    defaultModel: 'meta-llama/Llama-3.3-70B-Instruct-Turbo',
    models: ['meta-llama/Llama-3.3-70B-Instruct-Turbo', 'meta-llama/Llama-3.1-8B-Instruct-Turbo', 'mistralai/Mixtral-8x7B-Instruct-v0.1', 'Qwen/Qwen2-72B-Instruct'],
    placeholder: 'your-together-api-key',
  },
  openrouter: {
    id: 'openrouter',
    name: 'OpenRouter',
    description: 'Access multiple AI providers through one API',
    baseUrl: 'https://openrouter.ai/api/v1',
    defaultModel: 'openai/gpt-5.4',
    models: ['openai/gpt-5.5', 'openai/gpt-5.4', 'anthropic/claude-opus-4-7', 'anthropic/claude-sonnet-4-6', 'meta-llama/llama-3.3-70b-instruct'],
    placeholder: 'sk-or-...',
  },
  perplexity: {
    id: 'perplexity',
    name: 'Perplexity',
    description: 'AI with real-time internet access',
    baseUrl: 'https://api.perplexity.ai',
    defaultModel: 'llama-3.1-sonar-large-128k-online',
    models: ['llama-3.1-sonar-large-128k-online', 'llama-3.1-sonar-small-128k-online', 'llama-3.1-sonar-huge-128k-online'],
    placeholder: 'pplx-...',
  },
  fireworks: {
    id: 'fireworks',
    name: 'Fireworks AI',
    description: 'Fast and affordable AI inference',
    baseUrl: 'https://api.fireworks.ai/inference/v1',
    defaultModel: 'accounts/fireworks/models/llama-v3p3-70b-instruct',
    models: ['accounts/fireworks/models/llama-v3p3-70b-instruct', 'accounts/fireworks/models/llama-v3p1-8b-instruct', 'accounts/fireworks/models/mixtral-8x7b-instruct'],
    placeholder: 'fw_...',
  },
};

export interface UserAIConfig {
  provider: AIProvider;
  apiKey: string;
  model?: string;
}

export interface AISettings {
  activeProvider: AIProvider;
  providers: Partial<Record<AIProvider, { apiKey: string; model?: string }>>;
}

const DEFAULT_AI_SETTINGS: AISettings = {
  activeProvider: 'openai',
  providers: {},
};

// Client-side functions for localStorage
export function getAISettings(): AISettings {
  if (typeof window === 'undefined') {
    return DEFAULT_AI_SETTINGS;
  }
  
  const stored = localStorage.getItem('rf_ai_settings');
  if (stored) {
    try {
      return { ...DEFAULT_AI_SETTINGS, ...JSON.parse(stored) };
    } catch {
      return DEFAULT_AI_SETTINGS;
    }
  }
  return DEFAULT_AI_SETTINGS;
}

export function saveAISettings(settings: AISettings): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('rf_ai_settings', JSON.stringify(settings));
}

export function getActiveProviderConfig(): { provider: AIProviderConfig; apiKey: string; model: string } | null {
  const settings = getAISettings();
  const providerSettings = settings.providers[settings.activeProvider];
  
  if (!providerSettings?.apiKey) {
    return null;
  }
  
  const providerConfig = AI_PROVIDERS[settings.activeProvider];
  return {
    provider: providerConfig,
    apiKey: providerSettings.apiKey,
    model: providerSettings.model || providerConfig.defaultModel,
  };
}

// Create OpenAI-compatible client for any provider
export function createAIClient(provider: AIProvider, apiKey: string): OpenAI {
  const config = AI_PROVIDERS[provider];
  
  const clientConfig: ConstructorParameters<typeof OpenAI>[0] = {
    apiKey,
    dangerouslyAllowBrowser: true, // For client-side usage
  };
  
  if (config.baseUrl) {
    clientConfig.baseURL = config.baseUrl;
  }
  
  return new OpenAI(clientConfig);
}

// Get client from current settings
export function getAIClientFromSettings(): { client: OpenAI; model: string } | null {
  const config = getActiveProviderConfig();
  if (!config) return null;
  
  return {
    client: createAIClient(config.provider.id, config.apiKey),
    model: config.model,
  };
}
