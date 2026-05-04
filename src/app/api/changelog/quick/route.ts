import { NextRequest, NextResponse } from "next/server";
import { parseCommits, generateFormatMarkdown, getRepoCommitsWithoutAuth, getRepoInfo, detectVersionBump, getNextVersion, computeChangelogStats } from "@/lib/github/api";
import { generateChangelogSummary } from "@/lib/changelog-formats";

export async function POST(request: NextRequest) {
  try {
    const { owner, repo, days = 30, format = "default", includeStats = true } = await request.json();

    if (!owner || !repo) {
      return NextResponse.json({ error: "Missing owner or repo" }, { status: 400 });
    }

    const since = new Date();
    since.setDate(since.getDate() - days);

    const commits = await getRepoCommitsWithoutAuth(owner, repo, Math.max(100, days * 5), since.toISOString());

    const filteredCommits = commits.filter((commit) => new Date(commit.author.date) >= since);

    if (filteredCommits.length === 0) {
      return NextResponse.json({ error: "No commits found in the specified time range" }, { status: 404 });
    }

    const sections = parseCommits(filteredCommits);
    const markdown = generateFormatMarkdown(sections, format as any);
    const stats = computeChangelogStats(sections);
    const summary = generateChangelogSummary(sections);
    const bump = detectVersionBump(sections.flatMap((s) => s.commits));
    const suggestedVersion = getNextVersion("v0.0.0", bump);

    return NextResponse.json({
      markdown,
      sections,
      stats: includeStats ? stats : undefined,
      summary,
      suggestedVersion,
      commitCount: filteredCommits.length,
      owner,
      repo,
      days,
      format,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to generate changelog" }, { status: 500 });
  }
}
