import { describe, it, expect } from "vitest";
import { parseCommitMessage, parseCommits, detectVersionBump, getNextVersion, computeChangelogStats, generateFormatMarkdown, generateMarkdown } from "./api";

describe("parseCommitMessage", () => {
  it("should parse feat commit", () => {
    const result = parseCommitMessage("feat: add new login page");
    expect(result.type).toBe("feat");
    expect(result.scope).toBeNull();
    expect(result.subject).toBe("add new login page");
    expect(result.breaking).toBe(false);
  });

  it("should parse fix commit with scope", () => {
    const result = parseCommitMessage("fix(auth): resolve login issue");
    expect(result.type).toBe("fix");
    expect(result.scope).toBe("auth");
    expect(result.subject).toBe("resolve login issue");
  });

  it("should parse commit with breaking bang", () => {
    const result = parseCommitMessage("feat!: remove deprecated API");
    expect(result.type).toBe("feat");
    expect(result.breaking).toBe(true);
  });

  it("should detect breaking change in body", () => {
    const result = parseCommitMessage("feat: change API response\n\nBREAKING CHANGE: response format changed");
    expect(result.breaking).toBe(true);
    expect(result.breakingNote).toBe("response format changed");
  });

  it("should parse commit with body", () => {
    const result = parseCommitMessage("feat: new feature\n\nThis is the body");
    expect(result.type).toBe("feat");
    expect(result.subject).toBe("new feature");
  });

  it("should return default for invalid commit", () => {
    const result = parseCommitMessage("invalid commit message");
    expect(result.type).toBe("其他");
  });

  it("should parse docs commit", () => {
    const result = parseCommitMessage("docs: update README");
    expect(result.type).toBe("docs");
  });

  it("should parse refactor commit", () => {
    const result = parseCommitMessage("refactor: simplify logic");
    expect(result.type).toBe("refactor");
  });

  it("should parse test commit", () => {
    const result = parseCommitMessage("test: add unit tests");
    expect(result.type).toBe("test");
  });

  it("should parse chore commit", () => {
    const result = parseCommitMessage("chore: update dependencies");
    expect(result.type).toBe("chore");
  });

  it("should parse security commit", () => {
    const result = parseCommitMessage("sec: fix XSS vulnerability");
    expect(result.type).toBe("sec");
  });

  it("should parse security as full word", () => {
    const result = parseCommitMessage("security: patch CVE-2024-1234");
    expect(result.type).toBe("sec");
  });

  it("should handle lowercase type", () => {
    const result = parseCommitMessage("FEAT: something");
    expect(result.type).toBe("feat");
  });
});

describe("parseCommits", () => {
  it("should parse array of commits", () => {
    const commits = [
      { sha: "abc123", message: "feat: add feature", author: { name: "Test", email: "test@test.com", date: "2024-01-01" } },
      { sha: "def456", message: "fix: bug fix", author: { name: "Test", email: "test@test.com", date: "2024-01-02" } },
    ];
    const result = parseCommits(commits as any);
    expect(result.length).toBeGreaterThan(0);
  });

  it("should return empty array for empty input", () => {
    const result = parseCommits([]);
    expect(result.length).toBe(0);
  });

  it("should group commits by type", () => {
    const commits = [
      { sha: "a1", message: "feat: add login", author: { name: "A", email: "a@a.com", date: "2024-01-01" } },
      { sha: "a2", message: "feat: add logout", author: { name: "B", email: "b@b.com", date: "2024-01-02" } },
      { sha: "a3", message: "fix: bug", author: { name: "A", email: "a@a.com", date: "2024-01-03" } },
    ];
    const result = parseCommits(commits as any);
    const featSection = result.find((s) => s.type === "feat");
    expect(featSection?.commits.length).toBe(2);
    expect(result.find((s) => s.type === "fix")?.commits.length).toBe(1);
  });

  it("should separate breaking changes", () => {
    const commits = [
      { sha: "a1", message: "feat!: breaking change", author: { name: "A", email: "a@a.com", date: "2024-01-01" } },
      { sha: "a2", message: "feat: normal feature", author: { name: "B", email: "b@b.com", date: "2024-01-02" } },
    ];
    const result = parseCommits(commits as any);
    const breakingSection = result.find((s) => s.label === "Breaking Changes");
    expect(breakingSection?.commits.length).toBe(1);
  });
});

describe("detectVersionBump", () => {
  it("should return major for breaking changes", () => {
    const commits = [{ type: "feat" as const, breaking: true, message: "break", sha: "a", author: "a", date: "d" }];
    expect(detectVersionBump(commits)).toBe("major");
  });

  it("should return minor for features", () => {
    const commits = [{ type: "feat" as const, breaking: false, message: "feat", sha: "a", author: "a", date: "d" }];
    expect(detectVersionBump(commits)).toBe("minor");
  });

  it("should return patch for fixes", () => {
    const commits = [{ type: "fix" as const, breaking: false, message: "fix", sha: "a", author: "a", date: "d" }];
    expect(detectVersionBump(commits)).toBe("patch");
  });

  it("should return none for chores", () => {
    const commits = [{ type: "chore" as const, breaking: false, message: "chore", sha: "a", author: "a", date: "d" }];
    expect(detectVersionBump(commits)).toBe("none");
  });
});

describe("getNextVersion", () => {
  it("should bump major", () => {
    expect(getNextVersion("v1.2.3", "major")).toBe("v2.0.0");
  });

  it("should bump minor", () => {
    expect(getNextVersion("v1.2.3", "minor")).toBe("v1.3.0");
  });

  it("should bump patch", () => {
    expect(getNextVersion("v1.2.3", "patch")).toBe("v1.2.4");
  });

  it("should return same version for none", () => {
    expect(getNextVersion("v1.2.3", "none")).toBe("v1.2.3");
  });

  it("should handle version without v prefix", () => {
    expect(getNextVersion("1.0.0", "minor")).toBe("v1.1.0");
  });
});

describe("computeChangelogStats", () => {
  it("should compute stats correctly", () => {
    const sections = [
      { type: "feat" as const, label: "Features", icon: "🚀", commits: [
        { type: "feat" as const, scope: "auth", message: "add login", sha: "a1", author: "Alice", date: "d1", breaking: false },
        { type: "feat" as const, scope: "auth", message: "add logout", sha: "a2", author: "Bob", date: "d2", breaking: false },
      ]},
      { type: "fix" as const, label: "Bug Fixes", icon: "🐛", commits: [
        { type: "fix" as const, scope: null, message: "fix bug", sha: "a3", author: "Alice", date: "d3", breaking: false },
      ]},
    ];
    const stats = computeChangelogStats(sections);
    expect(stats.totalCommits).toBe(3);
    expect(stats.contributors).toBe(2);
    expect(stats.scopes).toBe(1);
    expect(stats.breakingChanges).toBe(0);
    expect(stats.typeCounts.feat).toBe(2);
    expect(stats.typeCounts.fix).toBe(1);
  });
});

describe("generateFormatMarkdown", () => {
  it("should generate default format", () => {
    const sections = [
      { type: "feat" as const, label: "Features", icon: "🚀", commits: [
        { type: "feat" as const, scope: null, message: "add feature", sha: "abc1234", author: "Test", date: "2024-01-01", breaking: false },
      ]},
    ];
    const md = generateFormatMarkdown(sections, "default");
    expect(md).toContain("add feature");
    expect(md).toContain("Features");
  });

  it("should generate simple format", () => {
    const sections = [
      { type: "feat" as const, label: "Features", icon: "🚀", commits: [
        { type: "feat" as const, scope: null, message: "add feature", sha: "abc1234", author: "Test", date: "2024-01-01", breaking: false },
      ]},
    ];
    const md = generateFormatMarkdown(sections, "simple");
    expect(md).toContain("add feature");
    expect(md).not.toContain("abc1234");
  });

  it("should generate github-release format", () => {
    const sections = [
      { type: "feat" as const, label: "Features", icon: "🚀", commits: [
        { type: "feat" as const, scope: null, message: "add feature", sha: "abc1234", author: "Test", date: "2024-01-01", breaking: false },
      ]},
    ];
    const md = generateFormatMarkdown(sections, "github-release");
    expect(md).toContain("What's Changed");
  });
});

describe("generateMarkdown", () => {
  it("should be alias for default format", () => {
    const sections: any[] = [];
    expect(generateMarkdown(sections)).toBe(generateFormatMarkdown(sections, "default"));
  });
});
