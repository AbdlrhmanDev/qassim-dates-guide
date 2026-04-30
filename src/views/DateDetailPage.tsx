import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, ArrowRight, Heart, Leaf, Sun, Calendar, MapPin, Phone, Store } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import sukkaryImage from '@/assets/sukkary-dates.jpg';
import khalasImage from '@/assets/khalas-dates.jpg';
import segaeImage from '@/assets/segae-dates.jpg';
import ajwaImage from '@/assets/ajwa-dates.jpg';

// Traders data
const traders = {
  'al-abdullah': {
    id: 'al-abdullah',
    name: { ar: 'مزارع العبدالله', en: 'Al-Abdullah Farms' },
  },
  'golden-palm': {
    id: 'golden-palm',
    name: { ar: 'مؤسسة النخيل الذهبي', en: 'Golden Palm Foundation' },
  },
  'al-waha': {
    id: 'al-waha',
    name: { ar: 'مزارع الواحة', en: 'Al-Waha Farms' },
  },
  'qassim-dates': {
    id: 'qassim-dates',
    name: { ar: 'شركة تمور القصيم', en: 'Qassim Dates Company' },
  },
};

const DateDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { isRTL } = useLanguage();

  const dateData: Record<string, any> = {
    sukkary: {
      name: isRTL ? 'تمر السكري' : 'Sukkary Dates',
      arabicName: 'السكري',
      description: isRTL 
        ? 'يُعد تمر السكري من أشهر أنواع التمور في المملكة العربية السعودية، يتميز بلونه الذهبي الجميل وملمسه الناعم. سُمي بالسكري نظراً لحلاوته الطبيعية الفريدة التي تشبه السكر المذاب.'
        : 'Sukkary dates are among the most famous date varieties in Saudi Arabia, known for their beautiful golden color and smooth texture. Named after sugar due to their unique natural sweetness.',
      image: sukkaryImage,
      origin: isRTL ? 'بريدة، القصيم' : 'Buraydah, Qassim',
      season: isRTL ? 'أغسطس - سبتمبر' : 'August - September',
      traderId: 'al-abdullah',
      nutrition: {
        calories: 277,
        carbs: 75,
        fiber: 7,
        protein: 2,
        potassium: 656,
      },
      benefits: [
        { icon: Heart, text: isRTL ? 'يدعم صحة القلب' : 'Supports heart health' },
        { icon: Leaf, text: isRTL ? 'غني بالألياف الغذائية' : 'Rich in dietary fiber' },
        { icon: Sun, text: isRTL ? 'مصدر طاقة طبيعي' : 'Natural energy source' },
      ],
    },
    khalas: {
      name: isRTL ? 'تمر الخلاص' : 'Khalas Dates',
      arabicName: 'الخلاص',
      description: isRTL 
        ? 'تمر الخلاص من التمور الفاخرة المميزة بلونها البني الداكن وطعمها الغني الذي يشبه الكراميل. يُعتبر من أكثر التمور طلباً في الأسواق المحلية والعالمية.'
        : 'Khalas dates are premium dates distinguished by their dark brown color and rich caramel-like taste. Considered one of the most sought-after dates in local and international markets.',
      image: khalasImage,
      origin: isRTL ? 'القصيم' : 'Qassim',
      season: isRTL ? 'سبتمبر - أكتوبر' : 'September - October',
      traderId: 'al-abdullah',
      nutrition: {
        calories: 282,
        carbs: 76,
        fiber: 8,
        protein: 2.5,
        potassium: 670,
      },
      benefits: [
        { icon: Heart, text: isRTL ? 'يخفض الكوليسترول' : 'Lowers cholesterol' },
        { icon: Leaf, text: isRTL ? 'يحسن الهضم' : 'Improves digestion' },
        { icon: Sun, text: isRTL ? 'يزيد النشاط والحيوية' : 'Boosts energy and vitality' },
      ],
    },
    segae: {
      name: isRTL ? 'تمر الصقعي' : 'Segae Dates',
      arabicName: 'الصقعي',
      description: isRTL 
        ? 'تمر الصقعي يتميز بلونه الأصفر الذهبي وقوامه المقرمش الفريد. يُحصد في مرحلة مبكرة مما يمنحه طعماً حلواً منعشاً ومميزاً.'
        : 'Segae dates are characterized by their golden yellow color and unique crispy texture. Harvested at an early stage giving them a refreshing sweet distinctive taste.',
      image: segaeImage,
      origin: isRTL ? 'عنيزة، القصيم' : 'Unayzah, Qassim',
      season: isRTL ? 'يوليو - أغسطس' : 'July - August',
      traderId: 'al-waha',
      nutrition: {
        calories: 265,
        carbs: 70,
        fiber: 6,
        protein: 1.8,
        potassium: 620,
      },
      benefits: [
        { icon: Heart, text: isRTL ? 'مضاد للأكسدة' : 'Antioxidant properties' },
        { icon: Leaf, text: isRTL ? 'غني بالفيتامينات' : 'Rich in vitamins' },
        { icon: Sun, text: isRTL ? 'منخفض السعرات نسبياً' : 'Relatively low calories' },
      ],
    },
    ajwa: {
      name: isRTL ? 'تمر العجوة' : 'Ajwa Dates',
      arabicName: 'العجوة',
      description: isRTL 
        ? 'تمر العجوة من أفخر أنواع التمور وأكثرها قيمة، يتميز بلونه الأسود الداكن وملمسه الناعم. له مكانة خاصة في الثقافة الإسلامية ويُعرف بفوائده الصحية العديدة.'
        : 'Ajwa dates are among the finest and most valuable date varieties, known for their dark black color and soft texture. Holds a special place in Islamic culture and known for numerous health benefits.',
      image: ajwaImage,
      origin: isRTL ? 'المدينة المنورة' : 'Madinah',
      season: isRTL ? 'أغسطس - سبتمبر' : 'August - September',
      traderId: 'golden-palm',
      nutrition: {
        calories: 287,
        carbs: 78,
        fiber: 9,
        protein: 2.8,
        potassium: 700,
      },
      benefits: [
        { icon: Heart, text: isRTL ? 'يقوي المناعة' : 'Strengthens immunity' },
        { icon: Leaf, text: isRTL ? 'مفيد للعظام' : 'Beneficial for bones' },
        { icon: Sun, text: isRTL ? 'يحسن صحة الدماغ' : 'Improves brain health' },
      ],
    },
  };

  const date = dateData[id || 'sukkary'] || dateData.sukkary;
  const trader = traders[date.traderId as keyof typeof traders];
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;

  return (
    <>
      <Helmet>
        <title>{date.name} | {isRTL ? 'تمور القصيم' : 'Qassim Dates'}</title>
        <meta name="description" content={date.description} />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />
        
        <main className="pt-24 md:pt-28">
          {/* Back Button */}
          <div className="container mx-auto px-4 py-4">
            <Link 
              to="/dates" 
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <BackIcon className="w-4 h-4" />
              <span>{isRTL ? 'العودة للقائمة' : 'Back to list'}</span>
            </Link>
          </div>

          {/* Hero Section */}
          <section className="py-8 md:py-12">
            <div className="container mx-auto px-4">
              <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-start">
                {/* Image */}
                <div className="relative rounded-3xl overflow-hidden shadow-elevated">
                  <img
                    src={date.image}
                    alt={date.name}
                    className="w-full aspect-square object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 to-transparent" />
                </div>

                {/* Content */}
                <div className="space-y-8">
                  {/* Title */}
                  <div>
                    <span className="text-primary font-medium mb-2 block">{date.arabicName}</span>
                    <h1 className="font-arabic text-4xl md:text-5xl font-bold text-foreground mb-4">
                      {date.name}
                    </h1>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                      {date.description}
                    </p>
                  </div>

                  {/* Trader Info */}
                  {trader && (
                    <Link 
                      to="/traders"
                      className="flex items-center gap-3 p-4 rounded-xl bg-muted/50 border border-border/50 hover:bg-muted transition-colors group"
                    >
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                        <Store className="w-6 h-6 text-primary-foreground" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-0.5">
                          {isRTL ? 'التاجر / المزارع' : 'Trader / Farmer'}
                        </p>
                        <p className="font-arabic font-bold text-foreground group-hover:text-primary transition-colors">
                          {isRTL ? trader.name.ar : trader.name.en}
                        </p>
                      </div>
                    </Link>
                  )}

                  {/* Origin & Season */}
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted">
                      <MapPin className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">{date.origin}</span>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted">
                      <Calendar className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium">{date.season}</span>
                    </div>
                  </div>

                  {/* Benefits */}
                  <div>
                    <h2 className="font-arabic text-xl font-bold text-foreground mb-4">
                      {isRTL ? 'الفوائد الصحية' : 'Health Benefits'}
                    </h2>
                    <div className="space-y-3">
                      {date.benefits.map((benefit: any, index: number) => (
                        <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-accent/10">
                          <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                            <benefit.icon className="w-5 h-5 text-accent" />
                          </div>
                          <span className="font-medium text-foreground">{benefit.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="flex flex-wrap gap-4">
                    <Button variant="hero" size="lg" className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      {isRTL ? 'تواصل مع المزارع' : 'Contact Farmer'}
                    </Button>
                    <Button variant="outline" size="lg">
                      {isRTL ? 'عرض التجار' : 'View Traders'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Nutrition Section */}
          <section className="py-12 md:py-20 bg-muted/30">
            <div className="container mx-auto px-4">
              <h2 className="font-arabic text-3xl font-bold text-foreground mb-8 text-center">
                {isRTL ? 'القيمة الغذائية' : 'Nutritional Value'}
              </h2>
              <p className="text-muted-foreground text-center mb-8">
                {isRTL ? 'لكل 100 جرام' : 'Per 100 grams'}
              </p>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 max-w-4xl mx-auto">
                {[
                  { label: isRTL ? 'سعرات حرارية' : 'Calories', value: date.nutrition.calories, unit: 'kcal' },
                  { label: isRTL ? 'كربوهيدرات' : 'Carbs', value: date.nutrition.carbs, unit: 'g' },
                  { label: isRTL ? 'ألياف' : 'Fiber', value: date.nutrition.fiber, unit: 'g' },
                  { label: isRTL ? 'بروتين' : 'Protein', value: date.nutrition.protein, unit: 'g' },
                  { label: isRTL ? 'بوتاسيوم' : 'Potassium', value: date.nutrition.potassium, unit: 'mg' },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="p-6 rounded-2xl bg-background shadow-card text-center hover:shadow-elevated transition-shadow"
                  >
                    <div className="text-3xl font-bold text-primary mb-1">
                      {item.value}
                    </div>
                    <div className="text-xs text-muted-foreground mb-2">{item.unit}</div>
                    <div className="text-sm font-medium text-foreground">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default DateDetailPage;
