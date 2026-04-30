"use client";

import { useState } from 'react';
import { Phone, Search } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/LanguageContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Producer {
  producer_id: string;
  company_name: string;
  manager_name: string | null;
  phone: string | null;
  city: string | null;
}

const LIMIT = 15;

export default function ProducersPage() {
  const { isRTL } = useLanguage();
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [page, setPage] = useState(1);

  const handleSearch = (val: string) => {
    setSearch(val); setPage(1);
    clearTimeout((window as any)._ps);
    (window as any)._ps = setTimeout(() => setDebounced(val), 300);
  };

  const { data, isLoading } = useQuery<{ data: Producer[]; total: number }>({
    queryKey: ['producers-public', debounced, page],
    queryFn: async () => {
      const p = new URLSearchParams({ page: String(page), limit: String(LIMIT) });
      if (debounced) p.set('search', debounced);
      const res = await fetch('/api/producers?' + p);
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    staleTime: 0,
  });

  const producers = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / LIMIT);

  const fmt = (ph: string | null) => {
    if (!ph) return '—';
    const d = ph.replace(/\D/g, '');
    if (d.startsWith('966') && d.length >= 12) return '+966 ' + d.slice(3,5) + ' ' + d.slice(5,8) + ' ' + d.slice(8);
    return '+' + d;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 md:pt-28">
        <section className="py-12 md:py-16 bg-gradient-to-b from-muted to-background relative overflow-hidden">
          <div className="absolute inset-0 arabic-pattern opacity-20" />
          <div className="container mx-auto px-4 relative z-10">
            <h1 className="font-arabic text-3xl md:text-5xl font-bold text-foreground mb-4 text-center">
              {isRTL ? 'بيان بمنتجي ومصدرين التمور' : 'Date Producers and Exporters Directory'}
            </h1>
            <p className="text-lg text-muted-foreground text-center mb-2">{isRTL ? 'بمنطقة القصيم' : 'In Qassim Region'}</p>
            <p className="text-sm text-muted-foreground text-center">
              {isRTL ? 'إجمالي ' + total + ' منشأة مسجلة' : 'Total of ' + total + ' registered establishments'}
            </p>
          </div>
        </section>

        <section className="py-8 md:py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-md mx-auto mb-8">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input type="text" placeholder={isRTL ? 'بحث بالاسم أو رقم الهاتف...' : 'Search by name or phone...'}
                  value={search} onChange={e => handleSearch(e.target.value)} className="pr-10 text-right" dir="rtl" />
              </div>
            </div>

            {isLoading && <div className="text-center py-12 text-muted-foreground">{isRTL ? 'جارٍ التحميل...' : 'Loading...'}</div>}

            {!isLoading && (
              <>
                <div className="bg-card rounded-2xl shadow-card overflow-hidden border border-border">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-secondary hover:bg-secondary">
                        <TableHead className="text-center text-secondary-foreground font-bold w-16">{isRTL ? 'م' : '#'}</TableHead>
                        <TableHead className="text-right text-secondary-foreground font-bold">{isRTL ? 'اسم المنشأة' : 'Company Name'}</TableHead>
                        <TableHead className="text-right text-secondary-foreground font-bold">{isRTL ? 'اسم المسؤول' : 'Manager Name'}</TableHead>
                        <TableHead className="text-center text-secondary-foreground font-bold">{isRTL ? 'رقم التواصل' : 'Contact'}</TableHead>
                        <TableHead className="text-center text-secondary-foreground font-bold w-24">{isRTL ? 'اتصال' : 'Call'}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {producers.length === 0 && (
                        <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">{isRTL ? 'لا توجد نتائج' : 'No results found'}</TableCell></TableRow>
                      )}
                      {producers.map((p, idx) => (
                        <TableRow key={p.producer_id} className="hover:bg-muted/50 transition-colors">
                          <TableCell className="text-center font-medium">{(page - 1) * LIMIT + idx + 1}</TableCell>
                          <TableCell className="text-right font-arabic font-medium">{p.company_name}</TableCell>
                          <TableCell className="text-right text-muted-foreground">{p.manager_name ?? '—'}</TableCell>
                          <TableCell className="text-center text-muted-foreground font-mono text-sm" dir="ltr">{fmt(p.phone)}</TableCell>
                          <TableCell className="text-center">
                            {p.phone && (
                              <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10"
                                onClick={() => { window.location.href = 'tel:+' + p.phone!.replace(/\D/g,''); }}>
                                <Phone className="w-4 h-4" />
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>{isRTL ? 'السابق' : 'Previous'}</Button>
                    <span className="text-sm text-muted-foreground px-2">{page} / {totalPages}</span>
                    <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>{isRTL ? 'التالي' : 'Next'}</Button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
