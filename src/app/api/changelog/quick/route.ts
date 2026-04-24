import { NextRequest, NextResponse } from "next/server";
import { parseCommits, generateFormatMarkdown, getRepoCommitsWithoutAuth, getRepoInfo } from "@/lib/github/api";

export async function POST(request: NextRequest) {
  try {
    const { owner, repo, days = 30, format = "default" } = await request.json();

    if (!owner || !repo) {
      return NextResponse.json(
        { error: "Missing owner or repo" },
        { status: 400 }
      );
    }

    const since = new Date();
    since.setDate(since.getDate() - days);

    const commits = await getRepoCommitsWithoutAuth(owner, repo, 100);

    const filteredCommits = commits.filter(
      (commit) => new Date(commit.author.date) >= since
    );

    if (filteredCommits.length === 0) {
      return NextResponse.json(
        { error: "No commits found in the specified time range" },
        { status: 404 }
      );
    }

    const sections = parseCommits(filteredCommits);
    const markdown = generateFormatMarkdown(sections, format as any);

    return NextResponse.json({
      markdown,
      commitCount: filteredCommits.length,
      owner,
      repo,
      days,
      format,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to generate changelog" },
      { status: 500 }
    );
  }
}