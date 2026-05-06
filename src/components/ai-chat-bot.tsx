"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getActiveProviderConfig } from "@/lib/ai-providers";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  isTyping?: boolean;
}

interface AIChatBotProps {
  isOpen: boolean;
  onClose: () => void;
}

const QUICK_ACTIONS = [
  { label: "🚀 Dashboard", action: () => window.location.href = "/dashboard" },
  { label: "⚙️ Settings", action: () => window.location.href = "/settings" },
  { label: "🤖 AI Studio", action: () => window.location.href = "/ai-studio" },
  { label: "📊 Generate", action: () => window.location.href = "/quick" },
  { label: "🔑 GitHub Token", action: () => window.location.href = "/settings" },
  { label: "📈 Analytics", action: () => window.location.href = "/analytics" },
];

const SUGGESTED_QUESTIONS = [
  "Nasıl changelog oluştururum?",
  "AI Studio nedir ve nasıl kullanılır?",
  "GitHub Token nasıl eklerim?",
  "Sidebar'daki özellikler nelerdir?",
  "Embed widget nasıl oluştururum?",
  "Otomatik versiyon nasıl belirlenir?",
];

export default function AIChatBot({ isOpen, onClose }: AIChatBotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "👋 Merhaba! Ben ReleaseFlow AI Asistanıyım.\n\nProje hakkında her şeyi biliyorum ve size yardım edebilirim:\n\n• 📝 Changelog oluşturma ve düzenleme\n• 🤖 AI Studio kullanımı (Rewrite, Translate, Social)\n• ⚙️ Ayarlar ve API key yapılandırması\n• 📊 Versiyon takibi ve otomatik etiketleme\n• 🎨 Sürükle-bırak editor ile düzenleme\n• 📈 Analitik ve raporlama\n\nHangi konuda yardıma ihtiyacınız var?",
      timestamp: Date.now(),
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const projectKnowledge = `
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
1. GitHub Token Ekleme: /settings → GitHub Authentication → Token ekle (ghp_ ile başlar)
2. AI Provider Ayarla: /settings → AI Provider Settings → Provider seç → API key ekle
3. Changelog Oluştur: /dashboard → Repo seç → Generate butonu
4. Batch Generate: /batch → Repo seç → Generate all
5. AI ile Düzenle: /ai-studio → Rewrite/Translate/Social → İçerik gir → Run
6. Embed Widget: /widget → Repo seç → Tema özelleştir → Kodu kopyala
`;

  const handleSend = async (text?: string) => {
    const messageText = text || input;
    if (!messageText.trim()) return;

    const userMessage: Message = {
      role: "user",
      content: messageText,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    setIsTyping(true);

    try {
      const config = getActiveProviderConfig();
      
      const conversationHistory = messages
        .slice(-6)
        .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
        .join("\n\n");

      const prompt = `Sen ReleaseFlow projesinin uzman AI asistanısın. Aşağıdaki kapsamlı proje bilgilerini kullanarak kullanıcıya yardım et.

${projectKnowledge}

=== ÖNCEKI KONUŞMA ===
${conversationHistory}

=== KULLANICI SORUSU ===
${messageText}

=== KURALLAR ===
1. Kısa, öz ve açıklayıcı cevaplar ver (maksimum 150 kelime)
2. Kod örnekleri ver (örneğin: /settings?tab=ai)
3. URL'leri tam olarak göster (örneğin: https://releaseflow.dev/settings)
4. Türkçe konuş
5. Eğer kullanıcı bir sayfa isterse, CEVAPTA "SAYFA:yol" formatını kullan (örnek: "SAYFA:/settings")
6. Eğer bir özellik hakkında soru sorulursa, nasıl kullanılacağını adım adım açıkla
7. Kod bloklarını \`\`\` kod\`\`\` formatında ver
8. Emoji kullan (😊, ✅, 📝, 🤖 gibi)
9. Eğer kullanıcı "merhaba", "selam" derse, kendini tanıt ve neler yapabileceğini listele
10. "Teşekkürler" derse, "Rica ederim! Başka bir sorun olursa buradayım 😊" de

Şimdi kullanıcıya yardım et:`;

      if (config) {
        const response = await fetch("/api/ai/rewrite", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: prompt,
            tone: "professional",
            audience: "developers",
            length: "concise",
            format: "plain",
            aiConfig: { provider: config.provider.id, apiKey: config.apiKey, model: config.model }
          }),
        });

        const data = await response.json();
        let botResponse = data.rewrittenContent || data.releaseNotes || "Üzgünüm, şu anda yardım edemiyorum.";

        // Check for page navigation
        const pageMatch = botResponse.match(/SAYFA:(\/[a-z0-9/_\-]*)/i);
        if (pageMatch) {
          const pagePath = pageMatch[1];
          botResponse = botResponse.replace(/SAYFA:[^\s]*/, "").trim();
          setMessages((prev) => [...prev, {
            role: "assistant",
            content: botResponse,
            timestamp: Date.now(),
          }]);
          setTimeout(() => {
            window.location.href = pagePath;
          }, 1500);
        } else {
          setMessages((prev) => [...prev, {
            role: "assistant",
            content: botResponse,
            timestamp: Date.now(),
          }]);
        }
      } else {
        setMessages((prev) => [...prev, {
          role: "assistant",
          content: "⚠️ Lütfen önce /settings sayfasından bir AI provider yapılandırın.\n\nAPI key ekledikten sonra tekrar sorabilirsiniz.",
          timestamp: Date.now(),
        }]);
      }
    } catch (err) {
      setMessages((prev) => [...prev, {
        role: "assistant",
        content: "❌ Bir hata oluştu. Lütfen tekrar deneyin veya /settings sayfasını kontrol edin.",
        timestamp: Date.now(),
      }]);
    }

    setLoading(false);
    setIsTyping(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickAction = (action: () => void, label: string) => {
    action();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-[420px] max-h-[700px] flex flex-col bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-xl">
            🤖
          </div>
          <div>
            <h3 className="font-bold text-sm">ReleaseFlow AI Asistanı</h3>
            <p className="text-xs opacity-80">Proje uzmanı • Çevrimiçi</p>
          </div>
        </div>
        <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-lg transition-colors">
          <span className="text-xl">×</span>
        </button>
      </div>

      {/* Quick Actions */}
      <div className="px-4 py-2 border-b bg-gray-50 flex flex-wrap gap-2">
        {QUICK_ACTIONS.slice(0, 4).map((action, idx) => (
          <button
            key={idx}
            onClick={() => handleQuickAction(action.action, action.label)}
            className="px-3 py-1 bg-white hover:bg-gray-100 border border-gray-200 rounded-full text-xs font-medium transition-colors"
          >
            {action.label}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[420px]">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "assistant" && (
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                🤖
              </div>
            )}
            <div
              className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-blue-600 text-white rounded-br-md"
                  : "bg-gray-100 text-gray-800 rounded-bl-md"
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
              <p className={`text-xs mt-2 ${msg.role === "user" ? "text-blue-100" : "text-gray-500"}`}>
                {new Date(msg.timestamp).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
            {msg.role === "user" && (
              <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0 text-sm">
                👤
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
              🤖
            </div>
            <div className="bg-gray-100 p-4 rounded-2xl rounded-bl-md">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions */}
      {messages.length <= 2 && (
        <div className="px-4 pb-2">
          <p className="text-xs text-gray-500 mb-2">Önerilen sorular:</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_QUESTIONS.slice(0, 3).map((question, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(question)}
                className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs transition-colors text-left"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t bg-gray-50">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Bir şey sorun..."
            className="flex-1 text-sm border-gray-300 focus:border-blue-500"
            disabled={loading}
          />
          <Button 
            onClick={() => handleSend()} 
            disabled={loading || !input.trim()} 
            size="sm"
            className="bg-blue-600 hover:bg-blue-700"
          >
            <span className="text-lg">➤</span>
          </Button>
        </div>
        <p className="text-xs text-gray-400 mt-2 text-center">
          ReleaseFlow AI Asistanı • Proje hakkında her şeyi bilir • GPT-5.5
        </p>
      </div>
    </div>
  );
}

export function AIChatBotTrigger({ onClick }: { onClick: () => void }) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="fixed bottom-4 right-4 z-40 w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 group"
      title="ReleaseFlow AI Asistanı"
    >
      <div className="relative">
        <span className="text-3xl">🤖</span>
        <div className={`absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white ${isHovered ? "animate-ping" : ""}`}></div>
      </div>
      {isHovered && (
        <div className="absolute right-20 bg-gray-900 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap animate-fade-in">
          AI Asistanı
          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
        </div>
      )}
    </button>
  );
}
