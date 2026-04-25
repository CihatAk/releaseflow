"use client";

import { useState } from "react";
import Link from "next/link";
import { MessageSquareIcon, SendIcon, CheckIcon, Loader2Icon } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const CloseIcon = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

export default function FeedbackButton() {
  const [isOpen, setIsOpen] = useState(false);
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

      if (!res.ok) throw new Error("Failed to send");

      setSent(true);
      setMessage("");
      setName("");
      setEmail("");
      setTimeout(() => {
        setSent(false);
        setIsOpen(false);
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to send");
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-all hover:scale-105"
        title="Give Feedback"
      >
        <MessageSquareIcon className="h-6 w-6" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">Feedback</CardTitle>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded hover:bg-gray-100"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </CardHeader>
            <CardContent className="space-y-3">
              {sent ? (
                <div className="text-center py-8">
                  <div className="flex justify-center mb-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                      <CheckIcon className="h-8 w-8 text-green-500" />
                    </div>
                  </div>
                  <p className="text-green-600 font-medium">Thank you!</p>
                  <p className="text-sm text-gray-500">Your feedback has been received.</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Name (optional)"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="px-3 py-2 border rounded-lg text-sm"
                    />
                    <input
                      type="email"
                      placeholder="Email (optional)"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="px-3 py-2 border rounded-lg text-sm"
                    />
                  </div>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
                  >
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                  <textarea
                    placeholder="Your message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border rounded-lg text-sm resize-none"
                  />
                  {error && <p className="text-sm text-red-500">{error}</p>}
                  <Button onClick={handleSubmit} disabled={sending} className="w-full">
                    {sending ? (
                      <Loader2Icon className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <SendIcon className="h-4 w-4 mr-2" />
                    )}
                    {sending ? "Sending..." : "Send"}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}