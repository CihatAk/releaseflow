import { NextRequest, NextResponse } from "next/server";
import {
  generateChangelogHTML,
  generateRSSFeed,
  generateSlackBlocks,
  generateDiscordEmbed,
} from "@/lib/changelog-formats";
import { computeChangelogStats } from "@/lib/github/api";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sections, repo, format = "csv", version, repoName } = body;

    if (!sections || !repo) {
      return NextResponse.json({ error: "Sections and repo required" }, { status: 400 });
    }

    const stats = computeChangelogStats(sections);
    const today = new Date().toISOString().split("T")[0];
    const displayVersion = version || "Unreleased";
    const displayName = repoName || repo;

    const formatLower = format.toLowerCase();

    switch (formatLower) {
      case "csv": {
        const csv = generateCSV(sections, repo);
        return newFileResponse(csv, `${repo}-changelog.csv`, "text/csv");
      }
      case "json": {
        const json = JSON.stringify({ repo, version: displayVersion, sections, stats, exportedAt: new Date().toISOString() }, null, 2);
        return newFileResponse(json, `${repo}-changelog.json`, "application/json");
      }
      case "yaml": {
        const yaml = generateYAML(sections, repo, displayVersion);
        return newFileResponse(yaml, `${repo}-changelog.yaml`, "text/yaml");
      }
      case "html": {
        const html = generateChangelogHTML(sections, displayVersion, today, displayName, stats);
        return newFileResponse(html, `${repo}-changelog.html`, "text/html");
      }
      case "rss": {
        const rss = generateRSSFeed(sections, displayVersion, today, displayName, `https://github.com/${repo}`);
        return newFileResponse(rss, `${repo}-changelog.xml`, "application/rss+xml");
      }
      case "slack": {
        const blocks = generateSlackBlocks(sections, displayVersion, displayName);
        return NextResponse.json({ blocks });
      }
      case "discord": {
        const embed = generateDiscordEmbed(sections, displayVersion, displayName);
        return NextResponse.json({ embeds: [embed] });
      }
      default:
        return NextResponse.json({ error: "Unsupported format" }, { status: 400 });
    }
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}

function newFileResponse(content: string, filename: string, contentType: string) {
  return new NextResponse(content, {
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

function generateCSV(sections: any[], repo: any): string {
  const rows = [["Type", "Scope", "Message", "SHA", "Author", "Date", "Breaking"]];

  for (const section of sections) {
    for (const commit of section.commits || []) {
      rows.push([
        section.type || "",
        commit.scope || "",
        (commit.message || "").replace(/"/g, '""'),
        commit.sha?.substring(0, 7) || "",
        commit.author || "",
        commit.date || "",
        commit.breaking ? "Yes" : "No",
      ]);
    }
  }

  return rows.map((row) => row.map((cell) => `"${cell || ""}"`).join(",")).join("\n");
}

function generateYAML(sections: any[], repo: any, version: string): string {
  let yaml = `# ${repo} Changelog - ${version}\n# Generated: ${new Date().toISOString()}\n\n`;
  yaml += `repo: ${repo}\n`;
  yaml += `version: "${version}"\n`;
  yaml += `date: "${new Date().toISOString().split("T")[0]}"\n\n`;

  for (const section of sections) {
    yaml += `${section.label}:\n`;
    for (const commit of section.commits || []) {
      yaml += `  - message: "${(commit.message || "").replace(/"/g, '\\"')}"\n`;
      if (commit.scope) yaml += `    scope: "${commit.scope}"\n`;
      if (commit.sha) yaml += `    sha: "${commit.sha.substring(0, 7)}"\n`;
      if (commit.author) yaml += `    author: "${commit.author}"\n`;
      yaml += `    breaking: ${commit.breaking || false}\n`;
    }
    yaml += "\n";
  }

  return yaml;
}

export async function GET() {
  return NextResponse.json({
    formats: ["csv", "json", "yaml", "html", "rss", "slack", "discord"],
    descriptions: {
      csv: "Spreadsheet-compatible format",
      json: "Structured JSON with stats",
      yaml: "YAML configuration format",
      html: "Styled HTML page with stats",
      rss: "RSS 2.0 feed for subscribers",
      slack: "Slack Block Kit format",
      discord: "Discord embed format",
    },
  });
}
