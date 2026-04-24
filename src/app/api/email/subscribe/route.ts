import { NextRequest, NextResponse } from "next/server";

interface Subscriber {
  id: string;
  email: string;
  repoId?: string;
  frequency: "daily" | "weekly" | "monthly";
  createdAt: string;
}

const subscribers: Map<string, Subscriber> = new Map();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, repoId, frequency } = body;

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Valid email is required" },
        { status: 400 }
      );
    }

    const subscriber: Subscriber = {
      id: `sub_${Date.now()}`,
      email,
      repoId,
      frequency: frequency || "weekly",
      createdAt: new Date().toISOString(),
    };

    subscribers.set(subscriber.id, subscriber);

    return NextResponse.json({
      success: true,
      message: "Subscribed successfully",
      subscriber: {
        id: subscriber.id,
        email: subscriber.email,
        frequency: subscriber.frequency,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to subscribe" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");

  if (email) {
    const sub = Array.from(subscribers.values()).find(s => s.email === email);
    if (sub) {
      return NextResponse.json({ subscribed: true, frequency: sub.frequency });
    }
    return NextResponse.json({ subscribed: false });
  }

  return NextResponse.json({
    message: "Email subscription API",
    frequencies: ["daily", "weekly", "monthly"],
    example: {
      email: "user@example.com",
      repoId: "123",
      frequency: "weekly",
    },
  });
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    for (const [id, sub] of subscribers.entries()) {
      if (sub.email === email) {
        subscribers.delete(id);
        return NextResponse.json({ success: true, message: "Unsubscribed" });
      }
    }

    return NextResponse.json(
      { error: "Subscriber not found" },
      { status: 404 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to unsubscribe" },
      { status: 500 }
    );
  }
}