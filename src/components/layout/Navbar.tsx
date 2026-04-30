"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Globe, LayoutDashboard, LogOut, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import Logo from '@/components/ui/Logo';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { language, setLanguage, t, isRTL } = useLanguage();
  const { isAuthenticated, user, logout } = useAuth();
  const pathname = usePathname();

  const navLinks = [
    { href: '/', label: t('nav.home') },
    { href: '/dates', label: t('nav.dates') },
    { href: '/exhibitions', label: t('nav.exhibitions') },
    { href: '/traders', label: t('nav.traders') },
    { href: '/producers', label: isRTL ? 'المنتجين' : 'Producers' },
    { href: '/top-products', label: isRTL ? 'الأعلى تقييماً' : 'Top Rated' },
    { href: '/ai-assistant', label: t('nav.ai') },
  ];

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-secondary">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <Logo 
              size="sm" 
              showText={true} 
              isRTL={isRTL}
              textClassName="text-primary-foreground"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  isActive(link.href)
                    ? 'bg-primary/20 text-primary-foreground'
                    : 'text-secondary-foreground/80 hover:text-primary-foreground hover:bg-primary/10'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            {/* Language Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
              className="flex items-center gap-2 text-secondary-foreground/80 hover:text-primary-foreground hover:bg-primary/10"
            >
              <Globe className="w-4 h-4" />
              <span className="text-sm font-medium">{language === 'ar' ? 'EN' : 'عربي'}</span>
            </Button>

            {/* Auth Buttons - Desktop */}
            {isAuthenticated ? (
              <div className="hidden md:flex items-center gap-2">
                <Button 
                  size="sm" 
                  className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2" 
                  asChild
                >
                  <Link href="/dashboard">
                    <LayoutDashboard className="w-4 h-4" />
                    {isRTL ? 'لوحة التحكم' : 'Dashboard'}
                  </Link>
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost"
                  className="text-secondary-foreground/80 hover:text-primary-foreground hover:bg-primary/10"
                  onClick={logout}
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Button 
                size="sm" 
                className="hidden md:flex bg-primary hover:bg-primary/90 text-primary-foreground" 
                asChild
              >
                <Link href="/login">{isRTL ? 'تسجيل الدخول' : 'Sign In'}</Link>
              </Button>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-secondary-foreground"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="lg:hidden py-4 border-t border-primary/20 animate-fade-in">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`px-4 py-3 rounded-md text-base font-medium transition-all duration-200 ${
                    isActive(link.href)
                      ? 'bg-primary/20 text-primary-foreground'
                      : 'text-secondary-foreground/80 hover:text-primary-foreground hover:bg-primary/10'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              {isAuthenticated ? (
                <>
                  <Link
                    href="/dashboard"
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-3 rounded-md text-base font-medium bg-primary text-primary-foreground text-center mt-2 flex items-center justify-center gap-2"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    {isRTL ? 'لوحة التحكم' : 'Dashboard'}
                  </Link>
                  <button
                    onClick={() => { logout(); setIsOpen(false); }}
                    className="px-4 py-3 rounded-md text-base font-medium text-destructive hover:bg-destructive/10 text-center mt-1 flex items-center justify-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    {isRTL ? 'تسجيل الخروج' : 'Logout'}
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-3 rounded-md text-base font-medium bg-primary text-primary-foreground text-center mt-2"
                >
                  {isRTL ? 'تسجيل الدخول' : 'Sign In'}
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
