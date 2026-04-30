"use client";

import { useState } from 'react';
import { Calendar, MapPin, Clock, ExternalLink } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import type { Exhibition } from '@/lib/database.types';

const LIMIT = 4;

const STATUS_STYLE: Record<string, string> = {
  active:   'bg-accent text-accent-foreground',
  upcoming: 'bg-primary/10 text-primary',
  ended:    'bg-muted text-muted-foreground',
};

export default function ExhibitionsPage() {
  const { isRTL } = useLanguage();
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useQuery<{ data: Exhibition[]; total: number }>({
    queryKey: ['exhibitions-public', page],
    queryFn: async () => {
      const p = new URLSearchParams({ page: String(page), limit: String(LIMIT) });
      const res = await fetch('/api/exhibitions?' + p);
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    staleTime: 0,
  });

  const exhibitions = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / LIMIT);

  const statusLabel = (s: string) =>
    s === 'active'   ? (isRTL ? 'جارٍ الآن' : 'Active Now') :
    s === 'ended'    ? (isRTL ? 'انتهى' : 'Ended') :
                       (isRTL ? 'قادم' : 'Upcoming');

  const formatDateRange = (start: string | null, end: string | null) => {
    if (!start) return '';
    const fmt = (d: string) =>
      new Date(d).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' });
    return end ? `${fmt(start)} - ${fmt(end)}` : fmt(start);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 md:pt-28">
        <section className="py-12 md:py-20 bg-gradient-to-b from-muted to-background relative overflow-hidden">
          <div className="absolute inset-0 arabic-pattern opacity-20" />
          <div className="container mx-auto px-4 relative z-10">
            <h1 className="font-arabic text-4xl md:text-6xl font-bold text-foreground mb-4 text-center">
              {isRTL ? 'المعارض والفعاليات' : 'Exhibitions & Events'}
            </h1>
            <p className="text-lg text-muted-foreground text-center max-w-2xl mx-auto">
              {isRTL
                ? 'تعرف على أهم معارض ومهرجانات التمور في المملكة العربية السعودية'
                : 'Discover the most important date exhibitions and festivals in Saudi Arabia'}
            </p>
            {total > 0 && (
              <p className="text-sm text-muted-foreground text-center mt-2">
                {isRTL ? `إجمالي ${total} فعالية` : `Total of ${total} events`}
              </p>
            )}
          </div>
        </section>

        <section className="py-12 md:py-20">
          <div className="container mx-auto px-4">
            {isLoading && (
              <div className="space-y-6">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="p-6 md:p-8 rounded-2xl bg-card animate-pulse space-y-4">
                    <div className="h-4 bg-muted rounded w-1/4" />
                    <div className="h-7 bg-muted rounded w-1/2" />
                    <div className="h-4 bg-muted rounded w-full" />
                    <div className="flex gap-6">
                      <div className="h-4 bg-muted rounded w-1/4" />
                      <div className="h-4 bg-muted rounded w-1/4" />
                    </div>
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
              <>
                <div className="space-y-6">
                  {exhibitions.length === 0 ? (
                    <p className="text-muted-foreground text-center py-12">
                      {isRTL ? 'لا توجد معارض حالياً' : 'No exhibitions at the moment'}
                    </p>
                  ) : (
                    exhibitions.map((ex, index) => (
                      <div
                        key={ex.exhibition_id}
                        className="p-6 md:p-8 rounded-2xl bg-card shadow-card hover:shadow-elevated transition-all duration-300 animate-fade-in"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_STYLE[ex.status] ?? ''}`}>
                                {statusLabel(ex.status)}
                              </span>
                            </div>
                            <h2 className="font-arabic text-2xl md:text-3xl font-bold text-foreground mb-3">
                              {isRTL ? ex.name_ar : ex.name_en}
                            </h2>
                            {(isRTL ? ex.description_ar : ex.description_en) && (
                              <p className="text-muted-foreground mb-4 max-w-2xl">
                                {isRTL ? ex.description_ar : ex.description_en}
                              </p>
                            )}
                            <div className="flex flex-wrap gap-4 text-sm">
                              {ex.city && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <MapPin className="w-4 h-4 text-primary" />
                                  <span>{ex.city}{ex.place ? ` - ${ex.place}` : ''}</span>
                                </div>
                              )}
                              {ex.start_date && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <Calendar className="w-4 h-4 text-primary" />
                                  <span>{formatDateRange(ex.start_date, ex.end_date)}</span>
                                </div>
                              )}
                              {ex.time_info && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <Clock className="w-4 h-4 text-primary" />
                                  <span>{ex.time_info}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-3">
                            <Button variant="default" className="flex items-center gap-2">
                              <ExternalLink className="w-4 h-4" />
                              {isRTL ? 'تفاصيل أكثر' : 'More Details'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-10">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page <= 1}
                      onClick={() => setPage(p => p - 1)}
                    >
                      {isRTL ? 'السابق' : 'Previous'}
                    </Button>
                    <span className="text-sm text-muted-foreground px-2">{page} / {totalPages}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= totalPages}
                      onClick={() => setPage(p => p + 1)}
                    >
                      {isRTL ? 'التالي' : 'Next'}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        <section className="py-12 md:py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="font-arabic text-3xl font-bold text-foreground mb-8 text-center">
              {isRTL ? 'مواقع الفعاليات' : 'Event Locations'}
            </h2>
            <div className="aspect-video max-w-4xl mx-auto rounded-2xl bg-muted flex items-center justify-center">
              <div className="text-center p-8">
                <MapPin className="w-16 h-16 text-primary mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {isRTL ? 'خريطة تفاعلية قريباً' : 'Interactive map coming soon'}
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
