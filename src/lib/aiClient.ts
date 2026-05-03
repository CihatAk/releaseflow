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

/**
 * Read the active AI config from the browser's localStorage.
 * Returns undefined when running server-side or when nothing is configured.
 */
export function getActiveAIConfig(): AIConfig | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const raw = localStorage.getItem("rf_settings");
    if (!raw) return undefined;
    const parsed = JSON.parse(raw) as Partial<StoredAISettings>;
    const provider = parsed.aiActiveProvider || "openai";
    const cfg = parsed.aiProviders?.[provider];
    if (!cfg?.apiKey) return undefined;
    return {
      provider,
      apiKey: cfg.apiKey,
      model: cfg.model || undefined,
      baseURL: cfg.baseURL || undefined,
    };
  } catch {
    return undefined;
  }
}
