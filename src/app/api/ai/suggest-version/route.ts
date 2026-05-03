import { NextRequest, NextResponse } from 'next/server';
import { suggestVersion, analyzeCommit } from '@/lib/ai';

export async function POST(request: NextRequest) {
  try {
    const { commits, aiConfig } = await request.json();
    
    if (!commits || !Array.isArray(commits)) {
      return NextResponse.json(
        { error: 'Commits array is required' },
        { status: 400 }
      );
    }

    // Analyze commits first
    const analyzedCommits = await Promise.all(
      commits.map(commit => analyzeCommit(commit.message, aiConfig))
    );

    const version = await suggestVersion(analyzedCommits, aiConfig);
    
    return NextResponse.json(version);
  } catch (error) {
    console.error('Error suggesting version:', error);
    return NextResponse.json(
      { error: 'Failed to suggest version' },
      { status: 500 }
    );
  }
}
