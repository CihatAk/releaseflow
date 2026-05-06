import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/client';

export async function POST(request: NextRequest) {
  try {
    const { conversationId } = await request.json();
    
    const supabase = createServerClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: conv } = await supabase
      .from('chat_conversations')
      .select('title')
      .eq('id', conversationId)
      .eq('user_id', user.id)
      .single();

    const { data: messages, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error || !messages) {
      return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
    }

    let markdown = `# ${conv?.title || 'Chat Export'}\n\n`;
    markdown += `Exported: ${new Date().toLocaleString('tr-TR')}\n\n---\n\n`;

    for (const msg of messages) {
      const role = msg.role === 'user' ? '👤 Kullanıcı' : '🤖 AI Asistanı';
      const time = new Date(msg.created_at).toLocaleString('tr-TR');
      markdown += `## ${role} (${time})\n\n${msg.content}\n\n---\n\n`;
    }

    return new NextResponse(markdown, {
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Content-Disposition': `attachment; filename="chat-${conversationId}.md"`,
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
