"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, User, Phone, Store, MapPin, ArrowLeft, ArrowRight, Eye, EyeOff } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';

const CITIES = [
  'بريدة', 'عنيزة', 'الرس', 'المذنب', 'البكيرية',
  'رياض الخبراء', 'الشماسية', 'عيون الجواء', 'البدائع', 'ضرية',
];

export default function TraderRegisterPage() {
  const { isRTL } = useLanguage();
  const { signUpTrader } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    shopName: '',
    phone: '',
    whatsapp: '',
    city: '',
  });
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');
  const [loading, setLoading]   = useState(false);

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (form.password.length < 6) {
      setError(isRTL ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' : 'Password must be at least 6 characters');
      return;
    }
    if (!form.city) {
      setError(isRTL ? 'يرجى اختيار المدينة' : 'Please select a city');
      return;
    }

    setLoading(true);
    const { error: err } = await signUpTrader(form);
    setLoading(false);

    if (err) {
      setError(err);
      return;
    }

    setSuccess(isRTL
      ? 'تم تسجيل طلبك! تحقق من بريدك الإلكتروني لتأكيد الحساب. سيتم مراجعة طلبك من قِبَل الإدارة.'
      : 'Registration submitted! Check your email to confirm. Your account will be reviewed by admin.');
  };

  const inputClass = "w-full ps-12 pe-4 py-3 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-lg mx-auto">

            <div className="bg-card rounded-3xl shadow-elevated p-8 md:p-10">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary mx-auto flex items-center justify-center shadow-glow mb-4">
                  <Store className="w-8 h-8 text-primary-foreground" />
                </div>
                <h1 className="font-arabic text-2xl font-bold text-foreground">
                  {isRTL ? 'تسجيل كتاجر' : 'Register as Trader'}
                </h1>
                <p className="text-muted-foreground mt-2 text-sm">
                  {isRTL
                    ? 'انضم إلى منصة تمور القصيم وتواصل مع آلاف العملاء'
                    : 'Join Qassim Dates platform and reach thousands of customers'}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Section: Personal Info */}
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {isRTL ? 'البيانات الشخصية' : 'Personal Info'}
                </p>

                {/* Full Name */}
                <div className="relative">
                  <User className="absolute start-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={form.fullName}
                    onChange={set('fullName')}
                    placeholder={isRTL ? 'الاسم الكامل' : 'Full Name'}
                    className={inputClass}
                    required
                  />
                </div>

                {/* Email */}
                <div className="relative">
                  <Mail className="absolute start-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={set('email')}
                    placeholder={isRTL ? 'البريد الإلكتروني' : 'Email'}
                    className={inputClass}
                    required
                    autoComplete="email"
                  />
                </div>

                {/* Password */}
                <div className="relative">
                  <Lock className="absolute start-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={form.password}
                    onChange={set('password')}
                    placeholder={isRTL ? 'كلمة المرور (6 أحرف على الأقل)' : 'Password (min 6 chars)'}
                    className="w-full ps-12 pe-12 py-3 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
                    required
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute end-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Section: Shop Info */}
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pt-2">
                  {isRTL ? 'بيانات المتجر' : 'Shop Info'}
                </p>

                {/* Shop Name */}
                <div className="relative">
                  <Store className="absolute start-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={form.shopName}
                    onChange={set('shopName')}
                    placeholder={isRTL ? 'اسم المتجر أو المزرعة' : 'Shop or Farm Name'}
                    className={inputClass}
                    required
                  />
                </div>

                {/* City */}
                <div className="relative">
                  <MapPin className="absolute start-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <select
                    value={form.city}
                    onChange={set('city')}
                    className={`${inputClass} appearance-none`}
                    required
                  >
                    <option value="">{isRTL ? 'اختر المدينة' : 'Select City'}</option>
                    {CITIES.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>

                {/* Phone */}
                <div className="relative">
                  <Phone className="absolute start-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={set('phone')}
                    placeholder={isRTL ? 'رقم الجوال' : 'Phone Number'}
                    className={inputClass}
                    required
                    dir="ltr"
                  />
                </div>

                {/* WhatsApp */}
                <div className="relative">
                  <Phone className="absolute start-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="tel"
                    value={form.whatsapp}
                    onChange={set('whatsapp')}
                    placeholder={isRTL ? 'رقم واتساب (اختياري)' : 'WhatsApp Number (optional)'}
                    className={inputClass}
                    dir="ltr"
                  />
                </div>

                {/* Error */}
                {error && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm text-center">
                    {error}
                  </div>
                )}

                {/* Success */}
                {success && (
                  <div className="p-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm text-center">
                    {success}
                  </div>
                )}

                <Button type="submit" variant="default" size="lg" className="w-full" disabled={loading || !!success}>
                  {loading
                    ? (isRTL ? 'جارٍ التسجيل...' : 'Registering...')
                    : (isRTL ? 'إرسال الطلب' : 'Submit Request')
                  }
                </Button>
              </form>

              <p className="text-center text-muted-foreground text-sm mt-6">
                {isRTL ? 'لديك حساب بالفعل؟' : 'Already have an account?'}
                <Link href="/login" className="text-primary font-medium hover:underline ms-2">
                  {isRTL ? 'تسجيل الدخول' : 'Sign In'}
                </Link>
              </p>
            </div>

            <div className="text-center mt-6">
              <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm">
                {isRTL ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
                <span>{isRTL ? 'العودة للرئيسية' : 'Back to Home'}</span>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
