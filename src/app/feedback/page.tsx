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

export default function FeedbackPage() {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!message.trim()) {
      setError("Lütfen bir mesaj yazın");
      return;
    }

    setSending(true);
    setError("");

    try {
      const res = await fetch("/api/admin/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: message.trim() }),
      });

      if (!res.ok) throw new Error("Mesaj gönnerilemedi");

      setSent(true);
      setMessage("");
      setTimeout(() => setSent(false), 5000);
    } catch (err: any) {
      setError(err.message);
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
            <h1 className="text-2xl font-bold">Geri Bildirim</h1>
            <p className="text-gray-600">Fikirlerinizi bizimle paylaşın</p>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquareIcon className="h-5 w-5" />
              Geri Bildirim Formu
            </CardTitle>
            <CardDescription>
              Sitenin iyileştirilmesi için önerilerinizi, hataları veya yeni özellik taleplerinizi yazabilirsiniz.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Düşüncelerinizi yazın..."
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
              {sending ? "Gönderiliyor..." : sent ? "Gönderildi!" : "Gönder"}
            </Button>

            {sent && (
              <p className="text-sm text-green-600 text-center">
                Teşekkürler! Geri bildiriminiz alındı.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Nasıl Kullanılır?</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <CheckIcon className="h-4 w-4 text-green-500 mt-0.5" />
                Yeni özellik talebi
              </li>
              <li className="flex items-start gap-2">
                <CheckIcon className="h-4 w-4 text-green-500 mt-0.5" />
                Bulduğunuz hataları raporlama
              </li>
              <li className="flex items-start gap-2">
                <CheckIcon className="h-4 w-4 text-green-500 mt-0.5" />
                Genel iyileştirme önerileri
              </li>
              <li className="flex items-start gap-2">
                <CheckIcon className="h-4 w-4 text-green-500 mt-0.5" />
                Fiyatlandırma geri bildirimi
              </li>
            </ul>
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-sm text-gray-500">
          <Link href="/privacy-policy" className="underline hover:text-gray-700">
            Gizlilik Politikası
          </Link>
          {" "}kapsamında işlenir.
        </div>
      </div>
    </div>
  );
}