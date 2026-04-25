import { NextRequest, NextResponse } from "next/server";

interface Feedback {
  id: string;
  name: string;
  email: string;
  category: string;
  message: string;
  created_at: string;
}

let feedbackStore: Feedback[] = [];

export async function GET() {
  return NextResponse.json(feedbackStore);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, category, message } = body;

    if (!message || !message.trim()) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const feedback: Feedback = {
      id: Date.now().toString(),
      name: name || "Anonymous",
      email: email || "",
      category: category || "feedback",
      message: message.trim(),
      created_at: new Date().toISOString(),
    };

    feedbackStore.push(feedback);

    return NextResponse.json({ success: true, id: feedback.id });
  } catch (error) {
    return NextResponse.json({ error: "Failed to save feedback" }, { status: 500 });
  }
}