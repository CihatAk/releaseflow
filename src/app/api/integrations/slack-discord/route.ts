import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { platform, webhookUrl, message, repo, changelog, format } = body;

    if (!webhookUrl || !message) {
      return NextResponse.json(
        { error: "webhookUrl and message are required" },
        { status: 400 }
      );
    }

    let payload: any;
    const emoji = {
      feat: "✨",
      fix: "🐛",
      docs: "📝",
      style: "💄",
      refactor: "♻️",
      perf: "⚡",
      test: "✅",
      build: "📦",
      ci: "🔧",
      chore: "🔨",
    };

    if (platform === "slack") {
      payload = {
        text: `🚀 *New Changelog: ${repo}*`,
        blocks: [
          {
            type: "header",
            text: { type: "plain_text", text: `🚀 ${repo} Changelog Released` },
          },
          {
            type: "section",
            text: { type: "mrkdwn", text: `*${message}*` },
          },
        ],
      };
    } else if (platform === "discord") {
      payload = {
        content: `🚀 **${repo} Changelog Released**`,
        embeds: [
          {
            title: message,
            description: changelog?.substring(0, 500) || "New release",
            color: 5814784,
            fields: changelog
              ? (await Promise.all(
                  changelog
                    .split("\n")
                    .filter((l: string) => l.match(/^[✨🐛📝💄♻️⚡✅📦🔧🔨]/))
                    .slice(0, 10)
                    .map(async (line: string) => ({
                      name: "Changes",
                      value: line.substring(0, 100),
                      inline: true,
                    }))
                ))
              : [],
            footer: { text: "ReleaseFlow" },
            timestamp: new Date().toISOString(),
          },
        ],
      };
    } else {
      payload = { message, repo, changelog, timestamp: new Date().toISOString() };
    }

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Failed to send: ${errorText}` },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      platform,
      delivered: true,
    });
  } catch (error: any) {
    console.error("Webhook send error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send webhook" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    platforms: [
      { id: "slack", name: "Slack", color: "#4A154B" },
      { id: "discord", name: "Discord", color: "#5865F2" },
      { id: "custom", name: "Custom", color: "#10B981" },
    ],
    payloadFormats: {
      slack: "Block Kit format",
      Discord: "Embed format",
      custom: "JSON",
    },
  });
}