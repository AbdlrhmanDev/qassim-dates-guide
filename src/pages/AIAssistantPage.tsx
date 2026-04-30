import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Sparkles, Send, Bot, User, Loader2 } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const AIAssistantPage = () => {
  const { isRTL } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: isRTL 
        ? 'مرحباً! أنا المساعد الذكي لتمور القصيم. كيف يمكنني مساعدتك اليوم؟ يمكنني مساعدتك في:\n\n• اختيار نوع التمر المناسب لذوقك\n• معرفة الفوائد الصحية للتمور\n• اقتراح تمور حسب احتياجاتك الصحية\n• الإجابة على أسئلتك حول تمور القصيم'
        : 'Hello! I\'m the Qassim Dates AI Assistant. How can I help you today? I can assist you with:\n\n• Choosing the right date type for your taste\n• Learning about the health benefits of dates\n• Suggesting dates based on your health needs\n• Answering questions about Qassim dates',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const quickQuestions = isRTL
    ? [
        'ما هو أفضل نوع تمر للمبتدئين؟',
        'أريد تمراً منخفض السكر',
        'ما فوائد تمر العجوة؟',
        'أفضل تمر للطاقة',
      ]
    : [
        'What is the best date type for beginners?',
        'I want low-sugar dates',
        'What are the benefits of Ajwa dates?',
        'Best dates for energy',
      ];

  const handleSend = async (message?: string) => {
    const text = message || input;
    if (!text.trim()) return;

    const userMessage: Message = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI response (would be replaced with actual API call)
    setTimeout(() => {
      const responses: Record<string, string> = {
        default: isRTL
          ? 'شكراً لسؤالك! بناءً على اهتماماتك، أنصحك بتجربة تمر السكري من القصيم. يتميز بحلاوته الطبيعية وملمسه الناعم، وهو مثالي للمبتدئين ومحبي التمور على حد سواء.'
          : 'Thank you for your question! Based on your interests, I recommend trying Sukkary dates from Qassim. Known for their natural sweetness and soft texture, they\'re perfect for beginners and date lovers alike.',
      };

      const assistantMessage: Message = {
        role: 'assistant',
        content: responses.default,
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const handleQuickQuestion = (question: string) => {
    handleSend(question);
  };

  return (
    <>
      <Helmet>
        <title>{isRTL ? 'المساعد الذكي | تمور القصيم' : 'AI Assistant | Qassim Dates'}</title>
        <meta 
          name="description" 
          content={isRTL 
            ? 'استخدم المساعد الذكي للحصول على توصيات شخصية لأنواع التمور'
            : 'Use the AI assistant to get personalized date recommendations'
          } 
        />
      </Helmet>

      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        
        <main className="flex-1 pt-24 md:pt-28 flex flex-col">
          {/* Header */}
          <section className="py-8 bg-gradient-to-b from-muted to-background relative overflow-hidden">
            <div className="absolute inset-0 arabic-pattern opacity-20" />
            <div className="container mx-auto px-4 relative z-10 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 mb-4">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">
                  {isRTL ? 'مدعوم بالذكاء الاصطناعي' : 'Powered by AI'}
                </span>
              </div>
              <h1 className="font-arabic text-3xl md:text-4xl font-bold text-foreground mb-2">
                {isRTL ? 'المساعد الذكي' : 'AI Assistant'}
              </h1>
              <p className="text-muted-foreground">
                {isRTL 
                  ? 'احصل على توصيات مخصصة لأنواع التمور المناسبة لك'
                  : 'Get personalized recommendations for the right date types for you'
                }
              </p>
            </div>
          </section>

          {/* Chat Section */}
          <section className="flex-1 container mx-auto px-4 py-6 flex flex-col max-w-4xl">
            {/* Messages */}
            <div className="flex-1 space-y-4 mb-6 overflow-y-auto">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-accent text-accent-foreground'
                    }`}
                  >
                    {message.role === 'user' ? (
                      <User className="w-5 h-5" />
                    ) : (
                      <Bot className="w-5 h-5" />
                    )}
                  </div>

                  {/* Message */}
                  <div
                    className={`max-w-[80%] p-4 rounded-2xl ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground rounded-br-sm rtl:rounded-br-2xl rtl:rounded-bl-sm'
                        : 'bg-muted text-foreground rounded-bl-sm rtl:rounded-bl-2xl rtl:rounded-br-sm'
                    }`}
                  >
                    <p className="whitespace-pre-line">{message.content}</p>
                  </div>
                </div>
              ))}

              {/* Loading */}
              {isLoading && (
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent text-accent-foreground flex items-center justify-center">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div className="bg-muted p-4 rounded-2xl rounded-bl-sm rtl:rounded-bl-2xl rtl:rounded-br-sm">
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  </div>
                </div>
              )}
            </div>

            {/* Quick Questions */}
            <div className="flex flex-wrap gap-2 mb-4">
              {quickQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickQuestion(question)}
                  className="px-4 py-2 rounded-full text-sm bg-muted hover:bg-muted/80 text-foreground transition-colors"
                  disabled={isLoading}
                >
                  {question}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder={isRTL ? 'اكتب سؤالك هنا...' : 'Type your question here...'}
                className="flex-1 px-4 py-3 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                disabled={isLoading}
              />
              <Button
                variant="default"
                size="lg"
                onClick={() => handleSend()}
                disabled={isLoading || !input.trim()}
                className="px-6"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default AIAssistantPage;
