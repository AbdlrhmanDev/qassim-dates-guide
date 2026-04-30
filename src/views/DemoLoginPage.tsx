import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Shield, Store, ArrowLeft, ArrowRight } from 'lucide-react';
import Logo from '@/components/ui/Logo';
import { Link } from 'react-router-dom';

const roleConfig: Record<UserRole, { icon: typeof User; labelAr: string; labelEn: string; descAr: string; descEn: string; color: string }> = {
  user: {
    icon: User,
    labelAr: 'مستخدم',
    labelEn: 'User',
    descAr: 'تصفح التمور والمنتجات',
    descEn: 'Browse dates and products',
    color: 'bg-blue-500/10 text-blue-600 border-blue-200',
  },
  admin: {
    icon: Shield,
    labelAr: 'مدير النظام',
    labelEn: 'Admin',
    descAr: 'إدارة كاملة للنظام',
    descEn: 'Full system management',
    color: 'bg-red-500/10 text-red-600 border-red-200',
  },
  trader: {
    icon: Store,
    labelAr: 'تاجر',
    labelEn: 'Trader',
    descAr: 'إدارة المنتجات والطلبات',
    descEn: 'Manage products and orders',
    color: 'bg-primary/10 text-primary border-primary/20',
  },
};

const DemoLoginPage: React.FC = () => {
  const { isRTL } = useLanguage();
  const { loginDemo, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = (role: UserRole) => {
    loginDemo(role);
    navigate('/dashboard');
  };

  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  return (
    <>
      <Helmet>
        <title>{isRTL ? 'تسجيل الدخول التجريبي | تمور القصيم' : 'Demo Login | Qassim Dates'}</title>
      </Helmet>

      <div className={`min-h-screen bg-background arabic-pattern flex items-center justify-center p-4 ${isRTL ? 'rtl' : 'ltr'}`}>
        <div className="w-full max-w-lg">
          <Card className="border-border/50 shadow-elevated">
            <CardHeader className="text-center space-y-4 pb-2">
              <div className="flex justify-center">
                <Logo size="lg" />
              </div>
              <CardTitle className="text-2xl font-bold text-foreground">
                {isRTL ? 'تسجيل الدخول التجريبي' : 'Demo Login'}
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                {isRTL ? 'اختر نوع الحساب للدخول' : 'Select account type to login'}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 pt-4">
              {(Object.keys(roleConfig) as UserRole[]).map((role) => {
                const config = roleConfig[role];
                const IconComponent = config.icon;
                
                return (
                  <button
                    key={role}
                    onClick={() => handleLogin(role)}
                    className={`w-full p-4 rounded-xl border-2 transition-all duration-300 hover:scale-[1.02] hover:shadow-card flex items-center gap-4 ${config.color}`}
                  >
                    <div className="p-3 rounded-full bg-background">
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <div className={`flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                      <h3 className="font-bold text-lg">
                        {isRTL ? config.labelAr : config.labelEn}
                      </h3>
                      <p className="text-sm opacity-80">
                        {isRTL ? config.descAr : config.descEn}
                      </p>
                    </div>
                    <ArrowIcon className="w-5 h-5 opacity-60" />
                  </button>
                );
              })}

              <div className="pt-4 border-t border-border">
                <p className="text-center text-sm text-muted-foreground mb-4">
                  {isRTL ? 'هذا عرض تجريبي - لا يتطلب بيانات حقيقية' : 'This is a demo - no real credentials required'}
                </p>
                <Link to="/">
                  <Button variant="ghost" className="w-full gap-2">
                    {isRTL ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
                    {isRTL ? 'العودة للرئيسية' : 'Back to Home'}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default DemoLoginPage;
