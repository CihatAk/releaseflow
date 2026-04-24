const GITHUB_API_URL = "https://api.github.com";

export interface GithubCommit {
  sha: string;
  message: string;
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
  sha: string;
  author: string;
  date: string;
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
  other: { label: "Other Changes", icon: "📌" },
};

const COMMIT_TYPE_LABELS: Record<CommitType, { label: string; icon: string }> = {
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
  其他: { label: "Other Changes", icon: "📌" },
};

let customCommitTypes: Record<string, { label: string; icon: string }> = {};
let customEmojiMapping: EmojiMapping = {};

export type VersionBump = "major" | "minor" | "patch" | "none";

export function detectVersionBump(commits: ParsedCommit[]): VersionBump {
  const hasMajor = commits.some(c => 
    c.breaking || 
    c.message.toLowerCase().includes("breaking") ||
    /^BREAKING/i.test(c.message)
  );

  if (hasMajor) return "major";

  const hasFeat = commits.some(c => c.type === "feat" || /^feat[:\(]/.test(c.message));
  const hasFix = commits.some(c => c.type === "fix" || /^fix[:\(]/.test(c.message));

  if (hasFeat) return "minor";
  if (hasFix) return "patch";

  return "none";
}

export function getNextVersion(currentVersion: string, bump: VersionBump): string {
  if (bump === "none") return currentVersion;

  const parts = currentVersion.replace(/^v/, "").split(".").map(Number);
  if (parts.length < 3) parts.push(0, 0, 0);

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

const CONVENTIONAL_COMMIT_REGEX =
  /^(\w+)(?:\(([^)]+)\))?(!)?:\s*(.+)$/i;

export function parseCommitMessage(message: string): {
  type: CommitType;
  scope: string | null;
  breaking: boolean;
  subject: string;
} {
  const lines = message.split("\n");
  const firstLine = lines[0].trim();

  const match = firstLine.match(CONVENTIONAL_COMMIT_REGEX);

  if (match) {
    const [, type, scope, breaking, subject] = match;
    return {
      type: type.toLowerCase() as CommitType,
      scope: scope || null,
      breaking: breaking === "!" || subject.toLowerCase().includes("breaking"),
      subject: subject.trim(),
    };
  }

  return {
    type: "其他",
    scope: null,
    breaking: false,
    subject: firstLine,
  };
}

export function parseCommits(commits: GithubCommit[]): ChangelogSection[] {
  const parsedCommits: ParsedCommit[] = commits.map((commit) => {
    const { type, scope, breaking, subject } = parseCommitMessage(
      commit.message
    );
    return {
      type,
      scope,
      breaking,
      message: subject,
      sha: commit.sha,
      author: commit.author.name,
      date: commit.author.date,
    };
  });

  const sections: ChangelogSection[] = [];
  const sectionMap = new Map<CommitType, ChangelogSection>();

  for (const commit of parsedCommits) {
    if (!sectionMap.has(commit.type)) {
      const typeInfo = COMMIT_TYPE_LABELS[commit.type];
      sectionMap.set(commit.type, {
        type: commit.type,
        label: typeInfo.label,
        icon: typeInfo.icon,
        commits: [],
      });
    }
    sectionMap.get(commit.type)!.commits.push(commit);
  }

  const typeOrder: CommitType[] = [
    "feat",
    "fix",
    "perf",
    "refactor",
    "docs",
    "style",
    "test",
    "build",
    "ci",
    "chore",
    "revert",
    "其他",
  ];

  for (const type of typeOrder) {
    const section = sectionMap.get(type);
    if (section && section.commits.length > 0) {
      if (section.type === "feat" || section.type === "fix") {
        if (section.commits.some((c) => c.breaking)) {
          const breakingCommits = section.commits.filter((c) => c.breaking);
          const nonBreakingCommits = section.commits.filter((c) => !c.breaking);

          if (breakingCommits.length > 0) {
            sections.push({
              ...section,
              commits: breakingCommits,
              label: `⚠️ ${section.label} (Breaking Changes)`,
              type: "其他",
            });
          }
          if (nonBreakingCommits.length > 0) {
            sections.push(section);
          }
        } else {
          sections.push(section);
        }
      } else {
        sections.push(section);
      }
    }
  }

  return sections;
}

export function generateMarkdown(sections: ChangelogSection[]): string {
  return generateFormatMarkdown(sections, "default");
}

export type ChangelogFormat = "default" | "keepachangelog" | "standardversion" | "simple";

export function generateFormatMarkdown(sections: ChangelogSection[], format: ChangelogFormat = "default"): string {
  const today = new Date().toISOString().split("T")[0];

  switch (format) {
    case "keepachangelog":
      return generateKeepAChangelogFormat(sections, today);
    case "standardversion":
      return generateStandardVersionFormat(sections, today);
    case "simple":
      return generateSimpleFormat(sections);
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
    lines.push(`### ${section.icon} ${section.label}`);
    lines.push("");

    for (const commit of section.commits) {
      const scope = commit.scope ? `**${commit.scope}:** ` : "";
      const sha = commit.sha.substring(0, 7);
      const authorRef = commit.author ? ` (@${commit.author})` : "";
      lines.push(`- ${scope}${commit.message} (${sha})${authorRef}`);
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

  // Group sections by importance
  const importantTypes = ["feat", "fix", "perf"];
  const breakingChanges: ParsedCommit[] = [];
  
  for (const section of sections) {
    if (importantTypes.includes(section.type)) {
      const sectionBreaks = section.commits.filter(c => c.breaking);
      const sectionNonBreaks = section.commits.filter(c => !c.breaking);
      
      if (sectionBreaks.length > 0) {
        lines.push(`### [Changed] - Breaking Changes in ${section.label}`);
        lines.push("");
        for (const commit of sectionBreaks) {
          lines.push(`- ${commit.scope ? `**${commit.scope}:** ` : ""}${commit.message} [${commit.sha.substring(0, 7)}]`);
        }
        lines.push("");
      }
      
      lines.push(`### ${section.label}`);
      lines.push("");
      for (const commit of sectionNonBreaks) {
        lines.push(`- ${commit.scope ? `**${commit.scope}:** ` : ""}${commit.message} [${commit.sha.substring(0, 7)}]`);
      }
      lines.push("");
    } else {
      lines.push(`### ${section.label}`);
      lines.push("");
      for (const commit of section.commits) {
        lines.push(`- ${commit.scope ? `**${commit.scope}:** ` : ""}${commit.message} [${commit.sha.substring(0, 7)}]`);
      }
      lines.push("");
    }
  }

  return lines.join("\n");
}

function generateStandardVersionFormat(sections: ChangelogSection[], today: string): string {
  const lines: string[] = [];
  
  lines.push(`# Changelog`);
  lines.push("");

  const versionSections: string[] = [];
  
  for (const section of sections) {
    if (section.commits.length === 0) continue;
    
    const commitLines: string[] = [];
    for (const commit of section.commits) {
      const scope = commit.scope ? `(${commit.scope})` : "";
      const breaking = commit.breaking ? "!" : "";
      commitLines.push(`  * ${section.type}${breaking}${scope}: ${commit.message} (${commit.sha.substring(0, 7)})`);
    }
    
    versionSections.push(`## [${section.type.toUpperCase()}] ${section.label}`);
    versionSections.push("");
    versionSections.push(...commitLines);
    versionSections.push("");
  }

  lines.push(...versionSections);

  return lines.join("\n");
}

function generateSimpleFormat(sections: ChangelogSection[]): string {
  const lines: string[] = [];
  lines.push("# Recent Changes");
  lines.push("");

  for (const section of sections) {
    lines.push(`### ${section.label}`);
    lines.push("");
    for (const commit of section.commits) {
      lines.push(`- ${commit.message}`);
    }
    lines.push("");
  }

  return lines.join("\n");
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
  perPage: number = 100
): Promise<GithubCommit[]> {
  const response = await fetch(
    `${GITHUB_API_URL}/repos/${owner}/${repo}/commits?per_page=${perPage}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github.v3+json",
      },
      next: { revalidate: 30 },
    }
  );

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
  perPage: number = 100
): Promise<GithubCommit[]> {
  const response = await fetch(
    `${GITHUB_API_URL}/repos/${owner}/${repo}/commits?per_page=${perPage}`,
    {
      headers: {
        Accept: "application/vnd.github.v3+json",
      },
      next: { revalidate: 30 },
    }
  );

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
  const response = await fetch(
    `${GITHUB_API_URL}/repos/${owner}/${repo}`,
    {
      headers: {
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