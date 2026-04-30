"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import Logo from '@/components/ui/Logo';
import {
  Home,
  LogOut,
  User,
  Shield,
  Store,
  Menu,
  X,
  LayoutDashboard,
  Package,
  Users,
  Settings,
  BarChart3,
  ShoppingCart,
  FileText,
  CalendarDays,
  Factory,
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { isRTL } = useLanguage();
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const getRoleIcon = () => {
    switch (user?.role) {
      case 'admin':
        return <Shield className="w-5 h-5" />;
      case 'trader':
        return <Store className="w-5 h-5" />;
      default:
        return <User className="w-5 h-5" />;
    }
  };

  const getRoleColor = () => {
    switch (user?.role) {
      case 'admin':
        return 'bg-red-500/10 text-red-600';
      case 'trader':
        return 'bg-primary/10 text-primary';
      default:
        return 'bg-blue-500/10 text-blue-600';
    }
  };

  const getNavItems = () => {
    const common = [
      { icon: LayoutDashboard, labelAr: 'لوحة التحكم', labelEn: 'Dashboard', href: '/dashboard' },
    ];

    switch (user?.role) {
      case 'admin':
        return [
          ...common,
          { icon: Users, labelAr: 'المستخدمين', labelEn: 'Users', href: '/dashboard/users' },
          { icon: Store, labelAr: 'التجار', labelEn: 'Traders', href: '/dashboard/traders' },
          { icon: Package, labelAr: 'المنتجات', labelEn: 'Products', href: '/dashboard/products' },
          { icon: BarChart3, labelAr: 'الإحصائيات', labelEn: 'Analytics', href: '/dashboard/analytics' },
          { icon: FileText, labelAr: 'التقارير', labelEn: 'Reports', href: '/dashboard/reports' },
          { icon: CalendarDays, labelAr: 'المعارض والفعاليات', labelEn: 'Exhibitions', href: '/dashboard/exhibitions' },
          { icon: Factory, labelAr: 'المنتجون والمصدّرون', labelEn: 'Producers & Exporters', href: '/dashboard/producers' },
          { icon: Settings, labelAr: 'الإعدادات', labelEn: 'Settings', href: '/dashboard/settings' },
        ];
      case 'trader':
        return [
          ...common,
          { icon: ShoppingCart, labelAr: 'طلبات العملاء', labelEn: 'Customer Orders', href: '/dashboard/trader-orders' },
          { icon: Package, labelAr: 'منتجاتي', labelEn: 'My Products', href: '/dashboard/my-products' },
          { icon: BarChart3, labelAr: 'المبيعات', labelEn: 'Sales', href: '/dashboard/sales' },
          { icon: User, labelAr: 'الملف الشخصي', labelEn: 'Profile', href: '/dashboard/profile' },
          { icon: Settings, labelAr: 'الإعدادات', labelEn: 'Settings', href: '/dashboard/settings' },
        ];
      default:
        return [
          ...common,
          { icon: ShoppingCart, labelAr: 'طلباتي', labelEn: 'My Orders', href: '/dashboard/orders' },
          { icon: Settings, labelAr: 'الإعدادات', labelEn: 'Settings', href: '/dashboard/settings' },
        ];
    }
  };

  const navItems = getNavItems();

  return (
    <div className={`min-h-screen bg-muted/30 ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-card border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
          <Logo size="sm" />
          <div className={`p-2 rounded-full ${getRoleColor()}`}>
            {getRoleIcon()}
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside className={`
        fixed top-0 ${isRTL ? 'right-0' : 'left-0'} z-40 h-full w-64 bg-card
        transform transition-transform duration-300 ease-in-out
        lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : isRTL ? 'translate-x-full' : '-translate-x-full'}
        ${isRTL ? 'border-l' : 'border-r'} border-border
      `}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-6 border-b border-border">
            <h2 className="font-arabic text-xl font-bold text-foreground">
              {isRTL ? 'تمور القصيم' : 'Qassim Dates'}
            </h2>
          </div>

          {/* User Info */}
          <div className="p-4 border-b border-border">
            <div className={`flex items-center gap-3 p-3 rounded-xl border ${getRoleColor()} border-current/20`}>
              <div className="p-2 rounded-full bg-background/80">
                {getRoleIcon()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{user?.name}</p>
                <p className="text-xs opacity-80 font-medium">
                  {user?.role === 'admin' ? (isRTL ? 'مدير النظام' : 'System Manager') : 
                   user?.role === 'trader' ? (isRTL ? 'تاجر التمور' : 'Date Merchant') : 
                   (isRTL ? 'مستخدم' : 'User')}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-primary/10 text-primary font-medium shadow-sm'
                      : 'text-foreground/70 hover:bg-muted/50 hover:text-foreground'
                  }`}
                >
                  <IconComponent className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm">{isRTL ? item.labelAr : item.labelEn}</span>
                </Link>
              );
            })}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-border space-y-1">
            <Link href="/" onClick={() => setSidebarOpen(false)}>
              <Button 
                variant="ghost" 
                className="w-full justify-start gap-3 text-foreground/70 hover:text-foreground hover:bg-muted/50"
              >
                <Home className="w-5 h-5" />
                <span className="text-sm">{isRTL ? 'الصفحة الرئيسية' : 'Home Page'}</span>
              </Button>
            </Link>
            <Button 
              variant="ghost" 
              className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={handleLogout}
            >
              <LogOut className="w-5 h-5" />
              <span className="text-sm">{isRTL ? 'تسجيل الخروج' : 'Logout'}</span>
            </Button>
          </div>
        </div>
      </aside>

      {/* Backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className={`min-h-screen pt-16 lg:pt-0 ${isRTL ? 'lg:mr-64' : 'lg:ml-64'}`}>
        <div className="p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
