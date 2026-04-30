import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Package, Truck, CheckCircle, Clock, MapPin, Phone, Eye } from 'lucide-react';

const OrdersPage: React.FC = () => {
  const { isRTL } = useLanguage();

  const orders = [
    {
      id: '1001',
      productAr: 'تمر سكري ممتاز - 2 كجم',
      productEn: 'Premium Sukkary - 2kg',
      date: '2024-01-15',
      status: 'delivered',
      price: '240',
      address: isRTL ? 'الرياض، حي النخيل' : 'Riyadh, Al-Nakheel',
    },
    {
      id: '1002',
      productAr: 'تمر عجوة المدينة - 1 كجم',
      productEn: 'Ajwa Al-Madina - 1kg',
      date: '2024-01-14',
      status: 'shipping',
      price: '180',
      address: isRTL ? 'جدة، حي الروضة' : 'Jeddah, Al-Rawda',
    },
    {
      id: '1003',
      productAr: 'تمر خلاص - 3 كجم',
      productEn: 'Khalas Dates - 3kg',
      date: '2024-01-13',
      status: 'processing',
      price: '285',
      address: isRTL ? 'الدمام، حي الفيصلية' : 'Dammam, Al-Faisaliya',
    },
    {
      id: '1004',
      productAr: 'تمر صقعي - 1.5 كجم',
      productEn: 'Segae Dates - 1.5kg',
      date: '2024-01-10',
      status: 'delivered',
      price: '127',
      address: isRTL ? 'القصيم، بريدة' : 'Qassim, Buraidah',
    },
    {
      id: '1005',
      productAr: 'تمر مجدول - 2 كجم',
      productEn: 'Medjool Dates - 2kg',
      date: '2024-01-08',
      status: 'delivered',
      price: '300',
      address: isRTL ? 'المدينة المنورة' : 'Madinah',
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered': return <CheckCircle className="w-4 h-4" />;
      case 'shipping': return <Truck className="w-4 h-4" />;
      case 'processing': return <Clock className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-500/10 text-green-600';
      case 'shipping': return 'bg-blue-500/10 text-blue-600';
      case 'processing': return 'bg-orange-500/10 text-orange-600';
      default: return 'bg-gray-500/10 text-gray-600';
    }
  };

  const getStatusLabel = (status: string) => {
    if (isRTL) {
      switch (status) {
        case 'delivered': return 'تم التوصيل';
        case 'shipping': return 'قيد الشحن';
        case 'processing': return 'قيد المعالجة';
        default: return status;
      }
    } else {
      switch (status) {
        case 'delivered': return 'Delivered';
        case 'shipping': return 'Shipping';
        case 'processing': return 'Processing';
        default: return status;
      }
    }
  };

  const stats = [
    { labelAr: 'إجمالي الطلبات', labelEn: 'Total Orders', value: orders.length, icon: ShoppingCart, color: 'bg-blue-500/10 text-blue-500' },
    { labelAr: 'تم التوصيل', labelEn: 'Delivered', value: orders.filter(o => o.status === 'delivered').length, icon: CheckCircle, color: 'bg-green-500/10 text-green-500' },
    { labelAr: 'قيد الشحن', labelEn: 'In Transit', value: orders.filter(o => o.status === 'shipping').length, icon: Truck, color: 'bg-primary/10 text-primary' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <ShoppingCart className="w-6 h-6 text-primary" />
          {isRTL ? 'طلباتي' : 'My Orders'}
        </h1>
        <p className="text-muted-foreground mt-1">
          {isRTL ? 'تتبع وإدارة طلباتك' : 'Track and manage your orders'}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Card key={index} className="border-border/50">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`p-3 rounded-xl ${stat.color}`}>
                  <IconComponent className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{isRTL ? stat.labelAr : stat.labelEn}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Orders List */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>{isRTL ? 'سجل الطلبات' : 'Order History'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {orders.map((order) => (
              <div 
                key={order.id} 
                className="p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Package className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium text-foreground">
                        {isRTL ? order.productAr : order.productEn}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {isRTL ? 'رقم الطلب:' : 'Order #'} {order.id}
                      </p>
                    </div>
                  </div>
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                    {getStatusIcon(order.status)}
                    {getStatusLabel(order.status)}
                  </div>
                </div>
                
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {order.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {order.address}
                  </span>
                  <span className="font-medium text-primary">
                    {order.price} {isRTL ? 'ر.س' : 'SAR'}
                  </span>
                </div>

                <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Eye className="w-4 h-4" />
                    {isRTL ? 'تتبع الطلب' : 'Track Order'}
                  </Button>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <Phone className="w-4 h-4" />
                    {isRTL ? 'تواصل معنا' : 'Contact Us'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrdersPage;
