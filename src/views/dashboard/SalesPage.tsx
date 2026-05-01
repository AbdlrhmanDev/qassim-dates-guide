import { authFetch } from '@/lib/api-client';
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DollarSign, Plus, Trash2, X } from 'lucide-react';
import type { DateType } from '@/lib/database.types';

interface SaleRow {
  sale_id: string;
  trader_id: string;
  date_type_id: string;
  quantity: number;
  price_per_unit: number;
  total_price: number;
  sale_date: string;
  market_name: string | null;
  status: 'pending' | 'confirmed' | 'cancelled';
  traders?: { shop_name: string };
  date_types?: { name_ar: string; name_en: string };
}

const STATUS_COLOR: Record<string, string> = {
  confirmed:  'bg-green-500/10 text-green-600',
  pending:    'bg-orange-500/10 text-orange-600',
  cancelled:  'bg-red-500/10 text-red-600',
};

const SalesPage: React.FC = () => {
  const { isRTL } = useLanguage();
  const { user } = useAuth();
  const qc = useQueryClient();
  const isAdmin = user?.role === 'admin';
  const isTrader = user?.role === 'trader';

  const [modal, setModal] = useState(false);
  type SaleStatus = 'pending' | 'confirmed' | 'cancelled';
  type SaleForm = { date_type_id: string; quantity: string; price_per_unit: string; market_name: string; sale_date: string; status: SaleStatus };
  const [form, setForm] = useState<SaleForm>({ date_type_id: '', quantity: '', price_per_unit: '', market_name: '', sale_date: new Date().toISOString().split('T')[0], status: 'confirmed' });
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const { data: sales = [], isLoading } = useQuery<SaleRow[]>({
    queryKey: ['sales'],
    queryFn: async () => {
      const res = await authFetch('/api/sales');
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
  });

  const { data: dateTypes = [] } = useQuery<DateType[]>({
    queryKey: ['dates', {}],
    queryFn: async () => { const r = await authFetch('/api/dates'); return r.json(); },
    enabled: isTrader,
  });

  const createMut = useMutation({
    mutationFn: async (body: typeof form) => {
      const res = await authFetch('/api/sales', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...body, quantity: Number(body.quantity), price_per_unit: Number(body.price_per_unit) }),
      });
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['sales'] }); setModal(false); setForm({ date_type_id: '', quantity: '', price_per_unit: '', market_name: '', sale_date: new Date().toISOString().split('T')[0], status: 'confirmed' }); },
  });

  const deleteMut = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/sales/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed');
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['sales'] }); setConfirmDelete(null); },
  });

  // Stats
  const totalRevenue = sales.filter(s => s.status === 'confirmed').reduce((a, s) => a + (s.total_price ?? 0), 0);
  const confirmed    = sales.filter(s => s.status === 'confirmed').length;

  const inp = "w-full px-3 py-2 text-sm rounded-lg bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary/50";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-primary" />
            {isRTL ? 'المبيعات' : 'Sales'}
          </h1>
        </div>
        {isTrader && (
          <Button onClick={() => setModal(true)} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            {isRTL ? 'إضافة بيعة' : 'Add Sale'}
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: isRTL ? 'إجمالي المبيعات' : 'Total Sales', value: sales.length },
          { label: isRTL ? 'المؤكدة' : 'Confirmed', value: confirmed },
          { label: isRTL ? 'الإيراد الكلي' : 'Total Revenue', value: `${totalRevenue.toLocaleString()} SAR` },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading && <div className="p-8 text-center text-muted-foreground">{isRTL ? 'جارٍ التحميل...' : 'Loading...'}</div>}
          {!isLoading && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-muted/50">
                  <tr>
                    {[
                      isRTL?'نوع التمر':'Date Type',
                      ...(isAdmin ? [isRTL?'التاجر':'Trader'] : []),
                      isRTL?'الكمية':'Qty',
                      isRTL?'السعر':'Price',
                      isRTL?'الإجمالي':'Total',
                      isRTL?'التاريخ':'Date',
                      isRTL?'السوق':'Market',
                      isRTL?'الحالة':'Status',
                      isRTL?'إجراءات':'Actions',
                    ].map(h => <th key={h} className="text-start px-4 py-3 font-medium text-muted-foreground">{h}</th>)}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {sales.map(s => (
                    <tr key={s.sale_id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-medium">{isRTL ? s.date_types?.name_ar : s.date_types?.name_en}</td>
                      {isAdmin && <td className="px-4 py-3 text-muted-foreground">{s.traders?.shop_name}</td>}
                      <td className="px-4 py-3">{s.quantity} {isRTL ? 'كجم' : 'kg'}</td>
                      <td className="px-4 py-3">{s.price_per_unit} {isRTL ? 'ر.س' : 'SAR'}</td>
                      <td className="px-4 py-3 font-medium">{s.total_price} {isRTL ? 'ر.س' : 'SAR'}</td>
                      <td className="px-4 py-3 text-muted-foreground">{s.sale_date}</td>
                      <td className="px-4 py-3 text-muted-foreground">{s.market_name ?? '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLOR[s.status] ?? ''}`}>
                          {s.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {(isAdmin || isTrader) && (
                          <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-50"
                            onClick={() => setConfirmDelete(s.sale_id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {sales.length === 0 && (
                    <tr><td colSpan={9} className="px-4 py-8 text-center text-muted-foreground">
                      {isRTL ? 'لا توجد مبيعات' : 'No sales yet'}
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Sale Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">{isRTL ? 'إضافة بيعة جديدة' : 'Add New Sale'}</h3>
              <button onClick={() => setModal(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">{isRTL ? 'نوع التمر' : 'Date Type'}</label>
                <select className={inp} value={form.date_type_id} onChange={e => setForm(f => ({ ...f, date_type_id: e.target.value }))}>
                  <option value="">{isRTL ? 'اختر نوع التمر' : 'Select date type'}</option>
                  {dateTypes.map(d => <option key={d.date_type_id} value={d.date_type_id}>{isRTL ? d.name_ar : d.name_en}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs text-muted-foreground mb-1 block">{isRTL ? 'الكمية (كجم)' : 'Quantity (kg)'}</label><input type="number" className={inp} value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} /></div>
                <div><label className="text-xs text-muted-foreground mb-1 block">{isRTL ? 'سعر الكجم (ر.س)' : 'Price/kg (SAR)'}</label><input type="number" className={inp} value={form.price_per_unit} onChange={e => setForm(f => ({ ...f, price_per_unit: e.target.value }))} /></div>
              </div>
              <div><label className="text-xs text-muted-foreground mb-1 block">{isRTL ? 'اسم السوق' : 'Market Name'}</label><input className={inp} value={form.market_name} onChange={e => setForm(f => ({ ...f, market_name: e.target.value }))} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs text-muted-foreground mb-1 block">{isRTL ? 'التاريخ' : 'Date'}</label><input type="date" className={inp} value={form.sale_date} onChange={e => setForm(f => ({ ...f, sale_date: e.target.value }))} /></div>
                <div><label className="text-xs text-muted-foreground mb-1 block">{isRTL ? 'الحالة' : 'Status'}</label>
                  <select className={inp} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as 'confirmed'|'pending'|'cancelled' }))}>
                    <option value="confirmed">Confirmed</option><option value="pending">Pending</option><option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
              {form.quantity && form.price_per_unit && (
                <p className="text-sm font-medium text-primary">
                  {isRTL ? 'الإجمالي:' : 'Total:'} {(Number(form.quantity) * Number(form.price_per_unit)).toLocaleString()} {isRTL ? 'ر.س' : 'SAR'}
                </p>
              )}
            </div>
            <div className="flex gap-3 mt-5">
              <Button variant="outline" className="flex-1" onClick={() => setModal(false)}>{isRTL ? 'إلغاء' : 'Cancel'}</Button>
              <Button className="flex-1" disabled={!form.date_type_id || !form.quantity || !form.price_per_unit || createMut.isPending}
                onClick={() => createMut.mutate(form)}>
                {createMut.isPending ? '...' : (isRTL ? 'إضافة' : 'Add')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card rounded-2xl p-6 max-w-sm w-full mx-4 shadow-xl">
            <h3 className="font-bold text-lg mb-2">{isRTL ? 'تأكيد الحذف' : 'Confirm Delete'}</h3>
            <p className="text-muted-foreground text-sm mb-6">{isRTL ? 'هل أنت متأكد؟' : 'Are you sure?'}</p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setConfirmDelete(null)}>{isRTL ? 'إلغاء' : 'Cancel'}</Button>
              <Button className="flex-1 bg-red-500 hover:bg-red-600 text-white" disabled={deleteMut.isPending}
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

export default SalesPage;
