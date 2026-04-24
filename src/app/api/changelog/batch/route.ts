import { NextRequest, NextResponse } from "next/server";
import { getRepoCommits, parseCommits, generateFormatMarkdown, ChangelogFormat, GithubCommit } from "@/lib/github/api";

export async function POST(request: NextRequest) {
  try {
    const { repos, days = 30, format = "default" } = await request.json();

    if (!repos || !Array.isArray(repos) || repos.length === 0) {
      return NextResponse.json(
        { error: "Repos array is required" },
        { status: 400 }
      );
    }

    if (repos.length > 10) {
      return NextResponse.json(
        { error: "Maximum 10 repos allowed per batch" },
        { status: 400 }
      );
    }

    const token = request.cookies.get("github_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Generate changelogs for all repos
    const results = await Promise.all(
      repos.map(async (repoPath: string) => {
        try {
          const [owner, repo] = repoPath.split("/");
          if (!owner || !repo) {
            return {
              repo: repoPath,
              error: "Invalid repo format",
              success: false,
            };
          }

          const commits = await getRepoCommits(token, owner, repo, 50);

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

          const sections = parseCommits(filteredCommits);
          const markdown = generateFormatMarkdown(sections, format as ChangelogFormat);

          return {
            repo: repoPath,
            sections,
            markdown,
            commitCount: filteredCommits.length,
            success: true,
          };
        } catch (error) {
          return {
            repo: repoPath,
            error: "Failed to generate changelog",
            success: false,
          };
        }
      })
    );

    const successful = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    return NextResponse.json({
      total: repos.length,
      successful,
      failed,
      results,
    });
  } catch (error) {
    console.error("Batch generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate batch changelog" },
      { status: 500 }
    );
  }
}