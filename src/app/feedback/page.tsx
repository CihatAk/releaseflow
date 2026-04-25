"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeftIcon,
  MessageSquareIcon,
  SendIcon,
  CheckIcon,
  Loader2Icon,
} from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

export default function FeedbackPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState("feedback");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const categories = [
    { value: "feedback", label: "General Feedback" },
    { value: "feature", label: "Feature Request" },
    { value: "bug", label: "Bug Report" },
    { value: "pricing", label: "Pricing" },
    { value: "other", label: "Other" },
  ];

  const handleSubmit = async () => {
    if (!message.trim()) {
      setError("Please enter a message");
      return;
    }

    setSending(true);
    setError("");

    try {
      const res = await fetch("/api/admin/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: name.trim() || "Anonymous",
          email: email.trim(),
          category,
          message: message.trim() 
        }),
      });

      if (!res.ok) throw new Error("Failed to send message");

      setSent(true);
      setMessage("");
      setName("");
      setEmail("");
      setTimeout(() => setSent(false), 5000);
    } catch (err: any) {
      setError(err.message || "Failed to send");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard" className="p-2 rounded-lg hover:bg-gray-100">
            <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Feedback</h1>
            <p className="text-gray-600">Share your thoughts with us</p>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquareIcon className="h-5 w-5" />
              Feedback Form
            </CardTitle>
            <CardDescription>
              Share your suggestions, report bugs, or request new features.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Name (optional)</label>
                <Input
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Email (optional)</label>
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg bg-white"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>
            <Textarea
              placeholder="Write your message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
            />
            
            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}

            <Button onClick={handleSubmit} disabled={sending} className="w-full">
              {sending ? (
                <Loader2Icon className="h-4 w-4 animate-spin mr-2" />
              ) : sent ? (
                <CheckIcon className="h-4 w-4 mr-2" />
              ) : (
                <SendIcon className="h-4 w-4 mr-2" />
              )}
              {sending ? "Sending..." : sent ? "Sent!" : "Send"}
            </Button>

            {sent && (
              <p className="text-sm text-green-600 text-center">
                Thank you! Your feedback has been received.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>What you can share</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <CheckIcon className="h-4 w-4 text-green-500 mt-0.5" />
                Feature requests
              </li>
              <li className="flex items-start gap-2">
                <CheckIcon className="h-4 w-4 text-green-500 mt-0.5" />
                Bug reports
              </li>
              <li className="flex items-start gap-2">
                <CheckIcon className="h-4 w-4 text-green-500 mt-0.5" />
                General improvement suggestions
              </li>
              <li className="flex items-start gap-2">
                <CheckIcon className="h-4 w-4 text-green-500 mt-0.5" />
                Pricing feedback
              </li>
            </ul>
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-sm text-gray-500">
          <Link href="/privacy-policy" className="underline hover:text-gray-700">
            Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  );
}