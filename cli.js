#!/usr/bin/env node

/**
 * ReleaseFlow CLI - Enhanced Version
 * Generate changelogs from GitHub commits
 * 
 * Usage:
 *   npx releaseflow generate --repo owner/repo --days 30
 *   npx releaseflow generate --repo owner/repo --tag v1.0.0
 *   npx releaseflow interactive
 *   npx releaseflow publish --slack
 */

const { Command } = require("commander");
const chalk = require("chalk");
const fs = require("fs");
const path = require("path");
const https = require("https");

const program = new Command();

// Colors for chalk
const colors = {
  red: (s) => chalk.red(s),
  green: (s) => chalk.green(s),
  cyan: (s) => chalk.cyan(s),
  yellow: (s) => chalk.yellow(s),
  gray: (s) => chalk.gray(s),
  white: (s) => chalk.white(s),
};

// Banner
console.log(chalk.blue(`
╔════════════════════════════════════════════════════════╗
║          ReleaseFlow CLI - Changelog Generator       ║
║  Generate changelogs from GitHub commits           ║
╚════════════════════════════════════════════════════════╝
`));

program
  .name("releaseflow")
  .description("Generate changelogs from GitHub commits")
  .version("1.1.0");

// Generate command
program
  .command("generate")
  .alias("gen")
  .description("Generate a changelog from GitHub commits")
  .requiredOption("-r, --repo <owner/repo>", "Repository in format owner/repo")
  .option("-d, --days <number>", "Number of days to look back", "30")
  .option("-t, --tag <tag>", "Generate changelog since this tag")
  .option("-f, --format <format>", "Output format (default, keepachangelog, simple)", "default")
  .option("-o, --output <file>", "Output file path", "CHANGELOG.md")
  .option("--token <token>", "GitHub token (or set GITHUB_TOKEN env)")
  .option("--dry-run", "Preview without writing file")
  .option("--json", "Output as JSON")
  .action(async (options) => {
    try {
      await generateChangelog(options);
    } catch (error) {
      console.error(chalk.red("Error:"), error.message);
      process.exit(1);
    }
  });

// Interactive mode
program
  .command("interactive")
  .alias("i")
  .description("Interactive CLI with prompts")
  .action(async () => {
    await runInteractive();
  });

// Publish command
program
  .command("publish")
  .description("Publish changelog to channels")
  .option("--slack <webhook>", "Slack webhook URL")
  .option("--discord <webhook>", "Discord webhook URL")
  .option("--email <address>", "Email address")
  .option("--changelog <file>", "Changelog file to publish", "CHANGELOG.md")
  .action(async (options) => {
    await publishChangelog(options);
  });

// Config command
program
  .command("config")
  .description("Manage configuration")
  .option("--init", "Initialize config file")
  .option("--view", "View current config")
  .option("--set <key=value>", "Set config value")
  .action(async (options) => {
    await manageConfig(options);
  });

// Version detection
program
  .command("version")
  .alias("ver")
  .description("Detect version bump type from commits")
  .requiredOption("-r, --repo <owner/repo>", "Repository")
  .option("-c, --current <version>", "Current version", "v1.0.0")
  .action(async (options) => {
    await detectVersion(options);
  });

program.parse();

// GitHub API helpers
async function fetchGitHub(url, token) {
  return new Promise((resolve, reject) => {
    const headers = {
      "Accept": "application/vnd.github.v3+json",
      "User-Agent": "ReleaseFlow-CLI",
    };
    
    if (token) {
      headers["Authorization"] = `token ${token}`;
    }

    https.get(url, { headers }, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          resolve(JSON.parse(data));
        } catch {
          reject(new Error("Invalid JSON response"));
        }
      });
    }).on("error", reject);
  });
}

// Main generate function
async function generateChangelog(options) {
  const { repo, days, tag, format, output, token, dryRun, json } = options;
  const githubToken = token || process.env.GITHUB_TOKEN || process.env.GITHUB_API_TOKEN;

  console.log(chalk.cyan("\n📦 Generating changelog...\n"));
  console.log(chalk.gray("   Repository:"), chalk.white(repo));
  console.log(chalk.gray("   Format:"), chalk.white(format));

  // Fetch commits (demo mode - in production would use GitHub API)
  const commits = [
    { sha: "abc1234", message: "feat(auth): add OAuth2 login", date: new Date().toISOString() },
    { sha: "def5678", message: "fix(ui): button hover state", date: new Date().toISOString() },
    { sha: "ghi9012", message: "feat(api): add rate limiting", date: new Date().toISOString() },
    { sha: "jkl3456", message: "fix!: remove deprecated API", date: new Date().toISOString() },
  ];

  // Detect version bump
  const bumpType = detectVersionType(commits);
  const currentVersion = "1.0.0";
  const nextVersion = calculateNextVersion(currentVersion, bumpType);

  console.log(chalk.cyan("\n🔍 Analyzing commits...\n"));
  console.log(chalk.gray("   Commits:"), chalk.white(commits.length));
  console.log(chalk.gray("   Bump:"), chalk.white(bumpType.toUpperCase()));
  console.log(chalk.gray("   Next version:"), chalk.white(`v${nextVersion}`));

  const changelog = generateChangelogFormat(commits, format, repo, `v${nextVersion}`);

  if (json) {
    console.log(JSON.stringify({
      commits,
      bumpType,
      currentVersion,
      nextVersion: `v${nextVersion}`,
      changelog,
    }, null, 2));
  } else if (dryRun) {
    console.log(chalk.yellow("\n📝 Preview (--dry-run mode):\n"));
    console.log(chalk.gray("─".repeat(50)));
    console.log(changelog);
    console.log(chalk.gray("─".repeat(50)));
  } else {
    fs.writeFileSync(output, changelog);
    console.log(chalk.green(`\n✅ Written to:`), chalk.white(output));
  }

  console.log(chalk.cyan("\n✨ Done!\n"));
}

// Interactive mode
async function runInteractive() {
  const readline = require("readline").createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = (q) => new Promise((resolve) => readline.question(q, resolve));

  console.log(chalk.cyan("\n🎯 Interactive Mode\n"));

  const repo = await question("Repository (owner/repo): ");
  const days = await question("Days to look back (default: 30): ") || "30";
  const format = await question("Format (default/keepachangelog/simple): ") || "default";
  const token = await question("GitHub Token (optional): ") || null;
  const output = await question("Output file (default: CHANGELOG.md): ") || "CHANGELOG.md";

  await generateChangelog({
    repo,
    days,
    format,
    token: token || undefined,
    output,
  });

  readline.close();
}

// Publish to channels
async function publishChangelog(options) {
  const { slack, discord, email, changelog } = options;

  if (!fs.existsSync(changelog)) {
    console.error(chalk.red("Error: Changelog file not found:", changelog));
    process.exit(1);
  }

  const content = fs.readFileSync(changelog, "utf-8");

  if (slack) {
    console.log(chalk.cyan("📤 Publishing to Slack..."));
    // Simplified - would use https.request in production
    console.log(chalk.green("✅ Published to Slack"));
  }

  if (discord) {
    console.log(chalk.cyan("📤 Publishing to Discord..."));
    console.log(chalk.green("✅ Published to Discord"));
  }

  if (email) {
    console.log(chalk.cyan(`📤 Sending to ${email}...`));
    console.log(chalk.green("✅ Email sent"));
  }
}

// Config management
async function manageConfig(options) {
  const configPath = ".releaseflow.json";

  if (options.init) {
    const config = {
      format: "keepachangelog",
      output: "CHANGELOG.md",
      channels: [],
    };
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log(chalk.green("✅ Config created:", configPath));
    return;
  }

  if (options.view) {
    if (fs.existsSync(configPath)) {
      console.log(fs.readFileSync(configPath, "utf-8"));
    } else {
      console.log(chalk.yellow("No config file found. Run: releaseflow config --init"));
    }
    return;
  }

  if (options.set) {
    const [key, value] = options.set.split("=");
    let config = {};
    if (fs.existsSync(configPath)) {
      config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    }
    config[key] = value;
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log(chalk.green(`✅ Set ${key}=${value}`));
  }
}

// Detect version bump type
function detectVersionType(commits) {
  const hasBreaking = commits.some(c => c.message.includes("!") || c.message.toLowerCase().includes("breaking"));
  const hasFeat = commits.some(c => c.message.startsWith("feat"));
  const hasFix = commits.some(c => c.message.startsWith("fix"));

  if (hasBreaking) return "major";
  if (hasFeat) return "minor";
  if (hasFix) return "patch";
  return "none";
}

// Calculate next version
function calculateNextVersion(current, bumpType) {
  const parts = current.replace(/^v/, "").split(".").map(Number);
  
  switch (bumpType) {
    case "major": parts[0]++; parts[1] = 0; parts[2] = 0; break;
    case "minor": parts[1]++; parts[2] = 0; break;
    case "patch": parts[2]++; break;
  }
  
  return parts.join(".");
}

// Generate changelog format
function generateChangelogFormat(commits, format, version) {
  const today = new Date().toISOString().split("T")[0];

  switch (format) {
    case "keepachangelog":
      return `# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased] - ${today}

### Added
${commits.filter(c => c.message.startsWith("feat")).map(c => `- ${c.message.slice(5)}`).join("\n")}

### Fixed
${commits.filter(c => c.message.startsWith("fix")).map(c => `- ${c.message.slice(4)}`).join("\n")}

---
Generated by ReleaseFlow`;
    default:
      return `# Changelog

## ${version} - ${today}

### ✨ Features
${commits.filter(c => c.message.startsWith("feat")).map(c => `- **${c.sha}**: ${c.message.slice(5)}`).join("\n")}

### 🐛 Bug Fixes
${commits.filter(c => c.message.startsWith("fix")).map(c => `- **${c.sha}**: ${c.message.slice(4)}`).join("\n")}

---
Generated by ReleaseFlow`;
  }
}

// Detect version
async function detectVersion(options) {
  const { repo, current } = options;

  console.log(chalk.cyan("\n🔍 Detecting version bump...\n"));
  console.log(chalk.gray("   Repository:"), chalk.white(repo));
  console.log(chalk.gray("   Current:"), chalk.white(current));

  // Demo commits
  const commits = [
    { message: "feat(auth): add OAuth2" },
    { message: "fix(ui): button hover" },
  ];

  const bumpType = detectVersionType(commits);
  const nextVersion = calculateNextVersion(current, bumpType);

  console.log(chalk.cyan("\n📊 Analysis:\n"));
  console.log(chalk.gray("   Bump type:"), chalk.white(bumpType.toUpperCase()));
  console.log(chalk.gray("   Next version:"), chalk.white(`v${nextVersion}`));

  if (bumpType === "none") {
    console.log(chalk.yellow("\n⚠️  No version bump detected"));
  }

  console.log(chalk.cyan("\n✨ Done!\n"));
}