import { NextRequest, NextResponse } from 'next/server';
import { improveCommitMessage } from '@/lib/ai';

export async function POST(request: NextRequest) {
  try {
    const { message, aiConfig } = await request.json();
    
    if (!message) {
      return NextResponse.json(
        { error: 'Commit message is required' },
        { status: 400 }
      );
    }

    const improved = await improveCommitMessage(message, aiConfig);
    
    return NextResponse.json({ improved });
  } catch (error) {
    console.error('Error improving commit message:', error);
    return NextResponse.json(
      { error: 'Failed to improve commit message' },
      { status: 500 }
    );
  }
}
