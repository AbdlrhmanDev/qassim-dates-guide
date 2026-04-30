"use client";

import Link from 'next/link';
import { Phone, MessageCircle, MapPin, Package } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { StarRating } from '@/components/ui/StarRating';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTraders } from '@/hooks/useTraders';

export default function TradersPage() {
  const { isRTL } = useLanguage();
  const { data: traders = [], isLoading, isError } = useTraders();

  const handleWhatsApp = (phone: string | null, shopName?: string) => {
    if (!phone) return;
    const d = phone.replace(/\D/g, '');
    const num = d.startsWith('966') ? d : d.startsWith('0') ? '966' + d.slice(1) : '966' + d;
    const msg = isRTL
      ? `السلام عليكم\nتواصلت معكم عبر *دليل تمور القصيم*\nأود الاستفسار عن منتجاتكم في *${shopName ?? 'متجركم'}*\nهل يمكنكم مشاركتي انواع التمور المتوفرة والاسعار؟`
      : `Hello\nI found you on *Qassim Dates Guide*\nI would like to inquire about your products at *${shopName ?? 'your store'}*\nCould you share your available date types and prices?`;
    window.open(`https://wa.me/${num}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 md:pt-28">
        {/* Header */}
        <section className="py-12 md:py-20 bg-gradient-to-b from-muted to-background relative overflow-hidden">
          <div className="absolute inset-0 arabic-pattern opacity-20" />
          <div className="container mx-auto px-4 relative z-10">
            <h1 className="font-arabic text-4xl md:text-6xl font-bold text-foreground mb-4 text-center">
              {isRTL ? 'التجار والمزارعين' : 'Traders & Farmers'}
            </h1>
            <p className="text-lg text-muted-foreground text-center max-w-2xl mx-auto">
              {isRTL
                ? 'تواصل مباشرة مع أفضل تجار ومزارعي التمور في منطقة القصيم'
                : 'Connect directly with the best date traders and farmers in Qassim region'}
            </p>
          </div>
        </section>

        {/* Traders Grid */}
        <section className="py-12 md:py-20">
          <div className="container mx-auto px-4">
            {isLoading && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="p-6 rounded-2xl bg-card animate-pulse space-y-4">
                    <div className="flex gap-4">
                      <div className="w-14 h-14 rounded-xl bg-muted" />
                      <div className="flex-1 space-y-2">
                        <div className="h-5 bg-muted rounded w-3/4" />
                        <div className="h-4 bg-muted rounded w-1/2" />
                      </div>
                    </div>
                    <div className="h-4 bg-muted rounded w-full" />
                    <div className="h-10 bg-muted rounded" />
                  </div>
                ))}
              </div>
            )}

            {isError && (
              <div className="text-center py-16">
                <p className="text-lg text-red-500">
                  {isRTL ? 'حدث خطأ في تحميل البيانات' : 'Error loading data'}
                </p>
              </div>
            )}

            {!isLoading && !isError && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {traders.length === 0 ? (
                  <p className="text-muted-foreground col-span-2 text-center py-12">
                    {isRTL ? 'لا يوجد تجار مسجلون بعد' : 'No traders registered yet'}
                  </p>
                ) : (
                  traders.map((trader, index) => (
                    <div
                      key={trader.trader_id}
                      className="p-6 rounded-2xl bg-card shadow-card hover:shadow-elevated transition-all duration-300 animate-fade-in"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      {/* Header */}
                      <div className="flex items-start gap-3 mb-4">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center overflow-hidden shrink-0">
                          {trader.image_url ? (
                            <img src={trader.image_url} alt={trader.shop_name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-2xl font-arabic font-bold text-primary-foreground">
                              {trader.shop_name.charAt(0)}
                            </span>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h2 className="font-arabic text-xl font-bold text-foreground">{trader.shop_name}</h2>
                            {trader.verified && (
                              <span className="px-2 py-0.5 rounded text-xs font-medium bg-accent/20 text-accent">
                                {isRTL ? 'موثق' : 'Verified'}
                              </span>
                            )}
                          </div>
                          <div className="mt-1">
                            <StarRating
                              value={trader.rating ?? 0}
                              count={(trader as any).rating_count ?? 0}
                              interactive={false}
                              size="sm"
                            />
                          </div>
                        </div>
                      </div>

                      {trader.description && (
                        <p className="text-muted-foreground mb-3 line-clamp-2">{trader.description}</p>
                      )}

                      {trader.city && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                          <MapPin className="w-4 h-4 text-primary" />
                          <span>{trader.city}</span>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2 flex-wrap">
                        <Link href={`/traders/${trader.trader_id}`} className="flex-1 min-w-[120px]">
                          <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                            <Package className="w-4 h-4" />
                            {isRTL ? 'عرض المنتجات' : 'View Products'}
                          </Button>
                        </Link>
                        {trader.contact_whatsapp && (
                          <Button variant="default" className="flex items-center gap-2"
                            onClick={() => handleWhatsApp(trader.contact_whatsapp, trader.shop_name)}>
                            <MessageCircle className="w-4 h-4" />
                            {isRTL ? 'واتساب' : 'WhatsApp'}
                          </Button>
                        )}
                        {trader.contact_phone && (
                          <Button variant="outline" size="icon" asChild>
                            <a href={`tel:${trader.contact_phone}`}><Phone className="w-4 h-4" /></a>
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 md:py-24 bg-gradient-to-r from-secondary via-secondary/95 to-secondary">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-arabic text-3xl md:text-4xl font-bold text-secondary-foreground mb-4">
              {isRTL ? 'هل أنت تاجر أو مزارع تمور؟' : 'Are you a date trader or farmer?'}
            </h2>
            <p className="text-secondary-foreground/80 max-w-2xl mx-auto mb-8">
              {isRTL
                ? 'انضم إلى منصتنا وتواصل مع آلاف العملاء المهتمين بتمور القصيم الفاخرة'
                : 'Join our platform and connect with thousands of customers interested in premium Qassim dates'}
            </p>
            <Button variant="hero" size="lg">
              {isRTL ? 'سجل كتاجر' : 'Register as Trader'}
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}



