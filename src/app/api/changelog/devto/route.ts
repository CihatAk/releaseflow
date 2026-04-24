import { NextRequest, NextResponse } from "next/server";
import { ChangelogSection } from "@/lib/github/api";

// Export to Dev.to, Hashnode, or Newsletter format
export async function POST(request: NextRequest) {
  try {
    const { sections, repo, format = "devto" } = await request.json();

    if (!sections || !repo) {
      return NextResponse.json({ error: "Sections and repo required" }, { status: 400 });
    }

    let output: string;

    switch (format) {
      case "devto":
        output = generateDevTo(sections as ChangelogSection[], repo);
        break;
      case "hashnode":
        output = generateHashnode(sections as ChangelogSection[], repo);
        break;
      case "newsletter":
        output = generateNewsletter(sections as ChangelogSection[], repo);
        break;
      case "markdown":
        output = generateMarkdown(sections as ChangelogSection[], repo);
        break;
      default:
        output = generateDevTo(sections as ChangelogSection[], repo);
    }

    return NextResponse.json({
      content: output,
      format,
      filename: `${repo}-changelog.${format === "markdown" ? "md" : "txt"}`,
    });
  } catch (error) {
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}

function generateDevTo(sections: ChangelogSection[], repo: string): string {
  const today = new Date().toISOString().split("T")[0];
  return `---
title: ${repo} Changelog - ${today}
published: true
description: Latest changes and updates for ${repo}
tags: changelog, release-notes, development
cover_image: https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=800
---

# ${repo} Changelog

${today}

All notable changes to this project will be documented here.

## 🚀 New Features

${sections.find(s => s.type === "feat")?.commits.map((c: any) => 
  `- ${c.message}`
).join("\n") || "No new features in this release."}

## 🐛 Bug Fixes

${sections.find(s => s.type === "fix")?.commits.map((c: any) => 
  `- ${c.message}`
).join("\n") || "No bug fixes in this release."}

## 📝 Other Changes

${sections.filter(s => s.type !== "feat" && s.type !== "fix").map(s => 
`### ${s.label}

${s.commits.map((c: any) => `- ${c.message}`).join("\n")}`
).join("\n\n")}

---

*Generated with [ReleaseFlow](https://releaseflow.dev)*`;
}

function generateHashnode(sections: ChangelogSection[], repo: string): string {
  const today = new Date().toISOString().split("T")[0];
  return `# ${repo} - Changelog ${today}

Welcome to the latest update of ${repo}! Here's what's new:

${
  sections.map(section => `
## ${section.icon} ${section.label}

${
  section.commits.slice(0, 10).map(commit => `- ${commit.message}`).join("\n")
}
`).join("\n")
}

---
*Published with ReleaseFlow*`;
}

function generateNewsletter(sections: ChangelogSection[], repo: string): string {
  const today = new Date().toLocaleDateString("en-US", { 
    year: "numeric", 
    month: "long", 
    day: "numeric" 
  });

  return `📢 *${repo} - Release Update*

Hey there! Here's what's new in ${repo}:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${
  sections.map(section => `
${section.icon} ${section.label.toUpperCase()}
${
  section.commits.slice(0, 5).map(commit => `• ${commit.message}`).join("\n")
}
`).join("\n\n")
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

That's all for this release! 

Happy coding! 🚀

— The ${repo} Team
*Generated with ReleaseFlow*`;
}

function generateMarkdown(sections: ChangelogSection[], repo: string): string {
  const today = new Date().toISOString().split("T")[0];
  return `# ${repo} Changelog

**Generated:** ${today}

---

${
  sections.map(section => 
`## ${section.icon} ${section.label}

${
  section.commits.map(commit => `- ${commit.message}`).join("\n")
}`
  ).join("\n\n")
}

---

*Generated with ReleaseFlow*`;
}