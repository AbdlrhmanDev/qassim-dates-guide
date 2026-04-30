import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Factory, Plus, Pencil, Trash2, X, Search, Phone } from 'lucide-react';

interface Producer {
  producer_id: string;
  company_name: string;
  manager_name: string | null;
  phone: string | null;
  city: string | null;
  email: string | null;
  website: string | null;
  notes: string | null;
}

type ProducerForm = Omit<Producer, 'producer_id'>;

const EMPTY: ProducerForm = {
  company_name: '', manager_name: '', phone: '',
  city: '', email: '', website: '', notes: '',
};

const inp = 'w-full px-3 py-2 text-sm rounded-lg bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary/50';

const ProducersAdminPage: React.FC = () => {
  const { isRTL } = useLanguage();
  const qc = useQueryClient();

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const limit = 20;

  const [modal, setModal] = useState<'add' | 'edit' | null>(null);
  const [editing, setEditing] = useState<Producer | null>(null);
  const [form, setForm] = useState<ProducerForm>({ ...EMPTY });
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const queryKey = ['admin-producers', search, page];

  const { data, isLoading, isError } = useQuery<{ data: Producer[]; total: number }>({
    queryKey,
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (search) params.set('search', search);
      const res = await fetch(`/api/producers?${params}`);
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    staleTime: 0,
  });

  const producers = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / limit);

  const createMut = useMutation({
    mutationFn: async (body: ProducerForm) => {
      const res = await fetch('/api/producers', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-producers'] }); closeModal(); },
  });

  const updateMut = useMutation({
    mutationFn: async ({ id, body }: { id: string; body: ProducerForm }) => {
      const res = await fetch(`/api/producers/${id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-producers'] }); closeModal(); },
  });

  const deleteMut = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/producers/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed');
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-producers'] }); setConfirmDelete(null); },
  });

  const openAdd = () => { setForm({ ...EMPTY }); setEditing(null); setModal('add'); };
  const openEdit = (p: Producer) => {
    setEditing(p);
    setForm({
      company_name: p.company_name,
      manager_name: p.manager_name ?? '',
      phone: p.phone ?? '',
      city: p.city ?? '',
      email: p.email ?? '',
      website: p.website ?? '',
      notes: p.notes ?? '',
    });
    setModal('edit');
  };
  const closeModal = () => { setModal(null); setEditing(null); setForm({ ...EMPTY }); };

  const handleSubmit = () => {
    const payload = {
      company_name: form.company_name.trim(),
      manager_name: form.manager_name?.trim() || null,
      phone:        form.phone?.trim() || null,
      city:         form.city?.trim() || null,
      email:        form.email?.trim() || null,
      website:      form.website?.trim() || null,
      notes:        form.notes?.trim() || null,
    };
    if (modal === 'edit' && editing) {
      updateMut.mutate({ id: editing.producer_id, body: payload });
    } else {
      createMut.mutate(payload);
    }
  };

  const isPending = createMut.isPending || updateMut.isPending;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Factory className="w-6 h-6 text-primary" />
            {isRTL ? 'دليل المنتجين والمصدّرين' : 'Producers & Exporters Directory'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {total} {isRTL ? 'منتج / مصدّر' : 'producers / exporters'}
          </p>
        </div>
        <Button onClick={openAdd} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          {isRTL ? 'إضافة منتج' : 'Add Producer'}
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          placeholder={isRTL ? 'بحث بالاسم أو المدير أو الهاتف...' : 'Search by name, manager, or phone...'}
          className="w-full ps-9 pe-4 py-2 text-sm rounded-lg bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading && (
            <div className="p-8 text-center text-muted-foreground">{isRTL ? 'جارٍ التحميل...' : 'Loading...'}</div>
          )}
          {isError && (
            <div className="p-8 text-center text-red-500">{isRTL ? 'حدث خطأ' : 'Error loading data'}</div>
          )}
          {!isLoading && !isError && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-muted/50">
                  <tr>
                    {['#',
                      isRTL ? 'اسم المنشأة' : 'Company',
                      isRTL ? 'مدير المنشأة' : 'Manager',
                      isRTL ? 'الهاتف' : 'Phone',
                      isRTL ? 'المدينة' : 'City',
                      isRTL ? 'إجراءات' : 'Actions',
                    ].map(h => (
                      <th key={h} className="text-start px-4 py-3 font-medium text-muted-foreground whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {producers.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                        {isRTL ? 'لا توجد نتائج' : 'No results'}
                      </td>
                    </tr>
                  )}
                  {producers.map((p, idx) => (
                    <tr key={p.producer_id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 text-muted-foreground text-xs">{(page - 1) * limit + idx + 1}</td>
                      <td className="px-4 py-3 font-medium">{p.company_name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{p.manager_name ?? '—'}</td>
                      <td className="px-4 py-3">
                        {p.phone ? (
                          <a href={`tel:+${p.phone}`} className="flex items-center gap-1 text-primary hover:underline">
                            <Phone className="w-3 h-3" />{p.phone}
                          </a>
                        ) : '—'}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{p.city ?? '—'}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => openEdit(p)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-50"
                            onClick={() => setConfirmDelete(p.producer_id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{isRTL ? `صفحة ${page} من ${totalPages}` : `Page ${page} of ${totalPages}`}</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
              {isRTL ? 'السابق' : 'Previous'}
            </Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
              {isRTL ? 'التالي' : 'Next'}
            </Button>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card rounded-2xl p-6 w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">
                {modal === 'edit'
                  ? (isRTL ? 'تعديل البيانات' : 'Edit Producer')
                  : (isRTL ? 'إضافة منتج / مصدّر' : 'Add Producer / Exporter')}
              </h3>
              <button onClick={closeModal}><X className="w-5 h-5" /></button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">
                  {isRTL ? 'اسم المنشأة *' : 'Company Name *'}
                </label>
                <input dir="rtl" className={inp} value={form.company_name}
                  onChange={e => setForm(f => ({ ...f, company_name: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">
                    {isRTL ? 'مدير المنشأة' : 'Manager Name'}
                  </label>
                  <input dir="rtl" className={inp} value={form.manager_name ?? ''}
                    onChange={e => setForm(f => ({ ...f, manager_name: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">
                    {isRTL ? 'رقم الهاتف' : 'Phone'}
                  </label>
                  <input className={inp} value={form.phone ?? ''} dir="ltr"
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">
                    {isRTL ? 'المدينة' : 'City'}
                  </label>
                  <input className={inp} value={form.city ?? ''}
                    onChange={e => setForm(f => ({ ...f, city: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">
                    {isRTL ? 'البريد الإلكتروني' : 'Email'}
                  </label>
                  <input className={inp} value={form.email ?? ''} dir="ltr" type="email"
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">
                  {isRTL ? 'الموقع الإلكتروني' : 'Website'}
                </label>
                <input className={inp} value={form.website ?? ''} dir="ltr"
                  onChange={e => setForm(f => ({ ...f, website: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">
                  {isRTL ? 'ملاحظات' : 'Notes'}
                </label>
                <textarea rows={2} className={inp} value={form.notes ?? ''}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <Button variant="outline" className="flex-1" onClick={closeModal}>
                {isRTL ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button className="flex-1" disabled={!form.company_name.trim() || isPending} onClick={handleSubmit}>
                {isPending ? '...' : modal === 'edit' ? (isRTL ? 'حفظ' : 'Save') : (isRTL ? 'إضافة' : 'Add')}
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
            <p className="text-muted-foreground text-sm mb-6">
              {isRTL ? 'هل أنت متأكد من حذف هذا المنتج/المصدّر؟' : 'Are you sure you want to delete this entry?'}
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

export default ProducersAdminPage;
