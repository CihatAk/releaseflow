import { NextRequest, NextResponse } from 'next/server';
import { analyzeCommit } from '@/lib/ai';

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();
    
    if (!message) {
      return NextResponse.json(
        { error: 'Commit message is required' },
        { status: 400 }
      );
    }

    const analysis = await analyzeCommit(message);
    
    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Error analyzing commit:', error);
    return NextResponse.json(
      { error: 'Failed to analyze commit' },
      { status: 500 }
    );
  }
}
