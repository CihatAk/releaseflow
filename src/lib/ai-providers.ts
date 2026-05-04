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
    description: 'GPT-4, GPT-3.5 Turbo and more',
    defaultModel: 'gpt-4',
    models: ['gpt-4', 'gpt-4-turbo', 'gpt-4o', 'gpt-4o-mini', 'gpt-3.5-turbo'],
    placeholder: 'sk-...',
  },
  groq: {
    id: 'groq',
    name: 'Groq',
    description: 'Ultra-fast inference with LLaMA, Mixtral',
    baseUrl: 'https://api.groq.com/openai/v1',
    defaultModel: 'llama-3.1-70b-versatile',
    models: ['llama-3.1-70b-versatile', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768', 'gemma2-9b-it'],
    placeholder: 'gsk_...',
  },
  anthropic: {
    id: 'anthropic',
    name: 'Anthropic',
    description: 'Claude 3.5 Sonnet, Claude 3 Opus',
    baseUrl: 'https://api.anthropic.com/v1',
    defaultModel: 'claude-3-5-sonnet-20241022',
    models: ['claude-3-5-sonnet-20241022', 'claude-3-opus-20240229', 'claude-3-haiku-20240307'],
    placeholder: 'sk-ant-...',
  },
  mistral: {
    id: 'mistral',
    name: 'Mistral AI',
    description: 'Mistral Large, Mistral Medium',
    baseUrl: 'https://api.mistral.ai/v1',
    defaultModel: 'mistral-large-latest',
    models: ['mistral-large-latest', 'mistral-medium-latest', 'mistral-small-latest', 'open-mixtral-8x22b'],
    placeholder: 'your-mistral-api-key',
  },
  together: {
    id: 'together',
    name: 'Together AI',
    description: 'Open source models at scale',
    baseUrl: 'https://api.together.xyz/v1',
    defaultModel: 'meta-llama/Llama-3-70b-chat-hf',
    models: ['meta-llama/Llama-3-70b-chat-hf', 'mistralai/Mixtral-8x7B-Instruct-v0.1', 'Qwen/Qwen2-72B-Instruct'],
    placeholder: 'your-together-api-key',
  },
  openrouter: {
    id: 'openrouter',
    name: 'OpenRouter',
    description: 'Access multiple AI providers through one API',
    baseUrl: 'https://openrouter.ai/api/v1',
    defaultModel: 'openai/gpt-4',
    models: ['openai/gpt-4', 'anthropic/claude-3.5-sonnet', 'meta-llama/llama-3.1-70b-instruct'],
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
    defaultModel: 'accounts/fireworks/models/llama-v3p1-70b-instruct',
    models: ['accounts/fireworks/models/llama-v3p1-70b-instruct', 'accounts/fireworks/models/mixtral-8x7b-instruct'],
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
