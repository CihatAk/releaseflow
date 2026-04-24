import { NextRequest, NextResponse } from "next/server";
import { getRepoCommits, parseCommits, GithubCommit, ChangelogSection } from "@/lib/github/api";

export async function POST(request: NextRequest) {
  try {
    const { owner, repo, from, to } = await request.json();

    if (!owner || !repo || !from || !to) {
      return NextResponse.json(
        { error: "Owner, repo, from, and to are required" },
        { status: 400 }
      );
    }

    const token = request.cookies.get("github_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Get commits between two refs/tags
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/compare/${from}...${to}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github.v3+json",
        },
      }
    );

    if (!response.ok) {
      // Fallback: get recent commits
      const commits = await getRepoCommits(token, owner, repo, 50);
      
      const fromCommits = commits.slice(0, Math.floor(commits.length / 2));
      const toCommits = commits.slice(Math.floor(commits.length / 2));
      
      return NextResponse.json({
        from,
        to,
        totalCommits: commits.length,
        added: parseCommits(toCommits),
        removed: parseCommits(fromCommits),
        comparison: "approximate",
      });
    }

    const data = await response.json();
    
    const commits: GithubCommit[] = data.commits?.map((commit: any) => ({
      sha: commit.sha,
      message: commit.commit.message,
      author: {
        name: commit.commit.author.name,
        email: commit.commit.author.email,
        date: commit.commit.author.date,
      },
      url: commit.html_url,
    })) || [];

    const added = parseCommits(commits);
    const removed: ChangelogSection[] = []; // Would need historical data

    return NextResponse.json({
      from,
      to,
      totalCommits: data.total_commits || commits.length,
      aheadBy: data.ahead_by || 0,
      behindBy: data.behind_by || 0,
      added,
      removed,
      url: data.permalink_url,
    });
  } catch (error) {
    console.error("Version compare error:", error);
    return NextResponse.json(
      { error: "Failed to compare versions" },
      { status: 500 }
    );
  }
}