"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getActiveProviderConfig } from "@/lib/ai-providers";
import { AI_PROVIDERS } from "@/lib/ai-providers";

function formatTime(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
  isStreaming?: boolean;
  model?: string;
}

interface Conversation {
  id: string;
  title: string;
  updated_at: string;
}

interface AIChatBotProps {
  isOpen: boolean;
  onClose: () => void;
}

const SUGGESTED_QUESTIONS = [
  "Nasıl changelog oluştururum?",
  "AI Studio nedir ve nasıl kullanılır?",
  "GitHub Token nasıl eklerim?",
  "Embed widget nasıl oluştururum?",
  "Otomatik versiyon nasıl belirlenir?",
  "Batch işlemi nedir?",
];

const MODELS = [
  { id: "gpt-5.4", name: "GPT-5.4", provider: "openai" },
  { id: "gpt-5.5", name: "GPT-5.5", provider: "openai" },
  { id: "gpt-4o", name: "GPT-4o", provider: "openai" },
  { id: "claude-sonnet-4-6", name: "Claude Sonnet 4.6", provider: "anthropic" },
  { id: "llama-3.3-70b-versatile", name: "LLaMA 3.3 70B", provider: "groq" },
];

export default function AIChatBot({ isOpen, onClose }: AIChatBotProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedModel, setSelectedModel] = useState(MODELS[0].id);
  const [showModelSelect, setShowModelSelect] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content: "👋 **Merhaba!** Ben ReleaseFlow AI Asistanı'yım.\n\nProje hakkında her şeyi biliyorum ve size yardım edebilirim:\n\n• 📝 Changelog oluşturma ve düzenleme\n• 🤖 AI Studio kullanımı (Rewrite, Translate, Social)\n• ⚙️ Ayarlar ve API key yapılandırması\n• 📊 Versiyon takibi ve otomatik etiketleme\n• 🎨 Sürükle-bırak editor ile düzenleme\n• 📈 Analitik ve raporlama\n\nHangi konuda yardıma ihtiyacınız var?",
          timestamp: Date.now(),
        },
      ]);
    }
  }, [isOpen]);

  const handleSend = async (text?: string) => {
    const messageText = text || input;
    if (!messageText.trim() || loading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: messageText,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    setIsTyping(true);

    const assistantMessageId = `assistant-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      {
        id: assistantMessageId,
        role: "assistant" as const,
        content: "",
        timestamp: Date.now(),
        isStreaming: true,
      },
    ]);

    try {
      const config = getActiveProviderConfig();
      const body = {
        message: messageText,
        stream: true,
        aiConfig: config
          ? {
              provider: config.provider.id,
              apiKey: config.apiKey,
              model: config.model,
            }
          : undefined,
      };

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error("API request failed");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.content) {
                  fullContent += data.content;
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === assistantMessageId
                        ? { ...msg, content: fullContent }
                        : msg
                    )
                  );
                }
                if (data.done) {
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === assistantMessageId
                        ? { ...msg, isStreaming: false }
                        : msg
                    )
                  );
                }
                if (data.error) {
                  throw new Error(data.error);
                }
              } catch {
                // Ignore parse errors for incomplete chunks
              }
            }
          }
        }
      }
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? {
                ...msg,
                content: "❌ Bir hata oluştu. Lütfen tekrar deneyin veya /settings sayfasını kontrol edin.",
                isStreaming: false,
              }
            : msg
        )
      );
    } finally {
      setLoading(false);
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handlePageNavigation = (content: string) => {
    const pageMatch = content.match(/SAYFA:(\/[a-z0-9/_\-]*)/i);
    if (pageMatch) {
      const pagePath = pageMatch[1];
      setTimeout(() => {
        window.location.href = pagePath;
      }, 1500);
      return content.replace(/SAYFA:[^\s]*/, "").trim();
    }
    return content;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-[450px] max-h-[85vh] flex flex-col bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-xl">
            🤖
          </div>
          <div>
            <h3 className="font-bold text-sm">ReleaseFlow AI Asistanı</h3>
            <p className="text-xs opacity-80 flex items-center gap-1">
              {isTyping ? (
                <>
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                  Yazıyor...
                </>
              ) : (
                <>
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                  Proje uzmanı • Çevrimiçi
                </>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setShowModelSelect(!showModelSelect)}
              className="hover:bg-white/20 p-2 rounded-lg transition-colors text-xs"
              title="Model Seç"
            >
              {MODELS.find(m => m.id === selectedModel)?.name || "Model"}
            </button>
            {showModelSelect && (
              <div className="absolute right-0 top-10 bg-white rounded-lg shadow-xl border border-gray-200 py-2 min-w-[180px] z-20">
                {MODELS.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => {
                      setSelectedModel(model.id);
                      setShowModelSelect(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-xs hover:bg-gray-50 transition-colors ${
                      selectedModel === model.id ? "bg-blue-50 text-blue-600" : "text-gray-700"
                    }`}
                  >
                    <span className="font-medium">{model.name}</span>
                    <span className="text-gray-400 ml-1">({model.provider})</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="hover:bg-white/20 p-2 rounded-lg transition-colors"
          >
            <span className="text-xl">×</span>
          </button>
        </div>
      </div>

      {/* Messages - Scrollable area with fixed height */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4"
        style={{ height: 'calc(85vh - 180px)' }}
      >
        <div className="space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0 text-sm">
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
                {msg.role === "assistant" ? (
                  <div>
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        code({ className, children, ...props }) {
                          const match = /language-(\w+)/.exec(className || "");
                          return match ? (
                            <pre className="bg-gray-900 text-gray-100 p-3 rounded-lg overflow-x-auto text-sm my-2">
                              <code className={className} {...props}>
                                {String(children).replace(/\n$/, "")}
                              </code>
                            </pre>
                          ) : (
                            <code className="bg-gray-200 px-1.5 py-0.5 rounded text-sm" {...props}>
                              {children}
                            </code>
                          );
                        },
                      }}
                    >
                      {handlePageNavigation(msg.content)}
                    </ReactMarkdown>
                    {msg.isStreaming && (
                      <span className="inline-block w-2 h-4 bg-blue-500 animate-pulse ml-1" />
                    )}
                    {!msg.isStreaming && msg.content && (
                      <div className="flex gap-2 mt-2 pt-2 border-t border-gray-200">
                        <button
                          onClick={() => navigator.clipboard.writeText(msg.content)}
                          className="text-xs text-gray-500 hover:text-blue-600 transition-colors"
                          title="Kopyala"
                        >
                          📋 Kopyala
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                )}
                <p
                  className={`text-xs mt-2 ${
                    msg.role === "user" ? "text-blue-100" : "text-gray-500"
                  }`}
                >
                  {formatTime(msg.timestamp)}
                </p>
              </div>
              {msg.role === "user" && (
                <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0 text-sm">
                  👤
                </div>
              )}
            </div>
          ))}

          {isTyping && !messages.some((m) => m.isStreaming) && (
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
        </div>
      </div>

      {/* Suggested Questions */}
      {messages.length <= 1 && (
        <div className="px-4 pb-2">
          <p className="text-xs text-gray-500 mb-2">Önerilen sorular:</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_QUESTIONS.slice(0, 3).map((question, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(question)}
                className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs transition-colors text-left"
                disabled={loading}
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
          ReleaseFlow AI Asistanı • Streaming destekli • Markdown
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
      className="fixed bottom-20 right-4 z-40 w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 group"
      title="ReleaseFlow AI Asistanı"
    >
      <div className="relative">
        <span className="text-2xl">🤖</span>
        <div
          className={`absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white ${isHovered ? "animate-ping" : ""}`}
        />
      </div>
      {isHovered && (
        <div className="absolute right-20 bg-gray-900 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap animate-fade-in">
          AI Asistanı
          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45" />
        </div>
      )}
    </button>
  );
}
