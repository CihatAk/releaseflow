import { NextRequest, NextResponse } from "next/server";

interface Repository {
  id: number;
  name: string;
  fullName: string;
  url: string;
  platform: "github" | "gitlab" | "bitbucket";
  isPrivate: boolean;
}

const PLATFORMS = {
  github: {
    name: "GitHub",
    apiBase: "https://api.github.com",
    color: "bg-black",
    icon: "🐙",
  },
  gitlab: {
    name: "GitLab",
    apiBase: "https://gitlab.com/api/v4",
    color: "bg-orange-500",
    icon: "🦊",
  },
  bitbucket: {
    name: "Bitbucket",
    apiBase: "https://api.bitbucket.org/2.0",
    color: "bg-blue-500",
    icon: "🔵",
  },
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const platform = searchParams.get("platform");

  if (platform && PLATFORMS[platform as keyof typeof PLATFORMS]) {
    return NextResponse.json({
      platform: PLATFORMS[platform as keyof typeof PLATFORMS],
      supported: true,
    });
  }

  return NextResponse.json({
    platforms: PLATFORMS,
    endpoints: {
      repos: "GET /api/repos?platform=github|gitlab|bitbucket",
      connect: "POST /api/repos/connect",
      commits: "GET /api/github/repos (GitHub only for now)",
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { platform, token, url, projectId } = body;

    if (!platform || !["github", "gitlab", "bitbucket"].includes(platform)) {
      return NextResponse.json({ error: "Invalid platform" }, { status: 400 });
    }

    if (!token && !url) {
      return NextResponse.json({ error: "Token or URL required" }, { status: 400 });
    }

    const platformConfig = PLATFORMS[platform as keyof typeof PLATFORMS];
    const apiKey = platformConfig.apiBase;

    let repos: any[] = [];

    if (platform === "gitlab" && token) {
      const response = await fetch(`${apiKey}/projects?membership=true&simple=true&per_page=20`, {
        headers: {
          "PRIVATE-TOKEN": token,
        },
      });
      if (response.ok) {
        const data = await response.json();
        repos = data.map((p: any) => ({
          id: p.id,
          name: p.name,
          fullName: p.path_with_namespace,
          url: p.web_url,
          isPrivate: p.visibility === "private",
          platform: "gitlab",
        }));
      }
    }

    if (platform === "bitbucket" && token) {
      const response = await fetch(`${apiKey}/repositories`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        repos = (data.values || []).map((p: any) => ({
          id: p.uuid,
          name: p.name,
          fullName: p.full_name,
          url: p.links.html.href,
          isPrivate: p.is_private,
          platform: "bitbucket",
        }));
      }
    }

    return NextResponse.json({
      success: true,
      platform,
      repos,
      count: repos.length,
    });
  } catch (error) {
    console.error("Platform fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch repos" }, { status: 500 });
  }
}