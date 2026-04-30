"use client";

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Trophy, ShoppingBag } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { StarRating } from '@/components/ui/StarRating';
import { useLanguage } from '@/contexts/LanguageContext';

interface TopProduct {
  id: string;
  price_per_kg: number;
  stock_kg: number;
  rating: number;
  rating_count: number;
  image_url: string | null;
  traders: { trader_id: string; shop_name: string; city: string | null; verified: boolean } | null;
  date_types: { date_type_id: string; name_ar: string; name_en: string; category: string } | null;
}

const MEDAL: Record<number, { emoji: string; bg: string; text: string }> = {
  1: { emoji: '🥇', bg: 'bg-yellow-50 border-yellow-300', text: 'text-yellow-700' },
  2: { emoji: '🥈', bg: 'bg-gray-50 border-gray-300', text: 'text-gray-600' },
  3: { emoji: '🥉', bg: 'bg-orange-50 border-orange-300', text: 'text-orange-700' },
};

export default function TopProductsPage() {
  const { isRTL } = useLanguage();

  const { data: products = [], isLoading, isError } = useQuery<TopProduct[]>({
    queryKey: ['top-products'],
    queryFn: async () => {
      const res = await fetch('/api/top-products?limit=50');
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    staleTime: 60_000,
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 md:pt-28">
        {/* Hero */}
        <section className="py-12 md:py-16 bg-gradient-to-b from-muted to-background relative overflow-hidden">
          <div className="absolute inset-0 arabic-pattern opacity-20" />
          <div className="container mx-auto px-4 relative z-10 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Trophy className="w-10 h-10 text-primary" />
            </div>
            <h1 className="font-arabic text-3xl md:text-5xl font-bold text-foreground mb-3">
              {isRTL ? 'أعلى المنتجات تقييماً' : 'Top Rated Products'}
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              {isRTL
                ? 'أفضل منتجات التمور بناءً على تقييمات الزوار'
                : 'Best date products ranked by visitor ratings'}
            </p>
            {products.length > 0 && (
              <p className="text-sm text-muted-foreground mt-2">
                {isRTL ? `${products.length} منتج مُقيَّم` : `${products.length} rated products`}
              </p>
            )}
          </div>
        </section>

        {/* List */}
        <section className="py-10 md:py-16">
          <div className="container mx-auto px-4 max-w-3xl">

            {isLoading && (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="h-24 rounded-2xl bg-card animate-pulse" />
                ))}
              </div>
            )}

            {isError && (
              <p className="text-center text-red-500 py-12">
                {isRTL ? 'حدث خطأ في تحميل البيانات' : 'Error loading data'}
              </p>
            )}

            {!isLoading && !isError && products.length === 0 && (
              <div className="text-center py-20">
                <Trophy className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground text-lg">
                  {isRTL
                    ? 'لا توجد تقييمات بعد — كن أول من يُقيّم!'
                    : 'No ratings yet — be the first to rate a product!'}
                </p>
                <Link href="/traders" className="mt-4 inline-block text-primary hover:underline text-sm">
                  {isRTL ? 'تصفح التجار' : 'Browse traders'}
                </Link>
              </div>
            )}

            {!isLoading && !isError && products.length > 0 && (
              <div className="space-y-3">
                {products.map((p, index) => {
                  const rank = index + 1;
                  const medal = MEDAL[rank];
                  const name = isRTL ? p.date_types?.name_ar : p.date_types?.name_en;

                  return (
                    <Link
                      key={p.id}
                      href={`/traders/${p.traders?.trader_id}`}
                      className={`flex items-center gap-4 p-4 rounded-2xl border bg-card hover:shadow-card transition-all duration-200 ${
                        medal ? medal.bg : 'border-border'
                      }`}
                    >
                      {/* Rank */}
                      <div className={`w-10 text-center shrink-0 ${medal ? medal.text : 'text-muted-foreground'}`}>
                        {medal ? (
                          <span className="text-2xl leading-none">{medal.emoji}</span>
                        ) : (
                          <span className="text-lg font-bold">#{rank}</span>
                        )}
                      </div>

                      {/* Image */}
                      <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-muted flex items-center justify-center">
                        {p.image_url ? (
                          <img src={p.image_url} alt={name} className="w-full h-full object-cover" />
                        ) : (
                          <ShoppingBag className="w-6 h-6 text-muted-foreground/40" />
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-foreground truncate">{name}</p>
                          <span className="px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary shrink-0">
                            {p.date_types?.category}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate mt-0.5">
                          {p.traders?.shop_name}
                          {p.traders?.city && ` · ${p.traders.city}`}
                          {p.traders?.verified && (
                            <span className="ms-1 text-accent text-xs">✓</span>
                          )}
                        </p>
                        <div className="mt-1">
                          <StarRating
                            value={p.rating}
                            count={p.rating_count}
                            interactive={false}
                            size="sm"
                          />
                        </div>
                      </div>

                      {/* Price */}
                      <div className="text-end shrink-0">
                        <p className="text-lg font-bold text-primary">{p.price_per_kg}</p>
                        <p className="text-xs text-muted-foreground">
                          {isRTL ? 'ر.س/كجم' : 'SAR/kg'}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
