import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { owner, repo, tagName, targetCommitish, changelog, prerelease, draft } = body;

    if (!owner || !repo || !tagName) {
      return NextResponse.json(
        { error: "owner, repo, and tagName are required" },
        { status: 400 }
      );
    }

    const token = request.headers.get("x-github-token");

    if (!token) {
      return NextResponse.json(
        { error: "GitHub token required" },
        { status: 401 }
      );
    }

    const releaseData = {
      tag_name: tagName,
      target_commitish: targetCommitish || "main",
      name: tagName,
      body: changelog || "",
      draft: draft || false,
      prerelease: prerelease || false,
    };

    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/releases`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(releaseData),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `GitHub error: ${errorText}` },
        { status: response.status }
      );
    }

    const release = await response.json();

    return NextResponse.json({
      success: true,
      platform: "github",
      releaseId: release.id,
      releaseUrl: release.html_url,
      tagName: release.tag_name,
      publishedAt: release.published_at,
    });
  } catch (error: any) {
    console.error("GitHub release error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create release" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const owner = searchParams.get("owner");
  const repo = searchParams.get("repo");

  if (!owner || !repo) {
    return NextResponse.json(
      { error: "owner and repo required" },
      { status: 400 }
    );
  }

  const token = request.headers.get("x-github-token");

  if (!token) {
    return NextResponse.json(
      { error: "GitHub token required" },
      { status: 401 }
    );
  }

  try {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/releases?per_page=10`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch releases" },
        { status: response.status }
      );
    }

    const releases = await response.json();

    return NextResponse.json({
      releases: releases.map((r: any) => ({
        id: r.id,
        tagName: r.tag_name,
        name: r.name,
        url: r.html_url,
        publishedAt: r.published_at,
        prerelease: r.prerelease,
        draft: r.draft,
      })),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}