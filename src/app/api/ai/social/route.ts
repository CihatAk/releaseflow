import { NextRequest, NextResponse } from 'next/server';
import { chat, type AIConfig } from '@/lib/ai';

type Platform = 'twitter' | 'linkedin' | 'blog-excerpt' | 'email-subject' | 'discord' | 'hacker-news';

interface SocialBody {
  content: string;
  platforms: Platform[];
  productName?: string;
  version?: string;
  aiConfig?: AIConfig;
}

const INSTRUCTIONS: Record<Platform, string> = {
  twitter:
    'Compose a Twitter/X thread of 3-5 tweets about this release. Each tweet <=270 chars. Number them (1/, 2/, ...). First tweet must hook readers. End with a CTA. Use 1-2 relevant hashtags total, not per tweet.',
  linkedin:
    'Write a professional LinkedIn post (~150-250 words) announcing this release. Start with a bold hook, list 3-4 key improvements with emoji bullets, end with a CTA. Friendly but professional.',
  'blog-excerpt':
    'Write a blog post excerpt (80-120 words) suitable for the homepage or a release announcement email. Highlight the 3 most impactful changes in narrative form.',
  'email-subject':
    'Propose 5 subject lines for a release announcement email. Each under 60 chars. Mix styles: news, benefit-driven, curiosity, urgency, playful. Return as a numbered list.',
  discord:
    'Write a Discord announcement (~100 words) with a friendly community tone. Use 2-3 emoji. Include a bold headline and a bullet list of highlights.',
  'hacker-news':
    'Write a Show HN-style post (2-3 short paragraphs). Honest, no marketing fluff, technical, focus on what was built and why. No emoji.',
};

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as SocialBody;
    if (!body.content || !Array.isArray(body.platforms) || body.platforms.length === 0) {
      return NextResponse.json(
        { error: 'content and platforms[] are required' },
        { status: 400 },
      );
    }

    const context = [
      body.productName ? `Product: ${body.productName}` : '',
      body.version ? `Version: ${body.version}` : '',
      `Release notes:\n${body.content}`,
    ]
      .filter(Boolean)
      .join('\n');

    const results = await Promise.all(
      body.platforms.map(async (platform) => {
        const system = `You are a world-class developer-marketing copywriter.
${INSTRUCTIONS[platform] || 'Rewrite the content for social media.'}
Never invent features. Only use what is in the release notes. Return only the post body.`;

        try {
          const r = await chat({ system, user: context, temperature: 0.8 }, body.aiConfig);
          return { platform, content: r.content, ok: true as const, latencyMs: r.latencyMs };
        } catch (err) {
          return {
            platform,
            content: '',
            ok: false as const,
            latencyMs: 0,
            error: err instanceof Error ? err.message : 'Failed',
          };
        }
      }),
    );

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Error generating social:', error);
    const message = error instanceof Error ? error.message : 'Failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
