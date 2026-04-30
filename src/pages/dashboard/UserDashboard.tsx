import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Star, Calendar, Store,
  Loader2, CheckCircle, MapPin, User, ShoppingCart,
} from 'lucide-react';

interface UserStats {
  user: { full_name: string; email: string; created_at: string; role: string } | null;
  commentsCount: number;
  ordersCount: number;
  traderRatings: {
    stars: number;
    created_at: string;
    traders: { shop_name: string; city: string | null; rating: number } | null;
  }[];
  recentComments: {
    comment_id: string;
    content: string;
    target_type: string;
    created_at: string;
  }[];
  topTraders: {
    trader_id: string;
    shop_name: string;
    city: string | null;
    rating: number;
    rating_count: number;
    verified: boolean;
  }[];
  exhibitions: {
    exhibition_id: string;
    name_ar: string;
    name_en: string;
    city: string;
    start_date: string;
    end_date: string;
    status: string;
  }[];
}

const UserDashboard: React.FC = () => {
  const { isRTL } = useLanguage();
  const { user } = useAuth();

  const { data, isLoading } = useQuery<UserStats>({
    queryKey: ['user-dashboard-stats', user?.id],
    queryFn: async () => {
      const res = await fetch(`/api/dashboard/user-stats?user_id=${user?.id}`);
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    enabled: !!user?.id,
    staleTime: 60_000,
  });

  // Days since joined
  const joinedDaysAgo = data?.user?.created_at
    ? Math.floor((Date.now() - new Date(data.user.created_at).getTime()) / 86_400_000)
    : null;

  const stats = [
    {
      icon: ShoppingCart,
      labelAr: 'طلباتي',
      labelEn: 'My Orders',
      value: isLoading ? '…' : String(data?.ordersCount ?? 0),
      color: 'text-blue-500 bg-blue-500/10',
    },
    {
      icon: Star,
      labelAr: 'تجار قيّمتهم',
      labelEn: 'Traders Rated',
      value: isLoading ? '…' : String(data?.traderRatings?.length ?? 0),
      color: 'text-yellow-500 bg-yellow-500/10',
    },
    {
      icon: Calendar,
      labelAr: 'فعاليات قادمة',
      labelEn: 'Upcoming Events',
      value: isLoading ? '…' : String(data?.exhibitions?.length ?? 0),
      color: 'text-orange-500 bg-orange-500/10',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome + profile summary */}
      <div className="bg-gradient-to-r from-primary/20 to-primary/5 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
            <User className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-1">
              {isRTL ? `مرحباً، ${user?.name}` : `Welcome, ${user?.name}`}
            </h1>
            <p className="text-muted-foreground text-sm">
              {data?.user?.email}
            </p>
            {joinedDaysAgo !== null && (
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-green-500" />
                {isRTL
                  ? `عضو منذ ${joinedDaysAgo} يوماً`
                  : `Member for ${joinedDaysAgo} day${joinedDaysAgo !== 1 ? 's' : ''}`}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card key={i} className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl ${stat.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {isLoading
                        ? <Loader2 className="w-5 h-5 animate-spin text-muted-foreground inline" />
                        : stat.value}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {isRTL ? stat.labelAr : stat.labelEn}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* My Trader Ratings */}
      <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-primary" />
              {isRTL ? 'التجار الذين قيّمتهم' : 'Traders You Rated'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-6">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
              </div>
            ) : (data?.traderRatings?.length ?? 0) === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                {isRTL
                  ? 'لم تقيّم أي تاجر بعد. تفضل بزيارة صفحة التجار!'
                  : "You haven't rated any trader yet. Visit the traders page!"}
              </p>
            ) : (
              <div className="space-y-3">
                {data!.traderRatings.map((r, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                        <Store className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{r.traders?.shop_name}</p>
                        {r.traders?.city && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin className="w-3 h-3" />{r.traders.city}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, si) => (
                        <Star
                          key={si}
                          className={`w-3.5 h-3.5 ${si < r.stars ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground'}`}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

      {/* Top Traders */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="w-5 h-5 text-primary" />
            {isRTL ? 'أفضل التجار تقييماً' : 'Top Rated Traders'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            </div>
          ) : (data?.topTraders?.length ?? 0) === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              {isRTL ? 'لا يوجد تجار بعد' : 'No traders yet'}
            </p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {data!.topTraders.map((t) => (
                <div key={t.trader_id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Store className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <p className="font-medium text-sm truncate">{t.shop_name}</p>
                      {t.verified && (
                        <CheckCircle className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      )}
                    </div>
                    {t.city && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-3 h-3" />{t.city}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-yellow-500 text-xs font-medium shrink-0">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    {t.rating > 0 ? t.rating.toFixed(1) : '—'}
                    {t.rating_count > 0 && (
                      <span className="text-muted-foreground">({t.rating_count})</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upcoming Exhibitions */}
      {(data?.exhibitions?.length ?? 0) > 0 && (
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              {isRTL ? 'الفعاليات القادمة' : 'Upcoming Exhibitions'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data!.exhibitions.map((ex) => (
                <div key={ex.exhibition_id} className="flex items-start gap-4 p-4 rounded-xl bg-muted/50">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center shrink-0">
                    <Calendar className="w-5 h-5 text-orange-500" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{isRTL ? ex.name_ar : ex.name_en}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" />{ex.city}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {new Date(ex.start_date).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US')}
                      {' — '}
                      {new Date(ex.end_date).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US')}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    ex.status === 'active'
                      ? 'bg-green-500/10 text-green-600'
                      : 'bg-orange-500/10 text-orange-600'
                  }`}>
                    {ex.status === 'active'
                      ? (isRTL ? 'جارٍ' : 'Live')
                      : (isRTL ? 'قادم' : 'Upcoming')}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UserDashboard;
