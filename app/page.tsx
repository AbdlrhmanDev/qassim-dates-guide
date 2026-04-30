import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/home/HeroSection';
import FeaturedDates from '@/components/home/FeaturedDates';
import StatsSection from '@/components/home/StatsSection';
import CultureSection from '@/components/home/CultureSection';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <FeaturedDates />
        <StatsSection />
        <CultureSection />
      </main>
      <Footer />
    </div>
  );
}
