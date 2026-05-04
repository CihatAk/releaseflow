const GITHUB_API_URL = "https://api.github.com";

export interface GithubCommit {
  sha: string;
  message: string;
  body?: string;
  author: {
    name: string;
    email: string;
    date: string;
  };
  url: string;
}

export interface GithubRepo {
  id: number;
  name: string;
  full_name: string;
  owner: {
    login: string;
    avatar_url: string;
  };
  private: boolean;
  html_url: string;
  description: string | null;
  default_branch: string;
  updated_at: string;
  stargazers_count: number;
  forks_count: number;
}

export interface ParsedCommit {
  type: CommitType;
  scope: string | null;
  message: string;
  breaking: boolean;
  breakingNote?: string;
  sha: string;
  author: string;
  date: string;
  url?: string;
}

export type CommitType =
  | "feat"
  | "fix"
  | "docs"
  | "style"
  | "refactor"
  | "perf"
  | "test"
  | "build"
  | "ci"
  | "chore"
  | "revert"
  | "sec"
  | "其他";

export interface ChangelogSection {
  type: CommitType;
  label: string;
  icon: string;
  commits: ParsedCommit[];
}

export interface EmojiMapping {
  [key: string]: { label: string; icon: string };
}

export const DEFAULT_EMOJI_MAPPING: EmojiMapping = {
  feat: { label: "Features", icon: "✨" },
  fix: { label: "Bug Fixes", icon: "🐛" },
  docs: { label: "Documentation", icon: "📝" },
  style: { label: "Styles", icon: "💄" },
  refactor: { label: "Refactoring", icon: "♻️" },
  perf: { label: "Performance", icon: "⚡️" },
  test: { label: "Tests", icon: "✅" },
  build: { label: "Build System", icon: "📦" },
  ci: { label: "CI/CD", icon: "🔧" },
  chore: { label: "Maintenance", icon: "🔨" },
  revert: { label: "Reverts", icon: "⏪" },
  sec: { label: "Security", icon: "🔒" },
  other: { label: "Other Changes", icon: "📌" },
  其他: { label: "Other Changes", icon: "📌" },
};

const COMMIT_TYPE_LABELS: Record<string, { label: string; icon: string }> = {
  feat: { label: "Features", icon: "🚀" },
  fix: { label: "Bug Fixes", icon: "🐛" },
  docs: { label: "Documentation", icon: "📝" },
  style: { label: "Styles", icon: "💄" },
  refactor: { label: "Refactoring", icon: "♻️" },
  perf: { label: "Performance", icon: "⚡" },
  test: { label: "Tests", icon: "✅" },
  build: { label: "Build System", icon: "📦" },
  ci: { label: "CI/CD", icon: "🔧" },
  chore: { label: "Maintenance", icon: "🔧" },
  revert: { label: "Reverts", icon: "⏪" },
  sec: { label: "Security", icon: "🔒" },
  其他: { label: "Other Changes", icon: "📌" },
};

let customCommitTypes: Record<string, { label: string; icon: string }> = {};
let customEmojiMapping: EmojiMapping = {};

export type VersionBump = "major" | "minor" | "patch" | "none";

const CONVENTIONAL_COMMIT_REGEX = /^(\w+)(?:\(([^)]+)\))?(!)?:\s*(.+)$/i;
const BREAKING_CHANGE_REGEX = /BREAKING[\s-]*CHANGE[:\s]+(.+)$/im;
const BREAKING_FOOTER_REGEX = /^BREAKING[\s-]*CHANGE:\s*(.+)$/m;

export function parseCommitMessage(message: string): {
  type: CommitType;
  scope: string | null;
  breaking: boolean;
  breakingNote?: string;
  subject: string;
} {
  const lines = message.split("\n");
  const firstLine = lines[0].trim();
  const body = lines.slice(1).join("\n").trim();

  const match = firstLine.match(CONVENTIONAL_COMMIT_REGEX);

  let breaking = false;
  let breakingNote: string | undefined;

  if (match) {
    const [, type, scope, breakingBang, subject] = match;
    breaking = breakingBang === "!";

    if (!breaking && body) {
      const breakingMatch = body.match(BREAKING_CHANGE_REGEX) || body.match(BREAKING_FOOTER_REGEX);
      if (breakingMatch) {
        breaking = true;
        breakingNote = breakingMatch[1].trim();
      }
    }

    if (!breaking && firstLine.toLowerCase().includes("breaking")) {
      breaking = true;
    }

    const normalizedType = type.toLowerCase() === "security" ? "sec" : type.toLowerCase() as CommitType;

    return {
      type: normalizedType,
      scope: scope || null,
      breaking,
      breakingNote,
      subject: subject.trim(),
    };
  }

  if (firstLine.toLowerCase().includes("breaking") || body.match(BREAKING_CHANGE_REGEX)) {
    breaking = true;
  }

  return {
    type: "其他",
    scope: null,
    breaking,
    breakingNote: body.match(BREAKING_CHANGE_REGEX)?.[1]?.trim(),
    subject: firstLine,
  };
}

export function parseCommits(commits: GithubCommit[]): ChangelogSection[] {
  const parsedCommits: ParsedCommit[] = commits.map((commit) => {
    const { type, scope, breaking, breakingNote, subject } = parseCommitMessage(commit.message);
    return {
      type,
      scope,
      breaking,
      breakingNote,
      message: subject,
      sha: commit.sha,
      author: commit.author.name,
      date: commit.author.date,
      url: commit.url,
    };
  });

  const sectionMap = new Map<string, ChangelogSection>();

  for (const commit of parsedCommits) {
    if (!sectionMap.has(commit.type)) {
      const typeInfo = COMMIT_TYPE_LABELS[commit.type] || COMMIT_TYPE_LABELS["其他"];
      sectionMap.set(commit.type, {
        type: commit.type,
        label: typeInfo.label,
        icon: typeInfo.icon,
        commits: [],
      });
    }
    sectionMap.get(commit.type)!.commits.push(commit);
  }

  const sections: ChangelogSection[] = [];
  const breakingSection: ChangelogSection = {
    type: "其他",
    label: "Breaking Changes",
    icon: "⚠️",
    commits: [],
  };

  const typeOrder: CommitType[] = [
    "feat", "fix", "sec", "perf", "refactor",
    "docs", "style", "test", "build", "ci", "chore", "revert", "其他",
  ];

  for (const type of typeOrder) {
    const section = sectionMap.get(type);
    if (!section || section.commits.length === 0) continue;

    const breakingCommits = section.commits.filter((c) => c.breaking);
    const nonBreakingCommits = section.commits.filter((c) => !c.breaking);

    if (breakingCommits.length > 0) {
      breakingSection.commits.push(...breakingCommits);
    }

    if (nonBreakingCommits.length > 0) {
      sections.push({ ...section, commits: nonBreakingCommits });
    }
  }

  if (breakingSection.commits.length > 0) {
    sections.unshift(breakingSection);
  }

  return sections;
}

export function generateMarkdown(sections: ChangelogSection[]): string {
  return generateFormatMarkdown(sections, "default");
}

export type ChangelogFormat =
  | "default"
  | "keepachangelog"
  | "standardversion"
  | "simple"
  | "github-release"
  | "telegram"
  | "email";

export function generateFormatMarkdown(sections: ChangelogSection[], format: ChangelogFormat = "default"): string {
  const today = new Date().toISOString().split("T")[0];

  switch (format) {
    case "keepachangelog":
      return generateKeepAChangelogFormat(sections, today);
    case "standardversion":
      return generateStandardVersionFormat(sections, today);
    case "simple":
      return generateSimpleFormat(sections);
    case "github-release":
      return generateGitHubReleaseFormat(sections, today);
    case "telegram":
      return generateTelegramFormat(sections);
    case "email":
      return generateEmailFormat(sections, today);
    default:
      return generateDefaultFormat(sections, today);
  }
}

function generateDefaultFormat(sections: ChangelogSection[], today: string): string {
  const lines: string[] = [];
  lines.push("# Changelog");
  lines.push("");
  lines.push(`All notable changes to this project will be documented in this file.`);
  lines.push("");
  lines.push(`## [Unreleased] - ${today}`);
  lines.push("");

  for (const section of sections) {
    if (section.commits.length === 0) continue;
    lines.push(`### ${section.icon} ${section.label}`);
    lines.push("");

    for (const commit of section.commits) {
      const scope = commit.scope ? `**${commit.scope}:** ` : "";
      const sha = commit.sha.substring(0, 7);
      const authorRef = commit.author ? ` (@${commit.author})` : "";
      const breaking = commit.breaking ? " ⚠️" : "";
      const note = commit.breakingNote ? `\n  > ${commit.breakingNote}` : "";
      lines.push(`- ${scope}${commit.message}${breaking} (${sha})${authorRef}${note}`);
    }
    lines.push("");
  }

  return lines.join("\n");
}

function generateKeepAChangelogFormat(sections: ChangelogSection[], today: string): string {
  const lines: string[] = [];
  lines.push("# Changelog");
  lines.push("");
  lines.push("All notable changes to this project will be documented in this file.");
  lines.push("");
  lines.push("The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),");
  lines.push("and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).");
  lines.push("");
  lines.push(`## [Unreleased] - ${today}`);
  lines.push("");

  const kacMap: Record<string, string> = {
    feat: "Added", fix: "Fixed", perf: "Changed",
    refactor: "Changed", docs: "Documentation", style: "Changed",
    test: "Tests", build: "Build", ci: "CI",
    chore: "Maintenance", revert: "Reverted", sec: "Security",
  };

  for (const section of sections) {
    if (section.commits.length === 0) continue;
    const kacLabel = section.type === "其他" ? "Changed" : (kacMap[section.type] || "Changed");
    lines.push(`### ${kacLabel}`);
    lines.push("");
    for (const commit of section.commits) {
      const scope = commit.scope ? `**${commit.scope}:** ` : "";
      const sha = commit.sha.substring(0, 7);
      lines.push(`- ${scope}${commit.message} [${sha}]`);
    }
    lines.push("");
  }

  return lines.join("\n");
}

function generateStandardVersionFormat(sections: ChangelogSection[], today: string): string {
  const lines: string[] = [];
  lines.push("# Changelog");
  lines.push("");

  for (const section of sections) {
    if (section.commits.length === 0) continue;
    lines.push(`## [${section.type.toUpperCase()}] ${section.label}`);
    lines.push("");
    for (const commit of section.commits) {
      const scope = commit.scope ? `(${commit.scope})` : "";
      const breaking = commit.breaking ? "!" : "";
      lines.push(`  * ${section.type}${breaking}${scope}: ${commit.message} (${commit.sha.substring(0, 7)})`);
    }
    lines.push("");
  }

  return lines.join("\n");
}

function generateSimpleFormat(sections: ChangelogSection[]): string {
  const lines: string[] = [];
  lines.push("# Recent Changes");
  lines.push("");

  for (const section of sections) {
    if (section.commits.length === 0) continue;
    lines.push(`### ${section.label}`);
    lines.push("");
    for (const commit of section.commits) {
      lines.push(`- ${commit.scope ? `[${commit.scope}] ` : ''}${commit.message}`);
    }
    lines.push("");
  }

  return lines.join("\n");
}

function generateGitHubReleaseFormat(sections: ChangelogSection[], today: string): string {
  const lines: string[] = [];
  lines.push(`## What's Changed`);
  lines.push("");

  for (const section of sections) {
    if (section.commits.length === 0) continue;
    lines.push(`### ${section.icon} ${section.label}`);
    lines.push("");
    for (const commit of section.commits) {
      const scope = commit.scope ? `**${commit.scope}:** ` : "";
      const sha = commit.sha.substring(0, 7);
      const breaking = commit.breaking ? " ⚠️" : "";
      lines.push(`- ${scope}${commit.message}${breaking} (${sha})`);
    }
    lines.push("");
  }

  const authors = [...new Set(sections.flatMap((s) => s.commits.map((c) => c.author)))];
  if (authors.length > 0) {
    lines.push("**Full Changelog**: https://github.com/compare/...");
    lines.push("");
    lines.push(`**Contributors**: ${authors.join(", ")}`);
  }

  return lines.join("\n");
}

function generateTelegramFormat(sections: ChangelogSection[]): string {
  const lines: string[] = [];
  lines.push("<b>🚀 Release Update</b>");
  lines.push("");

  for (const section of sections) {
    if (section.commits.length === 0) continue;
    lines.push(`<b>${section.icon} ${section.label}</b>`);
    for (const commit of section.commits) {
      const scope = commit.scope ? `<code>${commit.scope}</code>: ` : "";
      const breaking = commit.breaking ? " ⚠️" : "";
      lines.push(`• ${scope}${commit.message}${breaking}`);
    }
    lines.push("");
  }

  return lines.join("\n");
}

function generateEmailFormat(sections: ChangelogSection[], today: string): string {
  const lines: string[] = [];
  lines.push(`Subject: Release Update - ${today}`);
  lines.push("");
  lines.push("Hi there,");
  lines.push("");
  lines.push("Here's what changed in the latest release:");
  lines.push("");

  for (const section of sections) {
    if (section.commits.length === 0) continue;
    lines.push(`${section.icon} ${section.label}:`);
    for (const commit of section.commits) {
      const scope = commit.scope ? `[${commit.scope}] ` : "";
      lines.push(`  • ${scope}${commit.message}`);
    }
    lines.push("");
  }

  lines.push("Best regards,");
  lines.push("ReleaseFlow Team");

  return lines.join("\n");
}

export function detectVersionBump(commits: ParsedCommit[]): VersionBump {
  const hasMajor = commits.some((c) =>
    c.breaking ||
    c.message.toLowerCase().includes("breaking") ||
    /^BREAKING/i.test(c.message)
  );

  if (hasMajor) return "major";

  const hasFeat = commits.some((c) => c.type === "feat" || /^feat[:\(]/.test(c.message));
  const hasFix = commits.some((c) => c.type === "fix" || /^fix[:\(]/.test(c.message));

  if (hasFeat) return "minor";
  if (hasFix) return "patch";

  return "none";
}

export function getNextVersion(currentVersion: string, bump: VersionBump): string {
  if (bump === "none") return currentVersion;

  const parts = currentVersion.replace(/^v/, "").split(".").map(Number);
  while (parts.length < 3) parts.push(0);

  switch (bump) {
    case "major":
      parts[0] += 1;
      parts[1] = 0;
      parts[2] = 0;
      break;
    case "minor":
      parts[1] += 1;
      parts[2] = 0;
      break;
    case "patch":
      parts[2] += 1;
      break;
  }

  return `v${parts.join(".")}`;
}

export function computeChangelogStats(sections: ChangelogSection[]) {
  const allCommits = sections.flatMap((s) => s.commits);
  const authors = [...new Set(allCommits.map((c) => c.author))];
  const scopes = [...new Set(allCommits.filter((c) => c.scope).map((c) => c.scope!))];
  const breakingCount = allCommits.filter((c) => c.breaking).length;

  const typeCounts: Record<string, number> = {};
  for (const section of sections) {
    typeCounts[section.type] = section.commits.length;
  }

  const scopeCounts: Record<string, number> = {};
  for (const commit of allCommits) {
    if (commit.scope) {
      scopeCounts[commit.scope] = (scopeCounts[commit.scope] || 0) + 1;
    }
  }

  const topScopes = Object.entries(scopeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([scope, count]) => ({ scope, count }));

  return {
    totalCommits: allCommits.length,
    contributors: authors.length,
    scopes: scopes.length,
    breakingChanges: breakingCount,
    typeCounts,
    topScopes,
    sectionsCount: sections.length,
    authors,
  };
}

export function setCustomCommitTypes(types: Record<string, { label: string; icon: string }>) {
  customCommitTypes = types;
}

export function setCustomEmojiMapping(mapping: EmojiMapping) {
  customEmojiMapping = mapping;
}

export function getEmojiMapping(): EmojiMapping {
  return { ...DEFAULT_EMOJI_MAPPING, ...customEmojiMapping };
}

export function resetCustomTypes() {
  customCommitTypes = {};
  customEmojiMapping = {};
}

export async function getUserRepos(accessToken: string): Promise<GithubRepo[]> {
  const response = await fetch(
    `${GITHUB_API_URL}/user/repos?sort=updated&per_page=100`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github.v3+json",
      },
      next: { revalidate: 60 },
    }
  );

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status}`);
  }

  return response.json();
}

export async function getRepoCommits(
  accessToken: string,
  owner: string,
  repo: string,
  perPage: number = 100,
  since?: string
): Promise<GithubCommit[]> {
  let url = `${GITHUB_API_URL}/repos/${owner}/${repo}/commits?per_page=${perPage}`;
  if (since) url += `&since=${encodeURIComponent(since)}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github.v3+json",
    },
    next: { revalidate: 30 },
  });

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status}`);
  }

  const commits = await response.json();

  return commits.map((commit: any) => ({
    sha: commit.sha,
    message: commit.commit.message,
    author: {
      name: commit.commit.author.name,
      email: commit.commit.author.email,
      date: commit.commit.author.date,
    },
    url: commit.html_url,
  }));
}

export async function getRepoBranches(
  accessToken: string,
  owner: string,
  repo: string
): Promise<{ name: string; commit: { sha: string } }[]> {
  const response = await fetch(
    `${GITHUB_API_URL}/repos/${owner}/${repo}/branches`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github.v3+json",
      },
      next: { revalidate: 60 },
    }
  );

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status}`);
  }

  return response.json();
}

export async function getCommitsSinceTag(
  accessToken: string,
  owner: string,
  repo: string,
  tag: string
): Promise<GithubCommit[]> {
  const response = await fetch(
    `${GITHUB_API_URL}/repos/${owner}/${repo}/compare/${tag}...main`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github.v3+json",
      },
    }
  );

  if (!response.ok) {
    return getRepoCommits(accessToken, owner, repo);
  }

  const data = await response.json();
  return data.commits.map((commit: any) => ({
    sha: commit.sha,
    message: commit.commit.message,
    author: {
      name: commit.commit.author.name,
      email: commit.commit.author.email,
      date: commit.commit.author.date,
    },
    url: commit.html_url,
  }));
}

export async function getRepoCommitsWithoutAuth(
  owner: string,
  repo: string,
  perPage: number = 100,
  since?: string
): Promise<GithubCommit[]> {
  let url = `${GITHUB_API_URL}/repos/${owner}/${repo}/commits?per_page=${perPage}`;
  if (since) url += `&since=${encodeURIComponent(since)}`;

  const response = await fetch(url, {
    headers: { Accept: "application/vnd.github.v3+json" },
    next: { revalidate: 30 },
  });

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status}`);
  }

  const commits = await response.json();

  return commits.map((commit: any) => ({
    sha: commit.sha,
    message: commit.commit.message,
    author: {
      name: commit.commit.author.name,
      email: commit.commit.author.email,
      date: commit.commit.author.date,
    },
    url: commit.html_url,
  }));
}

export async function getRepoInfo(
  owner: string,
  repo: string
): Promise<{
  name: string;
  full_name: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  html_url: string;
  owner: { login: string; avatar_url: string };
}> {
  const response = await fetch(`${GITHUB_API_URL}/repos/${owner}/${repo}`, {
    headers: { Accept: "application/vnd.github.v3+json" },
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status}`);
  }

  return response.json();
}

export async function getLatestRelease(
  accessToken: string,
  owner: string,
  repo: string
): Promise<{ tag_name: string; name: string } | null> {
  const response = await fetch(
    `${GITHUB_API_URL}/repos/${owner}/${repo}/releases/latest`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github.v3+json",
      },
    }
  );

  if (!response.ok) return null;

  const data = await response.json();
  return { tag_name: data.tag_name, name: data.name };
}

export async function getRepoTags(
  accessToken: string,
  owner: string,
  repo: string
): Promise<{ name: string; commit: { sha: string } }[]> {
  const response = await fetch(
    `${GITHUB_API_URL}/repos/${owner}/${repo}/tags`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github.v3+json",
      },
    }
  );

  if (!response.ok) return [];

  return response.json();
}
