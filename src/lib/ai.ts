import { OpenAI } from 'openai';
import { 
  AIProvider, 
  AI_PROVIDERS as PROVIDERS_FROM_AI_PROVIDERS,
  createAIClient,
  type AISettings 
} from './ai-providers';

// Re-export AI_PROVIDERS from ai-providers with additional metadata for AI Studio
export { AI_PROVIDERS as AI_PROVIDERS_META } from './ai-providers';

// AI Studio expects AI_PROVIDERS with `label` property, but ai-providers.ts uses `name`
// Create a compatibility mapping for AI Studio usage
export const AI_PROVIDERS: Record<string, { id: string; label: string; baseURL: string; defaultModel: string; apiKeyUrl?: string; models?: string[]; name?: string; description?: string; placeholder?: string }> = {
  openai: {
    ...PROVIDERS_FROM_AI_PROVIDERS.openai,
    label: PROVIDERS_FROM_AI_PROVIDERS.openai.name,
    baseURL: 'https://api.openai.com/v1',
    apiKeyUrl: 'https://platform.openai.com/api-keys',
  },
  groq: {
    ...PROVIDERS_FROM_AI_PROVIDERS.groq,
    label: PROVIDERS_FROM_AI_PROVIDERS.groq.name,
    baseURL: PROVIDERS_FROM_AI_PROVIDERS.groq.baseUrl || 'https://api.groq.com/openai/v1',
    apiKeyUrl: 'https://console.groq.com/keys',
  },
  anthropic: {
    ...PROVIDERS_FROM_AI_PROVIDERS.anthropic,
    label: PROVIDERS_FROM_AI_PROVIDERS.anthropic.name,
    baseURL: PROVIDERS_FROM_AI_PROVIDERS.anthropic.baseUrl || 'https://api.anthropic.com/v1',
    apiKeyUrl: 'https://console.anthropic.com/settings/keys',
  },
  mistral: {
    ...PROVIDERS_FROM_AI_PROVIDERS.mistral,
    label: PROVIDERS_FROM_AI_PROVIDERS.mistral.name,
    baseURL: PROVIDERS_FROM_AI_PROVIDERS.mistral.baseUrl || 'https://api.mistral.ai/v1',
    apiKeyUrl: 'https://console.mistral.ai/api-keys/',
  },
  together: {
    ...PROVIDERS_FROM_AI_PROVIDERS.together,
    label: PROVIDERS_FROM_AI_PROVIDERS.together.name,
    baseURL: PROVIDERS_FROM_AI_PROVIDERS.together.baseUrl || 'https://api.together.xyz/v1',
    apiKeyUrl: 'https://api.together.ai/settings/api-keys',
  },
  openrouter: {
    ...PROVIDERS_FROM_AI_PROVIDERS.openrouter,
    label: PROVIDERS_FROM_AI_PROVIDERS.openrouter.name,
    baseURL: PROVIDERS_FROM_AI_PROVIDERS.openrouter.baseUrl || 'https://openrouter.ai/api/v1',
    apiKeyUrl: 'https://openrouter.ai/keys',
  },
  perplexity: {
    ...PROVIDERS_FROM_AI_PROVIDERS.perplexity,
    label: PROVIDERS_FROM_AI_PROVIDERS.perplexity.name,
    baseURL: PROVIDERS_FROM_AI_PROVIDERS.perplexity.baseUrl || 'https://api.perplexity.ai',
    apiKeyUrl: 'https://www.perplexity.ai/settings/api',
  },
  fireworks: {
    ...PROVIDERS_FROM_AI_PROVIDERS.fireworks,
    label: PROVIDERS_FROM_AI_PROVIDERS.fireworks.name,
    baseURL: PROVIDERS_FROM_AI_PROVIDERS.fireworks.baseUrl || 'https://api.fireworks.ai/inference/v1',
    apiKeyUrl: 'https://fireworks.ai/account/api-keys',
  },
};

export type { AIProvider, AISettings } from './ai-providers';
export { createAIClient } from './ai-providers';

export interface AIProviderMeta {
  id: string;
  label: string;
  baseURL: string;
  defaultModel: string;
  apiKeyUrl?: string;
  models?: string[];
}

export interface AIConfig {
  provider?: string;
  apiKey?: string;
  baseURL?: string;
  model?: string;
}

interface AIClientConfig {
  client: OpenAI;
  model: string;
}

// Server-side: use env variables as fallback
// Client-side: use user's API keys from request
function getAIClient(userSettings?: AISettings): AIClientConfig | null {
  // If user settings provided (from client request), use those
  if (userSettings) {
    const providerSettings = userSettings.providers[userSettings.activeProvider];
    if (providerSettings?.apiKey) {
      const providerConfig = AI_PROVIDERS[userSettings.activeProvider];
      return {
        client: createAIClient(userSettings.activeProvider, providerSettings.apiKey),
        model: providerSettings.model || providerConfig.defaultModel,
      };
    }
  }
  
  // Fallback to environment variables (server-side default)
  if (process.env.OPENAI_API_KEY) {
    return {
      client: new OpenAI({ apiKey: process.env.OPENAI_API_KEY }),
      model: 'gpt-4',
    };
  }
  
  // Check other provider env variables
  const envProviders: { env: string; provider: AIProvider }[] = [
    { env: 'GROQ_API_KEY', provider: 'groq' },
    { env: 'ANTHROPIC_API_KEY', provider: 'anthropic' },
    { env: 'MISTRAL_API_KEY', provider: 'mistral' },
    { env: 'TOGETHER_API_KEY', provider: 'together' },
    { env: 'OPENROUTER_API_KEY', provider: 'openrouter' },
    { env: 'PERPLEXITY_API_KEY', provider: 'perplexity' },
    { env: 'FIREWORKS_API_KEY', provider: 'fireworks' },
  ];
  
  for (const { env, provider } of envProviders) {
    const apiKey = process.env[env];
    if (apiKey) {
      const config = AI_PROVIDERS[provider];
      return {
        client: createAIClient(provider, apiKey),
        model: config.defaultModel,
      };
    }
  }
  
  return null;
}

function resolveConfig(cfg?: AIConfig) {
  const providerId = cfg?.provider || 'openai';
  const meta = AI_PROVIDERS[providerId];
  const baseURL = cfg?.baseURL || meta?.baseURL || 'https://api.openai.com/v1';
  const apiKey = cfg?.apiKey || process.env.OPENAI_API_KEY || '';
  const model = cfg?.model || meta?.defaultModel || 'gpt-4o-mini';
  if (!apiKey || !baseURL) return null;
  return { apiKey, baseURL, model };
}

function getClient(cfg?: AIConfig) {
  const resolved = resolveConfig(cfg);
  if (!resolved) return null;
  return {
    client: new OpenAI({ apiKey: resolved.apiKey, baseURL: resolved.baseURL }),
    model: resolved.model,
  };
}

export interface ChatOptions {
  system?: string;
  user: string;
  temperature?: number;
  maxTokens?: number;
  json?: boolean;
}

export interface ChatResult {
  content: string;
  model: string;
  provider: string;
  latencyMs: number;
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
}

/**
 * Generic chat completion usable by any feature. Returns structured result
 * with latency + token info for comparison/analytics UI.
 */
export async function chat(opts: ChatOptions, aiConfig?: AIConfig): Promise<ChatResult> {
  const c = getClient(aiConfig);
  if (!c) throw new Error('AI API key not configured');

  const messages = [] as { role: 'system' | 'user'; content: string }[];
  if (opts.system) messages.push({ role: 'system', content: opts.system });
  messages.push({ role: 'user', content: opts.user });

  const started = Date.now();
  const response = await c.client.chat.completions.create({
    model: c.model,
    messages,
    temperature: opts.temperature ?? 0.5,
    max_tokens: opts.maxTokens,
    ...(opts.json ? { response_format: { type: 'json_object' as const } } : {}),
  });
  const latencyMs = Date.now() - started;

  return {
    content: response.choices[0]?.message?.content || '',
    model: c.model,
    provider: aiConfig?.provider || 'openai',
    latencyMs,
    promptTokens: response.usage?.prompt_tokens,
    completionTokens: response.usage?.completion_tokens,
    totalTokens: response.usage?.total_tokens,
  };
}

export interface CommitAnalysis {
  summary: string;
  type: 'feat' | 'fix' | 'docs' | 'style' | 'refactor' | 'test' | 'chore' | 'perf';
  breaking: boolean;
  scope?: string;
}

export interface VersionSuggestion {
  version: string;
  reason: string;
  changes: {
    major: number;
    minor: number;
    patch: number;
  };
}

export async function analyzeCommit(message: string, aiConfig?: AIConfig): Promise<CommitAnalysis> {
  try {
    const c = getClient(aiConfig);
    if (!c) {
      throw new Error('AI API key not configured');
    }

    const response = await c.client.chat.completions.create({
      model: c.model,
      messages: [
        {
          role: "system",
          content: `You are a commit message analyzer. Analyze the following commit message and return a JSON object with:
          - summary: A brief, human-readable summary of what changed
          - type: The conventional commit type (feat, fix, docs, style, refactor, test, chore, perf)
          - breaking: Boolean indicating if this is a breaking change
          - scope: The scope of the change if present (optional)
          
          Respond only with valid JSON, no explanations.`
        },
        {
          role: "user",
          content: message
        }
      ],
      temperature: 0.1,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from AI');
    }

    return JSON.parse(content);
  } catch (error) {
    console.error('Error analyzing commit:', error);
    // Fallback to basic parsing
    return {
      summary: message.split('\n')[0],
      type: 'chore',
      breaking: message.includes('BREAKING CHANGE'),
    };
  }
}

export async function suggestVersion(commits: CommitAnalysis[], aiConfig?: AIConfig): Promise<VersionSuggestion> {
  try {
    const c = getClient(aiConfig);
    if (!c) {
      throw new Error('AI API key not configured');
    }

    const commitMessages = commits.map(x => `${x.type}: ${x.summary}`).join('\n');

    const response = await c.client.chat.completions.create({
      model: c.model,
      messages: [
        {
          role: "system",
          content: `You are a semantic versioning expert. Analyze these commits and suggest the next version.
          Return JSON with:
          - version: The suggested version (e.g., "1.2.3")
          - reason: Brief explanation of why this version
          - changes: Object with major, minor, patch counts
          
          Rules:
          - Major (X.0.0): Breaking changes
          - Minor (X.Y.0): New features
          - Patch (X.Y.Z): Bug fixes
          
          Respond only with valid JSON.`
        },
        {
          role: "user",
          content: commitMessages
        }
      ],
      temperature: 0.1,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from AI');
    }

    return JSON.parse(content);
  } catch (error) {
    console.error('Error suggesting version:', error);
    // Fallback logic
    const breaking = commits.filter(c => c.breaking).length;
    const features = commits.filter(c => c.type === 'feat').length;
    const fixes = commits.filter(c => c.type === 'fix').length;
    
    let version = '0.0.0';
    if (breaking > 0) {
      version = '1.0.0';
    } else if (features > 0) {
      version = '0.1.0';
    } else if (fixes > 0) {
      version = '0.0.1';
    }

    return {
      version,
      reason: `Based on ${breaking} breaking, ${features} features, ${fixes} fixes`,
      changes: { major: breaking, minor: features, patch: fixes }
    };
  }
}

export async function improveCommitMessage(message: string, aiConfig?: AIConfig): Promise<string> {
  try {
    const c = getClient(aiConfig);
    if (!c) {
      throw new Error('AI API key not configured');
    }

    const response = await c.client.chat.completions.create({
      model: c.model,
      messages: [
        {
          role: "system",
          content: `You are a commit message expert. Improve the following commit message to follow conventional commits format.
          Rules:
          - Use type(scope): description format
          - Keep description under 50 characters
          - Use imperative mood
          - Include breaking changes if present
          - Add body if needed
          
          Return only the improved commit message, no explanations.`
        },
        {
          role: "user",
          content: message
        }
      ],
      temperature: 0.3,
    });

    return response.choices[0]?.message?.content || message;
  } catch (error) {
    console.error('Error improving commit message:', error);
    return message;
  }
}
