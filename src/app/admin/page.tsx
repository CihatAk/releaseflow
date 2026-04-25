"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  LayoutGridIcon, UsersIcon, GithubIcon, BarChart3Icon, 
  SettingsIcon, MessageSquareIcon, FileTextIcon,
  LogOutIcon, TrendingUpIcon, EyeIcon,
  DownloadIcon, SearchIcon, FilterIcon
} from "@/components/ui/icons";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AdminStats {
  totalUsers: number;
  totalRepos: number;
  totalChangelogs: number;
  totalRevenue: number;
  newUsersThisMonth: number;
  activeUsers: number;
}

interface User {
  id: string;
  github_id: number;
  username: string;
  avatar_url: string;
  created_at: string;
  last_login: string;
}

interface Feedback {
  id: string;
  user_id: string;
  username: string;
  message: string;
  created_at: string;
}

interface Changelog {
  id: string;
  repo_name: string;
  user_id: string;
  version: string;
  created_at: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [recentChangelogs, setRecentChangelogs] = useState<Changelog[]>([]);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // Check cookie directly - no API call needed
    const cookies = document.cookie.split("; ");
    const adminCookie = cookies.find(c => c.startsWith("admin_token="));
    
    if (!adminCookie) {
      router.push("/admin/login");
      return;
    }

    // Cookie exists, load data
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsRes, usersRes, feedbackRes, changelogsRes] = await Promise.all([
        fetch("/api/admin/stats"),
        fetch("/api/admin/users"),
        fetch("/api/admin/feedback"),
        fetch("/api/admin/changelogs"),
      ]);

      if (statsRes.ok) setStats(await statsRes.json());
      if (usersRes.ok) setUsers(await usersRes.json());
      if (feedbackRes.ok) setFeedbacks(await feedbackRes.json());
      if (changelogsRes.ok) setRecentChangelogs(await changelogsRes.json());
    } catch (error) {
      console.error("Error loading admin data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    document.cookie = "github_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "admin_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-4">
              <Link href="/admin" className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                  <span className="text-primary-foreground font-bold">R</span>
                </div>
                <span className="font-bold text-lg">Admin Panel</span>
              </Link>
              <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">ADMIN</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700">
                View Site
              </Link>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOutIcon className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Toplam Kullanıcı</p>
                  <p className="text-2xl font-bold">{stats?.totalUsers || 0}</p>
                </div>
                <UsersIcon className="h-8 w-8 text-blue-500" />
              </div>
              <p className="text-xs text-green-500 mt-2">
                +{stats?.newUsersThisMonth || 0} bu ay
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Toplam Repo</p>
                  <p className="text-2xl font-bold">{stats?.totalRepos || 0}</p>
                </div>
                <GithubIcon className="h-8 w-8 text-gray-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Changelogs</p>
                  <p className="text-2xl font-bold">{stats?.totalChangelogs || 0}</p>
                </div>
                <FileTextIcon className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Aktif Kullanıcı</p>
                  <p className="text-2xl font-bold">{stats?.activeUsers || 0}</p>
                </div>
                <TrendingUpIcon className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {[
            { id: "dashboard", label: "Dashboard", icon: LayoutGridIcon },
            { id: "users", label: "Kullanıcılar", icon: UsersIcon },
            { id: "feedback", label: "Geri Bildirim", icon: MessageSquareIcon },
            { id: "changelogs", label: "Changelogs", icon: FileTextIcon },
            { id: "settings", label: "Ayarlar", icon: SettingsIcon },
          ].map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "outline"}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-2"
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Content */}
        {activeTab === "dashboard" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Son Kayıt olan Kullanıcılar</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.slice(0, 5).map((user) => (
                    <div key={user.id} className="flex items-center gap-3">
                      <img 
                        src={user.avatar_url} 
                        alt={user.username}
                        className="h-10 w-10 rounded-full"
                      />
                      <div className="flex-1">
                        <p className="font-medium">{user.username}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(user.created_at).toLocaleDateString("tr-TR")}
                        </p>
                      </div>
                    </div>
                  ))}
                  {users.length === 0 && (
                    <p className="text-gray-500 text-center py-4">Henüz kullanıcı yok</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Son Geri Bildirimler</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {feedbacks.slice(0, 5).map((fb) => (
                    <div key={fb.id} className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm">{fb.message}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {fb.username} • {new Date(fb.created_at).toLocaleDateString("tr-TR")}
                      </p>
                    </div>
                  ))}
                  {feedbacks.length === 0 && (
                    <p className="text-gray-500 text-center py-4">Henüz geri bildirim yok</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "users" && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Tüm Kullanıcılar</CardTitle>
                <Input 
                  placeholder="Ara..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Kullanıcı</th>
                      <th className="text-left py-3 px-4">GitHub ID</th>
                      <th className="text-left py-3 px-4">Kayıt Tarihi</th>
                      <th className="text-left py-3 px-4">Son Giriş</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users
                      .filter(u => u.username.toLowerCase().includes(searchQuery.toLowerCase()))
                      .map((user) => (
                        <tr key={user.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <img 
                                src={user.avatar_url} 
                                alt={user.username}
                                className="h-8 w-8 rounded-full"
                              />
                              <span className="font-medium">{user.username}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-gray-500">{user.github_id}</td>
                          <td className="py-3 px-4 text-gray-500">
                            {new Date(user.created_at).toLocaleDateString("tr-TR")}
                          </td>
                          <td className="py-3 px-4 text-gray-500">
                            {user.last_login 
                              ? new Date(user.last_login).toLocaleDateString("tr-TR")
                              : "-"}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
                {users.length === 0 && (
                  <p className="text-center py-8 text-gray-500">Henüz kullanıcı yok</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "feedback" && (
          <Card>
            <CardHeader>
              <CardTitle>Geri Bildirimler</CardTitle>
              <CardDescription>Müşterilerden gelen mesajlar</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {feedbacks.map((fb) => (
                  <div key={fb.id} className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-900">{fb.message}</p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-sm text-gray-500">{fb.username}</span>
                      <span className="text-xs text-gray-400">
                        {new Date(fb.created_at).toLocaleDateString("tr-TR")}
                      </span>
                    </div>
                  </div>
                ))}
                {feedbacks.length === 0 && (
                  <div className="text-center py-12">
                    <MessageSquareIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Henüz geri bildirim yok</p>
                    <p className="text-sm text-gray-400">
                      müşteriler formu kullanarak mesaj gönderebilir
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "changelogs" && (
          <Card>
            <CardHeader>
              <CardTitle>Son Üretilen Changelogs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Repo</th>
                      <th className="text-left py-3 px-4">Version</th>
                      <th className="text-left py-3 px-4">Tarih</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentChangelogs.map((cl) => (
                      <tr key={cl.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-mono text-sm">{cl.repo_name}</td>
                        <td className="py-3 px-4">{cl.version}</td>
                        <td className="py-3 px-4 text-gray-500">
                          {new Date(cl.created_at).toLocaleDateString("tr-TR")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {recentChangelogs.length === 0 && (
                  <p className="text-center py-8 text-gray-500">Henüz changelog yok</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "settings" && (
          <Card>
            <CardHeader>
              <CardTitle>Sistem Ayarları</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-medium mb-3">Genel Ayarlar</h3>
                <div className="grid gap-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">Bakım Modu</p>
                      <p className="text-sm text-gray-500">Siteyi bakıma al</p>
                    </div>
                    <Button variant="outline">Aktif Değil</Button>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">Kayıtları Kapat</p>
                      <p className="text-sm text-gray-500">Yeni kullanıcı alma</p>
                    </div>
                    <Button variant="outline">Aktif Değil</Button>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t">
                <h3 className="font-medium mb-3">Admin Yönetimi</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Admin yetkisi olan kullanıcılar
                </p>
                <Button variant="outline">Admin Ekle</Button>
              </div>

              <div className="pt-6 border-t">
                <h3 className="font-medium mb-3">Veri Yönetimi</h3>
                <div className="flex gap-3">
                  <Button variant="outline">
                    <DownloadIcon className="h-4 w-4 mr-2" />
                    Verileri İndir
                  </Button>
                  <Button variant="outline" className="text-red-500">
                    Verileri Temizle
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}