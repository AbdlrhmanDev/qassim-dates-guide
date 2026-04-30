"use client";

import { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Bot, User, Loader2, AlertCircle } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const QUICK_AR = [
  'أعطني أفضل التجار تقييماً',
  'ما هو أفضل تمر لمريض السكري؟',
  'ما هي فوائد تمر العجوة؟',
  'أفضل تمر للطاقة والتركيز',
  'ما الفرق بين تمر السكري والمجدول؟',
  'أريد تمراً منخفض السعرات',
];

const QUICK_EN = [
  'Give me top rated traders',
  'Best dates for diabetic patients',
  'What are the benefits of Ajwa dates?',
  'Best dates for energy & focus',
  'Difference between Sukkary and Medjool?',
  'I want low-calorie dates',
];

export default function AIAssistantPage() {
  const { isRTL } = useLanguage();
  const bottomRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: isRTL
        ? 'مرحباً! أنا مساعد تمور القصيم الذكي 🌴\n\nيمكنني مساعدتك في:\n• معرفة أفضل التجار وتقييماتهم\n• اختيار التمر المناسب لحالتك الصحية\n• مقارنة أنواع التمور وأسعارها\n• الإجابة على أي سؤال عن تمور القصيم\n\nاسألني أي شيء!'
        : "Hello! I'm the Qassim Dates AI Assistant 🌴\n\nI can help you with:\n• Finding top-rated traders and their products\n• Choosing the right dates for your health condition\n• Comparing date varieties and prices\n• Any question about Qassim dates\n\nAsk me anything!",
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    setError(null);
    const userMsg: Message = { role: 'user', content: trimmed };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updated }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error ?? 'Something went wrong');
        setMessages(prev => prev.slice(0, -1)); // remove the user message on error
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: data.content }]);
      }
    } catch {
      setError(isRTL ? 'خطأ في الاتصال بالخادم' : 'Connection error — please try again');
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const quickQuestions = isRTL ? QUICK_AR : QUICK_EN;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 pt-24 md:pt-28 flex flex-col">
        {/* Header */}
        <section className="py-8 bg-gradient-to-b from-muted to-background relative overflow-hidden shrink-0">
          <div className="absolute inset-0 arabic-pattern opacity-20" />
          <div className="container mx-auto px-4 relative z-10 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 mb-4">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">
                {isRTL ? 'مدعوم بـ Gemini AI' : 'Powered by Gemini AI'}
              </span>
            </div>
            <h1 className="font-arabic text-3xl md:text-4xl font-bold text-foreground mb-2">
              {isRTL ? 'المساعد الذكي' : 'AI Assistant'}
            </h1>
            <p className="text-muted-foreground text-sm">
              {isRTL
                ? 'يستخدم بيانات التجار والمنتجات الحية للإجابة على أسئلتك'
                : 'Uses live trader & product data to answer your questions'}
            </p>
          </div>
        </section>

        {/* Chat */}
        <section className="flex-1 container mx-auto px-4 pb-6 flex flex-col max-w-3xl min-h-0">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto py-4 space-y-4 min-h-[300px]">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-accent text-accent-foreground'
                }`}>
                  {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-tr-sm'
                    : 'bg-muted text-foreground rounded-tl-sm'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}

            {/* Loading bubble */}
            {isLoading && (
              <div className="flex gap-3">
                <div className="w-9 h-9 rounded-full bg-accent text-accent-foreground flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-muted px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">
                    {isRTL ? 'جارٍ التفكير...' : 'Thinking...'}
                  </span>
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">{isRTL ? 'حدث خطأ' : 'Error'}</p>
                  <p>{error}</p>
                  {error.includes('GEMINI_API_KEY') && (
                    <p className="mt-1 text-xs">
                      {isRTL
                        ? 'أضف GEMINI_API_KEY إلى ملف .env.local'
                        : 'Add your GEMINI_API_KEY to .env.local and restart the server.'}
                    </p>
                  )}
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Quick question chips */}
          <div className="flex flex-wrap gap-2 py-3 border-t border-border/50 shrink-0">
            {quickQuestions.map((q, i) => (
              <button
                key={i}
                disabled={isLoading}
                onClick={() => sendMessage(q)}
                className="px-3 py-1.5 rounded-full text-xs bg-muted hover:bg-primary/10 hover:text-primary text-foreground transition-colors disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="flex gap-2 shrink-0">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage(input)}
              placeholder={isRTL ? 'اكتب سؤالك هنا...' : 'Ask anything about Qassim dates...'}
              className="flex-1 px-4 py-3 rounded-xl bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              disabled={isLoading}
              dir={isRTL ? 'rtl' : 'ltr'}
            />
            <Button
              onClick={() => sendMessage(input)}
              disabled={isLoading || !input.trim()}
              size="lg"
              className="px-5"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
