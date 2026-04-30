import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Users, Package, TrendingUp, DollarSign, ShoppingCart,
  AlertTriangle, CheckCircle, Clock, Store, Loader2,
} from 'lucide-react';

interface DashboardStats {
  users: number;
  traders: number;
  activeTraders: number;
  pendingTraders: number;
  dateTypes: number;
  salesCount: number;
  revenue: number;
  recentTraders: { shop_name: string; city: string | null; status: string; created_at: string }[];
  recentSales: { total_price: number; sale_date: string; quantity_kg: number; date_types: { name_ar: string; name_en: string } | null; traders: { shop_name: string } | null }[];
}

const AdminDashboard: React.FC = () => {
  const { isRTL } = useLanguage();
  const { user } = useAuth();

  const { data, isLoading } = useQuery<DashboardStats>({
    queryKey: ['admin-dashboard-stats'],
    queryFn: async () => {
      const res = await fetch('/api/dashboard/stats');
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    staleTime: 60_000,
  });

  const stats = [
    {
      icon: Users,
      labelAr: 'المستخدمين',
      labelEn: 'Total Users',
      value: data?.users ?? '—',
      color: 'text-blue-500 bg-blue-500/10',
    },
    {
      icon: Store,
      labelAr: 'التجار النشطون',
      labelEn: 'Active Traders',
      value: data?.activeTraders ?? '—',
      color: 'text-green-500 bg-green-500/10',
    },
    {
      icon: Package,
      labelAr: 'أنواع التمور',
      labelEn: 'Date Types',
      value: data?.dateTypes ?? '—',
      color: 'text-purple-500 bg-purple-500/10',
    },
    {
      icon: DollarSign,
      labelAr: 'الإيرادات (ر.س)',
      labelEn: 'Revenue (SAR)',
      value: data ? data.revenue.toLocaleString() : '—',
      color: 'text-primary bg-primary/10',
    },
  ];

  const pendingTasks = [
    {
      titleAr: 'طلبات التجار المعلقة',
      titleEn: 'Pending trader applications',
      count: data?.pendingTraders ?? 0,
      status: (data?.pendingTraders ?? 0) > 0 ? 'pending' : 'done',
    },
    {
      titleAr: 'إجمالي المبيعات المسجلة',
      titleEn: 'Total recorded sales',
      count: data?.salesCount ?? 0,
      status: 'info',
    },
    {
      titleAr: 'أنواع التمور في الكتالوج',
      titleEn: 'Date types in catalog',
      count: data?.dateTypes ?? 0,
      status: 'info',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-red-500/20 to-red-500/5 rounded-2xl p-6">
        <h1 className="text-2xl font-bold text-foreground mb-2">
          {isRTL ? `مرحباً، ${user?.name}` : `Welcome, ${user?.name}`}
        </h1>
        <p className="text-muted-foreground">
          {isRTL ? 'لوحة تحكم المدير - إدارة كاملة للنظام' : 'Admin Dashboard - Full system management'}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Card key={index} className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-3 rounded-xl ${stat.color}`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
                </div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">
                  {isRTL ? stat.labelAr : stat.labelEn}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Traders */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              {isRTL ? 'أحدث التجار المسجلين' : 'Recently Registered Traders'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
            ) : (data?.recentTraders?.length ?? 0) === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                {isRTL ? 'لا يوجد تجار بعد' : 'No traders yet'}
              </p>
            ) : (
              <div className="space-y-3">
                {data!.recentTraders.map((trader, i) => (
                  <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-muted/50">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      <Store className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{trader.shop_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {trader.city ?? '—'} · {new Date(trader.created_at).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US')}
                      </p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      trader.status === 'active'    ? 'bg-green-500/10 text-green-600' :
                      trader.status === 'pending'   ? 'bg-orange-500/10 text-orange-600' :
                                                      'bg-red-500/10 text-red-600'
                    }`}>
                      {trader.status === 'active'  ? (isRTL ? 'نشط' : 'Active') :
                       trader.status === 'pending' ? (isRTL ? 'معلق' : 'Pending') :
                                                     (isRTL ? 'موقوف' : 'Suspended')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Summary Tasks */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-primary" />
              {isRTL ? 'ملخص النظام' : 'System Summary'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingTasks.map((task, index) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                  <div>
                    <p className="font-medium">{isRTL ? task.titleAr : task.titleEn}</p>
                    <p className="text-sm text-muted-foreground">
                      {isLoading ? '...' : task.count} {isRTL ? 'عنصر' : 'items'}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    task.status === 'pending' ? 'bg-orange-500/10 text-orange-500' :
                    task.status === 'done'    ? 'bg-green-500/10 text-green-600' :
                                               'bg-blue-500/10 text-blue-600'
                  }`}>
                    {task.status === 'pending' ? (isRTL ? 'يحتاج مراجعة' : 'Needs Review') :
                     task.status === 'done'    ? (isRTL ? 'لا يوجد معلق' : 'All Clear') :
                                                 (isRTL ? 'إجمالي' : 'Total')}
                  </span>
                </div>
              ))}
            </div>

            {/* Recent Sales */}
            {(data?.recentSales?.length ?? 0) > 0 && (
              <div className="mt-4 pt-4 border-t border-border/50">
                <p className="text-sm font-medium mb-2 flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-primary" />
                  {isRTL ? 'أحدث المبيعات' : 'Latest Sales'}
                </p>
                <div className="space-y-2">
                  {data!.recentSales.map((sale, i) => (
                    <div key={i} className="flex justify-between text-xs text-muted-foreground">
                      <span>{isRTL ? sale.date_types?.name_ar : sale.date_types?.name_en} — {sale.traders?.shop_name}</span>
                      <span className="font-medium text-foreground">{Number(sale.total_price).toLocaleString()} {isRTL ? 'ر.س' : 'SAR'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
