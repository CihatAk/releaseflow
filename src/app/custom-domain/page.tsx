"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeftIcon, GlobeIcon, CheckIcon, Loader2Icon, CopyIcon } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface DomainConfig {
  domain: string;
  status: string;
  target: string;
  cnameRecord: string;
}

export default function CustomDomainPage() {
  const [domain, setDomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState<DomainConfig | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const configureDomain = async () => {
    if (!domain) {
      setError("Please enter a domain");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/custom-domain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain }),
      });

      const data = await response.json();

      if (data.success) {
        setConfig({
          domain: data.domain,
          status: "configured",
          target: data.target,
          cnameRecord: data.cname_record,
        });
      } else {
        setError(data.error || "Failed to configure");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyRecord = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard" className="p-2 rounded-lg hover:bg-gray-100">
            <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Custom Domain</h1>
            <p className="text-gray-600">Use your own domain for changelogs</p>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GlobeIcon className="h-5 w-5" />
              Add Custom Domain
            </CardTitle>
            <CardDescription>
              Connect your own domain (e.g., changelog.yourcompany.com)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="changelog.yourcompany.com"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
            />
            <Button onClick={configureDomain} disabled={loading}>
              {loading ? <Loader2Icon className="h-4 w-4 animate-spin mr-2" /> : null}
              {loading ? "Configuring..." : "Configure Domain"}
            </Button>
          </CardContent>
        </Card>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {config && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckIcon className="h-5 w-5 text-green-500" />
                Domain Configured!
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="font-medium text-green-700">Your domain: {config.domain}</p>
                <p className="text-sm text-green-600">Status: {config.status}</p>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">DNS Records to add:</p>
                <div className="bg-gray-100 p-3 rounded-lg font-mono text-sm space-y-2">
                  <p>{config.cnameRecord || "CNAME @ → releaseflow-fawn.vercel.app"}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2"
                  onClick={() => copyRecord(config.cnameRecord || "CNAME @ → releaseflow-fawn.vercel.app")}
                >
                  {copied ? <CheckIcon className="h-4 w-4" /> : <CopyIcon className="h-4 w-4" />}
                  {copied ? "Copied!" : "Copy"}
                </Button>
              </div>

              <div className="text-sm text-gray-500">
                <p>1. Go to your domain provider (GoDaddy, Cloudflare, etc.)</p>
                <p>2. Add the CNAME record above</p>
                <p>3. Wait up to 24 hours for DNS propagation</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}