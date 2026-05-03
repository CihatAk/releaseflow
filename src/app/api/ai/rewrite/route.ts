import { NextRequest, NextResponse } from 'next/server';
import { chat, type AIConfig } from '@/lib/ai';

interface RewriteBody {
  content: string;
  tone?: 'professional' | 'casual' | 'enthusiastic' | 'technical' | 'playful';
  audience?: 'developers' | 'end-users' | 'business' | 'mixed';
  length?: 'concise' | 'standard' | 'detailed';
  format?: 'markdown' | 'html' | 'plain' | 'email';
  aiConfig?: AIConfig;
}

const TONE_HINTS: Record<string, string> = {
  professional: 'Professional, polished, confident.',
  casual: 'Casual, friendly, conversational.',
  enthusiastic: 'Enthusiastic, energetic, celebratory. Use light emojis.',
  technical: 'Highly technical, precise, developer-focused.',
  playful: 'Playful, witty, fun. Occasional emoji is fine.',
};

const AUDIENCE_HINTS: Record<string, string> = {
  developers: 'Technical developers who read commits. Include API details, breaking changes clearly.',
  'end-users': 'Non-technical end users. Focus on benefits, avoid jargon.',
  business: 'Business stakeholders. Emphasize value, impact, outcomes.',
  mixed: 'Mixed audience. Lead with value, then technical details.',
};

const LENGTH_HINTS: Record<string, string> = {
  concise: 'Be very concise. 3-5 bullet points max, short sentences.',
  standard: 'Standard length. Group into sections with short explanations.',
  detailed: 'Detailed. Include context, migration notes, and examples where useful.',
};

const FORMAT_HINTS: Record<string, string> = {
  markdown: 'Output as Markdown with ## headings and bullet lists.',
  html: 'Output as clean semantic HTML (<h2>, <ul>, <li>, <p>).',
  plain: 'Output as plain text with simple headings (no symbols).',
  email: 'Output as an email body with a friendly greeting, summary, and sign-off.',
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as RewriteBody;
    if (!body.content) {
      return NextResponse.json({ error: 'content is required' }, { status: 400 });
    }

    const tone = body.tone || 'professional';
    const audience = body.audience || 'mixed';
    const length = body.length || 'standard';
    const format = body.format || 'markdown';

    const system = `You are an expert release-notes writer for software products.
Transform the input (raw commits or a rough changelog) into polished release notes.

Requirements:
- Tone: ${TONE_HINTS[tone]}
- Audience: ${AUDIENCE_HINTS[audience]}
- Length: ${LENGTH_HINTS[length]}
- Format: ${FORMAT_HINTS[format]}

Group changes logically (e.g., New Features, Improvements, Bug Fixes, Breaking Changes).
Skip noise (merge commits, chore commits, version bumps) unless user-facing.
Never invent features that are not in the input.
Return only the final release notes. No preamble, no meta-comments.`;

    const result = await chat(
      { system, user: body.content, temperature: 0.6 },
      body.aiConfig,
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error rewriting:', error);
    const message = error instanceof Error ? error.message : 'Failed to rewrite';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
