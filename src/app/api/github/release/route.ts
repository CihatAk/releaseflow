import { NextRequest, NextResponse } from "next/server";

const GITHUB_API_URL = "https://api.github.com";

export async function POST(request: NextRequest) {
  try {
    const accessToken = request.headers.get("x-github-token");
    
    if (!accessToken) {
      return NextResponse.json(
        { error: "GitHub token required. Please authenticate first." },
        { status: 401 }
      );
    }

    const { owner, repo, tag, title, body, targetCommitish } = await request.json();

    if (!owner || !repo || !tag) {
      return NextResponse.json(
        { error: "Missing required fields: owner, repo, tag" },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${GITHUB_API_URL}/repos/${owner}/${repo}/releases`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tag_name: tag,
          name: title || tag,
          body: body || "",
          target_commitish: targetCommitish || "main",
          draft: false,
          prerelease: tag.includes("-beta") || tag.includes("-alpha"),
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { error: error.message || "Failed to create release" },
        { status: response.status }
      );
    }

    const release = await response.json();

    return NextResponse.json({
      success: true,
      url: release.html_url,
      releaseId: release.id,
      tag: release.tag_name,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to publish release" },
      { status: 500 }
    );
  }
}