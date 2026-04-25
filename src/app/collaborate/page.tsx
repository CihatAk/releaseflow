"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeftIcon, UsersIcon, Loader2Icon, SendIcon, CopyIcon, CheckIcon } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface Collaborator {
  id: string;
  name: string;
  avatar: string;
  cursor?: number;
  color: string;
}

export default function CollaborationPage() {
  const [roomId, setRoomId] = useState("");
  const [joined, setJoined] = useState(false);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState("");

  const colors = ["#EF4444", "#F59E0B", "#10B981", "#3B82F6", "#8B5CF6", "#EC4899"];

  const joinRoom = () => {
    if (!roomId) {
      setRoomId(Math.random().toString(36).substring(7));
    }
    setJoined(true);
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(`https://releaseflow.dev/collab/${roomId}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard" className="p-2 rounded-lg hover:bg-gray-100">
            <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Live Collaboration</h1>
            <p className="text-gray-600">Edit changelogs together in real-time</p>
          </div>
        </div>

        {!joined ? (
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Start Collaboration</CardTitle>
              <CardDescription>Create or join a room to edit together</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Room ID (optional)</label>
                <input
                  type="text"
                  placeholder="Leave empty to create new room"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <Button onClick={joinRoom} className="w-full">
                <UsersIcon className="w-4 h-4 mr-2" />
                {roomId ? "Join Room" : "Create Room"}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Changelog Editor</span>
                    <div className="flex items-center gap-2">
                      {collaborators.map((c) => (
                        <img
                          key={c.id}
                          src={c.avatar}
                          alt={c.name}
                          className="w-8 h-8 rounded-full border-2"
                          style={{ borderColor: c.color }}
                          title={c.name}
                        />
                      ))}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <textarea
                    className="w-full h-96 p-4 border rounded-lg font-mono text-sm resize-none"
                    placeholder="# Enter your changelog here..."
                  />
                  <div className="flex gap-2 mt-4">
                    <Button>
                      <SendIcon className="w-4 h-4 mr-2" />
                      Save & Publish
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Room Info</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500">Room ID</p>
                      <p className="font-mono text-sm">{roomId}</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={copyLink} className="w-full">
                      {copied ? <CheckIcon className="w-4 h-4 mr-2" /> : <CopyIcon className="w-4 h-4 mr-2" />}
                      {copied ? "Copied!" : "Copy Invite Link"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Active Users ({collaborators.length + 1})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm">Y</div>
                      <div>
                        <p className="text-sm font-medium">You</p>
                        <p className="text-xs text-green-500">Editing</p>
                      </div>
                    </div>
                    {collaborators.map((c) => (
                      <div key={c.id} className="flex items-center gap-3">
                        <img src={c.avatar} alt={c.name} className="w-8 h-8 rounded-full" />
                        <div>
                          <p className="text-sm font-medium">{c.name}</p>
                          <p className="text-xs text-gray-500">Viewing</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Demo Mode</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">
                    This is a demo. In production, this would use WebSocket for real-time sync.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}