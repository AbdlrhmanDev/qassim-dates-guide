"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, User, ArrowRight, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const { isRTL } = useLanguage();
  const { signIn, signUp } = useAuth();
  const router = useRouter();

  const [isLogin, setIsLogin]       = useState(true);
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [name, setName]             = useState('');
  const [showPass, setShowPass]     = useState(false);
  const [error, setError]           = useState('');
  const [success, setSuccess]       = useState('');
  const [loading, setLoading]       = useState(false);

  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (isLogin) {
      const { error: err } = await signIn(email, password);
      if (err) {
        if (err.toLowerCase().includes('confirm') || err.toLowerCase().includes('verified')) {
          setError(isRTL
            ? 'يرجى تأكيد بريدك الإلكتروني أولاً. تحقق من صندوق الوارد.'
            : 'Please confirm your email first. Check your inbox.');
        } else {
          setError(isRTL ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة' : 'Invalid email or password');
        }
        setLoading(false);
        return;
      }
      router.push('/dashboard');
    } else {
      if (password.length < 6) {
        setError(isRTL ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' : 'Password must be at least 6 characters');
        setLoading(false);
        return;
      }
      const { error: err } = await signUp(email, password, name);
      if (err) {
        setError(err);
        setLoading(false);
        return;
      }
      setSuccess(isRTL
        ? 'تم إنشاء حسابك! تحقق من بريدك الإلكتروني لتأكيد الحساب.'
        : 'Account created! Check your email to confirm your account.');
    }

    setLoading(false);
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setSuccess('');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 md:pt-28 pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">

            <div className="bg-card rounded-3xl shadow-elevated p-8 md:p-10">
              {/* Logo */}
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary mx-auto flex items-center justify-center shadow-glow mb-4">
                  <span className="text-3xl font-arabic font-bold text-primary-foreground">ت</span>
                </div>
                <h1 className="font-arabic text-2xl font-bold text-foreground">
                  {isLogin
                    ? (isRTL ? 'تسجيل الدخول' : 'Sign In')
                    : (isRTL ? 'إنشاء حساب' : 'Create Account')
                  }
                </h1>
                <p className="text-muted-foreground mt-2">
                  {isLogin
                    ? (isRTL ? 'مرحباً بعودتك!' : 'Welcome back!')
                    : (isRTL ? 'انضم إلى مجتمع محبي التمور' : 'Join the date lovers community')
                  }
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">

                {/* Name - signup only */}
                {!isLogin && (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      {isRTL ? 'الاسم الكامل' : 'Full Name'}
                    </label>
                    <div className="relative">
                      <User className="absolute start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={isRTL ? 'أدخل اسمك الكامل' : 'Enter your full name'}
                        className="w-full ps-12 pe-4 py-3 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                        required
                      />
                    </div>
                  </div>
                )}

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {isRTL ? 'البريد الإلكتروني' : 'Email'}
                  </label>
                  <div className="relative">
                    <Mail className="absolute start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={isRTL ? 'أدخل بريدك الإلكتروني' : 'Enter your email'}
                      className="w-full ps-12 pe-4 py-3 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                      required
                      autoComplete="email"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {isRTL ? 'كلمة المرور' : 'Password'}
                  </label>
                  <div className="relative">
                    <Lock className="absolute start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={isRTL ? 'أدخل كلمة المرور' : 'Enter your password'}
                      className="w-full ps-12 pe-12 py-3 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                      required
                      autoComplete={isLogin ? 'current-password' : 'new-password'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute end-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Forgot password */}
                {isLogin && (
                  <div className="text-end">
                    <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                      {isRTL ? 'نسيت كلمة المرور؟' : 'Forgot password?'}
                    </Link>
                  </div>
                )}

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

                {/* Submit */}
                <Button
                  type="submit"
                  variant="default"
                  size="lg"
                  className="w-full"
                  disabled={loading}
                >
                  {loading
                    ? (isRTL ? 'جارٍ...' : 'Loading...')
                    : isLogin
                      ? (isRTL ? 'تسجيل الدخول' : 'Sign In')
                      : (isRTL ? 'إنشاء حساب' : 'Create Account')
                  }
                  {!loading && <ArrowIcon className="w-4 h-4" />}
                </Button>
              </form>

              {/* Divider */}
              <div className="flex items-center gap-4 my-6">
                <div className="flex-1 h-px bg-border" />
                <span className="text-sm text-muted-foreground">{isRTL ? 'أو' : 'or'}</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              {/* Toggle login/signup */}
              <p className="text-center text-muted-foreground text-sm">
                {isLogin
                  ? (isRTL ? 'ليس لديك حساب؟' : "Don't have an account?")
                  : (isRTL ? 'لديك حساب بالفعل؟' : 'Already have an account?')
                }
                <button
                  type="button"
                  onClick={switchMode}
                  className="text-primary font-medium hover:underline ms-2"
                >
                  {isLogin
                    ? (isRTL ? 'إنشاء حساب' : 'Sign Up')
                    : (isRTL ? 'تسجيل الدخول' : 'Sign In')
                  }
                </button>
              </p>

              {/* Trader register link */}
              <p className="text-center text-muted-foreground text-sm mt-3">
                {isRTL ? 'تاجر أو مزارع؟' : 'Are you a trader or farmer?'}
                <Link href="/register/trader" className="text-primary font-medium hover:underline ms-2">
                  {isRTL ? 'سجّل كتاجر' : 'Register as Trader'}
                </Link>
              </p>
            </div>

            {/* Back to home */}
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
