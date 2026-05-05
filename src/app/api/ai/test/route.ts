import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { provider, apiKey, model } = await request.json();

    if (!provider || !apiKey) {
      return NextResponse.json(
        { success: false, message: "Provider ve API key gerekli" },
        { status: 400 }
      );
    }

    // Provider base URL'lerini belirle
    const providerConfig: Record<string, { baseUrl: string; testPath: string }> = {
      openai: { baseUrl: "https://api.openai.com/v1", testPath: "/models" },
      groq: { baseUrl: "https://api.groq.com/openai/v1", testPath: "/models" },
      deepseek: { baseUrl: "https://api.deepseek.com/v1", testPath: "/models" },
      openrouter: { baseUrl: "https://openrouter.ai/api/v1", testPath: "/models" },
      together: { baseUrl: "https://api.together.xyz/v1", testPath: "/models" },
      mistral: { baseUrl: "https://api.mistral.ai/v1", testPath: "/models" },
      xai: { baseUrl: "https://api.x.ai/v1", testPath: "/models" },
      cerebras: { baseUrl: "https://api.cerebras.ai/v1", testPath: "/models" },
      fireworks: { baseUrl: "https://api.fireworks.ai/inference/v1", testPath: "/models" },
    };

    const config = providerConfig[provider];
    if (!config) {
      return NextResponse.json(
        { success: false, message: `Bilinmeyen provider: ${provider}` },
        { status: 400 }
      );
    }

    // API key test et
    const testUrl = `${config.baseUrl}${config.testPath}`;
    const response = await fetch(testUrl, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const data = await response.json();
      const modelCount = data.data?.length || 0;
      return NextResponse.json({
        success: true,
        message: `API key geçerli (${modelCount} model mevcut)`,
      });
    } else {
      const error = await response.json().catch(() => null);
      return NextResponse.json(
        {
          success: false,
          message: `Geçersiz API key: ${error?.error?.message || response.statusText}`,
        },
        { status: response.status }
      );
    }
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Bağlantı hatası",
      },
      { status: 500 }
    );
  }
}
