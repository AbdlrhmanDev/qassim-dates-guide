import { Helmet } from 'react-helmet-async';
import { Calendar, MapPin, Clock, ExternalLink } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useExhibitions } from '@/hooks/useExhibitions';

const ExhibitionsPage = () => {
  const { isRTL } = useLanguage();
  const { data: exhibitions = [], isLoading, isError } = useExhibitions();

  const getStatusBadge = (status: string) => {
    if (status === 'active') {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-accent text-accent-foreground">
          {isRTL ? 'جارٍ الآن' : 'Active Now'}
        </span>
      );
    }
    if (status === 'ended') {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
          {isRTL ? 'انتهى' : 'Ended'}
        </span>
      );
    }
    return (
      <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
        {isRTL ? 'قادم' : 'Upcoming'}
      </span>
    );
  };

  const formatDateRange = (start: string | null, end: string | null) => {
    if (!start) return '';
    const s = new Date(start).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' });
    if (!end) return s;
    const e = new Date(end).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' });
    return `${s} - ${e}`;
  };

  return (
    <>
      <Helmet>
        <title>{isRTL ? 'المعارض والفعاليات | تمور القصيم' : 'Exhibitions & Events | Qassim Dates'}</title>
        <meta
          name="description"
          content={isRTL
            ? 'اكتشف معارض ومهرجانات التمور في منطقة القصيم والمملكة العربية السعودية'
            : 'Discover date exhibitions and festivals in Qassim region and Saudi Arabia'
          }
        />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />

        <main className="pt-24 md:pt-28">
          {/* Header */}
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
            </div>
          </section>

          {/* Exhibitions List */}
          <section className="py-12 md:py-20">
            <div className="container mx-auto px-4">

              {/* Loading */}
              {isLoading && (
                <div className="space-y-6">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="p-6 md:p-8 rounded-2xl bg-card animate-pulse space-y-4">
                      <div className="h-6 bg-muted rounded w-1/3" />
                      <div className="h-8 bg-muted rounded w-2/3" />
                      <div className="h-4 bg-muted rounded w-full" />
                      <div className="flex gap-6">
                        <div className="h-4 bg-muted rounded w-1/4" />
                        <div className="h-4 bg-muted rounded w-1/4" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Error */}
              {isError && (
                <div className="text-center py-16">
                  <p className="text-lg text-red-500">
                    {isRTL ? 'حدث خطأ في تحميل البيانات' : 'Error loading data'}
                  </p>
                </div>
              )}

              {/* Exhibitions */}
              {!isLoading && !isError && (
                <div className="space-y-6">
                  {exhibitions.length === 0 ? (
                    <p className="text-muted-foreground text-center py-12">
                      {isRTL ? 'لا توجد معارض حالياً' : 'No exhibitions at the moment'}
                    </p>
                  ) : (
                    exhibitions.map((exhibition, index) => (
                      <div
                        key={exhibition.exhibition_id}
                        className="p-6 md:p-8 rounded-2xl bg-card shadow-card hover:shadow-elevated transition-all duration-300 animate-fade-in"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              {getStatusBadge(exhibition.status)}
                            </div>
                            <h2 className="font-arabic text-2xl md:text-3xl font-bold text-foreground mb-3">
                              {isRTL ? exhibition.name_ar : exhibition.name_en}
                            </h2>
                            {(isRTL ? exhibition.description_ar : exhibition.description_en) && (
                              <p className="text-muted-foreground mb-4 max-w-2xl">
                                {isRTL ? exhibition.description_ar : exhibition.description_en}
                              </p>
                            )}

                            <div className="flex flex-wrap gap-4 text-sm">
                              {(exhibition.start_date || exhibition.end_date) && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <Calendar className="w-4 h-4 text-primary" />
                                  <span>{formatDateRange(exhibition.start_date, exhibition.end_date)}</span>
                                </div>
                              )}
                              {exhibition.city && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <MapPin className="w-4 h-4 text-primary" />
                                  <span>{exhibition.city}{exhibition.place ? ` - ${exhibition.place}` : ''}</span>
                                </div>
                              )}
                              {exhibition.time_info && (
                                <div className="flex items-center gap-2 text-muted-foreground">
                                  <Clock className="w-4 h-4 text-primary" />
                                  <span>{exhibition.time_info}</span>
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
              )}
            </div>
          </section>

          {/* Map placeholder */}
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
    </>
  );
};

export default ExhibitionsPage;
