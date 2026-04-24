import { NextRequest, NextResponse } from "next/server";
import type { NextFetchEvent } from "next/server";

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  message?: string;
}

const RATE_LIMITS: Record<string, RateLimitConfig> = {
  default: { windowMs: 60 * 1000, maxRequests: 60 },
  auth: { windowMs: 15 * 60 * 1000, maxRequests: 5 },
  api: { windowMs: 60 * 1000, maxRequests: 100 },
  generate: { windowMs: 60 * 1000, maxRequests: 30 },
};

const inMemoryStore = new Map<
  string,
  { count: number; resetTime: number; lockedUntil?: number }
>();

function getClientKey(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0] : "unknown";
  return ip;
}

function isRateLimited(key: string, config: RateLimitConfig, isAuth: boolean): boolean {
  const now = Date.now();
  const record = inMemoryStore.get(key);

  if (record?.lockedUntil && now < record.lockedUntil) {
    return true;
  }

  if (!record || now > record.resetTime) {
    inMemoryStore.set(key, {
      count: 1,
      resetTime: now + config.windowMs,
    });
    return false;
  }

  if (record.count >= config.maxRequests) {
    if (isAuth) {
      const newCount = record.count + 1;
      if (newCount >= config.maxRequests + 3) {
        record.lockedUntil = now + 60 * 60 * 1000;
        console.log(`[SECURITY] Account locked for IP: ${key}`);
      }
    }
    return true;
  }

  record.count++;
  return false;
}

function getRateLimitConfig(pathname: string): RateLimitConfig {
  if (pathname.startsWith("/api/auth") || pathname === "/login") {
    return RATE_LIMITS.auth;
  }
  if (pathname.startsWith("/api/changelog/generate")) {
    return RATE_LIMITS.generate;
  }
  if (pathname.startsWith("/api")) {
    return RATE_LIMITS.api;
  }
  return RATE_LIMITS.default;
}

function generateNonce(): string {
  return Buffer.from(crypto.randomUUID()).toString("base64");
}

export async function middleware(
  request: NextRequest,
  event: NextFetchEvent
): Promise<NextResponse> {
  const url = new URL(request.url);
  const clientKey = getClientKey(request);
  const isAuth =
    url.pathname.startsWith("/api/auth") || url.pathname === "/login";
  const config = getRateLimitConfig(url.pathname);

  if (isAuth) {
    const isLimited = isRateLimited(clientKey, config, isAuth);
    if (isLimited) {
      return NextResponse.json(
        {
          error: "Too many requests",
          message: `Rate limit exceeded. Try again in ${Math.ceil(config.windowMs / 1000)} seconds.`,
          retryAfter: Math.ceil(config.windowMs / 1000),
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil(config.windowMs / 1000)),
            "X-RateLimit-Limit": String(config.maxRequests),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(Date.now() + config.windowMs),
          },
        }
      );
    }
  }

  const response = NextResponse.next();

  const securityHeaders: Record<string, string> = {
    "X-Frame-Options": "DENY",
    "X-Content-Type-Options": "nosniff",
    "X-XSS-Protection": "1; mode=block",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "geolocation=(), microphone=(), camera=(), payment=()",
  };

  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  const isDev = process.env.NODE_ENV === "development";

  const cspScriptSrc = isDev
    ? "script-src 'self' 'unsafe-eval' 'unsafe-inline'"
    : "script-src 'self' 'unsafe-inline' https://github.com https://github.com/login/oauth";

  const csp = [
    "default-src 'self'",
    cspScriptSrc,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' blob: data: https:",
    "font-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self' https://github.com",
    "frame-ancestors 'none'",
    "connect-src 'self' https://github.com",
  ].join("; ");

  response.headers.set("Content-Security-Policy", csp);

  if (url.protocol === "http:" && url.hostname !== "localhost") {
    const httpsUrl = "https://" + url.host + url.pathname + url.search;
    return NextResponse.redirect(httpsUrl, request);
  }

  response.headers.set("X-RateLimit-Limit", String(config.maxRequests));
  response.headers.set(
    "X-RateLimit-Remaining",
    String(
      Math.max(
        0,
        config.maxRequests -
          (inMemoryStore.get(clientKey)?.count || 0)
      )
    )
  );

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};