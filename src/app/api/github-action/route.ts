import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { repoOwner, repoName, token } = body;

    if (!repoOwner || !repoName) {
      return NextResponse.json(
        { error: "repoOwner ve repoName gerekli" },
        { status: 400 }
      );
    }

    // GitHub Action YAML dosyası oluştur
    const yaml = [
      "name: Generate Changelog",
      "",
      "on:",
      "  push:",
      "    branches: [ main, master ]",
      "  workflow_dispatch:",
      "",
      "jobs:",
      "  generate-changelog:",
      "    runs-on: ubuntu-latest",
      "    steps:",
      "      - uses: actions/checkout@v4",
      "",
      "      - name: Setup Node.js",
      "        uses: actions/setup-node@v4",
      "        with:",
      "          node-version: '20'",
      "",
      "      - name: Install ReleaseFlow CLI",
      "        run: npm install -g releaseflow-cli",
      "",
      "      - name: Generate Changelog",
      "        env:",
      `          GITHUB_TOKEN: $` + `{ secrets.GITHUB_TOKEN }`,
      token ? `          RELEASEFLOW_TOKEN: $` + `{ secrets.RELEASEFLOW_TOKEN }` : "",
      "        run: |",
      `          releaseflow generate \\`,
      `            --owner ${repoOwner} \\`,
      `            --repo ${repoName} \\`,
      "            --format markdown \\",
      "            --output CHANGELOG.md",
      "",
      "      - name: Commit Changelog",
      "        uses: stefanzweifel/git-auto-commit-action@v5",
      "        with:",
      '          commit_message: "docs: update CHANGELOG.md [skip ci]"',
      '          file_pattern: "CHANGELOG.md"',
    ].filter(Boolean).join("\n");

    return NextResponse.json({
      success: true,
      yaml,
      instructions: [
        `1. Copy the YAML below to .github/workflows/changelog.yml`,
        `2. ${token ? 'Add RELEASEFLOW_TOKEN secret to your repo settings' : 'Set up ReleaseFlow token'}`,
        `3. Push to main branch to trigger the action`,
      ],
      message: "GitHub Action YAML oluşturuldu",
    });
  } catch (error) {
    console.error("GitHub Action error:", error);
    return NextResponse.json(
      { error: "YAML oluşturulamadı" },
      { status: 500 }
    );
  }
}
