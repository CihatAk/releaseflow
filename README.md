# ReleaseFlow

Auto-generate beautiful changelogs from GitHub conventional commits.

<p align="center">
  <a href="https://releaseflow.dev">
    <img src="https://releaseflow.dev/og-image.svg" alt="ReleaseFlow" width="600" />
  </a>
</p>

## Features

- **Automatic Changelog Generation** - Generate changelogs from GitHub commits using conventional commits
- **Multiple Export Formats** - Markdown, HTML, JSON, RSS, Dev.to, Newsletter
- **GitHub Integration** - OAuth login, automatic releases
- **Template System** - Customizable templates
- **Team Collaboration** - Role-based access control
- **Analytics** - Track changelog usage and contributor stats
- **Integrations** - Jira, Linear, Slack, Discord, Zapier
- **CLI Tool** - Command-line interface
- **GitHub Action** - CI/CD integration

## Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/your-username/releaseflow.git
cd releaseflow
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

Copy the example environment file:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your credentials:

```env
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
NEXTAUTH_SECRET=your_secret_key
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 4. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deployment

### Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/import/git)

### Docker

```bash
# Build
docker build -t releaseflow .

# Run
docker run -p 3000:3000 \
  -e GITHUB_CLIENT_ID=xxx \
  -e GITHUB_CLIENT_SECRET=xxx \
  -e NEXTAUTH_SECRET=xxx \
  -e NEXTAUTH_URL=http://localhost:3000 \
  releaseflow
```

## Usage

### Generate Changelog

1. Connect your GitHub repository via OAuth
2. Select a repository from the dashboard
3. Click "Generate Changelog"
4. Customize the output using templates
5. Export in your preferred format

### Using the API

```bash
# Generate changelog
curl -X POST https://releaseflow.dev/api/changelog/generate \
  -H "Content-Type: application/json" \
  -d '{"owner": "facebook", "repo": "react", "token": "your_github_token"}'

# Quick generate (public repo)
curl "https://releaseflow.dev/api/changelog/quick?owner=facebook&repo=react"
```

### Using the CLI

```bash
# Install CLI
npm install -g releaseflow

# Generate changelog
releaseflow generate owner/repo

# Export to file
releaseflow generate owner/repo --output changelog.md

# Custom template
releaseflow generate owner/repo --template custom
```

### GitHub Action

```yaml
name: Generate Changelog

on:
  release:
    types: [published]

jobs:
  changelog:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Generate Changelog
        uses: releaseflow/action@v1
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GITHUB_CLIENT_ID` | GitHub OAuth App Client ID | Yes |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth App Client Secret | Yes |
| `NEXTAUTH_SECRET` | NextAuth.js secret (run `openssl rand -base64 32`) | Yes |
| `NEXTAUTH_URL` | Production URL | Yes |
| `NEXT_PUBLIC_SITE_URL` | Public site URL | No |
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry DSN for error tracking | No |
| `SUPABASE_URL` | Supabase URL | No |
| `SUPABASE_ANON_KEY` | Supabase anon key | No |
| `STRIPE_SECRET_KEY` | Stripe secret key | No |

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (optional)
- **Auth**: NextAuth.js (GitHub OAuth)
- **Payments**: Stripe
- **Testing**: Vitest + Playwright
- **Error Tracking**: Sentry

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (`npm test`)
5. Commit your changes (`git commit -m 'feat: add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## License

MIT License - see [LICENSE](LICENSE) for details.

## Support

- [Documentation](https://releaseflow.dev/docs)
- [Discord Community](https://discord.gg/releaseflow)
- [Twitter](https://twitter.com/releaseflow)

---

<p align="center">Made with ❤️ by <a href="https://releaseflow.dev">ReleaseFlow</a></p>