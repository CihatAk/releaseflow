import { NextRequest, NextResponse } from "next/server";
import { getRepoCommits, parseCommits, generateMarkdown, GithubCommit } from "@/lib/github/api";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const parts = slug.replace(/-/g, "/").split("/");
    let owner = "";
    let repo = "";
    
    if (parts.length >= 2) {
      owner = parts[0];
      repo = parts[1];
    } else {
      repo = parts[0];
    }

    if (!owner && !repo) {
      return NextResponse.json(
        { error: "Invalid slug format. Use owner/repo-timestamp or repo" },
        { status: 400 }
      );
    }

    const token = request.cookies.get("github_token")?.value || 
                request.headers.get("x-github-token");

    let sections = [];
    let repoInfo = { name: repo, full_name: `${owner}/${repo}`, owner, description: "" };

try {
        if (token || owner) {
          const commits = await getRepoCommits(token || "", owner, repo, 100);
          sections = parseCommits(commits);
          repoInfo = {
            name: repo,
            full_name: owner ? `${owner}/${repo}` : repo,
            owner: owner || "",
            description: "",
          };
        } else {
        return NextResponse.json(
          { error: "No public changelog available. Publish first or provide token." },
          { status: 404 }
        );
      }
    } catch (apiError) {
      console.error("GitHub API error:", apiError);
      return NextResponse.json(
        { error: "Could not fetch changelog. Repository may not exist or is private." },
        { status: 404 }
      );
    }

    if (sections.length === 0 || sections.every(s => s.commits.length === 0)) {
      return NextResponse.json(
        { error: "No commits found. Make sure commits follow conventional commits." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      repo: repoInfo,
      sections,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Public changelog error:", error);
    return NextResponse.json(
      { error: "Failed to fetch changelog" },
      { status: 500 }
    );
  }
}