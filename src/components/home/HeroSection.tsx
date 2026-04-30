"use client";

import Link from 'next/link';
import Image from 'next/image';
import { ArrowDown, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import heroImage from '@/assets/hero-dates.jpg';

const HeroSection = () => {
  const { t, isRTL } = useLanguage();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <Image
          src={heroImage}
          alt="Qassim Date Palm Grove"
          fill
          priority
          quality={85}
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-secondary/60 via-secondary/40 to-cream" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 pt-20 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/15 backdrop-blur-sm border border-primary/30 mb-8 animate-fade-in">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              {isRTL ? 'اكتشف تراث التمور' : 'Discover Date Heritage'}
            </span>
          </div>

          {/* Title */}
          <h1 className="font-arabic text-5xl md:text-7xl lg:text-8xl font-bold text-primary-foreground mb-6 animate-fade-in drop-shadow-lg" style={{ animationDelay: '0.1s' }}>
            {t('hero.title')}
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-primary-foreground/90 font-arabic mb-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            {t('hero.subtitle')}
          </p>

          {/* Description */}
          <p className="text-lg text-primary-foreground/75 max-w-2xl mx-auto mb-10 animate-fade-in" style={{ animationDelay: '0.3s' }}>
            {t('hero.description')}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-base font-medium shadow-lg" size="lg" asChild>
              <Link href="/dates">{t('hero.explore')}</Link>
            </Button>
            <Button variant="outline" className="bg-card/80 backdrop-blur-sm border-border/60 text-foreground hover:bg-card px-8 py-3 text-base" size="lg" asChild>
              <Link href="/exhibitions">{t('hero.learn')}</Link>
            </Button>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
          <ArrowDown className="w-6 h-6 text-primary-foreground/50" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
