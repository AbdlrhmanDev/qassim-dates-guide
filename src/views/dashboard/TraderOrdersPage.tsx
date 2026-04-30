import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ShoppingCart, Loader2, Store, Leaf, Phone,
  MessageCircle, CheckCircle, Truck, Clock, XCircle, User,
} from 'lucide-react';

interface Order {
  order_id: string;
  quantity_kg: number;
  notes: string | null;
  status: 'pending' | 'confirmed' | 'delivered' | 'cancelled';
  created_at: string;
  users: { user_id: string; full_name: string; email: string } | null;
  date_types: { name_ar: string; name_en: string } | null;
}

interface Trader { trader_id: string; }

const STATUS_CFG = {
  pending:   { icon: Clock,       colorClass: 'bg-orange-500/10 text-orange-600', labelAr: 'قيد الانتظار', labelEn: 'Pending'   },
  confirmed: { icon: CheckCircle, colorClass: 'bg-blue-500/10 text-blue-600',     labelAr: 'تم التأكيد',   labelEn: 'Confirmed' },
  delivered: { icon: Truck,       colorClass: 'bg-green-500/10 text-green-600',   labelAr: 'تم التوصيل',   labelEn: 'Delivered' },
  cancelled: { icon: XCircle,     colorClass: 'bg-red-500/10 text-red-600',       labelAr: 'ملغي',         labelEn: 'Cancelled' },
};

// Next status in the workflow
const NEXT_STATUS: Record<string, { status: string; labelAr: string; labelEn: string; color: string }> = {
  pending:   { status: 'confirmed', labelAr: 'تأكيد الطلب',  labelEn: 'Confirm Order',  color: 'bg-blue-600 hover:bg-blue-700 text-white' },
  confirmed: { status: 'delivered', labelAr: 'تم التوصيل',  labelEn: 'Mark Delivered', color: 'bg-green-600 hover:bg-green-700 text-white' },
};

const TraderOrdersPage: React.FC = () => {
  const { isRTL } = useLanguage();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [filter, setFilter] = useState<'all' | Order['status']>('all');

  // Get trader_id for this user
  const { data: traderData } = useQuery<Trader>({
    queryKey: ['my-trader-profile', user?.id],
    queryFn: async () => {
      const res = await fetch(`/api/traders?user_id=${user?.id}`);
      if (!res.ok) throw new Error('Not found');
      return res.json();
    },
    enabled: !!user?.id,
    staleTime: 300_000,
  });

  const traderId = traderData?.trader_id;

  // Fetch incoming orders for this trader
  const { data: orders = [], isLoading } = useQuery<Order[]>({
    queryKey: ['trader-orders', traderId],
    queryFn: async () => {
      const res = await fetch(`/api/orders?trader_id=${traderId}`);
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    enabled: !!traderId,
    staleTime: 30_000,
    refetchInterval: 60_000, // auto-refresh every minute
  });

  // Update order status
  const updateMut = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Failed');
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['trader-orders', traderId] }),
  });

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);
  const counts = {
    all:       orders.length,
    pending:   orders.filter(o => o.status === 'pending').length,
    confirmed: orders.filter(o => o.status === 'confirmed').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
  };

  const FILTERS: { key: typeof filter; labelAr: string; labelEn: string }[] = [
    { key: 'all',       labelAr: 'الكل',       labelEn: 'All'       },
    { key: 'pending',   labelAr: 'انتظار',      labelEn: 'Pending'   },
    { key: 'confirmed', labelAr: 'مؤكدة',       labelEn: 'Confirmed' },
    { key: 'delivered', labelAr: 'مُسلَّمة',    labelEn: 'Delivered' },
    { key: 'cancelled', labelAr: 'ملغاة',       labelEn: 'Cancelled' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <ShoppingCart className="w-6 h-6 text-primary" />
          {isRTL ? 'طلبات العملاء' : 'Customer Orders'}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          {counts.pending > 0 && (
            <span className="inline-flex items-center gap-1 me-2 px-2 py-0.5 rounded-full text-xs font-medium bg-orange-500/10 text-orange-600">
              {counts.pending} {isRTL ? 'طلب جديد' : 'new'}
            </span>
          )}
          {orders.length} {isRTL ? 'طلب إجمالاً' : 'total orders'}
        </p>
      </div>

      {/* Workflow guide */}
      <div className="flex flex-wrap gap-2 items-center text-xs text-muted-foreground">
        <span className="px-2 py-1 rounded-full bg-orange-500/10 text-orange-600 font-medium">{isRTL ? 'انتظار' : 'Pending'}</span>
        <span>→</span>
        <span className="px-2 py-1 rounded-full bg-blue-500/10 text-blue-600 font-medium">{isRTL ? 'مؤكد' : 'Confirmed'}</span>
        <span>→</span>
        <span className="px-2 py-1 rounded-full bg-green-500/10 text-green-600 font-medium">{isRTL ? 'تم التوصيل' : 'Delivered'}</span>
        <span className="ms-2 text-muted-foreground">{isRTL ? '— حدّث الحالة بزر واحد' : '— update with one button'}</span>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 p-1 bg-muted rounded-xl overflow-x-auto">
        {FILTERS.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              filter === f.key ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {isRTL ? f.labelAr : f.labelEn}
            <span className="ms-1.5 text-xs opacity-70">({counts[f.key]})</span>
          </button>
        ))}
      </div>

      {/* Orders list */}
      <Card>
        <CardContent className="p-0">
          {isLoading || !traderId ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <ShoppingCart className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">{isRTL ? 'لا توجد طلبات' : 'No orders yet'}</p>
              <p className="text-sm mt-1">
                {isRTL
                  ? 'ستظهر هنا طلبات العملاء بعد إرسالها عبر واتساب'
                  : 'Customer orders will appear here after they send via WhatsApp'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filtered.map(order => {
                const cfg = STATUS_CFG[order.status];
                const StatusIcon = cfg.icon;
                const next = NEXT_STATUS[order.status];
                return (
                  <div key={order.order_id} className="p-4 hover:bg-muted/30 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                      <div className="flex-1 space-y-2">
                        {/* Status + date */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.colorClass}`}>
                            <StatusIcon className="w-3 h-3" />
                            {isRTL ? cfg.labelAr : cfg.labelEn}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(order.created_at).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', {
                              year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                            })}
                          </span>
                        </div>

                        {/* Customer + product */}
                        <div className="flex flex-wrap gap-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                              <User className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">{isRTL ? 'العميل' : 'Customer'}</p>
                              <p className="font-medium text-sm">{order.users?.full_name}</p>
                              <p className="text-xs text-muted-foreground">{order.users?.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Leaf className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">{isRTL ? 'نوع التمر' : 'Date Type'}</p>
                              <p className="font-medium text-sm">
                                {isRTL ? order.date_types?.name_ar : order.date_types?.name_en}
                              </p>
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">{isRTL ? 'الكمية' : 'Quantity'}</p>
                            <p className="font-semibold text-sm">{order.quantity_kg} {isRTL ? 'كجم' : 'kg'}</p>
                          </div>
                        </div>

                        {order.notes && (
                          <p className="text-xs text-muted-foreground bg-muted/50 px-3 py-2 rounded-lg">
                            📝 {order.notes}
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2 shrink-0">
                        {/* Advance status */}
                        {next && (
                          <Button
                            size="sm"
                            className={`gap-1.5 ${next.color}`}
                            disabled={updateMut.isPending}
                            onClick={() => updateMut.mutate({ orderId: order.order_id, status: next.status })}
                          >
                            {updateMut.isPending
                              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              : <CheckCircle className="w-3.5 h-3.5" />}
                            {isRTL ? next.labelAr : next.labelEn}
                          </Button>
                        )}

                        {/* Cancel (only if pending or confirmed) */}
                        {(order.status === 'pending' || order.status === 'confirmed') && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-300 text-red-600 hover:bg-red-50 gap-1.5"
                            disabled={updateMut.isPending}
                            onClick={() => updateMut.mutate({ orderId: order.order_id, status: 'cancelled' })}
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            {isRTL ? 'إلغاء' : 'Cancel'}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TraderOrdersPage;
