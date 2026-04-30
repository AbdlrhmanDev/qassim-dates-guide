import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Trash2, Shield, User, Store, Search } from 'lucide-react';
import type { User as AppUserRow } from '@/lib/database.types';

type Role = 'user' | 'admin' | 'trader';

const ROLE_CFG: Record<Role, { icon: typeof User; color: string }> = {
  user:   { icon: User,   color: 'bg-blue-500/10 text-blue-600' },
  trader: { icon: Store,  color: 'bg-primary/10 text-primary'   },
  admin:  { icon: Shield, color: 'bg-red-500/10 text-red-600'   },
};

const UsersPage: React.FC = () => {
  const { isRTL } = useLanguage();
  const { user: me } = useAuth();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const { data: users = [], isLoading, isError } = useQuery<AppUserRow[]>({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const res = await fetch('/api/users');
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    enabled: me?.role === 'admin',
  });

  const roleMut = useMutation({
    mutationFn: async ({ id, role }: { id: string; role: Role }) => {
      const res = await fetch(`/api/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
  });

  const deleteMut = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed');
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-users'] }); setConfirmDelete(null); },
  });

  if (me?.role !== 'admin') {
    return <div className="text-center py-20 text-muted-foreground">{isRTL ? 'للمديرين فقط' : 'Admins only'}</div>;
  }

  const filtered = users.filter(u =>
    u.full_name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Users className="w-6 h-6 text-primary" />
          {isRTL ? 'إدارة المستخدمين' : 'User Management'}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">{users.length} {isRTL ? 'مستخدم' : 'users'}</p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder={isRTL ? 'بحث...' : 'Search...'}
          className="w-full ps-9 pe-4 py-2 text-sm rounded-lg bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading && <div className="p-8 text-center text-muted-foreground">{isRTL ? 'جارٍ التحميل...' : 'Loading...'}</div>}
          {isError   && <div className="p-8 text-center text-red-500">{isRTL ? 'حدث خطأ' : 'Error loading users'}</div>}
          {!isLoading && !isError && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-muted/50">
                  <tr>
                    {[isRTL?'الاسم':'Name', isRTL?'البريد':'Email', isRTL?'الدور':'Role', isRTL?'تاريخ الإنشاء':'Created', isRTL?'إجراءات':'Actions'].map(h => (
                      <th key={h} className="text-start px-4 py-3 font-medium text-muted-foreground">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map(u => {
                    const isMe = u.user_id === me?.id;
                    const cfg = ROLE_CFG[u.role] ?? ROLE_CFG.user;
                    return (
                      <tr key={u.user_id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 font-medium">{u.full_name}</td>
                        <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                        <td className="px-4 py-3">
                          <select
                            value={u.role}
                            disabled={isMe || roleMut.isPending}
                            onChange={e => roleMut.mutate({ id: u.user_id, role: e.target.value as Role })}
                            className={`px-2 py-1 rounded-lg text-xs font-medium border-0 cursor-pointer ${cfg.color}`}
                          >
                            <option value="user">User</option>
                            <option value="trader">Trader</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</td>
                        <td className="px-4 py-3">
                          {!isMe && (
                            <Button variant="ghost" size="sm"
                              className="text-red-500 hover:text-red-600 hover:bg-red-50"
                              onClick={() => setConfirmDelete(u.user_id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                      {isRTL ? 'لا يوجد مستخدمون' : 'No users found'}
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card rounded-2xl p-6 max-w-sm w-full mx-4 shadow-xl">
            <h3 className="font-bold text-lg mb-2">{isRTL ? 'تأكيد الحذف' : 'Confirm Delete'}</h3>
            <p className="text-muted-foreground text-sm mb-6">{isRTL ? 'هل أنت متأكد؟ لا يمكن التراجع.' : 'Are you sure? This cannot be undone.'}</p>
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

export default UsersPage;
