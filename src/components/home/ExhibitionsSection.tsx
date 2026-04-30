import Link from 'next/link';
import { Calendar, MapPin, Clock, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useExhibitions } from '@/hooks/useExhibitions';

const STATUS_STYLE: Record<string, string> = {
  active:   'bg-green-500/10 text-green-600',
  upcoming: 'bg-primary/10 text-primary',
  ended:    'bg-muted text-muted-foreground',
};

const ExhibitionsSection = () => {
  const { isRTL } = useLanguage();
  const { data: exhibitions = [], isLoading } = useExhibitions();

  // Show at most 3, prioritise active then upcoming
  const sorted = [...exhibitions].sort((a, b) => {
    const order = { active: 0, upcoming: 1, ended: 2 };
    return (order[a.status] ?? 3) - (order[b.status] ?? 3);
  });
  const visible = sorted.slice(0, 3);

  const statusLabel = (s: string) =>
    s === 'active'   ? (isRTL ? 'جارٍ الآن' : 'Active Now') :
    s === 'ended'    ? (isRTL ? 'انتهى' : 'Ended') :
                       (isRTL ? 'قادم' : 'Upcoming');

  const formatDate = (d: string | null) =>
    d ? new Date(d).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : '';

  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  if (!isLoading && exhibitions.length === 0) return null;

  return (
    <section className="py-20 md:py-28 bg-muted/30 relative overflow-hidden">
      <div className="absolute inset-0 arabic-pattern opacity-10" />
      <div className="container mx-auto px-4 relative z-10">

        {/* Header */}
        <div className="text-center mb-14">
          <h2 className="font-arabic text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            {isRTL ? 'المعارض والفعاليات' : 'Exhibitions & Events'}
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            {isRTL
              ? 'تعرف على أبرز فعاليات ومهرجانات التمور في المملكة العربية السعودية'
              : 'Discover the most prominent date festivals and events across Saudi Arabia'}
          </p>
        </div>

        {/* Loading skeleton */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="rounded-2xl bg-card border border-border/60 p-6 animate-pulse space-y-3">
                <div className="h-4 bg-muted rounded w-1/3" />
                <div className="h-6 bg-muted rounded w-2/3" />
                <div className="h-4 bg-muted rounded w-full" />
                <div className="h-4 bg-muted rounded w-1/2" />
              </div>
            ))}
          </div>
        )}

        {/* Cards */}
        {!isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {visible.map((ex, index) => (
              <div
                key={ex.exhibition_id}
                className="group rounded-2xl bg-card border border-border/60 shadow-soft hover:shadow-card hover:-translate-y-1 transition-all duration-300 p-6 flex flex-col gap-4"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Status badge */}
                <div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_STYLE[ex.status] ?? ''}`}>
                    {statusLabel(ex.status)}
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-arabic text-xl font-bold text-foreground group-hover:text-primary transition-colors leading-snug">
                  {isRTL ? ex.name_ar : ex.name_en}
                </h3>

                {/* Description */}
                {(isRTL ? ex.description_ar : ex.description_en) && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {isRTL ? ex.description_ar : ex.description_en}
                  </p>
                )}

                {/* Meta */}
                <div className="flex flex-col gap-2 mt-auto text-sm text-muted-foreground">
                  {ex.city && (
                    <span className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-primary shrink-0" />
                      {ex.city}{ex.place ? ` — ${ex.place}` : ''}
                    </span>
                  )}
                  {ex.start_date && (
                    <span className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary shrink-0" />
                      {formatDate(ex.start_date)}
                      {ex.end_date ? ` — ${formatDate(ex.end_date)}` : ''}
                    </span>
                  )}
                  {ex.time_info && (
                    <span className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-primary shrink-0" />
                      {ex.time_info}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* View all */}
        <div className="text-center mt-12">
          <Button variant="outline" size="lg" className="border-border hover:bg-muted hover:border-primary/30" asChild>
            <Link href="/exhibitions" className="inline-flex items-center gap-2">
              {isRTL ? 'عرض جميع الفعاليات' : 'View All Events'}
              <ArrowIcon className="w-4 h-4" />
            </Link>
          </Button>
        </div>

      </div>
    </section>
  );
};

export default ExhibitionsSection;
