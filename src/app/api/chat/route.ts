import { NextRequest, NextResponse } from 'next/server';
import { OpenAI } from 'openai';
import { AI_PROVIDERS } from '@/lib/ai-providers';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, stream = true, aiConfig } = body;

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const provider = (aiConfig?.provider as keyof typeof AI_PROVIDERS) || 'openai';
    const providerConfig = AI_PROVIDERS[provider];
    
    if (!providerConfig) {
      return NextResponse.json({ error: 'Invalid provider' }, { status: 400 });
    }

    const apiKey = aiConfig?.apiKey || process.env.OPENAI_API_KEY || '';
    const model = aiConfig?.model || providerConfig.defaultModel;

    if (!apiKey) {
      return NextResponse.json({ 
        error: 'API key not configured. Please add your API key in settings.' 
      }, { status: 400 });
    }

    const clientConfig: ConstructorParameters<typeof OpenAI>[0] = {
      apiKey,
      dangerouslyAllowBrowser: false,
    };
    
    if (providerConfig.baseUrl) {
      clientConfig.baseURL = providerConfig.baseUrl;
    }
    
    const client = new OpenAI(clientConfig);

    const systemPrompt = `Sen ReleaseFlow projesinin uzmanı AI asistanısın. Kullanıcıya yardım et.
    
Kuralar:
- Türkçe konuş
- Kısa ve öz cevaplar ver (maksimum 200 kelime)
- Emoji kullan (🚀, ✅, 📝, 🤖)
- Kod örneklerini \`\`\` ile ver
- URL'leri tam yaz (örn: /settings)`;

    if (!stream) {
      const response = await client.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });

      const content = response.choices[0]?.message?.content || '';
      return NextResponse.json({ content, model });
    }

    const encoder = new TextEncoder();
    const streamResponse = new ReadableStream({
      async start(controller) {
        try {
          const completion = await client.chat.completions.create({
            model,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: message }
            ],
            temperature: 0.7,
            max_tokens: 1000,
            stream: true,
          });

          for await (const chunk of completion) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
            }
          }

          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true, model })}\n\n`));
          controller.close();
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Stream error';
          console.error('Stream error:', errorMessage);
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
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}
