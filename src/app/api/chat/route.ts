import { NextRequest, NextResponse } from 'next/server';
import { OpenAI } from 'openai';
import { createServerClient } from '@/lib/supabase/client';
import { AI_PROVIDERS } from '@/lib/ai-providers';

interface ChatRequestBody {
  message: string;
  conversationId?: string;
  stream?: boolean;
  aiConfig?: {
    provider?: string;
    apiKey?: string;
    model?: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequestBody = await request.json();
    const { message, conversationId, stream = true, aiConfig } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const supabase = createServerClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.id;

    let conversation;
    if (conversationId) {
      const { data, error } = await supabase
        .from('chat_conversations')
        .select('*')
        .eq('id', conversationId)
        .eq('user_id', userId)
        .single();

      if (error || !data) {
        return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
      }
      conversation = data;
    } else {
      const { data, error } = await supabase
        .from('chat_conversations')
        .insert({ user_id: userId, title: message.substring(0, 50) })
        .select()
        .single();

      if (error || !data) {
        return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 });
      }
      conversation = data;
    }

    const { data: historyData } = await supabase
      .from('chat_messages')
      .select('role, content')
      .eq('conversation_id', conversation.id)
      .order('created_at', { ascending: true })
      .limit(20);

    await supabase.from('chat_messages').insert({
      conversation_id: conversation.id,
      role: 'user',
      content: message,
    });

    const provider = (aiConfig?.provider as keyof typeof AI_PROVIDERS) || 'openai';
    const providerConfig = AI_PROVIDERS[provider];
    if (!providerConfig) {
      return NextResponse.json({ error: 'Invalid provider' }, { status: 400 });
    }

    const apiKey = aiConfig?.apiKey || process.env.OPENAI_API_KEY || '';
    const model = aiConfig?.model || providerConfig.defaultModel;

    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 400 });
    }

    const clientConfig: ConstructorParameters<typeof OpenAI>[0] = {
      apiKey,
      dangerouslyAllowBrowser: false,
    };
    if (providerConfig.baseUrl) {
      clientConfig.baseURL = providerConfig.baseUrl;
    }
    const client = new OpenAI(clientConfig);

    const systemPrompt = `Sen ReleaseFlow projesinin uzman AI asistanısın. Aşağıdaki proje bilgilerini kullanarak kullanıcıya yardım et.

RELEASEFLOW PROJE KILAVUZU:

=== ANA SAYFALAR ===
1. /dashboard - Ana panel, repo listesi, favoriler, filtreleme
2. /settings - GitHub Token, AI Provider API keys (OpenAI, Groq, Anthropic, Mistral, Together, OpenRouter, Perplexity, Fireworks)
3. /ai-studio - AI özellikleri: Rewrite, Translate, Social Kit, Compare
4. /ai-studio/rewrite - İçeriği yeniden yazma
5. /ai-studio/translate - Çoklu dil çevirisi
6. /ai-studio/social - Sosyal medya postları oluşturma
7. /ai-studio/compare - Farklı AI providerları karşılaştırma

=== ÖZELLIKLER ===
• Generate: /quick (Hızlı), /batch (Toplu), /version (Versiyon belirleme), /changelog-history (Geçmiş), /auto-tag (Otomatik etiket)
• Analytics: /analytics (GitHub), /trends (Trendler), /burndown (Burndown chart), /contributors (Katkıcılar)
• Publish: /publish (GitHub Release), /publish-channels, /email-digest, /short-url, /embed
• Automate: /watch (Repo izleme), /scheduled (Zamanlanmış), /github-action (GitHub Action), /pr-template (PR şablonu), /waitlist
• Integrations: /webhooks, /brand (Marka), /team, /collaborate
• Advanced: /drag-drop (Sürükle-bırak editor), /templates, /import, /language, /privacy

=== AI MODELLERI ===
- OpenAI: gpt-5.5, gpt-5.4, gpt-4o, gpt-4o-mini
- Groq: llama-3.3-70b-versatile, llama-3.1-8b-instant, mixtral-8x7b
- Anthropic: claude-opus-4-7, claude-sonnet-4-6, claude-haiku-4-5
- Diğer: Mistral, Together, OpenRouter, Perplexity, Fireworks

=== KULLANIM ===
1. GitHub Token: /settings → GitHub Authentication → Token ekle
2. AI Provider: /settings → AI Provider Settings → Provider seç → API key ekle
3. Changelog: /dashboard → Repo seç → Generate butonu
4. Batch: /batch → Repo seç → Generate all
5. AI Düzenle: /ai-studio → Rewrite/Translate/Social → İçerik gir → Run

KURALLAR:
- Türkçe konuş, samimi ve yardımcı ol
- Kod örneklerini \`\`\` dilinde ver
- URL'leri tam yaz (örn: /settings)
- Kısa ve öz cevaplar ver (maksimum 200 kelime)
- Emoji kullan (🚀, ✅, 📝, 🤖)
- Eğer kullanıcı bir sayfa isterse, "SAYFA:yol" formatını kullan`;

    const messages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
      { role: 'system', content: systemPrompt },
    ];

    if (historyData && historyData.length > 0) {
      for (const msg of historyData) {
        messages.push({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        });
      }
    }

    messages.push({ role: 'user', content: message });

    if (!stream) {
      const startTime = Date.now();
      const response = await client.chat.completions.create({
        model,
        messages,
        temperature: 0.7,
        max_tokens: 1000,
      });
      const latencyMs = Date.now() - startTime;

      const assistantContent = response.choices[0]?.message?.content || '';

      await supabase.from('chat_messages').insert({
        conversation_id: conversation.id,
        role: 'assistant',
        content: assistantContent,
        model,
        tokens_used: response.usage?.total_tokens,
        latency_ms: latencyMs,
      });

      return NextResponse.json({
        content: assistantContent,
        conversationId: conversation.id,
        model,
        tokensUsed: response.usage?.total_tokens,
        latencyMs,
      });
    }

    const encoder = new TextEncoder();
    const streamResponse = new ReadableStream({
      async start(controller) {
        try {
          const startTime = Date.now();
          const completion = await client.chat.completions.create({
            model,
            messages,
            temperature: 0.7,
            max_tokens: 1000,
            stream: true,
          });

          let fullContent = '';
          for await (const chunk of completion) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
              fullContent += content;
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
            }
          }

          const latencyMs = Date.now() - startTime;

          await supabase.from('chat_messages').insert({
            conversation_id: conversation.id,
            role: 'assistant',
            content: fullContent,
            model,
            latency_ms: latencyMs,
          });

          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true, conversationId: conversation.id, model, latencyMs })}\n\n`));
          controller.close();
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Stream error';
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: errorMessage })}\n\n`));
          controller.close();
        }
      },
    });

    return new NextResponse(streamResponse, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');

    if (conversationId) {
      const { data: messages, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) {
        return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
      }

      return NextResponse.json({ messages });
    }

    const { data: conversations, error } = await supabase
      .from('chat_conversations')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 });
    }

    return NextResponse.json({ conversations });
  } catch (error) {
    console.error('Chat GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = createServerClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');

    if (!conversationId) {
      return NextResponse.json({ error: 'conversationId required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('chat_conversations')
      .delete()
      .eq('id', conversationId)
      .eq('user_id', user.id);

    if (error) {
      return NextResponse.json({ error: 'Failed to delete conversation' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Chat DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
