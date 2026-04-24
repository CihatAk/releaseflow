import { NextRequest, NextResponse } from "next/server";

interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  timestamp: string;
}

const activityLogs: ActivityLog[] = [];

const ACTIONS: Record<string, string> = {
  "changelog.generated": "Generated changelog",
  "changelog.exported": "Exported changelog",
  "changelog.published": "Published changelog",
  "repo.connected": "Connected repository",
  "repo.disconnected": "Disconnected repository",
  "integration.added": "Added integration",
  "integration.removed": "Removed integration",
  "team.member_added": "Added team member",
  "team.member_removed": "Removed team member",
  "settings.updated": "Updated settings",
  "plan.upgraded": "Upgraded plan",
  "payment.checkout": "Started checkout",
  "payment.success": "Payment successful",
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || "50");
  const action = searchParams.get("action");
  const userId = searchParams.get("userId");
  
  let logs = [...activityLogs].reverse();
  
  if (action) {
    logs = logs.filter(l => l.action === action);
  }
  if (userId) {
    logs = logs.filter(l => l.userId === userId);
  }
  
  return NextResponse.json({
    logs: logs.slice(0, limit),
    total: logs.length,
    actions: ACTIONS,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, userId, userName, details } = body;
    
    if (!action || !userId) {
      return NextResponse.json({ error: "action and userId required" }, { status: 400 });
    }
    
    const log: ActivityLog = {
      id: `log_${Date.now()}`,
      userId,
      userName: userName || "Unknown",
      action,
      details: details || ACTIONS[action] || action,
      timestamp: new Date().toISOString(),
    };
    
    activityLogs.unshift(log);
    
    if (activityLogs.length > 1000) {
      activityLogs.length = 1000;
    }
    
    return NextResponse.json({
      success: true,
      log,
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to log activity" }, { status: 500 });
  }
}