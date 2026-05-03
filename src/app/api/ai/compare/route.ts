import { NextRequest, NextResponse } from 'next/server';
import { chat, type AIConfig, type ChatResult } from '@/lib/ai';

interface CompareBody {
  prompt: string;
  system?: string;
  configs: AIConfig[]; // one entry per provider to run in parallel
  temperature?: number;
  maxTokens?: number;
}

interface CompareItem {
  provider: string;
  model: string;
  ok: boolean;
  result?: ChatResult;
  error?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CompareBody;
    if (!body.prompt || !Array.isArray(body.configs) || body.configs.length === 0) {
      return NextResponse.json(
        { error: 'prompt and configs[] are required' },
        { status: 400 },
      );
    }

    const items: CompareItem[] = await Promise.all(
      body.configs.map(async (cfg) => {
        try {
          const result = await chat(
            {
              system: body.system,
              user: body.prompt,
              temperature: body.temperature,
              maxTokens: body.maxTokens,
            },
            cfg,
          );
          return {
            provider: cfg.provider || 'openai',
            model: result.model,
            ok: true,
            result,
          };
        } catch (err) {
          return {
            provider: cfg.provider || 'openai',
            model: cfg.model || '',
            ok: false,
            error: err instanceof Error ? err.message : 'Request failed',
          };
        }
      }),
    );

    return NextResponse.json({ items });
  } catch (error) {
    console.error('Error comparing:', error);
    const message = error instanceof Error ? error.message : 'Failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
