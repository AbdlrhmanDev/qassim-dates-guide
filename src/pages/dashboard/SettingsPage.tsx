import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Settings, Bell, Lock, Globe, Moon, Sun, Save, User } from 'lucide-react';

const SettingsPage: React.FC = () => {
  const { isRTL } = useLanguage();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Settings className="w-6 h-6 text-primary" />
          {isRTL ? 'الإعدادات' : 'Settings'}
        </h1>
        <p className="text-muted-foreground mt-1">
          {isRTL ? 'إدارة إعدادات حسابك' : 'Manage your account settings'}
        </p>
      </div>

      {/* Profile Settings */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            {isRTL ? 'معلومات الحساب' : 'Account Information'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{isRTL ? 'الاسم' : 'Name'}</Label>
              <Input defaultValue={user?.name} />
            </div>
            <div className="space-y-2">
              <Label>{isRTL ? 'البريد الإلكتروني' : 'Email'}</Label>
              <Input defaultValue={user?.email} type="email" />
            </div>
            <div className="space-y-2">
              <Label>{isRTL ? 'رقم الهاتف' : 'Phone Number'}</Label>
              <Input defaultValue="0501234567" />
            </div>
            <div className="space-y-2">
              <Label>{isRTL ? 'اللغة' : 'Language'}</Label>
              <Input defaultValue={isRTL ? 'العربية' : 'English'} disabled />
            </div>
          </div>
          <Button className="gap-2">
            <Save className="w-4 h-4" />
            {isRTL ? 'حفظ التغييرات' : 'Save Changes'}
          </Button>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            {isRTL ? 'إعدادات الإشعارات' : 'Notification Settings'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
            <div>
              <p className="font-medium">{isRTL ? 'إشعارات التطبيق' : 'Push Notifications'}</p>
              <p className="text-sm text-muted-foreground">
                {isRTL ? 'استلام إشعارات فورية' : 'Receive instant notifications'}
              </p>
            </div>
            <Switch checked={notifications} onCheckedChange={setNotifications} />
          </div>
          <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
            <div>
              <p className="font-medium">{isRTL ? 'إشعارات البريد' : 'Email Notifications'}</p>
              <p className="text-sm text-muted-foreground">
                {isRTL ? 'استلام تحديثات عبر البريد' : 'Receive updates via email'}
              </p>
            </div>
            <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-primary" />
            {isRTL ? 'الأمان' : 'Security'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{isRTL ? 'كلمة المرور الحالية' : 'Current Password'}</Label>
            <Input type="password" placeholder="••••••••" />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{isRTL ? 'كلمة المرور الجديدة' : 'New Password'}</Label>
              <Input type="password" placeholder="••••••••" />
            </div>
            <div className="space-y-2">
              <Label>{isRTL ? 'تأكيد كلمة المرور' : 'Confirm Password'}</Label>
              <Input type="password" placeholder="••••••••" />
            </div>
          </div>
          <Button variant="outline" className="gap-2">
            <Lock className="w-4 h-4" />
            {isRTL ? 'تغيير كلمة المرور' : 'Change Password'}
          </Button>
        </CardContent>
      </Card>

      {/* Appearance Settings */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            {isRTL ? 'المظهر' : 'Appearance'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
            <div className="flex items-center gap-3">
              {darkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              <div>
                <p className="font-medium">{isRTL ? 'الوضع الليلي' : 'Dark Mode'}</p>
                <p className="text-sm text-muted-foreground">
                  {isRTL ? 'تبديل مظهر التطبيق' : 'Toggle app appearance'}
                </p>
              </div>
            </div>
            <Switch checked={darkMode} onCheckedChange={setDarkMode} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage;
