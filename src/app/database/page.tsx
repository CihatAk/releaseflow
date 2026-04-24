"use client";

import { getSupabaseClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Loader2Icon, CheckIcon, AlertCircleIcon, SaveIcon } from "@/components/ui/icons";

interface SupabaseStatus {
  configured: boolean;
  url: string | null;
  hasAnonKey: boolean;
}

export default function DatabaseSettingsPage() {
  const [checking, setChecking] = useState(false);
  const [status, setStatus] = useState<SupabaseStatus | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "success" | "error">("idle");

  const checkConnection = async () => {
    setChecking(true);
    setConnectionStatus("idle");

    try {
      const response = await fetch("/api/db/status");
      const data = await response.json();
      setStatus({
        configured: data.configured,
        url: data.url,
        hasAnonKey: data.hasAnonKey,
      });
      setConnectionStatus(data.configured ? "success" : "error");
    } catch {
      setConnectionStatus("error");
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SaveIcon className="h-5 w-5" />
              Database Configuration
            </CardTitle>
            <CardDescription>
              Supabase database connection status
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={checkConnection} disabled={checking}>
              {checking ? (
                <>
                  <Loader2Icon className="h-4 w-4 animate-spin mr-2" />
                  Checking...
                </>
              ) : (
                "Check Connection"
              )}
            </Button>

            {connectionStatus !== "idle" && (
              <div className={`p-4 rounded-lg ${
                connectionStatus === "success" ? "bg-green-50" : "bg-red-50"
              }`}>
                <div className="flex items-center gap-2">
                  {connectionStatus === "success" ? (
                    <CheckIcon className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircleIcon className="h-5 w-5 text-red-600" />
                  )}
                  <span className={connectionStatus === "success" ? "text-green-700" : "text-red-700"}>
                    {connectionStatus === "success" 
                      ? "Database connected successfully!" 
                      : "Database not configured. Please add environment variables."}
                  </span>
                </div>
              </div>
            )}

            {status && (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">URL:</span>
                  <span className="font-mono">{status.url || "Not set"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">API Key:</span>
                  <span>{status.hasAnonKey ? "✅ Configured" : "❌ Missing"}</span>
                </div>
              </div>
            )}

            <div className="mt-4 pt-4 border-t">
              <h3 className="font-medium mb-2">Environment Variables</h3>
              <p className="text-sm text-gray-500 mb-2">
                Add these to your Vercel project settings:
              </p>
              <div className="bg-gray-100 p-3 rounded font-mono text-xs space-y-1">
                <div>NEXT_PUBLIC_SUPABASE_URL=your_url</div>
                <div>NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}