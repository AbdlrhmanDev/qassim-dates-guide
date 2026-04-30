"use client";

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, ArrowRight, ArrowLeft, ChevronLeft, ChevronRight, Store } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import sukkaryImage from '@/assets/sukkary-dates.jpg';
import khalasImage from '@/assets/khalas-dates.jpg';
import segaeImage from '@/assets/segae-dates.jpg';
import ajwaImage from '@/assets/ajwa-dates.jpg';
import Image from 'next/image';

const ITEMS_PER_PAGE = 9;

export default function DatesPage() {
  const { t, isRTL } = useLanguage();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  const categories = [
    { id: 'all', label: t('common.all') },
    { id: 'premium', label: isRTL ? 'فاخر' : 'Premium' },
    { id: 'fresh', label: isRTL ? 'طازج' : 'Fresh' },
    { id: 'dried', label: isRTL ? 'مجفف' : 'Dried' },
  ];

  // Traders data
  const traders = [
    {
      id: 'al-abdullah',
      name: isRTL ? 'مزارع العبدالله' : 'Al-Abdullah Farms',
      nameEn: 'Al-Abdullah Farms',
    },
    {
      id: 'golden-palm',
      name: isRTL ? 'مؤسسة النخيل الذهبي' : 'Golden Palm Foundation',
      nameEn: 'Golden Palm Foundation',
    },
    {
      id: 'al-waha',
      name: isRTL ? 'مزارع الواحة' : 'Al-Waha Farms',
      nameEn: 'Al-Waha Farms',
    },
    {
      id: 'qassim-dates',
      name: isRTL ? 'شركة تمور القصيم' : 'Qassim Dates Company',
      nameEn: 'Qassim Dates Company',
    },
  ];

  const dates = [
    {
      id: 'sukkary',
      name: isRTL ? 'السكري' : 'Sukkary',
      nameEn: 'Sukkary',
      description: isRTL ? 'ملك التمور السعودية، طعم حلو مميز وقوام طري' : 'King of Saudi dates, distinctively sweet taste with soft texture',
      image: sukkaryImage,
      category: 'premium',
      trader: traders[0],
    },
    {
      id: 'khalas',
      name: isRTL ? 'الخلاص' : 'Khalas',
      nameEn: 'Khalas',
      description: isRTL ? 'تمر ذهبي اللون، حلو المذاق مع نكهة الكراميل' : 'Golden colored date, sweet with caramel flavor',
      image: khalasImage,
      category: 'premium',
      trader: traders[0],
    },
    {
      id: 'segae',
      name: isRTL ? 'الصقعي' : 'Segae',
      nameEn: 'Segae',
      description: isRTL ? 'تمر ذو لونين أحمر وأصفر، طعم منعش ومقرمش' : 'Two-colored red and yellow, refreshing crispy taste',
      image: segaeImage,
      category: 'fresh',
      trader: traders[2],
    },
    {
      id: 'ajwa',
      name: isRTL ? 'العجوة' : 'Ajwa',
      nameEn: 'Ajwa',
      description: isRTL ? 'تمر المدينة المنورة المبارك، أسود اللون غني بالفوائد' : 'Blessed Madinah date, black color rich in benefits',
      image: ajwaImage,
      category: 'premium',
      trader: traders[1],
    },
    {
      id: 'mabroom',
      name: isRTL ? 'المبروم' : 'Mabroom',
      nameEn: 'Mabroom',
      description: isRTL ? 'تمر طويل ورفيع، طعم غني ومميز مع قوام مطاطي' : 'Long and thin, rich distinctive flavor with chewy texture',
      image: khalasImage,
      category: 'dried',
      trader: traders[1],
    },
    {
      id: 'safawi',
      name: isRTL ? 'الصفاوي' : 'Safawi',
      nameEn: 'Safawi',
      description: isRTL ? 'تمر أسود لامع من المدينة، مذاق حلو معتدل' : 'Shiny black date from Madinah, moderately sweet taste',
      image: ajwaImage,
      category: 'premium',
      trader: traders[3],
    },
    {
      id: 'medjool',
      name: isRTL ? 'المجدول' : 'Medjool',
      nameEn: 'Medjool',
      description: isRTL ? 'ملك التمور، حجم كبير وطعم كراميل غني' : 'King of dates, large size with rich caramel taste',
      image: sukkaryImage,
      category: 'premium',
      trader: traders[3],
    },
    {
      id: 'barhi',
      name: isRTL ? 'البرحي' : 'Barhi',
      nameEn: 'Barhi',
      description: isRTL ? 'تمر ذهبي كروي، يؤكل طازجاً أو ناضجاً' : 'Golden spherical date, eaten fresh or ripe',
      image: segaeImage,
      category: 'fresh',
      trader: traders[2],
    },
    {
      id: 'nabtat-ali',
      name: isRTL ? 'نبتة علي' : 'Nabtat Ali',
      nameEn: 'Nabtat Ali',
      description: isRTL ? 'تمر قصيمي أصيل، حلو ولذيذ بقوام متماسك' : 'Authentic Qassimi date, sweet and delicious with firm texture',
      image: khalasImage,
      category: 'premium',
      trader: traders[0],
    },
    {
      id: 'wannanah',
      name: isRTL ? 'الونانة' : 'Wannanah',
      nameEn: 'Wannanah',
      description: isRTL ? 'تمر أحمر داكن، طعم حلو متوازن ومميز' : 'Dark red date, balanced sweet and distinctive taste',
      image: ajwaImage,
      category: 'dried',
      trader: traders[1],
    },
  ];

  const filteredDates = useMemo(() => {
    return dates.filter(date => {
      const matchesSearch = date.nameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           date.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || date.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory, isRTL]);

  const totalPages = Math.ceil(filteredDates.length / ITEMS_PER_PAGE);
  const paginatedDates = filteredDates.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleDateClick = (id: string) => {
    router.push(`/dates/${id}`);
  };

  return (
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
              {isRTL ? 'اكتشف أكثر من 10 أنواع من أجود تمور منطقة القصيم' : 'Discover over 10 varieties of the finest Qassim dates'}
            </p>
          </div>
        </section>

        {/* Search and Filter */}
        <section className="py-6 border-b border-border bg-background">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              {/* Search */}
              <div className="relative w-full md:w-80">
                <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground`} />
                <input
                  type="text"
                  placeholder={t('common.search')}
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2.5 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm`}
                  dir={isRTL ? 'rtl' : 'ltr'}
                />
              </div>

              {/* Category Filters */}
              <div className="flex items-center gap-2 flex-wrap justify-center">
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      setSelectedCategory(category.id);
                      setCurrentPage(1);
                    }}
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
              {isRTL 
                ? `عرض ${paginatedDates.length} من ${filteredDates.length} نوع`
                : `Showing ${paginatedDates.length} of ${filteredDates.length} varieties`
              }
            </p>
          </div>
        </section>

        {/* Dates Grid */}
        <section className="py-8 md:py-12">
          <div className="container mx-auto px-4">
            {paginatedDates.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
                {paginatedDates.map((date, index) => (
                  <div
                    key={date.id}
                    className="group relative rounded-xl overflow-hidden bg-card border border-border/60 shadow-soft hover:shadow-card transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                    onClick={() => handleDateClick(date.id)}
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    {/* Image */}
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src={date.image}
                        alt={date.name}
                        fill
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
                      
                      {/* Category Badge */}
                      <div className={`absolute top-3 ${isRTL ? 'right-3' : 'left-3'}`}>
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-primary text-primary-foreground">
                          {categories.find(c => c.id === date.category)?.label}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <h3 className="font-arabic text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                        {date.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {date.description}
                      </p>
                      
                      {/* Trader */}
                      <div className="flex items-center gap-2 text-xs mb-3 p-2 rounded-lg bg-muted/50">
                        <Store className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                        <span className="text-foreground font-medium truncate">
                          {date.trader.name}
                        </span>
                      </div>

                      {/* CTA */}
                      <div className="flex items-center text-primary text-sm font-medium">
                        <span>{t('common.viewDetails')}</span>
                        {isRTL ? (
                          <ArrowLeft className="w-4 h-4 ms-2 group-hover:-translate-x-1 transition-transform" />
                        ) : (
                          <ArrowRight className="w-4 h-4 ms-2 group-hover:translate-x-1 transition-transform" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
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
                  variant="outline"
                  size="sm"
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
                  variant="outline"
                  size="sm"
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
  );
}

