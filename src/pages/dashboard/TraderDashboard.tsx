import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, ShoppingCart, DollarSign, Star, BarChart3, Loader2, TrendingUp } from 'lucide-react';

interface TraderStats {
  trader: { trader_id: string; shop_name: string; rating: number; rating_count: number; verified: boolean };
  productsCount: number;
  salesCount: number;
  revenue: number;
  topProducts: {
    price_per_kg: number;
    rating: number;
    rating_count: number;
    date_types: { name_ar: string; name_en: string; category: string } | null;
  }[];
  recentSales: {
    sale_date: string;
    quantity_kg: number;
    total_price: number;
    market_name: string | null;
    date_types: { name_ar: string; name_en: string } | null;
  }[];
}

const TraderDashboard: React.FC = () => {
  const { isRTL } = useLanguage();
  const { user } = useAuth();

  const { data, isLoading } = useQuery<TraderStats>({
    queryKey: ['trader-dashboard-stats', user?.id],
    queryFn: async () => {
      const res = await fetch(`/api/dashboard/trader-stats?user_id=${user?.id}`);
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    enabled: !!user?.id,
    staleTime: 60_000,
  });

  const stats = [
    {
      icon: Package,
      labelAr: 'منتجاتي',
      labelEn: 'My Products',
      value: isLoading ? '…' : String(data?.productsCount ?? 0),
      color: 'text-green-500 bg-green-500/10',
    },
    {
      icon: ShoppingCart,
      labelAr: 'المبيعات المسجلة',
      labelEn: 'Recorded Sales',
      value: isLoading ? '…' : String(data?.salesCount ?? 0),
      color: 'text-blue-500 bg-blue-500/10',
    },
    {
      icon: DollarSign,
      labelAr: 'الإيرادات (ر.س)',
      labelEn: 'Revenue (SAR)',
      value: isLoading ? '…' : (data?.revenue ?? 0).toLocaleString(),
      color: 'text-primary bg-primary/10',
    },
    {
      icon: Star,
      labelAr: 'تقييم المتجر',
      labelEn: 'Shop Rating',
      value: isLoading ? '…' : data?.trader ? `${data.trader.rating.toFixed(1)} ★` : '—',
      color: 'text-yellow-500 bg-yellow-500/10',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-primary/20 to-primary/5 rounded-2xl p-6 border border-border/30">
        <h1 className="text-2xl font-bold text-foreground mb-1">
          {isRTL ? `مرحباً، ${user?.name}` : `Welcome, ${user?.name}`}
        </h1>
        {data?.trader && (
          <p className="text-primary font-medium text-sm mb-1">
            {data.trader.shop_name}
            {data.trader.verified && (
              <span className="ms-2 text-xs bg-blue-500/10 text-blue-600 px-2 py-0.5 rounded-full">
                {isRTL ? 'موثّق ✓' : 'Verified ✓'}
              </span>
            )}
          </p>
        )}
        <p className="text-muted-foreground text-sm">
          {isRTL ? 'لوحة تحكم التاجر - إدارة منتجاتك ومبيعاتك' : 'Trader Dashboard - Manage your products and sales'}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card key={i} className="border-border bg-card shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-3 rounded-xl ${stat.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
                </div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground">
                  {isRTL ? stat.labelAr : stat.labelEn}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <Card className="border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <BarChart3 className="w-5 h-5 text-primary" />
              {isRTL ? 'أعلى المنتجات تقييماً' : 'Top Rated Products'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
            ) : (data?.topProducts?.length ?? 0) === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                {isRTL ? 'لا توجد منتجات بعد' : 'No products yet'}
              </p>
            ) : (
              <div className="space-y-3">
                {data!.topProducts.map((p, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-muted/50 border border-border/50">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                        {i + 1}
                      </div>
                      <div>
                        <p className="font-medium text-foreground text-sm">
                          {isRTL ? p.date_types?.name_ar : p.date_types?.name_en}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {p.price_per_kg} {isRTL ? 'ر.س/كجم' : 'SAR/kg'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400 text-sm">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span className="font-medium">{p.rating > 0 ? p.rating.toFixed(1) : '—'}</span>
                      {p.rating_count > 0 && (
                        <span className="text-xs text-muted-foreground">({p.rating_count})</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Sales */}
        <Card className="border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <TrendingUp className="w-5 h-5 text-primary" />
              {isRTL ? 'أحدث المبيعات' : 'Recent Sales'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
            ) : (data?.recentSales?.length ?? 0) === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                {isRTL ? 'لا توجد مبيعات بعد' : 'No sales yet'}
              </p>
            ) : (
              <div className="space-y-3">
                {data!.recentSales.map((sale, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-muted/50 border border-border/50">
                    <div>
                      <p className="font-medium text-foreground text-sm">
                        {isRTL ? sale.date_types?.name_ar : sale.date_types?.name_en}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {sale.quantity_kg} {isRTL ? 'كجم' : 'kg'} · {new Date(sale.sale_date).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US')}
                      </p>
                    </div>
                    <p className="font-semibold text-sm text-foreground">
                      {Number(sale.total_price).toLocaleString()} {isRTL ? 'ر.س' : 'SAR'}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TraderDashboard;
