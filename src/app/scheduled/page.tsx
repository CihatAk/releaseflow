"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeftIcon, CalendarIcon, ClockIcon, MailIcon, TrashIcon } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface ScheduledReport {
  id: string;
  repo: string;
  frequency: "weekly" | "monthly";
  day: number;
  time: string;
  email: string;
  active: boolean;
}

export default function ScheduledReportsPage() {
  const [reports, setReports] = useState<ScheduledReport[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    repo: "",
    frequency: "weekly",
    day: "1",
    time: "09:00",
    email: "",
  });

  const addReport = () => {
    if (!form.repo || !form.email) return;
    
    const newReport: ScheduledReport = {
      id: Date.now().toString(),
      repo: form.repo,
      frequency: form.frequency as "weekly" | "monthly",
      day: parseInt(form.day),
      time: form.time,
      email: form.email,
      active: true,
    };
    
    setReports([...reports, newReport]);
    localStorage.setItem("rf_scheduled_reports", JSON.stringify([...reports, newReport]));
    setShowForm(false);
    setForm({ repo: "", frequency: "weekly", day: "1", time: "09:00", email: "" });
  };

  const deleteReport = (id: string) => {
    const updated = reports.filter(r => r.id !== id);
    setReports(updated);
    localStorage.setItem("rf_scheduled_reports", JSON.stringify(updated));
  };

  const toggleReport = (id: string) => {
    const updated = reports.map(r => r.id === id ? { ...r, active: !r.active } : r);
    setReports(updated);
    localStorage.setItem("rf_scheduled_reports", JSON.stringify(updated));
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <ArrowLeftIcon className="h-5 w-5" />
            <span>Back to Dashboard</span>
          </Link>
        </div>
      </header>

      <main className="container mx-auto max-w-3xl px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">Scheduled Reports</h1>
          <p className="text-muted-foreground">
            Automatically generate and email changelogs on a schedule
          </p>
        </div>

        {/* Info Card */}
        <Card className="mb-6 bg-primary/5">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <CalendarIcon className="h-5 w-5 mt-0.5" />
              <div>
                <p className="font-medium">Coming Soon</p>
                <p className="text-sm text-muted-foreground">
                  Scheduled reports will automatically generate changelogs and email them. 
                  Currently in demo mode - reports are saved locally.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Add Button */}
        <Button onClick={() => setShowForm(!showForm)} className="mb-6">
          <ClockIcon className="h-4 w-4" /> Schedule New Report
        </Button>

        {/* Form */}
        {showForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>New Scheduled Report</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">Repository</label>
                <Input
                  placeholder="owner/repo"
                  value={form.repo}
                  onChange={(e) => setForm({ ...form, repo: e.target.value })}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium">Frequency</label>
                  <select
                    value={form.frequency}
                    onChange={(e) => setForm({ ...form, frequency: e.target.value })}
                    className="w-full rounded-lg border bg-background px-3 py-2"
                  >
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    {form.frequency === "weekly" ? "Day of Week" : "Day of Month"}
                  </label>
                  <select
                    value={form.day}
                    onChange={(e) => setForm({ ...form, day: e.target.value })}
                    className="w-full rounded-lg border bg-background px-3 py-2"
                  >
                    {form.frequency === "weekly" ? (
                      <>
                        <option value="1">Monday</option>
                        <option value="2">Tuesday</option>
                        <option value="3">Wednesday</option>
                        <option value="4">Thursday</option>
                        <option value="5">Friday</option>
                      </>
                    ) : (
                      <>
                        {[1, 5, 10, 15, 20, 25].map(d => (
                          <option key={d} value={d}>Day {d}</option>
                        ))}
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium">Time</label>
                  <Input
                    type="time"
                    value={form.time}
                    onChange={(e) => setForm({ ...form, time: e.target.value })}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Email To</label>
                  <Input
                    type="email"
                    placeholder="team@example.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={addReport}>Save Schedule</Button>
                <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Report List */}
        {reports.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <CalendarIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No scheduled reports yet.</p>
              <Button variant="outline" className="mt-4" onClick={() => setShowForm(true)}>
                Create your first schedule
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <Card key={report.id}>
                <CardContent className="flex items-center justify-between py-4">
                  <div>
                    <p className="font-medium">{report.repo}</p>
                    <p className="text-sm text-muted-foreground">
                      {report.frequency === "weekly" ? "Weekly" : "Monthly"} at {report.time} • {report.email}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleReport(report.id)}
                      className={`h-6 w-11 rounded-full transition-colors ${
                        report.active ? "bg-primary" : "bg-muted"
                      }`}
                    >
                      <span className={`block h-5 w-5 rounded-full bg-white shadow ${
                        report.active ? "translate-x-5" : "translate-x-0.5"
                      }`} />
                    </button>
                    <Button variant="ghost" size="sm" onClick={() => deleteReport(report.id)}>
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}