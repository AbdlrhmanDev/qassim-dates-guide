import { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Search, ArrowRight, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useDates } from '@/hooks/useDates';
import sukkaryImage from '@/assets/sukkary-dates.jpg';

const ITEMS_PER_PAGE = 9;

// StaticImageData → string via .src for use in <img src>
const FALLBACK_IMAGE: string = typeof sukkaryImage === 'string' ? sukkaryImage : (sukkaryImage as { src: string }).src;

const DatesPage = () => {
  const { t, isRTL } = useLanguage();
  const [searchTerm, setSearchTerm]         = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage]       = useState(1);

  const { data: allDates = [], isLoading, isError } = useDates();

  const categories = [
    { id: 'all',     label: t('common.all') },
    { id: 'premium', label: isRTL ? 'فاخر'  : 'Premium' },
    { id: 'fresh',   label: isRTL ? 'طازج'  : 'Fresh'   },
    { id: 'dried',   label: isRTL ? 'مجفف'  : 'Dried'   },
  ];

  const filteredDates = useMemo(() => {
    return allDates.filter((date) => {
      const name = isRTL ? date.name_ar : date.name_en;
      const matchesSearch =
        date.name_ar.toLowerCase().includes(searchTerm.toLowerCase()) ||
        date.name_en.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || date.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [allDates, searchTerm, selectedCategory, isRTL]);

  const totalPages   = Math.ceil(filteredDates.length / ITEMS_PER_PAGE);
  const startIndex   = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedDates = filteredDates.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleCategoryChange = (category: string) => { setSelectedCategory(category); setCurrentPage(1); };
  const handleSearchChange   = (value: string)    => { setSearchTerm(value);           setCurrentPage(1); };

  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  return (
    <>
      <Helmet>
        <title>{isRTL ? 'أنواع التمور | تمور القصيم' : 'Date Types | Qassim Dates'}</title>
        <meta
          name="description"
          content={isRTL
            ? 'استكشف جميع أنواع التمور في منطقة القصيم من السكري والخلاص والصقعي والعجوة وغيرها'
            : 'Explore all date varieties from Qassim region including Sukkary, Khalas, Segae, Ajwa and more'
          }
        />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />

        <main className="pt-16">
          {/* Header */}
          <section className="py-10 md:py-16 bg-cream relative overflow-hidden">
            <div className="container mx-auto px-4 relative z-10">
              <h1 className="font-arabic text-3xl md:text-5xl font-bold text-foreground mb-3 text-center">
                {t('nav.dates')}
              </h1>
              <p className="text-base md:text-lg text-muted-foreground text-center max-w-2xl mx-auto">
                {isRTL
                  ? 'اكتشف أجود أنواع تمور منطقة القصيم'
                  : 'Discover the finest varieties of Qassim dates'}
              </p>
            </div>
          </section>

          {/* Search and Filter */}
          <section className="py-6 border-b border-border bg-background">
            <div className="container mx-auto px-4">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-80">
                  <Search className="absolute start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder={t('common.search')}
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="w-full ps-12 pe-4 py-2.5 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
                  />
                </div>
                <div className="flex items-center gap-2 flex-wrap justify-center">
                  {categories.map((category) => (
                    <Button
                      key={category.id}
                      variant={selectedCategory === category.id ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleCategoryChange(category.id)}
                      className="text-sm"
                    >
                      {category.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Results count */}
          <section className="py-4 bg-background">
            <div className="container mx-auto px-4">
              <p className="text-sm text-muted-foreground">
                {isLoading
                  ? (isRTL ? 'جارٍ التحميل...' : 'Loading...')
                  : isRTL
                    ? `عرض ${paginatedDates.length} من ${filteredDates.length} نوع`
                    : `Showing ${paginatedDates.length} of ${filteredDates.length} varieties`
                }
              </p>
            </div>
          </section>

          {/* Dates Grid */}
          <section className="py-8 md:py-12">
            <div className="container mx-auto px-4">

              {/* Loading state */}
              {isLoading && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="rounded-xl bg-card border border-border/60 overflow-hidden animate-pulse">
                      <div className="h-48 bg-muted" />
                      <div className="p-4 space-y-3">
                        <div className="h-5 bg-muted rounded w-3/4" />
                        <div className="h-4 bg-muted rounded w-full" />
                        <div className="h-4 bg-muted rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Error state */}
              {isError && (
                <div className="text-center py-16">
                  <p className="text-lg text-red-500">
                    {isRTL ? 'حدث خطأ في تحميل البيانات' : 'Error loading data'}
                  </p>
                </div>
              )}

              {/* Dates grid */}
              {!isLoading && !isError && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
                  {paginatedDates.map((date, index) => (
                    <Link
                      key={date.date_type_id}
                      to={`/dates/${date.date_type_id}`}
                      className="group relative rounded-xl overflow-hidden bg-card border border-border/60 shadow-soft hover:shadow-card transition-all duration-300 hover:-translate-y-1"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      {/* Image */}
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={date.image_url ?? FALLBACK_IMAGE}
                          alt={isRTL ? date.name_ar : date.name_en}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
                        <div className="absolute top-3 start-3">
                          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-primary text-primary-foreground">
                            {categories.find(c => c.id === date.category)?.label}
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4">
                        <h3 className="font-arabic text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                          {isRTL ? date.name_ar : date.name_en}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {isRTL ? date.description_ar : date.description_en}
                        </p>

                        {/* Details */}
                        <div className="flex items-center justify-between text-xs mb-3">
                          {date.calories && (
                            <span className="text-muted-foreground">
                              <span className="font-medium text-foreground">{date.calories}</span>{' '}
                              {isRTL ? 'سعرة' : 'cal'}
                            </span>
                          )}
                          {date.season && (
                            <span className="text-muted-foreground">{date.season}</span>
                          )}
                        </div>

                        {/* CTA */}
                        <div className="flex items-center text-primary text-sm font-medium">
                          <span>{t('common.viewDetails')}</span>
                          <ArrowIcon className="w-4 h-4 ms-2 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* No Results */}
              {!isLoading && !isError && filteredDates.length === 0 && (
                <div className="text-center py-16">
                  <p className="text-lg text-muted-foreground">
                    {isRTL ? 'لا توجد نتائج مطابقة' : 'No matching results found'}
                  </p>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  <Button
                    variant="outline" size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="gap-1"
                  >
                    {isRTL ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                    {isRTL ? 'السابق' : 'Previous'}
                  </Button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className="w-9 h-9 p-0"
                      >
                        {page}
                      </Button>
                    ))}
                  </div>

                  <Button
                    variant="outline" size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="gap-1"
                  >
                    {isRTL ? 'التالي' : 'Next'}
                    {isRTL ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </Button>
                </div>
              )}
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default DatesPage;
