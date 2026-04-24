"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeftIcon, MailIcon, CheckIcon, LoaderIcon } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError("Lütfen email adresinizi girin");
      return;
    }

    setLoading(true);
    setError("");

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setSent(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-purple-500/25">
              <MailIcon className="h-10 w-10 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white">Şifremi Unuttum</h1>
          <p className="text-gray-400 mt-2">Şifrenizi sıfırlayın</p>
        </div>

        <Card className="border-0 shadow-2xl shadow-black/20">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-xl">Şifre Sıfırlama</CardTitle>
            <CardDescription>
              Email adresinizi girin, şifre sıfırlama bağlantısını gönderelim
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sent ? (
              <div className="text-center py-6">
                <div className="flex justify-center mb-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                    <CheckIcon className="h-8 w-8 text-green-500" />
                  </div>
                </div>
                <h2 className="text-xl font-semibold text-green-600 mb-2">Email Gönderildi!</h2>
                <p className="text-gray-600 mb-6">
                  {email} adresine şifre sırlama bağlantısı gönderdik.
                </p>
                <Link href="/admin/login">
                  <Button variant="outline" className="w-full">
                    <ArrowLeftIcon className="h-4 w-4 mr-2" />
                    Giriş sayfasına dön
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="text-sm font-medium mb-2 block text-gray-700">Email</label>
                  <div className="relative">
                    <MailIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      type="email"
                      placeholder="admin@releaseflow.app"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-11 h-12 bg-gray-50 border-gray-200 focus:bg-white"
                    />
                  </div>
                </div>

                {error && (
                  <p className="text-sm text-red-500">{error}</p>
                )}

                <Button 
                  type="submit" 
                  className="w-full h-12 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 border-0" 
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <LoaderIcon className="h-5 w-5 animate-spin" />
                      Gönderiliyor...
                    </span>
                  ) : (
                    "Şifre Sıfırlama Linki Gönder"
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <Link href="/admin/login" className="text-gray-400 hover:text-white text-sm transition-colors">
            ← Admin giriş sayfasına dön
          </Link>
        </div>
      </div>
    </div>
  );
}