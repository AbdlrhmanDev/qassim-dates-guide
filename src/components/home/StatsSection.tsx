"use client";

import { useLanguage } from '@/contexts/LanguageContext';
import { TreePalm, Users, CalendarDays, Package } from 'lucide-react';

const StatsSection = () => {
  const { t, isRTL } = useLanguage();

  const stats = [
    {
      icon: TreePalm,
      value: '50+',
      label: t('stats.varieties'),
    },
    {
      icon: Users,
      value: '10,000+',
      label: t('stats.farmers'),
    },
    {
      icon: CalendarDays,
      value: '5,000+',
      label: t('stats.heritage'),
    },
    {
      icon: Package,
      value: '400,000+',
      label: t('stats.exports'),
    },
  ];

  return (
    <section className="py-14 md:py-20 bg-secondary relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="text-center group"
            >
              {/* Icon */}
              <div className="inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-xl bg-primary/15 text-primary mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                <stat.icon className="w-7 h-7 md:w-8 md:h-8" />
              </div>

              {/* Value */}
              <div className="font-arabic text-2xl md:text-3xl lg:text-4xl font-bold text-secondary-foreground mb-1">
                {stat.value}
              </div>

              {/* Label */}
              <div className="text-sm md:text-base text-secondary-foreground/70 font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
