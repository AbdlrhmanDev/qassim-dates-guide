import { authFetch } from '@/lib/api-client';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart3, TrendingUp, Users, Package, ShoppingCart,
  DollarSign, Store, Loader2,
} from 'lucide-react';

interface DashboardStats {
  users: number;
  traders: number;
  activeTraders: number;
  pendingTraders: number;
  dateTypes: number;
  salesCount: number;
  revenue: number;
  recentSales: {
    total_price: number;
    sale_date: string;
    quantity_kg: number;
    date_types: { name_ar: string; name_en: string } | null;
    traders: { shop_name: string } | null;
  }[];
}

interface Sale {
  sale_date: string;
  total_price: number;
  quantity_kg: number;
  date_types: { name_ar: string; name_en: string; category: string } | null;
}

// Build monthly aggregates from raw sales (last 6 months)
function buildMonthlyData(sales: Sale[], isRTL: boolean) {
  const months: Record<string, { label: string; labelEn: string; revenue: number; count: number }> = {};

  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    months[key] = {
      label: d.toLocaleDateString('ar-SA', { month: 'short', year: '2-digit' }),
      labelEn: d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      revenue: 0,
      count: 0,
    };
  }

  for (const s of sales) {
    const d = new Date(s.sale_date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (months[key]) {
      months[key].revenue += Number(s.total_price) || 0;
      months[key].count += 1;
    }
  }

  return Object.values(months);
}

// Aggregate top date types from sales
function buildTopProducts(sales: Sale[], isRTL: boolean) {
  const map: Record<string, { nameAr: string; nameEn: string; revenue: number }> = {};
  for (const s of sales) {
    if (!s.date_types) continue;
    const key = s.date_types.name_en;
    if (!map[key]) map[key] = { nameAr: s.date_types.name_ar, nameEn: s.date_types.name_en, revenue: 0 };
    map[key].revenue += Number(s.total_price) || 0;
  }
  const sorted = Object.values(map).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  const maxRev = sorted[0]?.revenue || 1;
  return sorted.map(p => ({ ...p, percentage: Math.round((p.revenue / maxRev) * 100) }));
}

const AnalyticsPage: React.FC = () => {
  const { isRTL } = useLanguage();
  const { user } = useAuth();

  const isAdmin = user?.role === 'admin';

  const { data: statsData, isLoading: statsLoading } = useQuery<DashboardStats>({
    queryKey: ['analytics-dashboard-stats'],
    queryFn: async () => {
      const res = await authFetch('/api/dashboard/stats');
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    enabled: isAdmin,
    staleTime: 120_000,
  });

  const { data: salesData, isLoading: salesLoading } = useQuery<Sale[]>({
    queryKey: ['analytics-all-sales'],
    queryFn: async () => {
      const res = await authFetch('/api/sales');
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    staleTime: 120_000,
  });

  const isLoading = statsLoading || salesLoading;
  const sales = salesData ?? [];
  const monthlyData = buildMonthlyData(sales, isRTL);
  const topProducts = buildTopProducts(sales, isRTL);
  const maxRevenue = Math.max(...monthlyData.map(m => m.revenue), 1);

  const stats = [
    {
      icon: Users,
      labelAr: 'إجمالي المستخدمين',
      labelEn: 'Total Users',
      value: isAdmin ? (statsData?.users ?? '—') : '—',
      color: 'text-blue-500 bg-blue-500/10',
    },
    {
      icon: Store,
      labelAr: 'التجار النشطون',
      labelEn: 'Active Traders',
      value: isAdmin ? (statsData?.activeTraders ?? '—') : '—',
      color: 'text-green-500 bg-green-500/10',
    },
    {
      icon: ShoppingCart,
      labelAr: 'إجمالي المبيعات',
      labelEn: 'Total Sales',
      value: String(sales.length),
      color: 'text-purple-500 bg-purple-500/10',
    },
    {
      icon: DollarSign,
      labelAr: 'الإيرادات (ر.س)',
      labelEn: 'Revenue (SAR)',
      value: sales.reduce((s, x) => s + (Number(x.total_price) || 0), 0).toLocaleString(),
      color: 'text-primary bg-primary/10',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-primary" />
          {isRTL ? 'الإحصائيات والتحليلات' : 'Analytics & Statistics'}
        </h1>
        <p className="text-muted-foreground mt-1">
          {isRTL ? 'نظرة عامة على أداء المنصة' : 'Platform performance overview'}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card key={i} className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-3 rounded-xl ${stat.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
                </div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{isRTL ? stat.labelAr : stat.labelEn}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Monthly Revenue Chart */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              {isRTL ? 'الإيرادات الشهرية (آخر 6 أشهر)' : 'Monthly Revenue (Last 6 Months)'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {salesLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
            ) : (
              <div className="space-y-4">
                {monthlyData.map((m, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <span className="w-16 text-sm text-muted-foreground shrink-0">
                      {isRTL ? m.label : m.labelEn}
                    </span>
                    <div className="flex-1 h-8 bg-muted rounded-lg overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-lg transition-all duration-500"
                        style={{ width: `${(m.revenue / maxRevenue) * 100}%` }}
                      />
                    </div>
                    <span className="w-24 text-sm font-medium text-end shrink-0">
                      {m.revenue > 0 ? `${(m.revenue / 1000).toFixed(1)}K` : '0'}
                      {' '}{isRTL ? 'ر.س' : 'SAR'}
                    </span>
                  </div>
                ))}
                {sales.length === 0 && (
                  <p className="text-center text-sm text-muted-foreground pt-2">
                    {isRTL ? 'لا توجد مبيعات بعد' : 'No sales recorded yet'}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Date Types by Revenue */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              {isRTL ? 'أكثر الأنواع مبيعاً' : 'Top Selling Varieties'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {salesLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
            ) : topProducts.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground pt-4">
                {isRTL ? 'لا توجد بيانات بعد' : 'No data yet'}
              </p>
            ) : (
              <div className="space-y-4">
                {topProducts.map((p, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm">{isRTL ? p.nameAr : p.nameEn}</span>
                        <span className="text-xs text-muted-foreground">
                          {p.revenue.toLocaleString()} {isRTL ? 'ر.س' : 'SAR'}
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-500"
                          style={{ width: `${p.percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Platform Summary */}
      {isAdmin && (
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="w-5 h-5 text-primary" />
              {isRTL ? 'ملخص المنصة' : 'Platform Summary'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { labelAr: 'إجمالي التجار', labelEn: 'Total Traders', value: statsData?.traders ?? '—' },
                { labelAr: 'تجار معلقون', labelEn: 'Pending Traders', value: statsData?.pendingTraders ?? '—' },
                { labelAr: 'أنواع التمور', labelEn: 'Date Varieties', value: statsData?.dateTypes ?? '—' },
                { labelAr: 'كمية التمور المباعة (كجم)', labelEn: 'Total Qty Sold (kg)', value: sales.reduce((s, x) => s + (Number(x.quantity_kg) || 0), 0).toLocaleString() },
              ].map((item, i) => (
                <div key={i} className="p-4 rounded-xl bg-muted/50">
                  {statsLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  ) : (
                    <p className="text-2xl font-bold text-foreground">{item.value}</p>
                  )}
                  <p className="text-sm text-muted-foreground mt-1">{isRTL ? item.labelAr : item.labelEn}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AnalyticsPage;
