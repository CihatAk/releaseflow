import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sections, repo, format = "csv" } = body;

    if (!sections || !repo) {
      return NextResponse.json({ error: "Sections and repo required" }, { status: 400 });
    }

    const formatLower = format.toLowerCase();
    
    if (formatLower === "csv") {
      const csv = generateCSV(sections, repo);
      return newNextResponse(csv, `${repo}-changelog.csv`, "text/csv");
    }
    
    if (formatLower === "json") {
      const json = JSON.stringify({ repo, sections, exportedAt: new Date().toISOString() }, null, 2);
      return newNextResponse(json, `${repo}-changelog.json`, "application/json");
    }
    
    if (formatLower === "yaml") {
      const yaml = generateYAML(sections, repo);
      return newNextResponse(yaml, `${repo}-changelog.yaml`, "text/yaml");
    }

    return NextResponse.json({ error: "Unsupported format" }, { status: 400 });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}

function newNextResponse(content: string, filename: string, contentType: string) {
  return new NextResponse(content, {
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

function generateCSV(sections: any[], repo: any): string {
  const rows = [["Type", "Scope", "Message", "SHA", "Author", "Date"]];
  
  for (const section of sections) {
    for (const commit of section.commits || []) {
      rows.push([
        section.type || "",
        commit.scope || "",
        commit.message || "",
        commit.sha?.substring(0, 7) || "",
        commit.author || "",
        commit.date || "",
      ]);
    }
  }
  
  return rows.map(row => row.map(cell => `"${(cell || "").replace(/"/g, '""')}"`).join(",")).join("\n");
}

function generateYAML(sections: any[], repo: any): string {
  let yaml = `# ${repo} Changelog\n# Generated: ${new Date().toISOString()}\n\n`;
  
  for (const section of sections) {
    yaml += `## ${section.label}\n`;
    for (const commit of section.commits || []) {
      yaml += `- message: "${commit.message}"\n`;
      if (commit.scope) yaml += `  scope: ${commit.scope}\n`;
      if (commit.sha) yaml += `  sha: ${commit.sha.substring(0, 7)}\n`;
      if (commit.author) yaml += `  author: ${commit.author}\n`;
    }
    yaml += "\n";
  }
  
  return yaml;
}

export async function GET() {
  return NextResponse.json({
    formats: ["csv", "json", "yaml", "pdf", "html"],
    examples: {
      csv: { format: "csv" },
      json: { format: "json" },
      yaml: { format: "yaml" },
      pdf: { format: "pdf" },
      html: { format: "html" },
    },
  });
}