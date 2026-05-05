import { NextRequest, NextResponse } from 'next/server';
import { chat, type AIConfig } from '@/lib/ai';

interface ReleaseNotesBody {
  sections: any[];
  repoName?: string;
  version?: string;
  tone?: 'professional' | 'casual' | 'enthusiastic' | 'technical';
  length?: 'concise' | 'standard' | 'detailed';
  aiConfig?: AIConfig;
}

const TONE_HINTS: Record<string, string> = {
  professional: 'Professional, polished, confidence. Use standard business language.',
  casual: 'Casual, friendly, conversational. Like talking to a teammate.',
  enthusiastic: 'Enthusiastic, energetic, celebratory. Show excitement about new features!',
  technical: 'Highly technical, precise. Include API details, migration notes.',
};

const LENGTH_HINTS: Record<string, string> = {
  concise: 'Be very concise. 3-5 bullet points max, short sentences.',
  standard: 'Standard length. Group into sections with brief explanations.',
  detailed: 'Detailed. Include context, migration notes, and examples where useful.',
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as ReleaseNotesBody;
    const { sections, repoName, version, tone = 'professional', length = 'standard', aiConfig } = body;

    if (!sections || sections.length === 0) {
      return NextResponse.json({ error: 'Sections are required' }, { status: 400 });
    }

    const stats = computeStats(sections);
    const changelogText = formatForAI(sections);

    const system = `You are an expert release notes writer for software products.
Generate compelling release notes based on the provided commits.

Requirements:
- Tone: ${TONE_HINTS[tone]}
- Length: ${LENGTH_HINTS[length]}
- Repository: ${repoName || 'this project'}
- Version: ${version || 'latest'}

Structure your response:
1. A brief intro (1 sentence)
2. Grouped changes by importance (Features first, then Fixes, then Others)
3. Highlight breaking changes clearly
4. Include contributor count if > 1
5. End with a thank you note

Return ONLY the release notes in Markdown format. No preamble, no meta-comments.`;

    const result = await chat(
      { system, user: changelogText, temperature: 0.7 },
      aiConfig,
    );

    return NextResponse.json({
      releaseNotes: result.content,
      model: result.model,
      provider: result.provider,
      latencyMs: result.latencyMs,
      stats,
    });
  } catch (error) {
    console.error('Release notes generation error:', error);
    const message = error instanceof Error ? error.message : 'Failed to generate release notes';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function computeStats(sections: any[]) {
  const allCommits = sections.flatMap((s: any) => s.commits || []);
  const types = new Set(allCommits.map((c: any) => c.type));
  return {
    totalCommits: allCommits.length,
    contributors: new Set(allCommits.map((c: any) => c.author)).size,
    breakingChanges: allCommits.filter((c: any) => c.breaking).length,
    typeCount: types.size,
  };
}

function formatForAI(sections: any[]): string {
  const lines: string[] = [];
  for (const section of sections) {
    if (!section.commits || section.commits.length === 0) continue;
    lines.push(`\n## ${section.label || section.type}`);
    for (const commit of section.commits) {
      const scope = commit.scope ? `[${commit.scope}] ` : '';
      const breaking = commit.breaking ? ' [BREAKING]' : '';
      lines.push(`- ${scope}${commit.message}${breaking}`);
    }
  }
  return lines.join('\n');
}
