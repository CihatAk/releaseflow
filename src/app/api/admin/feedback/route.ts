import { NextResponse } from "next/server";

const mockFeedback = [
  { id: "1", username: "cihat", message: "Harika bir tool!Çok işime yarıyor.", created_at: "2026-01-24" },
  { id: "2", username: "johndev", message: "Auto version özelliği çok güzel çalışıyor.teşekkürler!", created_at: "2026-01-23" },
  { id: "3", username: "codeMaster", message: "Dark mode eklence güzel olur", created_at: "2026-01-22" },
  { id: "4", username: "bugHunter", message: "GitLab entegrasyonu yapabilir misiniz?", created_at: "2026-01-21" },
];

export async function GET() {
  return NextResponse.json(mockFeedback);
}

export async function POST(request: Request) {
  const body = await request.json();
  return NextResponse.json({ success: true, id: Date.now().toString() });
}