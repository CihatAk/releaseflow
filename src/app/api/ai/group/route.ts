import { NextRequest, NextResponse } from 'next/server';
import { chat, type AIConfig } from '@/lib/ai';

interface GroupingBody {
  commits: Array<{ message: string; sha: string; author: string }>;
  strategy?: 'feature' | 'type' | 'author' | 'smart';
  aiConfig?: AIConfig;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as GroupingBody;
    const { commits, strategy = 'smart', aiConfig } = body;

    if (!commits || commits.length === 0) {
      return NextResponse.json({ error: 'Commits are required' }, { status: 400 });
    }

    if (strategy !== 'smart') {
      return NextResponse.json({ groups: manualGroup(commits, strategy) });
    }

    const commitList = commits
      .map((c, i) => `[${i}] ${c.message} (by ${c.author})`)
      .join('\n');

    const system = `You are a commit grouping expert. Analyze the provided commits and group them logically.

Rules:
- Group related commits together (same feature, same bug fix, same refactor, etc.)
- Each group should have a clear, descriptive title
- Include ALL commit indices in each group
- Return valid JSON only

Return format:
{
  "groups": [
    { "title": "Feature: description", "commitIndices": [0, 3, 5], "reason": "brief reason" },
    { "title": "Fix: description", "commitIndices": [1, 2], "reason": "brief reason" }
  ]
}`;

    const result = await chat(
      { system, user: commitList, temperature: 0.3, json: true },
      aiConfig,
    );

    try {
      const parsed = JSON.parse(result.content);
      const groups = parsed.groups.map((g: any) => ({
        title: g.title,
        reason: g.reason,
        commits: g.commitIndices.map((idx: number) => commits[idx]).filter(Boolean),
      }));

      return NextResponse.json({
        groups,
        strategy: 'smart',
        model: result.model,
        provider: result.provider,
        latencyMs: result.latencyMs,
      });
    } catch {
      return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 });
    }
  } catch (error) {
    console.error('Smart grouping error:', error);
    const message = error instanceof Error ? error.message : 'Failed to group commits';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function manualGroup(
  commits: Array<{ message: string; sha: string; author: string }>,
  strategy: 'feature' | 'type' | 'author'
) {
  const groups: Array<{ title: string; commits: typeof commits }> = [];

  if (strategy === 'type') {
    const byType: Record<string, typeof commits> = {};
    for (const c of commits) {
      const type = c.message.split(':')[0]?.replace(/[!\(\)]/g, '') || 'other';
      (byType[type] ||= []).push(c);
    }
    for (const [type, items] of Object.entries(byType)) {
      groups.push({ title: type, commits: items });
    }
  } else if (strategy === 'author') {
    const byAuthor: Record<string, typeof commits> = {};
    for (const c of commits) {
      (byAuthor[c.author] ||= []).push(c);
    }
    for (const [author, items] of Object.entries(byAuthor)) {
      groups.push({ title: `Contributions by ${author}`, commits: items });
    }
  } else {
    // Feature-based simple grouping
    const features: typeof commits = [];
    const fixes: typeof commits = [];
    const other: typeof commits = [];
    for (const c of commits) {
      const msg = c.message.toLowerCase();
      if (msg.startsWith('feat')) features.push(c);
      else if (msg.startsWith('fix')) fixes.push(c);
      else other.push(c);
    }
    if (features.length) groups.push({ title: 'Features', commits: features });
    if (fixes.length) groups.push({ title: 'Bug Fixes', commits: fixes });
    if (other.length) groups.push({ title: 'Other Changes', commits: other });
  }

  return groups;
}
