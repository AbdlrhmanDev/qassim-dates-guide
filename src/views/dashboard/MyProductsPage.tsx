import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StarRating } from '@/components/ui/StarRating';
import { ShoppingBag, Plus, Pencil, Trash2, X, CheckCircle, XCircle, ImagePlus, Loader2 } from 'lucide-react';
import type { DateType } from '@/lib/database.types';

interface TraderProduct {
  id: string;
  trader_id: string;
  date_type_id: string;
  price_per_kg: number;
  stock_kg: number;
  available: boolean;
  notes: string | null;
  image_url: string | null;
  rating: number;
  rating_count: number;
  created_at: string;
  date_types?: { date_type_id: string; name_ar: string; name_en: string; category: string };
}

type FormState = {
  date_type_id: string;
  price_per_kg: string;
  stock_kg: string;
  available: boolean;
  notes: string;
};

const EMPTY_FORM: FormState = { date_type_id: '', price_per_kg: '', stock_kg: '', available: true, notes: '' };

const MyProductsPage: React.FC = () => {
  const { isRTL } = useLanguage();
  const { user } = useAuth();
  const qc = useQueryClient();

  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [editing, setEditing] = useState<TraderProduct | null>(null);
  const [form, setForm] = useState<FormState>({ ...EMPTY_FORM });
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  // Image state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch trader record for this user
  const { data: trader } = useQuery({
    queryKey: ['my-trader', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const res = await fetch(`/api/traders?user_id=${user.id}`);
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !!user?.id,
  });

  const traderId: string | null = trader?.trader_id ?? null;

  // Fetch this trader's products
  const { data: products = [], isLoading } = useQuery<TraderProduct[]>({
    queryKey: ['my-products', traderId],
    queryFn: async () => {
      const res = await fetch(`/api/trader-products?trader_id=${traderId}`);
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    enabled: !!traderId,
  });

  // Fetch all date types for the picker
  const { data: dateTypes = [] } = useQuery<DateType[]>({
    queryKey: ['dates', {}],
    queryFn: async () => { const r = await fetch('/api/dates'); return r.json(); },
  });

  const usedDateTypeIds = new Set(products.map(p => p.date_type_id));

  // Upload image helper
  const uploadImage = async (file: File): Promise<string> => {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('trader_id', traderId ?? 'shared');
    const res = await fetch('/api/upload', { method: 'POST', body: fd });
    if (!res.ok) { const e = await res.json(); throw new Error(e.error ?? 'Upload failed'); }
    const { url } = await res.json();
    return url;
  };

  const createMut = useMutation({
    mutationFn: async (body: FormState) => {
      let image_url: string | null = null;
      if (imageFile) image_url = await uploadImage(imageFile);

      const res = await fetch('/api/trader-products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trader_id: traderId,
          date_type_id: body.date_type_id,
          price_per_kg: Number(body.price_per_kg),
          stock_kg: Number(body.stock_kg) || 0,
          available: body.available,
          notes: body.notes || null,
          image_url,
        }),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error ?? 'Failed'); }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-products', traderId] });
      closeModal();
    },
  });

  const updateMut = useMutation({
    mutationFn: async ({ id, body }: { id: string; body: Partial<FormState> }) => {
      let image_url: string | null = editing?.image_url ?? null;
      if (imageFile) image_url = await uploadImage(imageFile);

      const res = await fetch(`/api/trader-products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          price_per_kg: Number(body.price_per_kg),
          stock_kg: Number(body.stock_kg) || 0,
          available: body.available,
          notes: body.notes || null,
          image_url,
        }),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error ?? 'Failed'); }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-products', traderId] });
      closeModal();
    },
  });

  const deleteMut = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/trader-products/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed');
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['my-products', traderId] }); setConfirmDelete(null); },
  });

  const openEdit = (p: TraderProduct) => {
    setEditing(p);
    setForm({
      date_type_id: p.date_type_id,
      price_per_kg: String(p.price_per_kg),
      stock_kg: String(p.stock_kg),
      available: p.available,
      notes: p.notes ?? '',
    });
    setImageFile(null);
    setImagePreview(p.image_url ?? null);
    setUploadError(null);
    setModal('edit');
  };

  const closeModal = () => {
    setModal(null);
    setEditing(null);
    setForm({ ...EMPTY_FORM });
    setImageFile(null);
    setImagePreview(null);
    setUploadError(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setUploadError(isRTL ? 'يجب أن يكون الملف صورة' : 'File must be an image'); return; }
    if (file.size > 5 * 1024 * 1024) { setUploadError(isRTL ? 'الحجم الأقصى 5 ميغابايت' : 'Max size is 5 MB'); return; }
    setUploadError(null);
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const inp = 'w-full px-3 py-2 text-sm rounded-lg bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary/50';
  const availableDateTypes = dateTypes.filter(d =>
    modal === 'create' ? !usedDateTypeIds.has(d.date_type_id) : true
  );
  const isPending = createMut.isPending || updateMut.isPending || isUploading;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-primary" />
            {isRTL ? 'منتجاتي' : 'My Products'}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {products.length} {isRTL ? 'منتج' : 'products'}
          </p>
        </div>
        <Button
          onClick={() => { setForm({ ...EMPTY_FORM }); setImageFile(null); setImagePreview(null); setUploadError(null); setModal('create'); }}
          disabled={!traderId}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {isRTL ? 'إضافة منتج' : 'Add Product'}
        </Button>
      </div>

      {!traderId && !isLoading && (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            {isRTL ? 'لم يتم العثور على ملف التاجر الخاص بك' : 'Trader profile not found'}
          </CardContent>
        </Card>
      )}

      {/* Products Table */}
      {traderId && (
        <Card>
          <CardContent className="p-0">
            {isLoading && (
              <div className="p-8 text-center text-muted-foreground">
                {isRTL ? 'جارٍ التحميل...' : 'Loading...'}
              </div>
            )}
            {!isLoading && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-border bg-muted/50">
                    <tr>
                      {[
                        isRTL ? 'صورة' : 'Image',
                        isRTL ? 'نوع التمر' : 'Date Type',
                        isRTL ? 'الفئة' : 'Category',
                        isRTL ? 'السعر/كجم' : 'Price/kg',
                        isRTL ? 'المخزون' : 'Stock',
                        isRTL ? 'التقييم' : 'Rating',
                        isRTL ? 'الحالة' : 'Status',
                        isRTL ? 'ملاحظات' : 'Notes',
                        isRTL ? 'إجراءات' : 'Actions',
                      ].map(h => (
                        <th key={h} className="text-start px-4 py-3 font-medium text-muted-foreground">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {products.map(p => (
                      <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3">
                          {p.image_url ? (
                            <img
                              src={p.image_url}
                              alt=""
                              className="w-10 h-10 rounded-lg object-cover border border-border"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                              <ImagePlus className="w-4 h-4 text-muted-foreground" />
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 font-medium">
                          {isRTL ? p.date_types?.name_ar : p.date_types?.name_en}
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 rounded-full text-xs bg-primary/10 text-primary">
                            {p.date_types?.category ?? '—'}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-medium">
                          {p.price_per_kg} {isRTL ? 'ر.س' : 'SAR'}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {p.stock_kg} {isRTL ? 'كجم' : 'kg'}
                        </td>
                        <td className="px-4 py-3">
                          <StarRating
                            value={p.rating ?? 0}
                            count={p.rating_count ?? 0}
                            interactive={false}
                            size="sm"
                          />
                        </td>
                        <td className="px-4 py-3">
                          {p.available ? (
                            <span className="flex items-center gap-1 text-green-600 text-xs font-medium">
                              <CheckCircle className="w-3.5 h-3.5" />
                              {isRTL ? 'متاح' : 'Available'}
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-red-500 text-xs font-medium">
                              <XCircle className="w-3.5 h-3.5" />
                              {isRTL ? 'غير متاح' : 'Unavailable'}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground text-xs max-w-[160px] truncate">
                          {p.notes ?? '—'}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" onClick={() => openEdit(p)}>
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost" size="sm"
                              className="text-red-500 hover:bg-red-50"
                              onClick={() => setConfirmDelete(p.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {products.length === 0 && (
                      <tr>
                        <td colSpan={9} className="px-4 py-8 text-center text-muted-foreground">
                          {isRTL ? 'لا توجد منتجات بعد — أضف منتجك الأول!' : 'No products yet — add your first product!'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Create / Edit Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card rounded-2xl p-6 w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">
                {modal === 'create'
                  ? (isRTL ? 'إضافة منتج جديد' : 'Add New Product')
                  : (isRTL ? 'تعديل المنتج' : 'Edit Product')}
              </h3>
              <button onClick={closeModal}><X className="w-5 h-5" /></button>
            </div>

            <div className="space-y-4">
              {/* Image upload */}
              <div>
                <label className="text-xs text-muted-foreground mb-2 block">
                  {isRTL ? 'صورة المنتج' : 'Product Image'}
                </label>
                <div
                  className="relative w-full h-36 rounded-xl border-2 border-dashed border-border bg-muted/40 flex items-center justify-center cursor-pointer hover:bg-muted/60 transition-colors overflow-hidden"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {imagePreview ? (
                    <>
                      <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white text-xs font-medium">
                          {isRTL ? 'تغيير الصورة' : 'Change image'}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="text-center px-4">
                      <ImagePlus className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground">
                        {isRTL ? 'انقر لرفع صورة (حتى 5 ميغابايت)' : 'Click to upload image (max 5 MB)'}
                      </p>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
                {uploadError && (
                  <p className="text-red-500 text-xs mt-1">{uploadError}</p>
                )}
                {imagePreview && (
                  <button
                    type="button"
                    className="text-xs text-muted-foreground hover:text-red-500 mt-1 flex items-center gap-1 transition-colors"
                    onClick={() => { setImageFile(null); setImagePreview(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                  >
                    <X className="w-3 h-3" />
                    {isRTL ? 'إزالة الصورة' : 'Remove image'}
                  </button>
                )}
              </div>

              {/* Date type */}
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">
                  {isRTL ? 'نوع التمر' : 'Date Type'}
                </label>
                {modal === 'create' ? (
                  <select
                    className={inp}
                    value={form.date_type_id}
                    onChange={e => setForm(f => ({ ...f, date_type_id: e.target.value }))}
                  >
                    <option value="">{isRTL ? 'اختر نوع التمر' : 'Select date type'}</option>
                    {availableDateTypes.map(d => (
                      <option key={d.date_type_id} value={d.date_type_id}>
                        {isRTL ? d.name_ar : d.name_en}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    className={inp + ' opacity-60 cursor-not-allowed'}
                    value={isRTL ? editing?.date_types?.name_ar : editing?.date_types?.name_en}
                    disabled
                  />
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">
                    {isRTL ? 'السعر/كجم (ر.س)' : 'Price/kg (SAR)'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className={inp}
                    value={form.price_per_kg}
                    onChange={e => setForm(f => ({ ...f, price_per_kg: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">
                    {isRTL ? 'المخزون (كجم)' : 'Stock (kg)'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    className={inp}
                    value={form.stock_kg}
                    onChange={e => setForm(f => ({ ...f, stock_kg: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-1 block">
                  {isRTL ? 'ملاحظات' : 'Notes'}
                </label>
                <textarea
                  className={inp}
                  rows={2}
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder={isRTL ? 'وصف إضافي اختياري...' : 'Optional extra description...'}
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  id="available"
                  type="checkbox"
                  checked={form.available}
                  onChange={e => setForm(f => ({ ...f, available: e.target.checked }))}
                  className="w-4 h-4 accent-primary"
                />
                <label htmlFor="available" className="text-sm">
                  {isRTL ? 'متاح للبيع' : 'Available for sale'}
                </label>
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <Button variant="outline" className="flex-1" onClick={closeModal} disabled={isPending}>
                {isRTL ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button
                className="flex-1"
                disabled={
                  (modal === 'create' && !form.date_type_id) ||
                  !form.price_per_kg ||
                  isPending
                }
                onClick={() => {
                  if (modal === 'create') createMut.mutate(form);
                  else if (editing) updateMut.mutate({ id: editing.id, body: form });
                }}
              >
                {isPending
                  ? <><Loader2 className="w-4 h-4 animate-spin me-1" />{isRTL ? 'جارٍ الحفظ...' : 'Saving...'}</>
                  : modal === 'create'
                    ? (isRTL ? 'إضافة' : 'Add')
                    : (isRTL ? 'حفظ' : 'Save')}
              </Button>
            </div>

            {(createMut.isError || updateMut.isError) && (
              <p className="text-red-500 text-xs mt-2 text-center">
                {(createMut.error as Error)?.message || (updateMut.error as Error)?.message}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card rounded-2xl p-6 max-w-sm w-full mx-4 shadow-xl">
            <h3 className="font-bold text-lg mb-2">{isRTL ? 'تأكيد الحذف' : 'Confirm Delete'}</h3>
            <p className="text-muted-foreground text-sm mb-6">
              {isRTL ? 'هل أنت متأكد من حذف هذا المنتج؟' : 'Are you sure you want to delete this product?'}
            </p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setConfirmDelete(null)}>
                {isRTL ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button
                className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                disabled={deleteMut.isPending}
                onClick={() => deleteMut.mutate(confirmDelete)}
              >
                {deleteMut.isPending ? '...' : (isRTL ? 'حذف' : 'Delete')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyProductsPage;
