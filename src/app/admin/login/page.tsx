"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { EyeIcon, EyeOffIcon, UsersIcon, ArrowRightIcon } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function AdminLoginPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Already logged in?
  useEffect(() => {
    const cookies = document.cookie.split("; ");
    if (cookies.find(c => c.startsWith("admin_session="))) {
      router.replace("/admin");
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token.trim()) {
      setError("Token giriniz");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: token.trim() }),
      });

      const data = await res.json();
      console.log("Login response:", data, "Status:", res.status);

      if (!res.ok || !data.success) {
        setError(data.error || "Giriş başarısız - token kontrol edin");
        setLoading(false);
        return;
      }

      // Success - set cookie manually and redirect
      setSuccess(true);
      
      // Small delay for visual feedback
      setTimeout(() => {
        router.push("/admin");
      }, 500);
      
    } catch (err) {
      console.error("Login error:", err);
      setError("Bağlantı hatası - internet kontrol edin");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-purple-500/25">
              <UsersIcon className="h-10 w-10 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white">Admin Panel</h1>
          <p className="text-gray-400 mt-2">ReleaseFlow Yönetim</p>
        </div>

        <Card className="border-0 shadow-2xl shadow-black/20">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-xl">Güvenli Giriş</CardTitle>
            <CardDescription>
              Yönetici anahtarı ile giriş yapın
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="text-sm font-medium mb-2 block text-gray-700">Admin Key</label>
                <div className="relative">
                  <UsersIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type={showToken ? "text" : "password"}
                    placeholder="releaseflow-admin-2026"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    className="pl-11 pr-11 h-12 bg-gray-50 border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowToken(!showToken)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showToken ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {success && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-600">Giriş başarılı! Yönlendiriliyor...</p>
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full h-12 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 border-0" 
                disabled={loading || success}
              >
                {loading ? "Kontrol ediliyor..." : success ? "Başarılı!" : (
                  <span className="flex items-center gap-2">
                    Giriş Yap <ArrowRightIcon className="h-5 w-5" />
                  </span>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-gray-500 mt-6">
          <Link href="/dashboard" className="underline hover:text-gray-400">
            ← Müşteri paneline dön
          </Link>
        </p>
      </div>
    </div>
  );
}