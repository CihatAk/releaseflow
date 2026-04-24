import { NextRequest, NextResponse } from "next/server";

// RSS Feed for public changelogs
export async function GET(request: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://releaseflow.dev";
  
  // In production, this would fetch from database
  // For now, return sample feed
  const sampleChangelogs = [
    {
      slug: "releaseflow-v1",
      repo: "releaseflow/releaseflow",
      title: "ReleaseFlow v1.0 - Initial Release",
      description: "First major release with changelog generation, batch processing, and custom branding.",
      pubDate: new Date().toISOString(),
    },
    {
      slug: "myapp-v20",
      repo: "user/myapp",
      title: "MyApp v2.0 - Performance Improvements",
      description: "Major performance improvements and new dashboard features.",
      pubDate: new Date(Date.now() - 86400000).toISOString(),
    },
  ];

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>ReleaseFlow Changelogs</title>
    <link>${baseUrl}</link>
    <description>Latest changelogs generated with ReleaseFlow</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/api/rss" rel="self" type="application/rss+xml"/>
    
    ${sampleChangelogs.map(changelog => `
    <item>
      <title><![CDATA[${changelog.title}]]></title>
      <link>${baseUrl}/embed/${changelog.slug}</link>
      <description><![CDATA[${changelog.description}]]></description>
      <pubDate>${new Date(changelog.pubDate).toUTCString()}</pubDate>
      <guid>${baseUrl}/embed/${changelog.slug}</guid>
    </item>
    `).join('')}
  </channel>
</rss>`;

  return new NextResponse(rss, {
    status: 200,
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600",
    },
  });
}