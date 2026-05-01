import { authFetch } from '@/lib/api-client';
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Plus, Pencil, Trash2, X } from 'lucide-react';

interface Exhibition {
  exhibition_id: string;
  name_ar: string;
  name_en: string;
  city: string;
  place: string | null;
  start_date: string | null;
  end_date: string | null;
  time_info: string | null;
  description_ar: string | null;
  description_en: string | null;
  status: 'upcoming' | 'active' | 'ended';
}

type ExhibitionForm = Omit<Exhibition, 'exhibition_id'>;

const EMPTY_FORM: ExhibitionForm = {
  name_ar: '',
  name_en: '',
  city: '',
  place: '',
  start_date: '',
  end_date: '',
  time_info: '',
  description_ar: '',
  description_en: '',
  status: 'upcoming',
};

const STATUS_COLOR: Record<string, string> = {
  active:   'bg-green-500/10 text-green-600',
  upcoming: 'bg-primary/10 text-primary',
  ended:    'bg-muted text-muted-foreground',
};

const inp = 'w-full px-3 py-2 text-sm rounded-lg bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary/50';

const ExhibitionsAdminPage: React.FC = () => {
  const { isRTL } = useLanguage();
  const qc = useQueryClient();

  const [modal, setModal] = useState<'add' | 'edit' | null>(null);
  const [editing, setEditing] = useState<Exhibition | null>(null);
  const [form, setForm] = useState<ExhibitionForm>(EMPTY_FORM);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const { data: exhibitions = [], isLoading } = useQuery<Exhibition[]>({
    queryKey: ['exhibitions-admin'],
    queryFn: async () => {
      const res = await authFetch('/api/exhibitions');
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
  });

  const createMut = useMutation({
    mutationFn: async (body: ExhibitionForm) => {
      const res = await authFetch('/api/exhibitions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['exhibitions-admin'] });
      qc.invalidateQueries({ queryKey: ['exhibitions'] });
      closeModal();
    },
  });

  const updateMut = useMutation({
    mutationFn: async ({ id, body }: { id: string; body: ExhibitionForm }) => {
      const res = await fetch(`/api/exhibitions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['exhibitions-admin'] });
      qc.invalidateQueries({ queryKey: ['exhibitions'] });
      closeModal();
    },
  });

  const deleteMut = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/exhibitions/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed');
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['exhibitions-admin'] });
      qc.invalidateQueries({ queryKey: ['exhibitions'] });
      setConfirmDelete(null);
    },
  });

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setEditing(null);
    setModal('add');
  };

  const openEdit = (ex: Exhibition) => {
    setEditing(ex);
    setForm({
      name_ar: ex.name_ar,
      name_en: ex.name_en,
      city: ex.city,
      place: ex.place ?? '',
      start_date: ex.start_date ?? '',
      end_date: ex.end_date ?? '',
      time_info: ex.time_info ?? '',
      description_ar: ex.description_ar ?? '',
      description_en: ex.description_en ?? '',
      status: ex.status,
    });
    setModal('edit');
  };

  const closeModal = () => {
    setModal(null);
    setEditing(null);
    setForm(EMPTY_FORM);
  };

  const handleSubmit = () => {
    const payload: ExhibitionForm = {
      ...form,
      place: form.place || null,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      time_info: form.time_info || null,
      description_ar: form.description_ar || null,
      description_en: form.description_en || null,
    };
    if (modal === 'edit' && editing) {
      updateMut.mutate({ id: editing.exhibition_id, body: payload });
    } else {
      createMut.mutate(payload);
    }
  };

  const isPending = createMut.isPending || updateMut.isPending;
  const canSubmit = form.name_ar.trim() && form.name_en.trim() && form.city.trim();

  const statusLabel = (s: string) =>
    s === 'active' ? (isRTL ? 'جارٍ الآن' : 'Active') :
    s === 'ended'  ? (isRTL ? 'انتهى' : 'Ended') :
                     (isRTL ? 'قادم' : 'Upcoming');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="w-6 h-6 text-primary" />
            {isRTL ? 'المعارض والفعاليات' : 'Exhibitions & Events'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {exhibitions.length} {isRTL ? 'فعالية' : 'events'}
          </p>
        </div>
        <Button onClick={openAdd} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          {isRTL ? 'إضافة فعالية' : 'Add Exhibition'}
        </Button>
      </div>

      {/* List */}
      <Card>
        <CardContent className="p-0">
          {isLoading && (
            <div className="p-8 text-center text-muted-foreground">
              {isRTL ? 'جارٍ التحميل...' : 'Loading...'}
            </div>
          )}
          {!isLoading && (
            <div className="divide-y divide-border">
              {exhibitions.length === 0 && (
                <div className="p-8 text-center text-muted-foreground">
                  {isRTL ? 'لا توجد فعاليات' : 'No exhibitions yet'}
                </div>
              )}
              {exhibitions.map(ex => (
                <div key={ex.exhibition_id} className="flex items-start gap-4 p-4 hover:bg-muted/30 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLOR[ex.status]}`}>
                        {statusLabel(ex.status)}
                      </span>
                    </div>
                    <p className="font-semibold truncate">{isRTL ? ex.name_ar : ex.name_en}</p>
                    <div className="flex flex-wrap gap-3 mt-1 text-xs text-muted-foreground">
                      {ex.city && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {ex.city}{ex.place ? ` - ${ex.place}` : ''}
                        </span>
                      )}
                      {ex.start_date && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {ex.start_date}{ex.end_date ? ` → ${ex.end_date}` : ''}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(ex)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-50"
                      onClick={() => setConfirmDelete(ex.exhibition_id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add / Edit Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card rounded-2xl p-6 w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">
                {modal === 'edit'
                  ? (isRTL ? 'تعديل الفعالية' : 'Edit Exhibition')
                  : (isRTL ? 'إضافة فعالية جديدة' : 'Add New Exhibition')}
              </h3>
              <button onClick={closeModal}><X className="w-5 h-5" /></button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">
                    {isRTL ? 'الاسم بالعربية *' : 'Name (Arabic) *'}
                  </label>
                  <input dir="rtl" className={inp} value={form.name_ar}
                    onChange={e => setForm(f => ({ ...f, name_ar: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">
                    {isRTL ? 'الاسم بالإنجليزية *' : 'Name (English) *'}
                  </label>
                  <input className={inp} value={form.name_en}
                    onChange={e => setForm(f => ({ ...f, name_en: e.target.value }))} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">
                    {isRTL ? 'المدينة *' : 'City *'}
                  </label>
                  <input className={inp} value={form.city}
                    onChange={e => setForm(f => ({ ...f, city: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">
                    {isRTL ? 'المكان' : 'Place'}
                  </label>
                  <input className={inp} value={form.place ?? ''}
                    onChange={e => setForm(f => ({ ...f, place: e.target.value }))} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">
                    {isRTL ? 'تاريخ البداية' : 'Start Date'}
                  </label>
                  <input type="date" className={inp} value={form.start_date ?? ''}
                    onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">
                    {isRTL ? 'تاريخ النهاية' : 'End Date'}
                  </label>
                  <input type="date" className={inp} value={form.end_date ?? ''}
                    onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">
                    {isRTL ? 'أوقات الدوام' : 'Time Info'}
                  </label>
                  <input className={inp} value={form.time_info ?? ''}
                    onChange={e => setForm(f => ({ ...f, time_info: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">
                    {isRTL ? 'الحالة' : 'Status'}
                  </label>
                  <select className={inp} value={form.status}
                    onChange={e => setForm(f => ({ ...f, status: e.target.value as Exhibition['status'] }))}>
                    <option value="upcoming">{isRTL ? 'قادم' : 'Upcoming'}</option>
                    <option value="active">{isRTL ? 'جارٍ الآن' : 'Active'}</option>
                    <option value="ended">{isRTL ? 'انتهى' : 'Ended'}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-1 block">
                  {isRTL ? 'الوصف بالعربية' : 'Description (Arabic)'}
                </label>
                <textarea dir="rtl" rows={2} className={inp} value={form.description_ar ?? ''}
                  onChange={e => setForm(f => ({ ...f, description_ar: e.target.value }))} />
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-1 block">
                  {isRTL ? 'الوصف بالإنجليزية' : 'Description (English)'}
                </label>
                <textarea rows={2} className={inp} value={form.description_en ?? ''}
                  onChange={e => setForm(f => ({ ...f, description_en: e.target.value }))} />
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <Button variant="outline" className="flex-1" onClick={closeModal}>
                {isRTL ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button className="flex-1" disabled={!canSubmit || isPending} onClick={handleSubmit}>
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
              {isRTL ? 'هل أنت متأكد من حذف هذه الفعالية؟' : 'Are you sure you want to delete this exhibition?'}
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

export default ExhibitionsAdminPage;
