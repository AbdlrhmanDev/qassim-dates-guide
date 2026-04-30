import { Helmet } from 'react-helmet-async';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/home/HeroSection';
import FeaturedDates from '@/components/home/FeaturedDates';
import ExhibitionsSection from '@/components/home/ExhibitionsSection';
import StatsSection from '@/components/home/StatsSection';
import CultureSection from '@/components/home/CultureSection';
import { useLanguage } from '@/contexts/LanguageContext';

const Index = () => {
  const { isRTL } = useLanguage();

  return (
    <>
      <Helmet>
        <title>{isRTL ? 'تمور القصيم - اكتشف إرث التمور السعودية' : 'Qassim Dates - Discover Saudi Date Heritage'}</title>
        <meta 
          name="description" 
          content={isRTL 
            ? 'اكتشف أجود أنواع التمور من منطقة القصيم في المملكة العربية السعودية. تعرف على السكري والخلاص والصقعي والعجوة وغيرها من أنواع التمور الفاخرة.'
            : 'Discover the finest date varieties from Qassim region in Saudi Arabia. Learn about Sukkary, Khalas, Segae, Ajwa and other premium date types.'
          } 
        />
        <meta name="keywords" content="Qassim dates, Saudi dates, Sukkary, Khalas, Segae, Ajwa, تمور القصيم, تمور سعودية" />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />
        <main>
          <HeroSection />
          <FeaturedDates />
          <ExhibitionsSection />
          <StatsSection />
          <CultureSection />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Index;
