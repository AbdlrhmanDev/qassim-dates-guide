"use client";

import { authFetch } from '@/lib/api-client';
import { use, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Phone, MessageCircle, MapPin, ArrowLeft, ArrowRight, CheckCircle, XCircle, ShoppingBag, LogIn } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { StarRating } from '@/components/ui/StarRating';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';

interface Trader {
  trader_id: string;
  shop_name: string;
  description: string | null;
  contact_phone: string | null;
  contact_whatsapp: string | null;
  city: string | null;
  image_url: string | null;
  rating: number;
  rating_count: number;
  verified: boolean;
  status: string;
}

interface Product {
  id: string;
  price_per_kg: number;
  stock_kg: number;
  available: boolean;
  notes: string | null;
  image_url: string | null;
  rating: number;
  rating_count: number;
  date_types: { date_type_id: string; name_ar: string; name_en: string; category: string } | null;
}

export default function TraderProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { isRTL } = useLanguage();
  const { user } = useAuth();
  const router = useRouter();
  const qc = useQueryClient();

  // --- Product rating state ---
  const [userRatings, setUserRatings] = useState<Record<string, number>>({});
  const [optimistic, setOptimistic] = useState<Record<string, { rating: number; rating_count: number }>>({});
  const [ratingLoading, setRatingLoading] = useState<Record<string, boolean>>({});
  const [ratingError, setRatingError] = useState<string | null>(null);

  // --- Trader rating state ---
  const [traderUserRating, setTraderUserRating] = useState(0);
  const [traderOptimistic, setTraderOptimistic] = useState<{ rating: number; rating_count: number } | null>(null);
  const [traderRatingLoading, setTraderRatingLoading] = useState(false);
  const [traderRatingError, setTraderRatingError] = useState<string | null>(null);

  const { data: trader, isLoading: loadingTrader, isError: errorTrader } = useQuery<Trader>({
    queryKey: ['trader', id],
    queryFn: async () => {
      const res = await fetch(`/api/traders/${id}`);
      if (!res.ok) throw new Error('Not found');
      return res.json();
    },
  });

  const { data: products = [], isLoading: loadingProducts } = useQuery<Product[]>({
    queryKey: ['trader-products', id],
    queryFn: async () => {
      const res = await fetch(`/api/trader-products?trader_id=${id}`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!id,
  });

  const handleRate = useCallback(async (productId: string, stars: number, currentProduct: Product) => {
    if (!user?.id) return;

    setRatingError(null);

    // Save previous state for rollback
    const prevUserRating = userRatings[productId];
    const prevOptimistic = optimistic[productId];

    // Optimistic update
    const prevStars = userRatings[productId];
    const prevCount = (optimistic[productId]?.rating_count ?? currentProduct.rating_count) ?? 0;
    const prevRating = (optimistic[productId]?.rating ?? currentProduct.rating) ?? 0;
    const prevTotal = prevRating * prevCount;
    const newCount = prevStars ? prevCount : prevCount + 1;
    const newTotal = prevStars ? prevTotal - prevStars + stars : prevTotal + stars;
    const newRating = newCount > 0 ? Math.round((newTotal / newCount) * 100) / 100 : 0;

    setOptimistic(o => ({ ...o, [productId]: { rating: newRating, rating_count: newCount } }));
    setUserRatings(prev => {
      const updated = { ...prev, [productId]: stars };
      localStorage.setItem('qd_product_ratings', JSON.stringify(updated));
      return updated;
    });
    setRatingLoading(l => ({ ...l, [productId]: true }));

    try {
      const res = await authFetch('/api/product-ratings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId, stars }),
      });
      if (res.ok) {
        const { rating, rating_count } = await res.json();
        setOptimistic(o => ({ ...o, [productId]: { rating, rating_count } }));
        qc.invalidateQueries({ queryKey: ['trader-products', id] });
      } else {
        // Rollback on API error
        setOptimistic(o => {
          const next = { ...o };
          if (prevOptimistic) next[productId] = prevOptimistic;
          else delete next[productId];
          return next;
        });
        setUserRatings(prev => {
          const next = { ...prev };
          if (prevUserRating) next[productId] = prevUserRating;
          else delete next[productId];
          localStorage.setItem('qd_product_ratings', JSON.stringify(next));
          return next;
        });
        const err = await res.json().catch(() => ({}));
        setRatingError(err.error ?? (isRTL ? 'فشل حفظ التقييم — تأكد من تطبيق قاعدة البيانات' : 'Rating failed — make sure the DB migration has been applied'));
      }
    } catch {
      // Network error — rollback
      setOptimistic(o => {
        const next = { ...o };
        if (prevOptimistic) next[productId] = prevOptimistic;
        else delete next[productId];
        return next;
      });
      setRatingError(isRTL ? 'خطأ في الشبكة' : 'Network error');
    } finally {
      setRatingLoading(l => ({ ...l, [productId]: false }));
    }
  }, [userRatings, optimistic, id, qc, isRTL]);

  const handleTraderRate = useCallback(async (stars: number) => {
    if (!user?.id) return;
    const voterKey = user.id;

    setTraderRatingError(null);

    const prevUserRating = traderUserRating;
    const prevOptimistic = traderOptimistic;
    const currentRating = traderOptimistic?.rating ?? trader?.rating ?? 0;
    const currentCount = traderOptimistic?.rating_count ?? trader?.rating_count ?? 0;
    const prevTotal = currentRating * currentCount;
    const newCount = prevUserRating ? currentCount : currentCount + 1;
    const newTotal = prevUserRating ? prevTotal - prevUserRating + stars : prevTotal + stars;
    const newRating = newCount > 0 ? Math.round((newTotal / newCount) * 100) / 100 : 0;

    setTraderOptimistic({ rating: newRating, rating_count: newCount });
    setTraderUserRating(stars);
    setTraderRatingLoading(true);

    try {
      const res = await authFetch('/api/trader-ratings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trader_id: id, stars }),
      });
      if (res.ok) {
        const { rating, rating_count } = await res.json();
        setTraderOptimistic({ rating, rating_count });
        qc.invalidateQueries({ queryKey: ['trader', id] });
      } else {
        setTraderOptimistic(prevOptimistic);
        setTraderUserRating(prevUserRating);
        const err = await res.json().catch(() => ({}));
        setTraderRatingError(err.error ?? (isRTL ? 'فشل حفظ التقييم' : 'Rating failed — run migration 006'));
      }
    } catch {
      setTraderOptimistic(prevOptimistic);
      setTraderUserRating(prevUserRating);
      setTraderRatingError(isRTL ? 'خطأ في الشبكة' : 'Network error');
    } finally {
      setTraderRatingLoading(false);
    }
  }, [user, traderUserRating, traderOptimistic, trader, id, qc, isRTL]);

  const handleWhatsApp = (phone: string | null, shopName?: string) => {
    if (!phone) return;
    const d = phone.replace(/\D/g, '');
    const num = d.startsWith('966') ? d : d.startsWith('0') ? '966' + d.slice(1) : '966' + d;
    const msg = isRTL
      ? `السلام عليكم\nتواصلت معكم عبر *دليل تمور القصيم*\nأود الاستفسار عن منتجاتكم في *${shopName ?? 'متجركم'}*\nهل يمكنكم مشاركتي انواع التمور المتوفرة والاسعار؟`
      : `Hello\nI found you on *Qassim Dates Guide*\nI'd like to inquire about your products at *${shopName ?? 'your store'}*\nCould you share your available date types and prices?`;
    window.open(`https://wa.me/${num}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const ArrowIcon = isRTL ? ArrowRight : ArrowLeft;

  // Sort available products by rating desc, then by creation order
  const sortedAvailable = [...products]
    .filter(p => p.available)
    .sort((a, b) => {
      const ra = optimistic[a.id]?.rating ?? a.rating ?? 0;
      const rb = optimistic[b.id]?.rating ?? b.rating ?? 0;
      return rb - ra;
    });
  const unavailableProducts = products.filter(p => !p.available);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 md:pt-28 pb-20">
        <div className="container mx-auto px-4 max-w-4xl">

          {/* Back */}
          <Link href="/traders" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ArrowIcon className="w-4 h-4" />
            {isRTL ? 'العودة إلى التجار' : 'Back to Traders'}
          </Link>

          {/* Rating error banner */}
          {ratingError && (
            <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center justify-between">
              <span>{ratingError}</span>
              <button onClick={() => setRatingError(null)} className="ms-3 text-red-400 hover:text-red-600">✕</button>
            </div>
          )}

          {/* Loading */}
          {loadingTrader && (
            <div className="p-8 rounded-2xl bg-card animate-pulse space-y-4">
              <div className="flex gap-4">
                <div className="w-20 h-20 rounded-2xl bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-7 bg-muted rounded w-1/2" />
                  <div className="h-4 bg-muted rounded w-1/3" />
                </div>
              </div>
              <div className="h-4 bg-muted rounded w-full" />
            </div>
          )}

          {/* Error */}
          {errorTrader && (
            <div className="text-center py-20">
              <p className="text-red-500 text-lg mb-4">{isRTL ? 'لم يتم العثور على التاجر' : 'Trader not found'}</p>
              <Button asChild variant="outline"><Link href="/traders">{isRTL ? 'العودة' : 'Go Back'}</Link></Button>
            </div>
          )}

          {trader && (
            <div className="space-y-6">
              {/* Trader profile card */}
              <div className="p-6 md:p-8 rounded-2xl bg-card shadow-card">
                <div className="flex flex-col sm:flex-row gap-5">
                  {/* Avatar */}
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shrink-0 overflow-hidden">
                    {trader.image_url ? (
                      <img src={trader.image_url} alt={trader.shop_name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl font-arabic font-bold text-primary-foreground">
                        {trader.shop_name.charAt(0)}
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h1 className="font-arabic text-2xl md:text-3xl font-bold text-foreground">
                        {trader.shop_name}
                      </h1>
                      {trader.verified && (
                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-accent/20 text-accent">
                          {isRTL ? 'موثق ✓' : 'Verified ✓'}
                        </span>
                      )}
                    </div>

                    {/* Trader rating — read-only display */}
                    <div className="mb-2">
                      <StarRating
                        value={traderOptimistic?.rating ?? trader.rating}
                        count={traderOptimistic?.rating_count ?? trader.rating_count ?? 0}
                        interactive={false}
                        size="md"
                      />
                    </div>

                    {trader.city && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                        <MapPin className="w-4 h-4 text-primary" />
                        <span>{trader.city}</span>
                      </div>
                    )}

                    {trader.description && (
                      <p className="text-muted-foreground mb-4">{trader.description}</p>
                    )}

                    {/* Contact buttons */}
                    <div className="flex gap-2 flex-wrap">
                      {trader.contact_whatsapp && (
                        <Button variant="default" className="flex items-center gap-2"
                          onClick={() => handleWhatsApp(trader.contact_whatsapp, trader.shop_name)}>
                          <MessageCircle className="w-4 h-4" />
                          {isRTL ? 'تواصل عبر واتساب' : 'WhatsApp'}
                        </Button>
                      )}
                      {trader.contact_phone && (
                        <Button variant="outline" className="flex items-center gap-2" asChild>
                          <a href={`tel:${trader.contact_phone}`}>
                            <Phone className="w-4 h-4" />
                            {trader.contact_phone}
                          </a>
                        </Button>
                      )}
                    </div>

                    {/* Rate this trader */}
                    <div className="mt-4 pt-4 border-t border-border/50">
                      {user ? (
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="text-sm text-muted-foreground">
                            {isRTL ? 'قيّم هذا التاجر:' : 'Rate this trader:'}
                          </span>
                          <StarRating
                            value={traderOptimistic?.rating ?? trader.rating}
                            count={traderOptimistic?.rating_count ?? trader.rating_count ?? 0}
                            interactive={!traderRatingLoading}
                            userRating={traderUserRating}
                            onRate={handleTraderRate}
                            size="md"
                            showCount={false}
                          />
                          {traderRatingLoading && (
                            <span className="text-xs text-muted-foreground animate-pulse">
                              {isRTL ? 'جارٍ الحفظ...' : 'Saving...'}
                            </span>
                          )}
                          {!traderRatingLoading && traderUserRating > 0 && (
                            <span className="text-xs text-green-600">
                              {isRTL ? 'تم التقييم ✓' : 'Rated ✓'}
                            </span>
                          )}
                          {traderRatingError && (
                            <p className="text-xs text-red-500 flex items-center gap-2">
                              <span>{traderRatingError}</span>
                              <button onClick={() => setTraderRatingError(null)} className="text-red-400 hover:text-red-600">✕</button>
                            </p>
                          )}
                        </div>
                      ) : (
                        <button
                          onClick={() => router.push('/auth')}
                          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                          <LogIn className="w-4 h-4" />
                          {isRTL ? 'سجّل دخولك لتقييم هذا التاجر' : 'Login to rate this trader'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Products */}
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                  <ShoppingBag className="w-5 h-5 text-primary" />
                  {isRTL ? 'المنتجات المتاحة' : 'Available Products'}
                  <span className="text-sm font-normal text-muted-foreground">
                    ({sortedAvailable.length})
                  </span>
                </h2>

                {loadingProducts && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="p-4 rounded-xl bg-card animate-pulse space-y-2">
                        <div className="h-5 bg-muted rounded w-1/2" />
                        <div className="h-4 bg-muted rounded w-1/3" />
                        <div className="h-4 bg-muted rounded w-2/3" />
                      </div>
                    ))}
                  </div>
                )}

                {!loadingProducts && sortedAvailable.length === 0 && (
                  <div className="p-8 rounded-2xl bg-card text-center text-muted-foreground">
                    {isRTL ? 'لا توجد منتجات متاحة حالياً' : 'No products available at the moment'}
                  </div>
                )}

                {!loadingProducts && sortedAvailable.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {sortedAvailable.map(p => {
                      const opt = optimistic[p.id];
                      const displayRating = opt?.rating ?? p.rating ?? 0;
                      const displayCount = opt?.rating_count ?? p.rating_count ?? 0;
                      const userStar = userRatings[p.id];
                      const isSubmitting = ratingLoading[p.id];

                      return (
                        <div key={p.id} className="rounded-2xl bg-card border border-border/60 shadow-soft hover:shadow-card transition-all overflow-hidden">
                          {/* Product image */}
                          {p.image_url ? (
                            <div className="w-full h-44 overflow-hidden">
                              <img
                                src={p.image_url}
                                alt={isRTL ? p.date_types?.name_ar : p.date_types?.name_en}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-full h-32 bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
                              <ShoppingBag className="w-10 h-10 text-primary/30" />
                            </div>
                          )}
                          <div className="p-5">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <p className="font-semibold text-foreground">
                                  {isRTL ? p.date_types?.name_ar : p.date_types?.name_en}
                                </p>
                                <span className="px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary">
                                  {p.date_types?.category}
                                </span>
                              </div>
                              <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                            </div>

                            <div className="mt-3 flex items-center justify-between text-sm">
                              <span className="text-2xl font-bold text-primary">
                                {p.price_per_kg}
                                <span className="text-sm font-normal text-muted-foreground ms-1">
                                  {isRTL ? 'ر.س/كجم' : 'SAR/kg'}
                                </span>
                              </span>
                              <span className="text-muted-foreground">
                                {isRTL ? `مخزون: ${p.stock_kg} كجم` : `Stock: ${p.stock_kg} kg`}
                              </span>
                            </div>

                            {p.notes && (
                              <p className="mt-2 text-xs text-muted-foreground line-clamp-2">{p.notes}</p>
                            )}

                            {/* Star rating */}
                            <div className="mt-3 pt-3 border-t border-border/50">
                              {user ? (
                                <div className="flex items-center justify-between">
                                  <StarRating
                                    value={displayRating}
                                    count={displayCount}
                                    interactive={!isSubmitting}
                                    userRating={userStar}
                                    onRate={stars => handleRate(p.id, stars, p)}
                                    size="md"
                                  />
                                  {isSubmitting && (
                                    <span className="text-xs text-muted-foreground animate-pulse">
                                      {isRTL ? 'جارٍ...' : 'Saving...'}
                                    </span>
                                  )}
                                  {!isSubmitting && userStar && (
                                    <span className="text-xs text-green-600">
                                      {isRTL ? 'تم التقييم ✓' : 'Rated ✓'}
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <div className="flex items-center justify-between">
                                  <StarRating
                                    value={displayRating}
                                    count={displayCount}
                                    interactive={false}
                                    size="md"
                                  />
                                  <button
                                    onClick={() => router.push('/auth')}
                                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                                  >
                                    <LogIn className="w-3 h-3" />
                                    {isRTL ? 'سجّل للتقييم' : 'Login to rate'}
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Unavailable products */}
                {!loadingProducts && unavailableProducts.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                      <XCircle className="w-4 h-4" />
                      {isRTL ? 'غير متاح حالياً' : 'Currently Unavailable'}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {unavailableProducts.map(p => (
                        <div key={p.id} className="p-4 rounded-xl bg-muted/50 border border-border/40 opacity-60">
                          <p className="font-medium text-sm">
                            {isRTL ? p.date_types?.name_ar : p.date_types?.name_en}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {p.price_per_kg} {isRTL ? 'ر.س/كجم' : 'SAR/kg'}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
