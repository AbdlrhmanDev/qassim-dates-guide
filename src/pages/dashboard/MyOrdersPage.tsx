import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ShoppingCart, Plus, Loader2, Store, Leaf,
  Phone, MessageCircle, X, CheckCircle, Truck,
  Clock, XCircle, Send, DollarSign,
} from 'lucide-react';

interface Order {
  order_id: string;
  quantity_kg: number;
  price_per_kg: number | null;
  notes: string | null;
  status: 'pending' | 'confirmed' | 'delivered' | 'cancelled';
  created_at: string;
  traders: {
    trader_id: string;
    shop_name: string;
    city: string | null;
    contact_phone: string | null;
    contact_whatsapp: string | null;
  } | null;
  date_types: { date_type_id: string; name_ar: string; name_en: string; category: string } | null;
}

interface Trader {
  trader_id: string;
  shop_name: string;
  city: string | null;
  contact_whatsapp: string | null;
  contact_phone: string | null;
}
interface DateType { date_type_id: string; name_ar: string; name_en: string; category: string; }
interface TraderProduct { price_per_kg: number; date_types: { date_type_id: string } | null; }

const STATUS_CFG = {
  pending:   { icon: Clock,       colorClass: 'bg-orange-500/10 text-orange-600', labelAr: 'قيد الانتظار', labelEn: 'Pending'   },
  confirmed: { icon: CheckCircle, colorClass: 'bg-blue-500/10 text-blue-600',     labelAr: 'تم التأكيد',   labelEn: 'Confirmed' },
  delivered: { icon: Truck,       colorClass: 'bg-green-500/10 text-green-600',   labelAr: 'تم التوصيل',   labelEn: 'Delivered' },
  cancelled: { icon: XCircle,     colorClass: 'bg-red-500/10 text-red-600',       labelAr: 'ملغي',         labelEn: 'Cancelled' },
};

function toSaudiWhatsApp(raw: string): string {
  const d = raw.replace(/\D/g, '');
  if (d.startsWith('966')) return d;
  if (d.startsWith('0'))   return '966' + d.slice(1);
  return '966' + d;
}

function buildWhatsAppUrl(
  whatsapp: string,
  o: { shopName: string; dateName: string; qty: number; pricePerKg: string; notes: string | null; userName: string }
) {
  const phone = toSaudiWhatsApp(whatsapp);
  const priceAr = o.pricePerKg ? `السعر المطلوب: *${o.pricePerKg} ريال/كجم*` : `السعر: *يرجى التاكيد*`;
  const priceEn = o.pricePerKg ? `Price: *${o.pricePerKg} SAR/kg*` : `Price: *please confirm*`;
  const msg = [
    `السلام عليكم`,
    ``,
    `*طلب جديد عبر دليل تمور القصيم*`,
    `--------------------------`,
    `العميل: *${o.userName}*`,
    `المتجر: *${o.shopName}*`,
    `نوع التمر: *${o.dateName}*`,
    `الكمية المطلوبة: *${o.qty} كجم*`,
    priceAr,
    o.notes ? `ملاحظات: ${o.notes}` : null,
    `--------------------------`,
    `ارجو التواصل لتاكيد الطلب`,
    ``,
    `_New order via Qassim Dates Guide_`,
    `_${o.dateName} - ${o.qty} kg - ${priceEn}_`,
  ].filter(Boolean).join('\n');
  return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`;
}

const MyOrdersPage: React.FC = () => {
  const { isRTL } = useLanguage();
  const { user } = useAuth();
  const qc = useQueryClient();

  const [showForm, setShowForm]       = useState(false);
  const [traderId, setTraderId]       = useState('');
  const [dateTypeId, setDateTypeId]   = useState('');
  const [quantityKg, setQuantityKg]   = useState('');
  const [pricePerKg, setPricePerKg]   = useState('');
  const [notes, setNotes]             = useState('');
  const [filter, setFilter]           = useState<'all' | Order['status']>('all');

  // Fetch user's orders
  const { data: orders = [], isLoading } = useQuery<Order[]>({
    queryKey: ['my-orders', user?.id],
    queryFn: async () => {
      const res = await fetch(`/api/orders?user_id=${user?.id}`);
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    enabled: !!user?.id,
    staleTime: 30_000,
  });

  // Fetch traders
  const { data: traders = [] } = useQuery<Trader[]>({
    queryKey: ['active-traders-list'],
    queryFn: async () => {
      const res = await fetch('/api/traders');
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    staleTime: 120_000,
  });

  // Fetch date types
  const { data: dateTypes = [] } = useQuery<DateType[]>({
    queryKey: ['date-types-list'],
    queryFn: async () => {
      const res = await fetch('/api/dates');
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    staleTime: 120_000,
  });

  // Fetch trader's products to auto-fill price when trader + date type selected
  const { data: traderProducts = [] } = useQuery<TraderProduct[]>({
    queryKey: ['trader-products-for-order', traderId],
    queryFn: async () => {
      const res = await fetch(`/api/trader-products?trader_id=${traderId}`);
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    enabled: !!traderId,
    staleTime: 60_000,
  });

  // Auto-fill price when trader + date type are both selected
  useEffect(() => {
    if (!traderId || !dateTypeId) return;
    const match = traderProducts.find(p => p.date_types?.date_type_id === dateTypeId);
    if (match) setPricePerKg(String(match.price_per_kg));
    else setPricePerKg('');
  }, [traderId, dateTypeId, traderProducts]);

  // Reset price when trader changes
  useEffect(() => { setPricePerKg(''); setDateTypeId(''); }, [traderId]);

  // Place order
  const placeMut = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id:      user?.id,
          trader_id:    traderId,
          date_type_id: dateTypeId,
          quantity_kg:  Number(quantityKg),
          price_per_kg: pricePerKg ? Number(pricePerKg) : null,
          notes:        notes.trim() || null,
        }),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
      return res.json() as Promise<Order>;
    },
    onSuccess: (order) => {
      qc.invalidateQueries({ queryKey: ['my-orders', user?.id] });
      setShowForm(false);
      setTraderId(''); setDateTypeId(''); setQuantityKg(''); setPricePerKg(''); setNotes('');
      const wa = order.traders?.contact_whatsapp || order.traders?.contact_phone;
      if (wa) {
        window.open(buildWhatsAppUrl(wa, {
          shopName:   order.traders!.shop_name,
          dateName:   isRTL ? (order.date_types?.name_ar ?? '') : (order.date_types?.name_en ?? ''),
          qty:        order.quantity_kg,
          pricePerKg: order.price_per_kg ? String(order.price_per_kg) : '',
          notes:      order.notes,
          userName:   user?.name ?? '',
        }), '_blank');
      }
    },
  });

  // Cancel order
  const cancelMut = useMutation({
    mutationFn: async (orderId: string) => {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' }),
      });
      if (!res.ok) throw new Error('Failed');
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['my-orders', user?.id] }),
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

  const formValid = traderId && dateTypeId && Number(quantityKg) > 0;
  const selectedTrader = traders.find(t => t.trader_id === traderId);
  const selectedDate   = dateTypes.find(d => d.date_type_id === dateTypeId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-primary" />
            {isRTL ? 'طلباتي' : 'My Orders'}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {orders.length} {isRTL ? 'طلب' : 'order(s)'}
          </p>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          {isRTL ? 'طلب جديد' : 'New Order'}
        </Button>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-700 text-sm">
        <MessageCircle className="w-4 h-4 mt-0.5 shrink-0" />
        <p>
          {isRTL
            ? 'عند إرسال الطلب سيُفتح واتساب تلقائياً لإرسال تفاصيل طلبك للتاجر. يمكنك متابعة حالة الطلب من هذه الصفحة.'
            : 'When you place an order, WhatsApp will open to send your order details to the trader. Track the status here.'}
        </p>
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
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <ShoppingCart className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">{isRTL ? 'لا توجد طلبات' : 'No orders found'}</p>
              <p className="text-sm mt-1">
                {isRTL ? 'اضغط "طلب جديد" لإنشاء طلبك الأول' : 'Press "New Order" to place your first order'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filtered.map(order => {
                const cfg = STATUS_CFG[order.status];
                const StatusIcon = cfg.icon;
                const wa = order.traders?.contact_whatsapp || order.traders?.contact_phone;
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
                              year: 'numeric', month: 'short', day: 'numeric',
                            })}
                          </span>
                        </div>

                        {/* Details row */}
                        <div className="flex flex-wrap gap-4">
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
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                              <Store className="w-4 h-4 text-green-600" />
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">{isRTL ? 'التاجر' : 'Trader'}</p>
                              <p className="font-medium text-sm">{order.traders?.shop_name}</p>
                              {order.traders?.city && (
                                <p className="text-xs text-muted-foreground">{order.traders.city}</p>
                              )}
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">{isRTL ? 'الكمية' : 'Quantity'}</p>
                            <p className="font-semibold text-sm">{order.quantity_kg} {isRTL ? 'كجم' : 'kg'}</p>
                          </div>
                          {order.price_per_kg && (
                            <div>
                              <p className="text-xs text-muted-foreground">{isRTL ? 'السعر/كجم' : 'Price/kg'}</p>
                              <p className="font-semibold text-sm text-primary">
                                {order.price_per_kg} {isRTL ? 'ر.س' : 'SAR'}
                              </p>
                            </div>
                          )}
                          {order.price_per_kg && (
                            <div>
                              <p className="text-xs text-muted-foreground">{isRTL ? 'الإجمالي' : 'Total'}</p>
                              <p className="font-semibold text-sm text-primary">
                                {(order.price_per_kg * order.quantity_kg).toLocaleString()} {isRTL ? 'ر.س' : 'SAR'}
                              </p>
                            </div>
                          )}
                        </div>

                        {order.notes && (
                          <p className="text-xs text-muted-foreground bg-muted/50 px-3 py-2 rounded-lg">
                            {order.notes}
                          </p>
                        )}

                        {/* Action buttons */}
                        <div className="flex gap-2 flex-wrap">
                          {wa && order.status !== 'cancelled' && (
                            <a
                              href={buildWhatsAppUrl(wa, {
                                shopName:   order.traders!.shop_name,
                                dateName:   isRTL ? (order.date_types?.name_ar ?? '') : (order.date_types?.name_en ?? ''),
                                qty:        order.quantity_kg,
                                pricePerKg: order.price_per_kg ? String(order.price_per_kg) : '',
                                notes:      order.notes,
                                userName:   user?.name ?? '',
                              })}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-green-500/10 text-green-700 hover:bg-green-500/20 transition-colors font-medium"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              {isRTL ? 'واتساب' : 'WhatsApp'}
                            </a>
                          )}
                          {order.traders?.contact_phone && (
                            <a
                              href={`tel:${order.traders.contact_phone}`}
                              className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/70 transition-colors"
                            >
                              <Phone className="w-3.5 h-3.5" />
                              {isRTL ? 'اتصال' : 'Call'}
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Cancel */}
                      {order.status === 'pending' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-300 text-red-600 hover:bg-red-50 shrink-0"
                          disabled={cancelMut.isPending}
                          onClick={() => cancelMut.mutate(order.order_id)}
                        >
                          <X className="w-4 h-4 me-1" />
                          {isRTL ? 'إلغاء' : 'Cancel'}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ─── New Order Modal ─── */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card rounded-2xl p-6 w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-lg">{isRTL ? 'طلب جديد' : 'New Order'}</h3>
              <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Trader */}
              <div>
                <label className="text-sm font-medium mb-1 block">{isRTL ? 'اختر التاجر' : 'Select Trader'}</label>
                <select
                  value={traderId}
                  onChange={e => setTraderId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="">{isRTL ? '— اختر —' : '— Choose —'}</option>
                  {traders.map(t => (
                    <option key={t.trader_id} value={t.trader_id}>
                      {t.shop_name}{t.city ? ` — ${t.city}` : ''}
                    </option>
                  ))}
                </select>
                {selectedTrader && !selectedTrader.contact_whatsapp && !selectedTrader.contact_phone && (
                  <p className="text-xs text-orange-500 mt-1">
                    {isRTL ? 'هذا التاجر لم يضف رقم واتساب بعد' : 'This trader has no WhatsApp number yet'}
                  </p>
                )}
              </div>

              {/* Date type */}
              <div>
                <label className="text-sm font-medium mb-1 block">{isRTL ? 'نوع التمر' : 'Date Type'}</label>
                <select
                  value={dateTypeId}
                  onChange={e => setDateTypeId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="">{isRTL ? '— اختر —' : '— Choose —'}</option>
                  {dateTypes.map(d => (
                    <option key={d.date_type_id} value={d.date_type_id}>
                      {isRTL ? d.name_ar : d.name_en}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quantity + Price side by side */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium mb-1 block">{isRTL ? 'الكمية (كجم)' : 'Quantity (kg)'}</label>
                  <input
                    type="number"
                    min="0.5"
                    step="0.5"
                    value={quantityKg}
                    onChange={e => setQuantityKg(e.target.value)}
                    placeholder={isRTL ? 'مثال: 5' : 'e.g. 5'}
                    className="w-full px-3 py-2 rounded-xl bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    {isRTL ? 'السعر (ر.س/كجم)' : 'Price (SAR/kg)'}
                    {pricePerKg && traderProducts.find(p => p.date_types?.date_type_id === dateTypeId) && (
                      <span className="ms-1 text-xs font-normal text-green-600">
                        {isRTL ? '(من كتالوج التاجر)' : '(from catalog)'}
                      </span>
                    )}
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute start-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <input
                      type="number"
                      min="1"
                      step="0.5"
                      value={pricePerKg}
                      onChange={e => setPricePerKg(e.target.value)}
                      placeholder={isRTL ? 'اختياري' : 'Optional'}
                      className="w-full ps-8 pe-3 py-2 rounded-xl bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                </div>
              </div>

              {/* Total preview */}
              {Number(quantityKg) > 0 && Number(pricePerKg) > 0 && (
                <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-primary/10 text-sm">
                  <span className="text-muted-foreground">{isRTL ? 'الإجمالي المتوقع:' : 'Estimated total:'}</span>
                  <span className="font-bold text-primary">
                    {(Number(quantityKg) * Number(pricePerKg)).toLocaleString()} {isRTL ? 'ر.س' : 'SAR'}
                  </span>
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="text-sm font-medium mb-1 block">{isRTL ? 'ملاحظات (اختياري)' : 'Notes (optional)'}</label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={2}
                  placeholder={isRTL ? 'أي تفاصيل إضافية...' : 'Any additional details...'}
                  className="w-full px-3 py-2 rounded-xl bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                />
              </div>

              {/* WhatsApp preview */}
              {selectedTrader && selectedDate && Number(quantityKg) > 0 && (
                <div className="rounded-xl bg-green-500/10 border border-green-500/20 p-3 text-xs text-green-800 space-y-1">
                  <p className="font-medium flex items-center gap-1">
                    <MessageCircle className="w-3.5 h-3.5" />
                    {isRTL ? 'رسالة الواتساب:' : 'WhatsApp message:'}
                  </p>
                  <p>{isRTL ? selectedDate.name_ar : selectedDate.name_en} — {quantityKg} {isRTL ? 'كجم' : 'kg'}</p>
                  {pricePerKg && (
                    <p>{isRTL ? 'السعر:' : 'Price:'} {pricePerKg} {isRTL ? 'ر.س/كجم' : 'SAR/kg'}</p>
                  )}
                  {!pricePerKg && (
                    <p className="text-orange-700">{isRTL ? 'السعر: يرجى التاكيد' : 'Price: please confirm'}</p>
                  )}
                  <p>{selectedTrader.shop_name}</p>
                  {notes && <p>{notes}</p>}
                </div>
              )}

              {placeMut.isError && (
                <p className="text-sm text-red-500">{isRTL ? 'حدث خطأ، حاول مجدداً' : 'An error occurred, please try again'}</p>
              )}

              <div className="flex gap-3 pt-1">
                <Button variant="outline" className="flex-1" onClick={() => setShowForm(false)}>
                  {isRTL ? 'إلغاء' : 'Cancel'}
                </Button>
                <Button
                  className="flex-1 gap-2"
                  disabled={!formValid || placeMut.isPending}
                  onClick={() => placeMut.mutate()}
                >
                  {placeMut.isPending
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <><Send className="w-4 h-4" />{isRTL ? 'ارسال + واتساب' : 'Send + WhatsApp'}</>}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyOrdersPage;
