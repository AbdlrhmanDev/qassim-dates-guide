import { useLanguage } from '@/contexts/LanguageContext';
import { Heart, Leaf, Sun, Sparkles } from 'lucide-react';
import datesOrbital from '@/assets/dates-orbital.jpg';

const CultureSection = () => {
  const { t, isRTL } = useLanguage();

  const benefits = [
    {
      icon: Leaf,
      title: isRTL ? 'ألياف طبيعية' : 'Natural Fiber',
      description: isRTL ? 'يحتوي على ألياف تساعد في الهضم' : 'Contains fiber for better digestion',
    },
    {
      icon: Heart,
      title: isRTL ? 'صحة القلب' : 'Heart Health',
      description: isRTL ? 'غني بالبوتاسيوم المفيد لصحة القلب' : 'Rich in potassium for heart health',
    },
    {
      icon: Sparkles,
      title: isRTL ? 'مضادات أكسدة' : 'Antioxidants',
      description: isRTL ? 'غني بمضادات الأكسدة الطبيعية' : 'Rich in natural antioxidants',
    },
    {
      icon: Sun,
      title: isRTL ? 'طاقة فورية' : 'Instant Energy',
      description: isRTL ? 'سكريات طبيعية للطاقة السريعة' : 'Natural sugars for quick energy',
    },
  ];

  return (
    <section className="py-24 md:py-32 bg-gradient-to-b from-cream to-background relative overflow-hidden">
      {/* Subtle geometric pattern */}
      <div className="absolute inset-0 arabic-pattern opacity-40" />

      <div className="container mx-auto px-4 relative z-10">
        <div className={`grid lg:grid-cols-5 gap-12 lg:gap-16 items-center ${isRTL ? '' : ''}`}>
          
          {/* Text Content - Takes 3 columns */}
          <div className={`lg:col-span-3 ${isRTL ? 'lg:order-1 text-right' : 'lg:order-1'}`}>
            {/* Section Title */}
            <h2 className="font-arabic text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              {isRTL ? 'تراث التمور في القصيم' : 'Qassim Date Heritage'}
            </h2>
            
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-12 max-w-2xl">
              {isRTL 
                ? 'تمثل التمور جزءاً أساسياً من الثقافة والهوية السعودية، حيث تعد منطقة القصيم من أكبر مناطق إنتاج التمور في العالم'
                : 'Dates represent an essential part of Saudi culture and identity, with the Qassim region being one of the largest date-producing areas in the world'}
            </p>

            {/* Benefits Grid - 2x2 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
              {benefits.map((benefit, index) => (
                <div
                  key={index}
                  className={`group flex items-center gap-4 p-5 rounded-2xl bg-card/80 backdrop-blur-sm border border-border/40 shadow-soft hover:shadow-card hover:border-primary/30 hover:bg-card transition-all duration-300 ${isRTL ? 'flex-row-reverse text-right' : ''}`}
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors duration-300">
                    <benefit.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-foreground mb-1">{benefit.title}</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Orbital Image Visual - Takes 2 columns */}
          <div className={`lg:col-span-2 ${isRTL ? 'lg:order-2' : 'lg:order-2'}`}>
            <div className="relative aspect-square max-w-sm lg:max-w-md mx-auto">
              
              {/* Outer glow ring */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full h-full rounded-full bg-gradient-to-br from-primary/5 to-transparent animate-[pulse_4s_ease-in-out_infinite]" />
              </div>
              
              {/* Outer ring */}
              <div className="absolute inset-[2%] flex items-center justify-center">
                <div className="w-full h-full border-2 border-primary/20 rounded-full" />
              </div>
              
              {/* Second ring with subtle glow */}
              <div className="absolute inset-[8%] flex items-center justify-center">
                <div className="w-full h-full border border-primary/30 rounded-full shadow-[0_0_30px_rgba(180,130,60,0.15)]" />
              </div>
              
              {/* Third decorative ring */}
              <div className="absolute inset-[14%] flex items-center justify-center">
                <div className="w-full h-full border border-border/50 rounded-full" />
              </div>

              {/* Center Image Container */}
              <div className="absolute inset-[18%] flex items-center justify-center">
                <div className="w-full h-full rounded-full overflow-hidden shadow-elevated transform hover:scale-105 transition-transform duration-700 ring-4 ring-primary/20 ring-offset-4 ring-offset-cream">
                  <img 
                    src={datesOrbital.src} 
                    alt={isRTL ? 'تمور فاخرة' : 'Premium Dates'}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Floating decorative elements */}
              <div 
                className="absolute w-5 h-5 rounded-full bg-primary/80 shadow-glow animate-[float_6s_ease-in-out_infinite]"
                style={{ top: '2%', left: '50%', transform: 'translateX(-50%)' }}
              />
              <div 
                className="absolute w-4 h-4 rounded-full bg-cream border-2 border-primary/40 shadow-soft animate-[float_6s_ease-in-out_infinite_1s]"
                style={{ top: '15%', right: '8%' }}
              />
              <div 
                className="absolute w-4 h-4 rounded-full bg-cream border-2 border-primary/40 shadow-soft animate-[float_6s_ease-in-out_infinite_2s]"
                style={{ bottom: '15%', left: '8%' }}
              />
              <div 
                className="absolute w-3 h-3 rounded-full bg-primary/60 shadow-soft animate-[float_6s_ease-in-out_infinite_3s]"
                style={{ bottom: '5%', right: '30%' }}
              />
              <div 
                className="absolute w-3 h-3 rounded-full bg-cream border-2 border-primary/30 shadow-soft animate-[float_6s_ease-in-out_infinite_4s]"
                style={{ top: '40%', left: '2%' }}
              />
              <div 
                className="absolute w-4 h-4 rounded-full bg-cream border-2 border-primary/30 shadow-soft animate-[float_6s_ease-in-out_infinite_2.5s]"
                style={{ top: '40%', right: '2%' }}
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default CultureSection;
