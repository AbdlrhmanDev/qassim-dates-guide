import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, Plus, Pencil, Trash2, X } from 'lucide-react';
import type { DateType } from '@/lib/database.types';

type Category = 'premium' | 'fresh' | 'dried';
type FormState = { name_ar: string; name_en: string; description_ar: string; description_en: string; season: string; category: Category; calories: string };
const EMPTY_FORM: FormState = { name_ar: '', name_en: '', description_ar: '', description_en: '', season: '', category: 'premium', calories: '' };

const ProductsPage: React.FC = () => {
  const { isRTL } = useLanguage();
  const { user } = useAuth();
  const qc = useQueryClient();

  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [editing, setEditing] = useState<DateType | null>(null);
  const [form, setForm] = useState<FormState>({ ...EMPTY_FORM });
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const isAdmin = user?.role === 'admin';

  const { data: dates = [], isLoading } = useQuery<DateType[]>({
    queryKey: ['dates', {}],
    queryFn: async () => { const r = await fetch('/api/dates'); return r.json(); },
  });

  const createMut = useMutation({
    mutationFn: async (body: typeof form) => {
      const res = await fetch('/api/dates', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...body, calories: body.calories ? Number(body.calories) : null }),
      });
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['dates'] }); setModal(null); setForm({ ...EMPTY_FORM }); },
  });

  const updateMut = useMutation({
    mutationFn: async (body: typeof form & { id: string }) => {
      const { id, ...rest } = body;
      const res = await fetch(`/api/dates/${id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...rest, calories: rest.calories ? Number(rest.calories) : null }),
      });
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['dates'] }); setModal(null); setEditing(null); },
  });

  const deleteMut = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/dates/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed');
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['dates'] }); setConfirmDelete(null); },
  });

  const openEdit = (d: DateType) => {
    setEditing(d);
    setForm({ name_ar: d.name_ar, name_en: d.name_en, description_ar: d.description_ar ?? '', description_en: d.description_en ?? '', season: d.season ?? '', category: d.category, calories: d.calories ? String(d.calories) : '' });
    setModal('edit');
  };

  const catLabel = (c: string) => ({ premium: isRTL ? 'فاخر' : 'Premium', fresh: isRTL ? 'طازج' : 'Fresh', dried: isRTL ? 'مجفف' : 'Dried' }[c] ?? c);

  const inp = "w-full px-3 py-2 text-sm rounded-lg bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary/50";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Package className="w-6 h-6 text-primary" />
            {isRTL ? 'أنواع التمور' : 'Date Types'}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">{dates.length} {isRTL ? 'نوع' : 'types'}</p>
        </div>
        {isAdmin && (
          <Button onClick={() => { setForm({ ...EMPTY_FORM }); setModal('create'); }} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            {isRTL ? 'إضافة نوع' : 'Add Type'}
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading && <div className="p-8 text-center text-muted-foreground">{isRTL ? 'جارٍ التحميل...' : 'Loading...'}</div>}
          {!isLoading && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-muted/50">
                  <tr>
                    {[isRTL?'الاسم (ع)':'Name (AR)', isRTL?'الاسم (إن)':'Name (EN)', isRTL?'الفئة':'Category', isRTL?'الموسم':'Season', isRTL?'السعرات':'Cal', ...(isAdmin ? [isRTL?'إجراءات':'Actions'] : [])].map(h => (
                      <th key={h} className="text-start px-4 py-3 font-medium text-muted-foreground">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {dates.map(d => (
                    <tr key={d.date_type_id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-medium">{d.name_ar}</td>
                      <td className="px-4 py-3">{d.name_en}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 rounded-full text-xs bg-primary/10 text-primary">{catLabel(d.category)}</span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{d.season ?? '—'}</td>
                      <td className="px-4 py-3 text-muted-foreground">{d.calories ?? '—'}</td>
                      {isAdmin && (
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" onClick={() => openEdit(d)}><Pencil className="w-4 h-4" /></Button>
                            <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-50" onClick={() => setConfirmDelete(d.date_type_id)}><Trash2 className="w-4 h-4" /></Button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create / Edit Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card rounded-2xl p-6 w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">{modal === 'create' ? (isRTL ? 'إضافة نوع تمر' : 'Add Date Type') : (isRTL ? 'تعديل نوع التمر' : 'Edit Date Type')}</h3>
              <button onClick={() => setModal(null)}><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs text-muted-foreground mb-1 block">{isRTL ? 'الاسم بالعربي' : 'Name (Arabic)'}</label><input className={inp} value={form.name_ar} onChange={e => setForm(f => ({ ...f, name_ar: e.target.value }))} /></div>
                <div><label className="text-xs text-muted-foreground mb-1 block">{isRTL ? 'الاسم بالإنجليزي' : 'Name (English)'}</label><input className={inp} value={form.name_en} onChange={e => setForm(f => ({ ...f, name_en: e.target.value }))} /></div>
              </div>
              <div><label className="text-xs text-muted-foreground mb-1 block">{isRTL ? 'وصف عربي' : 'Description (AR)'}</label><textarea className={inp} rows={2} value={form.description_ar} onChange={e => setForm(f => ({ ...f, description_ar: e.target.value }))} /></div>
              <div><label className="text-xs text-muted-foreground mb-1 block">{isRTL ? 'وصف إنجليزي' : 'Description (EN)'}</label><textarea className={inp} rows={2} value={form.description_en} onChange={e => setForm(f => ({ ...f, description_en: e.target.value }))} /></div>
              <div className="grid grid-cols-3 gap-3">
                <div><label className="text-xs text-muted-foreground mb-1 block">{isRTL ? 'الفئة' : 'Category'}</label>
                  <select className={inp} value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value as 'premium'|'fresh'|'dried' }))}>
                    <option value="premium">Premium</option><option value="fresh">Fresh</option><option value="dried">Dried</option>
                  </select>
                </div>
                <div><label className="text-xs text-muted-foreground mb-1 block">{isRTL ? 'الموسم' : 'Season'}</label><input className={inp} value={form.season} onChange={e => setForm(f => ({ ...f, season: e.target.value }))} /></div>
                <div><label className="text-xs text-muted-foreground mb-1 block">{isRTL ? 'السعرات' : 'Calories'}</label><input type="number" className={inp} value={form.calories} onChange={e => setForm(f => ({ ...f, calories: e.target.value }))} /></div>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <Button variant="outline" className="flex-1" onClick={() => setModal(null)}>{isRTL ? 'إلغاء' : 'Cancel'}</Button>
              <Button className="flex-1"
                disabled={!form.name_ar || !form.name_en || createMut.isPending || updateMut.isPending}
                onClick={() => {
                  if (modal === 'create') createMut.mutate(form);
                  else if (editing) updateMut.mutate({ ...form, id: editing.date_type_id });
                }}>
                {createMut.isPending || updateMut.isPending ? '...' : (modal === 'create' ? (isRTL ? 'إضافة' : 'Add') : (isRTL ? 'حفظ' : 'Save'))}
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
              <Button className="flex-1 bg-red-500 hover:bg-red-600 text-white" disabled={deleteMut.isPending} onClick={() => deleteMut.mutate(confirmDelete)}>
                {deleteMut.isPending ? '...' : (isRTL ? 'حذف' : 'Delete')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
