import { NextRequest, NextResponse } from "next/server";

const rateLimitStore = new Map<string, { count: number; resetTime: number; plan: string }>();

const PLANS = {
  free: { generate: 30, api: 100, export: 10 },
  pro: { generate: 300, api: 1000, export: 100 },
  team: { generate: 3000, api: 10000, export: 1000 },
};

export async function GET(request: NextRequest) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "") || 
                request.cookies.get("github_token")?.value;
  
  const plan = "free";
  const limits = PLANS[plan as keyof typeof PLANS] || PLANS.free;
  
  const clientKey = request.headers.get("x-forwarded-for") || "unknown";
  const stats = rateLimitStore.get(clientKey) || { count: 0, resetTime: Date.now() + 60000, plan };
  
  return NextResponse.json({
    plan,
    limits: {
      generate: limits.generate,
      api: limits.api,
      export: limits.export,
    },
    usage: {
      remaining: limits.generate - stats.count,
      resetIn: Math.max(0, Math.floor((stats.resetTime - Date.now()) / 1000)),
    },
    endpoints: {
      generate: "POST /api/changelog/generate",
      export: "POST /api/changelog/export",
      batch: "POST /api/changelog/batch",
      badge: "GET /api/changelog/badge/:slug",
    },
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { action, endpoint } = body;
  
  if (action === "check") {
    const clientKey = request.headers.get("x-forwarded-for") || "unknown";
    const stats = rateLimitStore.get(clientKey);
    
    if (stats && Date.now() < stats.resetTime && stats.count >= PLANS.free.generate) {
      return NextResponse.json({
        limited: true,
        retryAfter: Math.floor((stats.resetTime - Date.now()) / 1000),
      }, { status: 429 });
    }
    
    return NextResponse.json({ limited: false });
  }
  
  if (action === "increment") {
    const clientKey = request.headers.get("x-forwarded-for") || "unknown";
    const stats = rateLimitStore.get(clientKey) || { count: 0, resetTime: Date.now() + 60000, plan: "free" };
    
    stats.count++;
    rateLimitStore.set(clientKey, stats);
    
    return NextResponse.json({
      success: true,
      remaining: PLANS.free.generate - stats.count,
    });
  }
  
  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}