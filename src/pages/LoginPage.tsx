import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, ArrowLeft } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';

const LoginPage = () => {
  const { isRTL } = useLanguage();
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    if (isLogin) {
      const { error: err } = await signIn(email, password);
      if (err) { setError(err); setLoading(false); return; }
    } else {
      const { error: err } = await signUp(email, password, name);
      if (err) { setError(err); setLoading(false); return; }
    }
    setLoading(false);
    navigate('/dashboard');
  };

  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  return (
    <>
      <Helmet>
        <title>{isRTL ? 'تسجيل الدخول | تمور القصيم' : 'Login | Qassim Dates'}</title>
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />
        
        <main className="pt-24 md:pt-28 pb-12">
          <div className="container mx-auto px-4">
            <div className="max-w-md mx-auto">
              {/* Card */}
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
                  {/* Name Field - Only for Signup */}
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
                          placeholder={isRTL ? 'أدخل اسمك' : 'Enter your name'}
                          className="w-full ps-12 pe-4 py-3 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                          required
                        />
                      </div>
                    </div>
                  )}

                  {/* Email Field */}
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
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      {isRTL ? 'كلمة المرور' : 'Password'}
                    </label>
                    <div className="relative">
                      <Lock className="absolute start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={isRTL ? 'أدخل كلمة المرور' : 'Enter your password'}
                        className="w-full ps-12 pe-4 py-3 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                        required
                      />
                    </div>
                  </div>

                  {/* Forgot Password */}
                  {isLogin && (
                    <div className="text-end">
                      <a href="#" className="text-sm text-primary hover:underline">
                        {isRTL ? 'نسيت كلمة المرور؟' : 'Forgot password?'}
                      </a>
                    </div>
                  )}

                  {/* Error message */}
                  {error && (
                    <p className="text-sm text-red-500 text-center">{error}</p>
                  )}

                  {/* Submit Button */}
                  <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading}>
                    {loading
                      ? (isRTL ? 'جارٍ...' : 'Loading...')
                      : isLogin
                        ? (isRTL ? 'تسجيل الدخول' : 'Sign In')
                        : (isRTL ? 'إنشاء حساب' : 'Create Account')
                    }
                    <ArrowIcon className="w-4 h-4" />
                  </Button>
                </form>

                {/* Divider */}
                <div className="flex items-center gap-4 my-6">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-sm text-muted-foreground">
                    {isRTL ? 'أو' : 'or'}
                  </span>
                  <div className="flex-1 h-px bg-border" />
                </div>

                {/* Toggle Login/Signup */}
                <p className="text-center text-muted-foreground">
                  {isLogin
                    ? (isRTL ? 'ليس لديك حساب؟' : "Don't have an account?")
                    : (isRTL ? 'لديك حساب بالفعل؟' : 'Already have an account?')
                  }
                  <button
                    type="button"
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-primary font-medium hover:underline ms-2"
                  >
                    {isLogin
                      ? (isRTL ? 'إنشاء حساب' : 'Sign Up')
                      : (isRTL ? 'تسجيل الدخول' : 'Sign In')
                    }
                  </button>
                </p>
              </div>

              {/* Back to Home */}
              <div className="text-center mt-6">
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {isRTL ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
                  <span>{isRTL ? 'العودة للرئيسية' : 'Back to Home'}</span>
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default LoginPage;
