import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Store, CheckCircle, XCircle, Clock, Trash2, Search, MapPin, Phone, Star } from 'lucide-react';

interface Trader {
  trader_id: string;
  user_id: string | null;
  shop_name: string;
  description: string | null;
  contact_phone: string | null;
  contact_whatsapp: string | null;
  city: string | null;
  rating: number;
  rating_count: number;
  verified: boolean;
  status: 'active' | 'pending' | 'suspended';
  created_at: string;
  users?: { full_name: string; email: string } | null;
}

const STATUS_CFG = {
  active:    { color: 'bg-green-500/10 text-green-600',  labelAr: 'نشط',    labelEn: 'Active'    },
  pending:   { color: 'bg-orange-500/10 text-orange-600', labelAr: 'معلق',   labelEn: 'Pending'   },
  suspended: { color: 'bg-red-500/10 text-red-600',      labelAr: 'موقوف',  labelEn: 'Suspended' },
};

const TradersAdminPage: React.FC = () => {
  const { isRTL } = useLanguage();
  const { user: me } = useAuth();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'active' | 'suspended'>('all');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const { data: traders = [], isLoading, isError } = useQuery<Trader[]>({
    queryKey: ['admin-traders'],
    queryFn: async () => {
      const res = await fetch('/api/traders?admin=true');
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    enabled: me?.role === 'admin',
    staleTime: 0,
  });

  const patchMut = useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Partial<Trader> }) => {
      const res = await fetch(`/api/traders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-traders'] }),
  });

  const deleteMut = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/traders/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed');
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-traders'] });
      setConfirmDelete(null);
    },
  });

  const approve  = (id: string) => patchMut.mutate({ id, patch: { status: 'active',    verified: true  } });
  const suspend  = (id: string) => patchMut.mutate({ id, patch: { status: 'suspended', verified: false } });
  const reinstate= (id: string) => patchMut.mutate({ id, patch: { status: 'active',    verified: true  } });

  const filtered = traders.filter(t => {
    const matchStatus = filter === 'all' || t.status === filter;
    const matchSearch =
      t.shop_name.toLowerCase().includes(search.toLowerCase()) ||
      (t.city ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (t.users?.full_name ?? '').toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const counts = {
    all:       traders.length,
    pending:   traders.filter(t => t.status === 'pending').length,
    active:    traders.filter(t => t.status === 'active').length,
    suspended: traders.filter(t => t.status === 'suspended').length,
  };

  const FILTERS: { key: typeof filter; labelAr: string; labelEn: string }[] = [
    { key: 'all',       labelAr: 'الكل',    labelEn: 'All'       },
    { key: 'pending',   labelAr: 'معلق',    labelEn: 'Pending'   },
    { key: 'active',    labelAr: 'نشط',     labelEn: 'Active'    },
    { key: 'suspended', labelAr: 'موقوف',   labelEn: 'Suspended' },
  ];

  if (me?.role !== 'admin') {
    return <div className="text-center py-20 text-muted-foreground">{isRTL ? 'للمديرين فقط' : 'Admins only'}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Store className="w-6 h-6 text-primary" />
          {isRTL ? 'إدارة التجار' : 'Trader Management'}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          {traders.length} {isRTL ? 'تاجر' : 'traders'}
          {counts.pending > 0 && (
            <span className="ms-2 px-2 py-0.5 rounded-full text-xs font-medium bg-orange-500/10 text-orange-600">
              {counts.pending} {isRTL ? 'بانتظار الموافقة' : 'pending approval'}
            </span>
          )}
        </p>
      </div>

      {/* Filter tabs + search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-1 p-1 bg-muted rounded-xl">
          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                filter === f.key ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {isRTL ? f.labelAr : f.labelEn}
              <span className="ms-1.5 text-xs opacity-70">({counts[f.key]})</span>
            </button>
          ))}
        </div>
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder={isRTL ? 'بحث...' : 'Search...'}
            className="w-full ps-9 pe-4 py-2 text-sm rounded-lg bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>

      {/* List */}
      <Card>
        <CardContent className="p-0">
          {isLoading && (
            <div className="p-8 text-center text-muted-foreground">{isRTL ? 'جارٍ التحميل...' : 'Loading...'}</div>
          )}
          {isError && (
            <div className="p-8 text-center text-red-500">{isRTL ? 'حدث خطأ' : 'Error loading traders'}</div>
          )}
          {!isLoading && !isError && (
            <div className="divide-y divide-border">
              {filtered.length === 0 && (
                <div className="p-8 text-center text-muted-foreground">
                  {isRTL ? 'لا يوجد تجار' : 'No traders found'}
                </div>
              )}
              {filtered.map(t => {
                const cfg = STATUS_CFG[t.status];
                const isPending = patchMut.isPending;
                return (
                  <div key={t.trader_id} className="p-4 hover:bg-muted/30 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                      {/* Info */}
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}>
                            {isRTL ? cfg.labelAr : cfg.labelEn}
                          </span>
                          {t.verified && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-600">
                              {isRTL ? 'موثّق ✓' : 'Verified ✓'}
                            </span>
                          )}
                        </div>
                        <p className="font-semibold text-base">{t.shop_name}</p>
                        {t.users && (
                          <p className="text-xs text-muted-foreground">
                            {t.users.full_name} · {t.users.email}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                          {t.city && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />{t.city}
                            </span>
                          )}
                          {t.contact_phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />{t.contact_phone}
                            </span>
                          )}
                          {t.rating > 0 && (
                            <span className="flex items-center gap-1">
                              <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                              {t.rating.toFixed(1)}
                              {t.rating_count > 0 && (
                                <span className="text-muted-foreground">({t.rating_count})</span>
                              )}
                            </span>
                          )}
                        </div>
                        {t.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2">{t.description}</p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 shrink-0 flex-wrap">
                        {t.status === 'pending' && (
                          <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white gap-1.5"
                            disabled={isPending} onClick={() => approve(t.trader_id)}>
                            <CheckCircle className="w-4 h-4" />
                            {isRTL ? 'موافقة' : 'Approve'}
                          </Button>
                        )}
                        {t.status === 'suspended' && (
                          <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white gap-1.5"
                            disabled={isPending} onClick={() => reinstate(t.trader_id)}>
                            <CheckCircle className="w-4 h-4" />
                            {isRTL ? 'إعادة تفعيل' : 'Reinstate'}
                          </Button>
                        )}
                        {t.status === 'active' && (
                          <Button size="sm" variant="outline"
                            className="border-orange-300 text-orange-600 hover:bg-orange-50 gap-1.5"
                            disabled={isPending} onClick={() => suspend(t.trader_id)}>
                            <XCircle className="w-4 h-4" />
                            {isRTL ? 'إيقاف' : 'Suspend'}
                          </Button>
                        )}
                        {t.status === 'pending' && (
                          <Button size="sm" variant="outline"
                            className="border-orange-300 text-orange-600 hover:bg-orange-50 gap-1.5"
                            disabled={isPending} onClick={() => suspend(t.trader_id)}>
                            <XCircle className="w-4 h-4" />
                            {isRTL ? 'رفض' : 'Reject'}
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" className="text-red-500 hover:bg-red-50"
                          onClick={() => setConfirmDelete(t.trader_id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete confirm */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card rounded-2xl p-6 max-w-sm w-full mx-4 shadow-xl">
            <h3 className="font-bold text-lg mb-2">{isRTL ? 'تأكيد الحذف' : 'Confirm Delete'}</h3>
            <p className="text-muted-foreground text-sm mb-6">
              {isRTL ? 'سيتم حذف التاجر وجميع بياناته نهائياً.' : 'The trader and all their data will be permanently deleted.'}
            </p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setConfirmDelete(null)}>
                {isRTL ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                disabled={deleteMut.isPending}
                onClick={() => deleteMut.mutate(confirmDelete)}>
                {deleteMut.isPending ? '...' : (isRTL ? 'حذف' : 'Delete')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TradersAdminPage;
