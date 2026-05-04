import { NextRequest, NextResponse } from 'next/server';
import { chat, type AIConfig } from '@/lib/ai';

interface TranslateBody {
  content: string;
  languages: string[]; // ISO codes or full names: 'tr', 'de', 'Spanish', ...
  preserveFormatting?: boolean;
  aiConfig?: AIConfig;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as TranslateBody;
    if (!body.content || !Array.isArray(body.languages) || body.languages.length === 0) {
      return NextResponse.json(
        { error: 'content and languages[] are required' },
        { status: 400 },
      );
    }

    const preserve = body.preserveFormatting !== false;

    const results = await Promise.all(
      body.languages.map(async (lang) => {
        const system = `You are a professional localization expert. Translate the user's release notes to ${lang}.
${preserve ? 'Preserve all Markdown formatting (headings, bullets, code blocks, links).' : ''}
Keep technical terms, product names, code identifiers, version numbers, and URLs unchanged.
Use natural, idiomatic phrasing for a software release announcement.
Return only the translation. No explanations.`;

        try {
          const r = await chat(
            { system, user: body.content, temperature: 0.3 },
            body.aiConfig,
          );
          return { language: lang, content: r.content, latencyMs: r.latencyMs, ok: true as const };
        } catch (err) {
          return {
            language: lang,
            content: '',
            latencyMs: 0,
            ok: false as const,
            error: err instanceof Error ? err.message : 'Translation failed',
          };
        }
      }),
    );

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Error translating:', error);
    const message = error instanceof Error ? error.message : 'Failed to translate';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
