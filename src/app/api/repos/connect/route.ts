import { NextRequest, NextResponse } from "next/server";

// Simple repo connection - works without Supabase
export async function POST(request: NextRequest) {
  try {
    const { repoId, name, fullName, owner, isPrivate, description } = await request.json();

    const token = request.cookies.get("github_token")?.value;
    
    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // For now, just return success and redirect to the repo detail page
    // Database storage will be added when Supabase is configured
    return NextResponse.json({ 
      success: true, 
      repoId: repoId,
      redirectUrl: `/dashboard/${repoId}`
    });
  } catch (error) {
    console.error("Repo connect error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}