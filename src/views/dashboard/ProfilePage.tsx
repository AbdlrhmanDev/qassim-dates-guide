import React, { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Shield, Store, Save, Lock } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const ROLE_CONFIG = {
  user:   { icon: User,   color: 'bg-blue-500/10 text-blue-600',  label: 'User'   },
  trader: { icon: Store,  color: 'bg-primary/10 text-primary',    label: 'Trader' },
  admin:  { icon: Shield, color: 'bg-red-500/10 text-red-600',    label: 'Admin'  },
};

const ProfilePage: React.FC = () => {
  const { isRTL } = useLanguage();
  const { user } = useAuth();

  const [name, setName]         = useState(user?.name ?? '');
  const [newPass, setNewPass]   = useState('');
  const [confPass, setConfPass] = useState('');
  const [nameMsg, setNameMsg]   = useState('');
  const [passMsg, setPassMsg]   = useState('');

  useEffect(() => { setName(user?.name ?? ''); }, [user]);

  const nameMut = useMutation({
    mutationFn: async () => {
      // Update auth metadata
      const { error: authErr } = await supabase.auth.updateUser({ data: { full_name: name } });
      if (authErr) throw authErr;
      // Update public.users
      if (user?.id) {
        const { error: dbErr } = await supabase.from('users').update({ full_name: name }).eq('user_id', user.id);
        if (dbErr) throw dbErr;
      }
    },
    onSuccess: () => setNameMsg(isRTL ? 'تم تحديث الاسم بنجاح' : 'Name updated successfully'),
    onError:   () => setNameMsg(isRTL ? 'حدث خطأ' : 'Error updating name'),
  });

  const passMut = useMutation({
    mutationFn: async () => {
      if (newPass !== confPass) throw new Error('mismatch');
      if (newPass.length < 6)  throw new Error('short');
      const { error } = await supabase.auth.updateUser({ password: newPass });
      if (error) throw error;
    },
    onSuccess: () => { setPassMsg(isRTL ? 'تم تغيير كلمة المرور بنجاح' : 'Password changed successfully'); setNewPass(''); setConfPass(''); },
    onError: (e: Error) => {
      if (e.message === 'mismatch') setPassMsg(isRTL ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match');
      else if (e.message === 'short') setPassMsg(isRTL ? 'كلمة المرور قصيرة جداً' : 'Password too short');
      else setPassMsg(isRTL ? 'حدث خطأ' : 'Error changing password');
    },
  });

  const role = (user?.role ?? 'user') as keyof typeof ROLE_CONFIG;
  const cfg  = ROLE_CONFIG[role] ?? ROLE_CONFIG.user;
  const RoleIcon = cfg.icon;

  const inp = "w-full px-3 py-2 text-sm rounded-lg bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary/50";

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <User className="w-6 h-6 text-primary" />
        {isRTL ? 'الملف الشخصي' : 'My Profile'}
      </h1>

      {/* Role badge */}
      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl ${cfg.color}`}>
        <RoleIcon className="w-4 h-4" />
        <span className="font-medium text-sm">{user?.role === 'admin' ? (isRTL ? 'مدير النظام' : 'System Admin') : user?.role === 'trader' ? (isRTL ? 'تاجر' : 'Trader') : (isRTL ? 'مستخدم' : 'User')}</span>
      </div>

      {/* Update Name */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-base"><User className="w-4 h-4" />{isRTL ? 'المعلومات الشخصية' : 'Personal Info'}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">{isRTL ? 'الاسم الكامل' : 'Full Name'}</label>
            <input className={inp} value={name} onChange={e => { setName(e.target.value); setNameMsg(''); }} />
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">{isRTL ? 'البريد الإلكتروني' : 'Email'}</label>
            <input className={inp + ' opacity-60 cursor-not-allowed'} value={user?.email ?? ''} disabled />
            <p className="text-xs text-muted-foreground mt-1">{isRTL ? 'لا يمكن تغيير البريد الإلكتروني' : 'Email cannot be changed'}</p>
          </div>
          {nameMsg && <p className={`text-sm ${nameMsg.includes('خطأ') || nameMsg.includes('Error') ? 'text-red-500' : 'text-green-600'}`}>{nameMsg}</p>}
          <Button onClick={() => nameMut.mutate()} disabled={!name.trim() || name === user?.name || nameMut.isPending} className="flex items-center gap-2">
            <Save className="w-4 h-4" />
            {nameMut.isPending ? (isRTL ? 'جارٍ الحفظ...' : 'Saving...') : (isRTL ? 'حفظ التغييرات' : 'Save Changes')}
          </Button>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Lock className="w-4 h-4" />{isRTL ? 'تغيير كلمة المرور' : 'Change Password'}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">{isRTL ? 'كلمة المرور الجديدة' : 'New Password'}</label>
            <input type="password" className={inp} value={newPass} onChange={e => { setNewPass(e.target.value); setPassMsg(''); }} placeholder={isRTL ? 'على الأقل 6 أحرف' : 'At least 6 characters'} />
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">{isRTL ? 'تأكيد كلمة المرور' : 'Confirm Password'}</label>
            <input type="password" className={inp} value={confPass} onChange={e => { setConfPass(e.target.value); setPassMsg(''); }} />
          </div>
          {passMsg && <p className={`text-sm ${passMsg.includes('نجاح') || passMsg.includes('successfully') ? 'text-green-600' : 'text-red-500'}`}>{passMsg}</p>}
          <Button onClick={() => passMut.mutate()} disabled={!newPass || !confPass || passMut.isPending} variant="outline" className="flex items-center gap-2">
            <Lock className="w-4 h-4" />
            {passMut.isPending ? '...' : (isRTL ? 'تغيير كلمة المرور' : 'Change Password')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;
