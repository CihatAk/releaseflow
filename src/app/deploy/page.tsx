"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function DeployPage() {
  const [copied, setCopied] = useState(false);

  const copyDeployCode = () => {
    navigator.clipboard.writeText(DEPLOY_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="container mx-auto min-h-screen max-w-3xl px-4 py-12">
      <Link href="/dashboard">
        <Button variant="ghost" size="sm" className="mb-4">
          ← Back to Dashboard
        </Button>
      </Link>

      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">One-Click Deploy</h1>
          <p className="mt-2 text-muted-foreground">
            Deploy ReleaseFlow to Vercel with one click
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Vercel Deploy</CardTitle>
            <CardDescription>Click the button below to deploy to Vercel</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <a
              href="https://vercel.com/import/git?os=github&repo=releaseflow"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex"
            >
              <img
                src="https://vercel.com/button"
                alt="Deploy to Vercel"
                className="h-12"
              />
            </a>

            <div className="mt-8 rounded-lg bg-muted p-4">
              <p className="mb-2 text-sm font-medium">Or configure environment:</p>
              <pre className="overflow-x-auto text-xs text-muted-foreground">
                {`GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
NEXTAUTH_SECRET=your_secret
NEXTAUTH_URL=https://your-app.vercel.app`}
              </pre>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Environment Variables</CardTitle>
            <CardDescription>Required for production</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">GITHUB_CLIENT_ID</label>
                <p className="text-xs text-muted-foreground">From GitHub OAuth App</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">GITHUB_CLIENT_SECRET</label>
                <p className="text-xs text-muted-foreground">From GitHub OAuth App</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">NEXTAUTH_SECRET</label>
                <p className="text-xs text-muted-foreground">Run: openssl rand -base64 32</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">NEXTAUTH_URL</label>
                <p className="text-xs text-muted-foreground">Your Vercel deployment URL</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Docker Deploy</CardTitle>
            <CardDescription>Alternative: Run locally with Docker</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <pre className="rounded-lg bg-muted p-4 text-xs">
              {`# Build
docker build -t releaseflow .

# Run
docker run -p 3000:3000 \
  -e GITHUB_CLIENT_ID=your_client_id \
  -e GITHUB_CLIENT_SECRET=your_client_secret \
  -e NEXTAUTH_SECRET=your_secret_key \
  -e NEXTAUTH_URL=http://localhost:3000 \
  releaseflow`}
            </pre>
            <Button variant="outline" onClick={copyDeployCode}>
              {copied ? "Copied!" : "Copy Dockerfile"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

const DEPLOY_CODE = `FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY ./
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]`;