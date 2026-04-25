-- Create migration table
CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
    "id" VARCHAR(36) PRIMARY KEY,
    "checksum" VARCHAR(64) NOT NULL,
    "finished_at" TIMESTAMP,
    "migration_name" VARCHAR(255) NOT NULL,
    "logs" TEXT,
    "rolled_back_at" TIMESTAMP,
    "started_at" TIMESTAMP NOT NULL DEFAULT NOW(),
    "applied_steps_count" INTEGER NOT NULL DEFAULT 0,
    "error_code" VARCHAR(32),
    "error" TEXT
);

-- User table
CREATE TABLE IF NOT EXISTS "User" (
    id TEXT PRIMARY KEY,
    github_id INTEGER UNIQUE,
    username VARCHAR(255) NOT NULL,
    email TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    last_login TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Repo table
CREATE TABLE IF NOT EXISTS "Repo" (
    id TEXT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) UNIQUE NOT NULL,
    owner VARCHAR(255) NOT NULL,
    private BOOLEAN DEFAULT false,
    github_token TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    user_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Changelog table
CREATE TABLE IF NOT EXISTS "Changelog" (
    id TEXT PRIMARY KEY,
    version VARCHAR(255) NOT NULL,
    content TEXT,
    published BOOLEAN DEFAULT false,
    slug TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    repo_id TEXT NOT NULL REFERENCES "Repo"(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Feedback table
CREATE TABLE IF NOT EXISTS "Feedback" (
    id TEXT PRIMARY KEY,
    name VARCHAR(255) DEFAULT 'Anonymous',
    email TEXT,
    category VARCHAR(255) DEFAULT 'feedback',
    message TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Settings table
CREATE TABLE IF NOT EXISTS "Settings" (
    id TEXT PRIMARY KEY,
    githubToken TEXT,
    autoPublish BOOLEAN DEFAULT false,
    defaultFormat VARCHAR(255) DEFAULT 'markdown',
    webhookUrl TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);