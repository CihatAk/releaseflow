import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/client';

export async function POST(request: NextRequest) {
  try {
    const { query, conversationId } = await request.json();
    
    const supabase = createServerClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let dbQuery = supabase
      .from('chat_messages')
      .select(`
        *,
        chat_conversations!inner(id, user_id, title)
      `)
      .eq('chat_conversations.user_id', user.id)
      .textSearch('content', query);

    if (conversationId) {
      dbQuery = dbQuery.eq('conversation_id', conversationId);
    }

    const { data, error } = await dbQuery
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      return NextResponse.json({ error: 'Search failed' }, { status: 500 });
    }

    return NextResponse.json({ results: data || [] });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
