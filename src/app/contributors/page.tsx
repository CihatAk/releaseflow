"use client";

import Link from "next/link";
import { ArrowLeftIcon, UsersIcon } from "@/components/ui/icons";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function ContributorsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard" className="p-2 rounded-lg hover:bg-gray-100">
            <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Contributors</h1>
            <p className="text-gray-600">Track and analyze contributor activity</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Contributor Analytics</CardTitle>
            <CardDescription>No repositories connected yet</CardDescription>
          </CardHeader>
          <CardContent className="text-center py-12">
            <UsersIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">
              Connect a repository to see contributor statistics
            </p>
            <Link href="/dashboard" className="text-blue-500 hover:underline">
              Go to Dashboard
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}