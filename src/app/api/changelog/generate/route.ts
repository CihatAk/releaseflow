import { NextRequest, NextResponse } from "next/server";
import { getRepoCommits, parseCommits, generateFormatMarkdown, ChangelogFormat, GithubCommit, CommitType } from "@/lib/github/api";

export async function POST(request: NextRequest) {
  try {
    const { owner, repo, branch, days, format = "default", types, search } = await request.json();

    if (!owner || !repo) {
      return NextResponse.json(
        { error: "Owner and repo are required" },
        { status: 400 }
      );
    }

    const token = request.cookies.get("github_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const commits = await getRepoCommits(token, owner, repo, 100);

    // Filter by date
    let filteredCommits = commits;
    
    if (days) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      filteredCommits = commits.filter((commit) => {
        const commitDate = new Date(commit.author.date);
        return commitDate >= cutoffDate;
      });
    }

    // Parse commits
    let sections = parseCommits(filteredCommits);

    // Filter by commit types
    if (types && types.length > 0) {
      sections = sections.filter(section => types.includes(section.type));
    }

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      sections = sections.map(section => ({
        ...section,
        commits: section.commits.filter(commit => 
          commit.message.toLowerCase().includes(searchLower) ||
          (commit.scope && commit.scope.toLowerCase().includes(searchLower)) ||
          commit.sha.toLowerCase().includes(searchLower)
        )
      })).filter(section => section.commits.length > 0);
    }

    // Generate markdown in selected format
    const markdown = generateFormatMarkdown(sections, format as ChangelogFormat);

    return NextResponse.json({
      sections,
      markdown,
      commitCount: sections.reduce((acc, s) => acc + s.commits.length, 0),
    });
  } catch (error) {
    console.error("Changelog generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate changelog" },
      { status: 500 }
    );
  }
}