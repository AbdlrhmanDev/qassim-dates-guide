'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'ar' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const translations: Record<Language, Record<string, string>> = {
  ar: {
    // Navigation
    'nav.home': 'الرئيسية',
    'nav.dates': 'أنواع التمور',
    'nav.exhibitions': 'المعارض',
    'nav.traders': 'التجار',
    'nav.ai': 'المساعد الذكي',
    'nav.login': 'تسجيل الدخول',
    
    // Hero
    'hero.title': 'تمور القصيم',
    'hero.subtitle': 'اكتشف إرث التمور السعودية العريق',
    'hero.description': 'استكشف أجود أنواع التمور من منطقة القصيم، حيث تلتقي الجودة بالتراث العربي الأصيل',
    'hero.explore': 'استكشف التمور',
    'hero.learn': 'تعرف على المزيد',
    
    // Featured
    'featured.title': 'أشهر أنواع التمور',
    'featured.subtitle': 'تشتهر منطقة القصيم بإنتاج أجود أنواع التمور في المملكة العربية السعودية',
    
    // Date Types
    'date.sukkary': 'السكري',
    'date.sukkary.desc': 'تمر ذهبي اللون، حلو المذاق، يذوب في الفم',
    'date.khalas': 'الخلاص',
    'date.khalas.desc': 'تمر بني داكن، طعم كراميل غني',
    'date.segae': 'الصقعي',
    'date.segae.desc': 'تمر أصفر ذهبي، مقرمش وحلو',
    'date.ajwa': 'العجوة',
    'date.ajwa.desc': 'تمر أسود فاخر، ذو قيمة غذائية عالية',
    
    // Stats
    'stats.varieties': 'نوع من التمور',
    'stats.farmers': 'مزارع',
    'stats.heritage': 'سنة من التراث',
    'stats.exports': 'طن صادرات سنوياً',
    
    // Culture
    'culture.title': 'تراث التمور في القصيم',
    'culture.description': 'تمثل التمور جزءاً أساسياً من الثقافة والهوية السعودية، حيث تُعد منطقة القصيم من أكبر مناطق إنتاج التمور في العالم',
    
    // Footer
    'footer.about': 'عن المنصة',
    'footer.aboutText': 'منصة ثقافية تعليمية تهدف لإبراز تراث التمور في منطقة القصيم',
    'footer.links': 'روابط سريعة',
    'footer.contact': 'تواصل معنا',
    'footer.rights': 'جميع الحقوق محفوظة',
    
    // Common
    'common.viewDetails': 'عرض التفاصيل',
    'common.contactFarmer': 'تواصل مع المزارع',
    'common.search': 'ابحث عن نوع التمر...',
    'common.filter': 'تصفية',
    'common.all': 'الكل',
  },
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.dates': 'Date Types',
    'nav.exhibitions': 'Exhibitions',
    'nav.traders': 'Traders',
    'nav.ai': 'AI Assistant',
    'nav.login': 'Login',
    
    // Hero
    'hero.title': 'Qassim Dates',
    'hero.subtitle': 'Discover the Legacy of Saudi Arabian Dates',
    'hero.description': 'Explore the finest date varieties from the Qassim region, where quality meets authentic Arabian heritage',
    'hero.explore': 'Explore Dates',
    'hero.learn': 'Learn More',
    
    // Featured
    'featured.title': 'Featured Date Varieties',
    'featured.subtitle': 'Qassim region is renowned for producing the finest dates in Saudi Arabia',
    
    // Date Types
    'date.sukkary': 'Sukkary',
    'date.sukkary.desc': 'Golden color, sweet taste, melts in your mouth',
    'date.khalas': 'Khalas',
    'date.khalas.desc': 'Dark brown, rich caramel flavor',
    'date.segae': 'Segae',
    'date.segae.desc': 'Golden yellow, crispy and sweet',
    'date.ajwa': 'Ajwa',
    'date.ajwa.desc': 'Premium black dates, highly nutritious',
    
    // Stats
    'stats.varieties': 'Date Varieties',
    'stats.farmers': 'Farmers',
    'stats.heritage': 'Years of Heritage',
    'stats.exports': 'Tons Exported Yearly',
    
    // Culture
    'culture.title': 'Date Heritage in Qassim',
    'culture.description': 'Dates represent an essential part of Saudi culture and identity. Qassim region is one of the largest date-producing areas in the world',
    
    // Footer
    'footer.about': 'About',
    'footer.aboutText': 'A cultural educational platform highlighting the date heritage of Qassim region',
    'footer.links': 'Quick Links',
    'footer.contact': 'Contact Us',
    'footer.rights': 'All Rights Reserved',
    
    // Common
    'common.viewDetails': 'View Details',
    'common.contactFarmer': 'Contact Farmer',
    'common.search': 'Search for a date type...',
    'common.filter': 'Filter',
    'common.all': 'All',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('ar');

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  const isRTL = language === 'ar';

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL }}>
      <div dir={isRTL ? 'rtl' : 'ltr'} className={isRTL ? 'font-arabic' : 'font-sans'}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
