import { NextRequest, NextResponse } from 'next/server';
import { chat, type AIConfig } from '@/lib/ai';

interface SummaryBody {
  sections: any[];
  style?: 'bullet' | 'paragraph' | 'executive' | 'social';
  maxLength?: number;
  aiConfig?: AIConfig;
}

const STYLE_HINTS: Record<string, string> = {
  bullet: 'Use bullet points. Concise, scannable. Focus on user-facing changes.',
  paragraph: 'Write 2-3 paragraphs. Flow naturally. Include context and impact.',
  executive: 'Executive summary. Business-focused. Emphasize value delivery, KPIs, and outcomes.',
  social: 'Social media style. Energetic, emoji-friendly. Keep under 280 chars for Twitter compatibility.',
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as SummaryBody;
    const { sections, style = 'bullet', maxLength = 500, aiConfig } = body;

    if (!sections || sections.length === 0) {
      return NextResponse.json({ error: 'Sections are required' }, { status: 400 });
    }

    const stats = computeQuickStats(sections);
    const input = formatForSummary(sections, stats);

    const system = `You are a technical writer specializing in release summaries.
${STYLE_HINTS[style]}
${maxLength ? `Keep under ${maxLength} characters.` : ''}

Return ONLY the summary. No preamble, no meta-comments.`;

    const result = await chat(
      { system, user: input, temperature: 0.5, maxTokens: maxLength || 300 },
      aiConfig,
    );

    return NextResponse.json({
      summary: result.content,
      style,
      stats,
      model: result.model,
      provider: result.provider,
      latencyMs: result.latencyMs,
    });
  } catch (error) {
    console.error('Summary generation error:', error);
    const message = error instanceof Error ? error.message : 'Failed to generate summary';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function computeQuickStats(sections: any[]) {
  const allCommits = sections.flatMap((s: any) => s.commits || []);
  const types = new Set(allCommits.map((c: any) => c.type));
  return {
    totalCommits: allCommits.length,
    typeCount: types.size,
    breakingChanges: allCommits.filter((c: any) => c.breaking).length,
    hasFeatures: types.has('feat'),
    hasFixes: types.has('fix'),
    hasPerf: types.has('perf'),
  };
}

function formatForSummary(sections: any[], stats: any): string {
  const lines: string[] = [
    `Total: ${stats.totalCommits} commits, ${stats.typeCount} types`,
    stats.breakingChanges > 0 ? `⚠️ ${stats.breakingChanges} breaking change(s)` : '',
  ].filter(Boolean);

  for (const section of sections) {
    if (!section.commits || section.commits.length === 0) continue;
    lines.push(`\n${section.label || section.type} (${section.commits.length}):`);
    const samples = section.commits.slice(0, 3);
    for (const c of samples) {
      lines.push(`- ${c.message}`);
    }
    if (section.commits.length > 3) {
      lines.push(`  ...and ${section.commits.length - 3} more`);
    }
  }

  return lines.join('\n');
}
