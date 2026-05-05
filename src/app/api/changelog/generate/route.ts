import { NextRequest, NextResponse } from "next/server";
import {
  getRepoCommits,
  parseCommits,
  generateFormatMarkdown,
  detectVersionBump,
  getNextVersion,
  computeChangelogStats,
  getLatestRelease,
  getRepoTags,
  ChangelogFormat,
} from "@/lib/github/api";
import { generateChangelogSummary } from "@/lib/changelog-formats";

export async function POST(request: NextRequest) {
  try {
    const { owner, repo, branch, days, format = "default", types, search, tag, includeStats = true } = await request.json();

    if (!owner || !repo) {
      return NextResponse.json({ error: "Owner and repo are required" }, { status: 400 });
    }

    // Token is optional for public repos
    const token = request.headers.get("x-github-token") || 
                  request.cookies.get("github_token")?.value ||
                  process.env.GITHUB_TOKEN || // Fallback to env token
                  null;

    const headers: Record<string, string> = {
      Accept: "application/vnd.github.v3+json",
    };
    
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    let commits;

    if (tag) {
      const tags = await getRepoTags(token, owner, repo);
      const matchedTag = tags.find((t) => t.name === tag);
      if (matchedTag) {
        const compareRes = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/compare/${tag}...HEAD`,
          { headers }
        );
        if (compareRes.ok) {
          const data = await compareRes.json();
          commits = data.commits.map((c: any) => ({
            sha: c.sha,
            message: c.commit.message,
            author: {
              name: c.commit.author.name,
              email: c.commit.author.email,
              date: c.commit.author.date,
            },
            url: c.html_url,
          }));
        }
      }
    }

    if (!commits) {
      const perPage = Math.max(100, days ? days * 5 : 100);
      const since = days
        ? new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
        : undefined;
      commits = await getRepoCommits(token, owner, repo, perPage, since);
    }

    let sections = parseCommits(commits);

    if (types && types.length > 0) {
      sections = sections.filter((section) => types.includes(section.type));
    }

    if (search) {
      const searchLower = search.toLowerCase();
      sections = sections
        .map((section) => ({
          ...section,
          commits: section.commits.filter(
            (commit) =>
              commit.message.toLowerCase().includes(searchLower) ||
              (commit.scope && commit.scope.toLowerCase().includes(searchLower)) ||
              commit.sha.toLowerCase().includes(searchLower)
          ),
        }))
        .filter((section) => section.commits.length > 0);
    }

    const markdown = generateFormatMarkdown(sections, format as ChangelogFormat);
    const stats = computeChangelogStats(sections);
    const bump = detectVersionBump(sections.flatMap((s) => s.commits));
    const summary = generateChangelogSummary(sections);

    let currentVersion = "v0.0.0";
    const latestRelease = await getLatestRelease(token, owner, repo);
    if (latestRelease) {
      currentVersion = latestRelease.tag_name;
    }

    const suggestedVersion = getNextVersion(currentVersion, bump);

    return NextResponse.json({
      sections,
      markdown,
      stats: includeStats ? stats : undefined,
      summary,
      version: {
        current: currentVersion,
        suggested: suggestedVersion,
        bump,
      },
      commitCount: stats.totalCommits,
      repo: `${owner}/${repo}`,
    });
  } catch (error: any) {
    console.error("Changelog generation error:", error);
    
    // More specific error messages
    if (error?.message?.includes("404") || error?.message?.includes("Not Found")) {
      return NextResponse.json({ error: "Repository not found. Make sure the repository exists and is accessible." }, { status: 404 });
    }
    
    return NextResponse.json({ error: error?.message || "Failed to generate changelog" }, { status: 500 });
  }
}
