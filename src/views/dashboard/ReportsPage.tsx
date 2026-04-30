import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, Calendar, Filter, TrendingUp, Users, ShoppingCart, Package } from 'lucide-react';

const ReportsPage: React.FC = () => {
  const { isRTL } = useLanguage();

  const reports = [
    {
      id: 1,
      titleAr: 'تقرير المبيعات الشهري',
      titleEn: 'Monthly Sales Report',
      descAr: 'ملخص شامل لجميع المبيعات خلال الشهر الحالي',
      descEn: 'Comprehensive summary of all sales for the current month',
      icon: TrendingUp,
      date: '2024-01-15',
      type: 'sales',
      size: '2.4 MB'
    },
    {
      id: 2,
      titleAr: 'تقرير المستخدمين',
      titleEn: 'Users Report',
      descAr: 'إحصائيات تفصيلية عن المستخدمين والتجار',
      descEn: 'Detailed statistics about users and traders',
      icon: Users,
      date: '2024-01-14',
      type: 'users',
      size: '1.8 MB'
    },
    {
      id: 3,
      titleAr: 'تقرير الطلبات',
      titleEn: 'Orders Report',
      descAr: 'تحليل شامل لجميع الطلبات المكتملة والمعلقة',
      descEn: 'Complete analysis of all completed and pending orders',
      icon: ShoppingCart,
      date: '2024-01-13',
      type: 'orders',
      size: '3.1 MB'
    },
    {
      id: 4,
      titleAr: 'تقرير المخزون',
      titleEn: 'Inventory Report',
      descAr: 'حالة المخزون الحالية وتنبيهات النقص',
      descEn: 'Current inventory status and shortage alerts',
      icon: Package,
      date: '2024-01-12',
      type: 'inventory',
      size: '1.2 MB'
    },
  ];

  const scheduledReports = [
    { titleAr: 'تقرير المبيعات الأسبوعي', titleEn: 'Weekly Sales Report', frequencyAr: 'كل أسبوع', frequencyEn: 'Weekly', nextRun: '2024-01-20' },
    { titleAr: 'تقرير الأداء الشهري', titleEn: 'Monthly Performance Report', frequencyAr: 'كل شهر', frequencyEn: 'Monthly', nextRun: '2024-02-01' },
    { titleAr: 'تقرير المخزون اليومي', titleEn: 'Daily Inventory Report', frequencyAr: 'يومياً', frequencyEn: 'Daily', nextRun: '2024-01-16' },
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'sales': return 'bg-green-500/10 text-green-600';
      case 'users': return 'bg-blue-500/10 text-blue-600';
      case 'orders': return 'bg-purple-500/10 text-purple-600';
      case 'inventory': return 'bg-orange-500/10 text-orange-600';
      default: return 'bg-gray-500/10 text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <FileText className="w-6 h-6 text-primary" />
            {isRTL ? 'التقارير' : 'Reports'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isRTL ? 'تحميل وإدارة التقارير' : 'Download and manage reports'}
          </p>
        </div>
        <Button className="gap-2">
          <Filter className="w-4 h-4" />
          {isRTL ? 'إنشاء تقرير مخصص' : 'Create Custom Report'}
        </Button>
      </div>

      {/* Available Reports */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>{isRTL ? 'التقارير المتاحة' : 'Available Reports'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reports.map((report) => {
              const IconComponent = report.icon;
              return (
                <div 
                  key={report.id} 
                  className="flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${getTypeColor(report.type)}`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">
                        {isRTL ? report.titleAr : report.titleEn}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {isRTL ? report.descAr : report.descEn}
                      </p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {report.date}
                        </span>
                        <span>{report.size}</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Download className="w-4 h-4" />
                    {isRTL ? 'تحميل' : 'Download'}
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Scheduled Reports */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            {isRTL ? 'التقارير المجدولة' : 'Scheduled Reports'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-border">
            {scheduledReports.map((report, index) => (
              <div key={index} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-foreground">
                    {isRTL ? report.titleAr : report.titleEn}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {isRTL ? report.frequencyAr : report.frequencyEn} • {isRTL ? 'التالي:' : 'Next:'} {report.nextRun}
                  </p>
                </div>
                <Button variant="ghost" size="sm">
                  {isRTL ? 'تعديل' : 'Edit'}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsPage;
