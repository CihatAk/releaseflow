import { NextRequest, NextResponse } from "next/server";

// PDF Export with professional templates
export async function POST(request: NextRequest) {
  try {
    const { 
      sections, 
      repo, 
      template = "default",
      theme = {},
      format = "pdf" 
    } = await request.json();

    if (!sections || !repo) {
      return NextResponse.json({ error: "Sections and repo required" }, { status: 400 });
    }

    // Brand customization
    const brand = {
      logo: theme?.logo || null,
      primaryColor: theme?.primaryColor || "#3b82f6",
      secondaryColor: theme?.secondaryColor || "#8b5cf6",
      companyName: theme?.companyName || repo.owner,
      accentColor: theme?.accentColor || "#10b981",
      ...theme
    };

    const templates = {
      default: generateDefaultTemplate(sections, repo, brand),
      modern: generateModernTemplate(sections, repo, brand),
      minimal: generateMinimalTemplate(sections, repo, brand),
      enterprise: generateEnterpriseTemplate(sections, repo, brand),
      creative: generateCreativeTemplate(sections, repo, brand),
    };

    if (format === "html") {
      return NextResponse.json({
        html: templates[template as keyof typeof templates] || templates.default,
        filename: `${repo}-changelog.${format === "pdf" ? "html" : format}`,
      });
    }

    // For PDF, return HTML that can be converted using browser print
    return NextResponse.json({
      html: templates[template as keyof typeof templates] || templates.default,
      template,
      brand,
      instructions: "Open in browser and print to PDF (Cmd/Ctrl+P, Save as PDF)",
    });
  } catch (error) {
    console.error("PDF export error:", error);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}

function generateDefaultTemplate(sections: any[], repo: any, brand: any) {
  const today = new Date().toISOString().split("T")[0];
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${repo} Changelog</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
      line-height: 1.6; 
      color: #1a1a1a; 
      background: #fff;
      padding: 40px;
      max-width: 800px;
      margin: 0 auto;
    }
    .header { 
      border-bottom: 3px solid ${brand.primaryColor};
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .logo { 
      height: 40px; 
      margin-bottom: 10px;
    }
    h1 { 
      font-size: 2.5rem;
      color: ${brand.primaryColor};
      margin-bottom: 5px;
    }
    .meta { 
      color: #666;
      font-size: 0.9rem;
    }
    .section { 
      margin-bottom: 25px;
    }
    .section-title { 
      font-size: 1.3rem;
      font-weight: 600;
      color: ${brand.primaryColor};
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .commit { 
      padding: 8px 0;
      border-bottom: 1px solid #eee;
      display: flex;
      align-items: start;
      gap: 10px;
    }
    .commit:last-child { border-bottom: none; }
    .commit-icon { 
      width: 8px; 
      height: 8px; 
      border-radius: 50%;
      background: ${brand.primaryColor};
      margin-top: 8px;
      flex-shrink: 0;
    }
    .commit-content { flex: 1; }
    .commit-message { font-weight: 500; }
    .commit-sha { 
      font-size: 0.75rem; 
      color: #999;
      font-family: monospace;
    }
    .scope {
      background: ${brand.primaryColor}15;
      color: ${brand.primaryColor};
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 500;
    }
    .footer { 
      border-top: 2px solid #eee;
      padding-top: 20px;
      margin-top: 40px;
      text-align: center;
      color: #666;
      font-size: 0.85rem;
    }
    .badge {
      display: inline-block;
      background: ${brand.primaryColor};
      color: white;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <header class="header">
    ${brand.logo ? `<img src="${brand.logo}" alt="${brand.companyName}" class="logo">` : ''}
    <h1>${repo} Changelog</h1>
    <p class="meta">Generated on ${today} • ${brand.companyName}</p>
  </header>

  ${sections.map(section => `
    <div class="section">
      <h2 class="section-title">${section.icon} ${section.label}</h2>
      ${section.commits.slice(0, 20).map((commit: any) => `
        <div class="commit">
          <div class="commit-icon"></div>
          <div class="commit-content">
            ${commit.scope ? `<span class="scope">${commit.scope}</span>` : ''}
            <span class="commit-message">${commit.message}</span>
            <span class="commit-sha">${commit.sha?.slice(0, 7)}</span>
          </div>
        </div>
      `).join('')}
    </div>
  `).join('')}

  <footer class="footer">
    <span class="badge">Generated with ReleaseFlow</span>
    <p>${brand.companyName} • ${new Date().getFullYear()}</p>
  </footer>
</body>
</html>`;
}

function generateModernTemplate(sections: any[], repo: any, brand: any) {
  const today = new Date().toISOString().split("T")[0];
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${repo} Changelog</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Inter', -apple-system, sans-serif; 
      background: #f8f9fa;
      color: #1a1a1a;
    }
    .container { max-width: 700px; margin: 0 auto; padding: 40px; }
    .card {
      background: white;
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
      padding: 32px;
      margin-bottom: 24px;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 32px;
    }
    h1 { font-size: 1.75rem; font-weight: 700; color: ${brand.primaryColor}; }
    .tag { 
      background: ${brand.primaryColor}; 
      color: white; 
      padding: 4px 12px; 
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 600;
    }
    .section { margin-bottom: 24px; }
    .section-title { 
      font-size: 0.85rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: ${brand.secondaryColor};
      font-weight: 600;
      margin-bottom: 12px;
    }
    .commit {
      padding: 12px 0;
      border-bottom: 1px solid #f0f0f0;
    }
    .commit:last-child { border-bottom: none; }
    .commit-type {
      display: inline-block;
      width: 24px;
      height: 24px;
      border-radius: 6px;
      background: ${brand.primaryColor}15;
      color: ${brand.primaryColor};
      text-align: center;
      line-height: 24px;
      font-size: 0.75rem;
      margin-right: 10px;
    }
    .commit-text { font-weight: 500; }
    .stats {
      display: flex;
      gap: 16px;
      margin-top: 16px;
    }
    .stat { font-size: 0.85rem; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="header">
        <h1>${repo}</h1>
        <span class="tag">${today}</span>
      </div>
      
      ${sections.map(section => `
        <div class="section">
          <div class="section-title">${section.label}</div>
          ${section.commits.slice(0, 10).map((commit: any) => `
            <div class="commit">
              <span class="commit-type">${section.icon}</span>
              <span class="commit-text">${commit.message}</span>
            </div>
          `).join('')}
        </div>
      `).join('')}
      
      <div class="stats">
        ${sections.reduce((acc, s) => acc + s.commits.length, 0)} changes • Managed by ReleaseFlow
      </div>
    </div>
  </div>
</body>
</html>`;
}

function generateMinimalTemplate(sections: any[], repo: any, brand: any) {
  const today = new Date().toISOString().split("T")[0];
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${repo}</title>
  <style>
    body { font-family: 'Courier New', monospace; padding: 40px; max-width: 600px; margin: 0 auto; color: #333; }
    h1 { font-size: 1.5rem; border-bottom: 2px solid #333; padding-bottom: 10px; }
    h2 { font-size: 1rem; margin-top: 24px; color: #666; }
    ul { list-style: none; padding-left: 0; }
    li { padding: 6px 0; border-bottom: 1px dotted #ddd; }
    .date { float: right; color: #999; font-size: 0.8rem; }
  </style>
</head>
<body>
  <h1>${repo} — CHANGELOG</h1>
  <p>${today}</p>
  
  ${sections.map(section => `
    <h2>// ${section.label}</h2>
    <ul>
      ${section.commits.slice(0, 15).map((c: any) => `
        <li><span class="date">${c.sha?.slice(0,6)}</span> ${c.message}</li>
      `).join('')}
    </ul>
  `).join('')}
</body>
</html>`;
}

function generateEnterpriseTemplate(sections: any[], repo: any, brand: any) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${repo} Release Notes</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
    .header { background: linear-gradient(135deg, ${brand.primaryColor}, ${brand.secondaryColor}); color: white; padding: 40px; border-radius: 8px; margin-bottom: 30px; }
    h1 { font-size: 2rem; margin-bottom: 8px; }
    .version { background: rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 4px; font-size: 0.9rem; }
    .section { margin: 24px 0; }
    .section h2 { font-size: 1.1rem; border-bottom: 2px solid ${brand.primaryColor}; padding-bottom: 8px; margin-bottom: 16px; }
    table { width: 100%; border-collapse: collapse; }
    td { padding: 12px 8px; border-bottom: 1px solid #eee; }
    td:first-child { width: 40px; text-align: center; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #666; font-size: 0.85rem; }
  </style>
</head>
<body>
  <div class="header">
    <span class="version">RELEASE</span>
    <h1>${repo}</h1>
    <p>Generated by ReleaseFlow</p>
  </div>
  
  ${sections.map(section => `
    <div class="section">
      <h2>${section.label}</h2>
      <table>
        ${section.commits.slice(0, 15).map((c: any) => `
          <tr><td>${section.icon}</td><td>${c.message}</td><td>${c.sha?.slice(0,7)}</td></tr>
        `).join('')}
      </table>
    </div>
  `).join('')}
  
  <div class="footer">
    <p>© ${new Date().getFullYear()} ${brand.companyName} • Confidential</p>
  </div>
</body>
</html>`;
}

function generateCreativeTemplate(sections: any[], repo: any, brand: any) {
  const colors = [brand.primaryColor, brand.secondaryColor, brand.accentColor, "#f59e0b", "#ef4444"];
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${repo}</title>
  <style>
    body { font-family: 'Poppins', sans-serif; padding: 40px; max-width: 750px; margin: 0 auto; background: linear-gradient(135deg, #667eea22 0%, #764ba222 100%); }
    .container { background: white; border-radius: 24px; padding: 48px; box-shadow: 0 20px 60px rgba(0,0,0,0.1); }
    h1 { font-size: 2.5rem; background: linear-gradient(135deg, ${brand.primaryColor}, ${brand.secondaryColor}); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 8px; }
    .badge { 
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: ${brand.primaryColor}10;
      color: ${brand.primaryColor};
      padding: 8px 16px;
      border-radius: 24px;
      font-weight: 600;
      margin-bottom: 32px;
    }
    .category { margin-bottom: 28px; }
    .category-title { 
      font-size: 0.8rem;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #888;
      margin-bottom: 12px;
    }
    .item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      background: #fafafa;
      border-radius: 12px;
      margin-bottom: 8px;
      transition: transform 0.2s;
    }
    .item:hover { transform: translateX(4px); }
    .icon { 
      width: 32px; 
      height: 32px; 
      border-radius: 8px;
      background: ${brand.primaryColor}20;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1rem;
    }
  </style>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body>
  <div class="container">
    <h1>${repo}</h1>
    <div class="badge">✨ What's New</div>
    
    ${sections.map((section, idx) => `
      <div class="category">
        <div class="category-title">${section.label}</div>
        ${section.commits.slice(0, 12).map((c: any) => `
          <div class="item">
            <div class="icon">${section.icon}</div>
            <div>${c.message}</div>
          </div>
        `).join('')}
      </div>
    `).join('')}
  </div>
</body>
</html>`;
}