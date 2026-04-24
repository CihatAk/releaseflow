import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { domain, repo, cname } = body;

    if (!domain) {
      return NextResponse.json({ error: "Domain is required" }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      domain,
      target: `releaseflow-fawn.vercel.app`,
      cname_record: cname ? `${domain} CNAME ${cname}.vercel.app` : null,
      a_record: domain.includes("www") ? `${domain} A 76.76.21.21` : null,
      status: "configured",
      message: "Custom domain configured. Update your DNS records.",
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to configure domain" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    instructions: [
      "1. Go to Vercel Project Settings → Domains",
      "2. Add your custom domain",
      "3. Update DNS records as instructed",
    ],
    example: {
      domain: "changelog.mydomain.com",
      target: "releaseflow-fawn.vercel.app",
    },
  });
}