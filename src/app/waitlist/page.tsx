"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MailIcon, CheckIcon, TwitterIcon, GithubIcon } from "@/components/ui/icons";

export default function WaitlistPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const submitEmail = async () => {
    if (!email) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setSubmitted(true);
    setLoading(false);
  };

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <CheckIcon className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold">You're on the list!</h2>
              <p className="mt-2 text-muted-foreground">
                We'll notify you when ReleaseFlow launches. Check your inbox for confirmation.
              </p>
              <div className="mt-6 flex justify-center gap-4">
                <a
                  href="https://twitter.com/releaseflow"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border p-2 hover:bg-muted"
                >
                  <TwitterIcon className="h-5 w-5" />
                </a>
                <a
                  href="https://github.com/releaseflow"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border p-2 hover:bg-muted"
                >
                  <GithubIcon className="h-5 w-5" />
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Join the Waitlist</CardTitle>
          <CardDescription>
            Get early access to ReleaseFlow and exclusive launch updates
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitEmail()}
            />
            <Button onClick={submitEmail} disabled={!email || loading}>
              {loading ? "..." : "Join"}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Join 2,000+ developers on the waitlist. No spam, ever.
          </p>

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <a
              href="https://twitter.com/releaseflow"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-lg border py-2 text-sm hover:bg-muted"
            >
              <TwitterIcon className="h-4 w-4" />
              Follow on Twitter
            </a>
            <a
              href="https://github.com/releaseflow"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-lg border py-2 text-sm hover:bg-muted"
            >
              <GithubIcon className="h-4 w-4" />
              Star on GitHub
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}