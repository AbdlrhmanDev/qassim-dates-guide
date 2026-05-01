"use client";

import { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { MessageCircle, X, Send, Bot, User, Loader2, Sparkles } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const QUICK_AR = [
  'أفضل التجار تقييماً',
  'تمر مناسب للسكري',
  'فوائد تمر العجوة',
  'أرخص الأسعار',
];
const QUICK_EN = [
  'Top rated traders',
  'Dates for diabetics',
  'Ajwa date benefits',
  'Best prices',
];

export default function FloatingChatbot() {
  const { isRTL } = useLanguage();
  const pathname = usePathname();
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);

  const [open, setOpen]       = useState(false);
  const [input, setInput]     = useState('');
  const [loading, setLoading] = useState(false);
  const [unread, setUnread]   = useState(false);

  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: isRTL
        ? 'مرحباً! 👋 أنا مساعد تمور القصيم.\nاسألني عن أفضل التجار، أنواع التمور، أو نصائح صحية!'
        : 'Hello! 👋 I\'m the Qassim Dates assistant.\nAsk me about top traders, date varieties, or health tips!',
    },
  ]);

  // Auto-scroll
  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading, open]);

  // Focus input when panel opens
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  const handleOpen = () => {
    setOpen(true);
    setUnread(false);
  };

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg: Message = { role: 'user', content: trimmed };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updated }),
      });
      const data = await res.json();
      const reply: Message = {
        role: 'assistant',
        content: data.error
          ? (isRTL ? 'عذراً، حدث خطأ. حاول مجدداً.' : 'Sorry, an error occurred. Try again.')
          : data.content,
      };
      setMessages(prev => [...prev, reply]);
      if (!open) setUnread(true);
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: isRTL ? 'خطأ في الاتصال.' : 'Connection error.',
      }]);
    } finally {
      setLoading(false);
    }
  };

  const quickQuestions = isRTL ? QUICK_AR : QUICK_EN;
  const side = isRTL ? 'left-4 md:left-6' : 'right-4 md:right-6';

  // Hide on the full AI assistant page
  if (pathname === '/ai-assistant') return null;

  return (
    <>
      {/* Chat panel */}
      {open && (
        <div className={`fixed bottom-24 ${side} z-50 w-[340px] md:w-[380px] flex flex-col rounded-2xl bg-card border border-border shadow-2xl overflow-hidden`}
          style={{ maxHeight: 'calc(100vh - 120px)', height: 520 }}>

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-secondary to-secondary/90 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                <Bot className="w-4 h-4 text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm font-bold text-secondary-foreground">
                  {isRTL ? 'مساعد تمور القصيم' : 'Qassim Dates Assistant'}
                </p>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                  <span className="text-xs text-secondary-foreground/70">
                    {isRTL ? 'متصل' : 'Online'}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-secondary-foreground/70 hover:text-secondary-foreground transition-colors p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                  msg.role === 'user' ? 'bg-primary' : 'bg-accent'
                }`}>
                  {msg.role === 'user'
                    ? <User className="w-3.5 h-3.5 text-primary-foreground" />
                    : <Bot className="w-3.5 h-3.5 text-accent-foreground" />}
                </div>
                <div className={`max-w-[78%] px-3 py-2 rounded-2xl text-xs leading-relaxed whitespace-pre-line ${
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-tr-sm'
                    : 'bg-muted text-foreground rounded-tl-sm'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-2">
                <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center shrink-0">
                  <Bot className="w-3.5 h-3.5 text-accent-foreground" />
                </div>
                <div className="bg-muted px-3 py-2 rounded-2xl rounded-tl-sm flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                  <span className="text-xs text-muted-foreground">
                    {isRTL ? 'يفكر...' : 'Thinking...'}
                  </span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick chips */}
          <div className="px-3 pb-2 flex flex-wrap gap-1.5 shrink-0">
            {quickQuestions.map((q, i) => (
              <button
                key={i}
                disabled={loading}
                onClick={() => sendMessage(q)}
                className="px-2.5 py-1 rounded-full text-[11px] bg-muted hover:bg-primary/10 hover:text-primary text-foreground transition-colors disabled:opacity-40"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="flex gap-2 px-3 pb-3 shrink-0">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
              placeholder={isRTL ? 'اكتب سؤالك...' : 'Ask anything...'}
              disabled={loading}
              dir={isRTL ? 'rtl' : 'ltr'}
              className="flex-1 px-3 py-2 rounded-xl bg-muted border border-border text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            <button
              disabled={loading || !input.trim()}
              onClick={() => sendMessage(input)}
              className="w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 disabled:opacity-40 transition-colors shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Floating button */}
      <button
        onClick={handleOpen}
        className={`fixed bottom-6 ${side} z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:scale-110 hover:shadow-xl transition-all duration-200 flex items-center justify-center`}
        aria-label={isRTL ? 'فتح المساعد الذكي' : 'Open AI Assistant'}
      >
        {open ? (
          <X className="w-6 h-6" />
        ) : (
          <>
            <MessageCircle className="w-6 h-6" />
            {unread && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 border-2 border-background" />
            )}
          </>
        )}
        {/* Pulse ring */}
        {!open && (
          <span className="absolute inset-0 rounded-full bg-primary animate-ping opacity-20" />
        )}
      </button>

      {/* Powered badge (shows when closed) */}
      {!open && (
        <div className={`fixed bottom-[88px] ${side} z-40 flex items-center gap-1 px-2 py-1 rounded-full bg-card border border-border shadow text-[10px] text-muted-foreground`}>
          <Sparkles className="w-2.5 h-2.5 text-primary" />
          {isRTL ? 'مساعد ذكي' : 'AI Assistant'}
        </div>
      )}
    </>
  );
}
