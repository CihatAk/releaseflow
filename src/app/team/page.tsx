"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeftIcon,
  UsersIcon,
  PlusIcon,
  TrashIcon,
  CrownIcon,
  MailIcon,
} from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "admin" | "editor" | "viewer";
  avatar?: string;
}

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([
    { id: "1", name: "You", email: "you@example.com", role: "admin" },
  ]);
  const [showForm, setShowForm] = useState(false);
  const [newMember, setNewMember] = useState({ name: "", email: "", role: "editor" as const });

  const addMember = () => {
    if (!newMember.name || !newMember.email) return;
    setMembers([...members, { ...newMember, id: Date.now().toString() }]);
    setNewMember({ name: "", email: "", role: "editor" });
    setShowForm(false);
  };

  const removeMember = (id: string) => {
    setMembers(members.filter(m => m.id !== id));
  };

  const updateRole = (id: string, role: "admin" | "editor" | "viewer") => {
    setMembers(members.map(m => m.id === id ? { ...m, role } : m));
  };

  const ROLE_PERMISSIONS = {
    admin: { label: "Admin", description: "Full access - can manage team and settings" },
    editor: { label: "Editor", description: "Can generate and publish changelogs" },
    viewer: { label: "Viewer", description: "Read-only access" },
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard" className="p-2 rounded-lg hover:bg-gray-100">
            <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Team Management</h1>
            <p className="text-gray-600">Manage team members and permissions</p>
          </div>
        </div>

        <Card className="mb-6 bg-yellow-50 border-yellow-200">
          <CardContent className="py-4">
            <p className="text-yellow-700 text-sm">
              <strong>Team features are in demo mode.</strong> In production, these would connect to a real auth system.
              Add team members locally to test the UI.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Team Members ({members.length})</CardTitle>
              <CardDescription>People with access to your workspace</CardDescription>
            </div>
            <Button onClick={() => setShowForm(true)}>
              <PlusIcon className="w-4 h-4 mr-2" />
              Add Member
            </Button>
          </CardHeader>
          <CardContent>
            {showForm && (
              <div className="mb-4 p-4 bg-gray-50 rounded-lg space-y-3">
                <Input
                  placeholder="Name"
                  value={newMember.name}
                  onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                />
                <Input
                  type="email"
                  placeholder="Email"
                  value={newMember.email}
                  onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                />
                <select
                  value={newMember.role}
                  onChange={(e) => setNewMember({ ...newMember, role: e.target.value as any })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="admin">Admin</option>
                  <option value="editor">Editor</option>
                  <option value="viewer">Viewer</option>
                </select>
                <div className="flex gap-2">
                  <Button size="sm" onClick={addMember}>Add</Button>
                  <Button size="sm" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {members.map((member) => (
                <div key={member.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                    {member.name[0].toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{member.name}</span>
                      {member.role === "admin" && (
                        <CrownIcon className="w-4 h-4 text-yellow-500" />
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{member.email}</p>
                  </div>
                  <select
                    value={member.role}
                    onChange={(e) => updateRole(member.id, e.target.value as any)}
                    className="px-2 py-1 border rounded text-sm"
                    disabled={member.role === "admin"}
                  >
                    <option value="admin">Admin</option>
                    <option value="editor">Editor</option>
                    <option value="viewer">Viewer</option>
                  </select>
                  {member.role !== "admin" && (
                    <Button variant="ghost" size="icon" onClick={() => removeMember(member.id)}>
                      <TrashIcon className="w-4 h-4 text-red-500" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Role Permissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(ROLE_PERMISSIONS).map(([role, info]) => (
                <div key={role} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <span className="font-medium capitalize">{info.label}</span>
                    <p className="text-sm text-gray-500">{info.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}