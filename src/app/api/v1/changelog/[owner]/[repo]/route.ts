import { NextRequest, NextResponse } from "next/server";
import { parseCommits, generateFormatMarkdown, getRepoCommitsWithoutAuth, detectVersionBump, getNextVersion, computeChangelogStats } from "@/lib/github/api";
import { generateChangelogSummary } from "@/lib/changelog-formats";

interface RouteParams {
  params: Promise<{ owner: string; repo: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { owner, repo } = await params;
    const searchParams = request.nextUrl.searchParams;
    const days = Number(searchParams.get("days")) || 30;
    const format = (searchParams.get("format") as any) || "default";
    const includeStats = searchParams.get("stats") !== "false";

    if (!owner || !repo) {
      return NextResponse.json({ error: "Missing owner or repo parameter" }, { status: 400 });
    }

    const since = new Date();
    since.setDate(since.getDate() - days);

    const commits = await getRepoCommitsWithoutAuth(owner, repo, Math.max(100, days * 5), since.toISOString());
    const filteredCommits = commits.filter((commit) => new Date(commit.author.date) >= since);

    if (filteredCommits.length === 0) {
      return NextResponse.json({
        owner, repo, days, sections: [], commitCount: 0,
        message: "No commits found in the specified time range",
      }, { status: 200 });
    }

    const sections = parseCommits(filteredCommits);
    const markdown = generateFormatMarkdown(sections, format);
    const stats = computeChangelogStats(sections);
    const summary = generateChangelogSummary(sections);
    const bump = detectVersionBump(sections.flatMap((s) => s.commits));
    const suggestedVersion = getNextVersion("v0.0.0", bump);

    return NextResponse.json({
      owner, repo, days,
      sections: sections.map((s) => ({
        type: s.type, label: s.label, icon: s.icon,
        commits: s.commits.map((c) => ({
          message: c.message, scope: c.scope, sha: c.sha,
          author: c.author, date: c.date, breaking: c.breaking,
        })),
      })),
      commitCount: filteredCommits.length,
      markdown,
      stats: includeStats ? stats : undefined,
      summary,
      suggestedVersion,
      generatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to generate changelog" }, { status: 500 });
  }
}
