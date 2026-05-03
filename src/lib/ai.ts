import { OpenAI } from 'openai';

export interface AIProviderMeta {
  id: string;
  label: string;
  baseURL: string;
  defaultModel: string;
  apiKeyUrl?: string;
  models?: string[];
}

export const AI_PROVIDERS: Record<string, AIProviderMeta> = {
  openai: {
    id: 'openai',
    label: 'OpenAI',
    baseURL: 'https://api.openai.com/v1',
    defaultModel: 'gpt-4o-mini',
    apiKeyUrl: 'https://platform.openai.com/api-keys',
    models: ['gpt-4o-mini', 'gpt-4o', 'gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo'],
  },
  groq: {
    id: 'groq',
    label: 'Groq',
    baseURL: 'https://api.groq.com/openai/v1',
    defaultModel: 'llama-3.3-70b-versatile',
    apiKeyUrl: 'https://console.groq.com/keys',
    models: [
      'llama-3.3-70b-versatile',
      'llama-3.1-70b-versatile',
      'llama-3.1-8b-instant',
      'mixtral-8x7b-32768',
      'gemma2-9b-it',
    ],
  },
  deepseek: {
    id: 'deepseek',
    label: 'DeepSeek',
    baseURL: 'https://api.deepseek.com/v1',
    defaultModel: 'deepseek-chat',
    apiKeyUrl: 'https://platform.deepseek.com/api_keys',
    models: ['deepseek-chat', 'deepseek-reasoner'],
  },
  openrouter: {
    id: 'openrouter',
    label: 'OpenRouter',
    baseURL: 'https://openrouter.ai/api/v1',
    defaultModel: 'openai/gpt-4o-mini',
    apiKeyUrl: 'https://openrouter.ai/keys',
  },
  together: {
    id: 'together',
    label: 'Together AI',
    baseURL: 'https://api.together.xyz/v1',
    defaultModel: 'meta-llama/Llama-3.3-70B-Instruct-Turbo',
    apiKeyUrl: 'https://api.together.ai/settings/api-keys',
  },
  mistral: {
    id: 'mistral',
    label: 'Mistral',
    baseURL: 'https://api.mistral.ai/v1',
    defaultModel: 'mistral-small-latest',
    apiKeyUrl: 'https://console.mistral.ai/api-keys/',
    models: ['mistral-small-latest', 'mistral-large-latest', 'open-mistral-nemo'],
  },
  xai: {
    id: 'xai',
    label: 'xAI (Grok)',
    baseURL: 'https://api.x.ai/v1',
    defaultModel: 'grok-2-latest',
    apiKeyUrl: 'https://console.x.ai/',
    models: ['grok-2-latest', 'grok-beta'],
  },
  cerebras: {
    id: 'cerebras',
    label: 'Cerebras',
    baseURL: 'https://api.cerebras.ai/v1',
    defaultModel: 'llama-3.3-70b',
    apiKeyUrl: 'https://cloud.cerebras.ai/platform',
    models: ['llama-3.3-70b', 'llama3.1-8b'],
  },
  fireworks: {
    id: 'fireworks',
    label: 'Fireworks AI',
    baseURL: 'https://api.fireworks.ai/inference/v1',
    defaultModel: 'accounts/fireworks/models/llama-v3p3-70b-instruct',
    apiKeyUrl: 'https://fireworks.ai/account/api-keys',
  },
  custom: {
    id: 'custom',
    label: 'Custom (OpenAI-compatible)',
    baseURL: '',
    defaultModel: '',
  },
};

export interface AIConfig {
  provider?: string;
  apiKey?: string;
  baseURL?: string;
  model?: string;
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
