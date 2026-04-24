import { NextRequest, NextResponse } from "next/server";

// Dynamic SVG badge generator
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    // Parse repo name from slug
    const parts = slug.split("-");
    parts.pop(); // Remove timestamp
    const repoName = parts.join("-") || "changelog";
    
    const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="140" height="28" viewBox="0 0 140 28">
  <linearGradient from="#3b82f6" to="#2563eb" x1="0%" y1="0%" x2="100%" y2="0%">
    <stop offset="0%" style="stop-color:#3b82f6"/>
    <stop offset="100%" style="stop-color:#2563eb"/>
  </linearGradient>
  <rect fill="url(#gradient)" width="140" height="28" rx="4"/>
  <text x="14" y="19" fill="white" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="600">
    Changelog
  </text>
  <text x="82" y="19" fill="white" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="500" opacity="0.9">
    View Online
  </text>
  <defs>
    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#3b82f6"/>
      <stop offset="100%" style="stop-color:#2563eb"/>
    </linearGradient>
  </defs>
</svg>`;

    return new NextResponse(svg, {
      status: 200,
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (error) {
    return new NextResponse("Error", { status: 500 });
  }
}