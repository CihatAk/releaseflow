import type { AIConfig } from "@/lib/ai";

export interface AIProviderConfig {
  apiKey: string;
  model?: string;
  baseURL?: string;
}

export interface StoredAISettings {
  aiActiveProvider: string;
  aiProviders: Record<string, AIProviderConfig>;
}

function readStored(): Partial<StoredAISettings> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("rf_settings");
    if (!raw) return null;
    return JSON.parse(raw) as Partial<StoredAISettings>;
  } catch {
    return null;
  }
}

/**
 * Read the active AI config from the browser's localStorage.
 * Returns undefined when running server-side or when nothing is configured.
 */
export function getActiveAIConfig(): AIConfig | undefined {
  const parsed = readStored();
  if (!parsed) return undefined;
  const provider = parsed.aiActiveProvider || "openai";
  const cfg = parsed.aiProviders?.[provider];
  if (!cfg?.apiKey) return undefined;
  return {
    provider,
    apiKey: cfg.apiKey,
    model: cfg.model || undefined,
    baseURL: cfg.baseURL || undefined,
  };
}

/**
 * Read all providers that have an API key configured. Useful for the Playground
 * to run the same prompt against every configured provider.
 */
export function getAllConfiguredAIConfigs(): AIConfig[] {
  const parsed = readStored();
  if (!parsed?.aiProviders) return [];
  return Object.entries(parsed.aiProviders)
    .filter(([, cfg]) => cfg?.apiKey)
    .map(([provider, cfg]) => ({
      provider,
      apiKey: cfg.apiKey,
      model: cfg.model || undefined,
      baseURL: cfg.baseURL || undefined,
    }));
}
