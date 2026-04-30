import Link from 'next/link';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const Footer = () => {
  const { t, isRTL } = useLanguage();

  const quickLinks = [
    { href: '/', label: t('nav.home') },
    { href: '/dates', label: t('nav.dates') },
    { href: '/exhibitions', label: t('nav.exhibitions') },
    { href: '/traders', label: t('nav.traders') },
    { href: '/ai-assistant', label: t('nav.ai') },
  ];

  return (
    <footer className="bg-secondary text-secondary-foreground">
      {/* Decorative Top Border */}
      <div className="h-1 bg-gradient-to-r from-primary via-date-gold to-primary" />
      
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* About Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-date-gold flex items-center justify-center">
                <span className="text-primary-foreground font-arabic font-bold text-xl">ت</span>
              </div>
              <span className="font-arabic text-2xl font-bold">
                {isRTL ? 'تمور القصيم' : 'Qassim Dates'}
              </span>
            </div>
            <p className="text-secondary-foreground/80 leading-relaxed mb-6">
              {t('footer.aboutText')}
            </p>
            {/* Social Links */}
            <div className="flex gap-4">
              {[Facebook, Twitter, Instagram].map((Icon, index) => (
                <a
                  key={index}
                  href="#"
                  className="w-10 h-10 rounded-full bg-secondary-foreground/10 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-arabic text-lg font-bold mb-4 text-primary">
              {t('footer.links')}
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-secondary-foreground/80 hover:text-primary transition-colors duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-arabic text-lg font-bold mb-4 text-primary">
              {t('footer.contact')}
            </h3>
            <ul className="space-y-4">
              <li className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-primary flex-shrink-0" />
                <span className="text-secondary-foreground/80">
                  {isRTL ? 'بريدة، منطقة القصيم، المملكة العربية السعودية' : 'Buraydah, Qassim Region, Saudi Arabia'}
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-primary flex-shrink-0" />
                <span className="text-secondary-foreground/80" dir="ltr">+966 16 xxx xxxx</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary flex-shrink-0" />
                <span className="text-secondary-foreground/80">info@qassimdates.sa</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-arabic text-lg font-bold mb-4 text-primary">
              {isRTL ? 'النشرة البريدية' : 'Newsletter'}
            </h3>
            <p className="text-secondary-foreground/80 mb-4">
              {isRTL ? 'اشترك لتصلك آخر الأخبار والفعاليات' : 'Subscribe for the latest news and events'}
            </p>
            <form className="flex gap-2">
              <input
                type="email"
                placeholder={isRTL ? 'بريدك الإلكتروني' : 'Your email'}
                className="flex-1 px-4 py-2 rounded-lg bg-secondary-foreground/10 border border-secondary-foreground/20 text-secondary-foreground placeholder:text-secondary-foreground/50 focus:outline-none focus:border-primary transition-colors"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
              >
                {isRTL ? 'اشتراك' : 'Subscribe'}
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-secondary-foreground/10 text-center text-secondary-foreground/60">
          <p>
            © {new Date().getFullYear()} {isRTL ? 'تمور القصيم' : 'Qassim Dates'}. {t('footer.rights')}.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
