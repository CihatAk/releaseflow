import { NextResponse } from "next/server";
import { getConnectionInfo } from "@/lib/supabase/client";
import { createServerClient } from "@/lib/supabase/client";

export async function GET() {
  const info = getConnectionInfo();

  if (!info.configured) {
    return NextResponse.json({
      configured: false,
      url: null,
      hasAnonKey: false,
      message: "Supabase not configured",
    });
  }

  const supabase = createServerClient();
  
  try {
    const result = await supabase?.from("profiles").select("id").limit(1);
    const error = result?.error;
    
    return NextResponse.json({
      configured: true,
      url: info.url,
      hasAnonKey: info.hasAnonKey,
      connected: !error,
      message: error ? error.message : "Connected",
    });
  } catch (error: any) {
    return NextResponse.json({
      configured: true,
      url: info.url,
      hasAnonKey: info.hasAnonKey,
      connected: false,
      message: error.message || "Connection failed",
    });
  }
}