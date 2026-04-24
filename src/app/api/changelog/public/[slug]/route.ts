import { NextRequest, NextResponse } from "next/server";
import { getRepoCommits, parseCommits, generateMarkdown, GithubCommit } from "@/lib/github/api";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Parse slug to extract repo info (format: owner/repo-timestamp or repo-timestamp)
    const lastDashIndex = slug.lastIndexOf("-");
    const repoIdentifier = slug.substring(0, lastDashIndex);
    const timestampPart = slug.substring(lastDashIndex + 1);
    
    // Try to extract owner and repo from localStorage published data
    // For now, return demo data - in production this would be stored in Supabase
    const sections = [
      {
        type: "feat",
        label: "Features",
        icon: "🚀",
        commits: [
          {
            type: "feat",
            scope: "auth",
            message: "Add OAuth2 login with GitHub",
            breaking: false,
            sha: "abc1234567890",
            author: "developer",
            date: new Date().toISOString(),
          },
          {
            type: "feat",
            scope: "dashboard",
            message: "Create user dashboard with repository list",
            breaking: false,
            sha: "def4567890123",
            author: "developer",
            date: new Date().toISOString(),
          },
          {
            type: "feat",
            scope: "api",
            message: "Implement REST API for changelog generation",
            breaking: false,
            sha: "hij4567890456",
            author: "developer",
            date: new Date().toISOString(),
          },
        ],
      },
      {
        type: "fix",
        label: "Bug Fixes",
        icon: "🐛",
        commits: [
          {
            type: "fix",
            scope: "ui",
            message: "Fix button hover state styling",
            breaking: false,
            sha: "ghi7890123456",
            author: "developer",
            date: new Date().toISOString(),
          },
          {
            type: "fix",
            scope: "auth",
            message: "Resolve OAuth callback redirect issue",
            breaking: false,
            sha: "klm8901234567",
            author: "developer",
            date: new Date().toISOString(),
          },
        ],
      },
      {
        type: "docs",
        label: "Documentation",
        icon: "📝",
        commits: [
          {
            type: "docs",
            scope: null,
            message: "Update README with installation instructions",
            breaking: false,
            sha: "nop1234567890",
            author: "developer",
            date: new Date().toISOString(),
          },
        ],
      },
    ];

    // Parse repo name from slug
    const repoName = repoIdentifier.split("/").pop() || repoIdentifier || "demo-repo";
    
    return NextResponse.json({
      repo: {
        name: repoName,
        full_name: `owner/${repoName}`,
        owner: "owner",
        description: "Changelog generated with ReleaseFlow",
      },
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