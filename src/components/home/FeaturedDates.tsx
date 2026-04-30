"use client";

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import sukkaryImage from '@/assets/sukkary-dates.jpg';
import khalasImage from '@/assets/khalas-dates.jpg';
import segaeImage from '@/assets/segae-dates.jpg';
import ajwaImage from '@/assets/ajwa-dates.jpg';

const FeaturedDates = () => {
  const { t, isRTL } = useLanguage();

  const dates = [
    {
      id: 'sukkary',
      name: t('date.sukkary'),
      description: t('date.sukkary.desc'),
      image: sukkaryImage,
    },
    {
      id: 'khalas',
      name: t('date.khalas'),
      description: t('date.khalas.desc'),
      image: khalasImage,
    },
    {
      id: 'segae',
      name: t('date.segae'),
      description: t('date.segae.desc'),
      image: segaeImage,
    },
    {
      id: 'ajwa',
      name: t('date.ajwa'),
      description: t('date.ajwa.desc'),
      image: ajwaImage,
    },
  ];

  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  return (
    <section className="py-20 md:py-28 bg-background relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-14">
          <h2 className="font-arabic text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            {t('featured.title')}
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('featured.subtitle')}
          </p>
        </div>

        {/* Date Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
          {dates.map((date, index) => (
            <Link
              key={date.id}
              href={`/dates/${date.id}`}
              className="group relative rounded-xl overflow-hidden bg-card border border-border/60 shadow-soft hover:shadow-card transition-all duration-300 hover:-translate-y-1"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Image */}
              <div className="relative h-52 overflow-hidden">
                <Image
                  src={date.image}
                  alt={date.name}
                  fill
                  quality={75}
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  loading={index === 0 ? 'eager' : 'lazy'}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
              </div>

              {/* Content */}
              <div className="p-5">
                <h3 className="font-arabic text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                  {date.name}
                </h3>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {date.description}
                </p>
                <div className="flex items-center text-primary text-sm font-medium">
                  <span>{t('common.viewDetails')}</span>
                  <ArrowIcon className="w-4 h-4 ms-2 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <Button variant="outline" size="lg" className="border-border hover:bg-muted hover:border-primary/30" asChild>
            <Link href="/dates" className="inline-flex items-center gap-2">
              {isRTL ? 'عرض جميع الأنواع' : 'View All Varieties'}
              <ArrowIcon className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedDates;
