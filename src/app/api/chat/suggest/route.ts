import { NextRequest, NextResponse } from 'next/server';
import { OpenAI } from 'openai';
import { AI_PROVIDERS } from '@/lib/ai-providers';

export async function POST(request: NextRequest) {
  try {
    const { context, aiConfig } = await request.json();

    const provider = (aiConfig?.provider as keyof typeof AI_PROVIDERS) || 'openai';
    const providerConfig = AI_PROVIDERS[provider];
    const apiKey = aiConfig?.apiKey || process.env.OPENAI_API_KEY || '';
    const model = aiConfig?.model || providerConfig?.defaultModel || 'gpt-4o';

    if (!apiKey || !providerConfig) {
      return NextResponse.json({ suggestions: [] });
    }

    const clientConfig: ConstructorParameters<typeof OpenAI>[0] = {
      apiKey,
      dangerouslyAllowBrowser: false,
    };
    if (providerConfig.baseUrl) {
      clientConfig.baseURL = providerConfig.baseUrl;
    }
    const client = new OpenAI(clientConfig);

    const prompt = `Based on this context from ReleaseFlow app, suggest 3 relevant follow-up questions or actions:
    
Context: ${context || 'User is using ReleaseFlow AI assistant'}

Rules:
- Return ONLY a JSON array of strings
- Each suggestion should be 5-8 words max
- Make them actionable and relevant
- Use Turkish language
- Focus on ReleaseFlow features

Example: ["Versiyon nasıl güncellenir?", "AI Studio'yu dene", "GitHub token ekle"]`;

    const response = await client.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: 'You are a helpful assistant that suggests relevant follow-up questions.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 200,
    });

    const content = response.choices[0]?.message?.content || '[]';
    let suggestions = [];
    try {
      suggestions = JSON.parse(content);
    } catch {
      suggestions = [
        "Changelog nasıl oluşturulur?",
        "AI Studio'yu dene",
        "GitHub token ekle"
      ];
    }

    return NextResponse.json({ suggestions: suggestions.slice(0, 3) });
  } catch (error) {
    console.error('Suggest API error:', error);
    return NextResponse.json({ suggestions: [] });
  }
}
