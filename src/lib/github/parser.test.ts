import { describe, it, expect } from "vitest";
import { parseCommitMessage, parseCommits } from "./api";

describe("parseCommitMessage", () => {
  it("should parse feat commit", () => {
    const result = parseCommitMessage("feat: add new login page");
    expect(result.type).toBe("feat");
    expect(result.scope).toBeNull();
    expect(result.subject).toBe("add new login page");
  });

  it("should parse fix commit with scope", () => {
    const result = parseCommitMessage("fix(auth): resolve login issue");
    expect(result.type).toBe("fix");
    expect(result.scope).toBe("auth");
    expect(result.subject).toBe("resolve login issue");
  });

  it("should parse commit with breaking change", () => {
    const result = parseCommitMessage("feat!: remove deprecated API");
    expect(result.type).toBe("feat");
    expect(result.breaking).toBe(true);
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
});