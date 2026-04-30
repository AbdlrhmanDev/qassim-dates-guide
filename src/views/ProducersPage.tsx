import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Phone, Search } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Producer {
  id: number;
  companyName: string;
  managerName: string;
  phone: string;
}

const ProducersPage = () => {
  const { isRTL } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const producers: Producer[] = [
    { id: 1, companyName: 'مؤسسة هضيم للتمور', managerName: 'عبدالعزيز عبدالله وايل التويجري', phone: '966550877933' },
    { id: 2, companyName: 'مؤسسة نخلات القصيم للتمور', managerName: 'عبد العزيز بن عثمان الدبيخي', phone: '966533370999' },
    { id: 3, companyName: 'شركة مصنع تمور المملكة', managerName: 'صالح عبدالكريم الجمحان', phone: '966501474738' },
    { id: 4, companyName: 'مصنع تمور الضيف', managerName: 'محمد ضيف الله اللحيدان', phone: '966559335556' },
    { id: 5, companyName: 'شركة أطايب التمور للتجارة', managerName: 'بدر الدبيخي', phone: '966500009501' },
    { id: 6, companyName: 'مؤسسة العياف للتمور', managerName: 'عبدالعزيز عبدالرحمن محمد العياف', phone: '966567463666' },
    { id: 7, companyName: 'مؤسسة عاصمة التمور التجارية', managerName: 'احمد محمد صالح الوهيبي', phone: '966504287763' },
    { id: 8, companyName: 'مصنع احمد عبدالله المشرف للتمور', managerName: 'احمد عبدالله المشرف', phone: '966596010999' },
    { id: 9, companyName: 'فهد العوس للتمور', managerName: 'فهد العوس', phone: '966500009993' },
    { id: 10, companyName: 'سليمان العوس للتمور', managerName: 'سليمان العوس', phone: '966500004449' },
    { id: 11, companyName: 'عبدالرحمن السلوم للتمور', managerName: 'عبدالرحمن السلوم', phone: '966555153210' },
    { id: 12, companyName: 'مؤسسة عاصمت النخيل', managerName: 'احمد محمد الوهيبي', phone: '966504287763' },
    { id: 13, companyName: 'مصنع الطاقة الماسة للتمور', managerName: 'عبدالعزيز عبدالرحمن التويجري', phone: '966532320077' },
    { id: 14, companyName: 'مؤسسة عدق الوطن التجارية', managerName: 'عبدالله حمد صالح العرج', phone: '966594044084' },
    { id: 15, companyName: 'شركة منافذ السعودية المحدودة', managerName: 'سالم محمد مقبل الحربي', phone: '966502330222' },
    { id: 16, companyName: 'شركة روضة القصيم للتمور', managerName: 'وليد عبدالله محمد السويد', phone: '966555220064' },
    { id: 17, companyName: 'شركة تمور زادنا', managerName: 'بشار عبدالكريم عطاء الكريع', phone: '966501010007' },
    { id: 18, companyName: 'محل مشرفة للتمور', managerName: 'صالح عبد الله الهذلول', phone: '966503492221' },
    { id: 19, companyName: 'مصنع تمور القصيم', managerName: 'شركة تمور القصيم', phone: '966505450554' },
    { id: 20, companyName: 'مؤسسة تمور الياسريه التجارية', managerName: 'عبدالله صالح الفالح', phone: '966503734543' },
    { id: 21, companyName: 'موسسه قنوان القصيم للتمور', managerName: 'عبد الرحمن عبد الله سليمان العمران', phone: '966565537929' },
    { id: 22, companyName: 'مؤسسة رطب الضيافه للتمور', managerName: 'محمد عبدالرحمن محمد الدخيل', phone: '966554150666' },
    { id: 23, companyName: 'جمعية منتجي التمور التعاونية', managerName: 'طلال عبيد عبدالله بالعبيد', phone: '966560440044' },
    { id: 24, companyName: 'مصنع توفي للحلويات', managerName: 'ياسر محمد عبدالكريم العابد', phone: '966551418888' },
    { id: 25, companyName: 'موسسه نوايع التمور للتمور', managerName: 'يوسف عبدالله ناصر الرسيني', phone: '966504880658' },
    { id: 26, companyName: 'مؤسسة أرض القصيم للتمور', managerName: 'عبدالعزيز ابراهيم علي السحيمان', phone: '966535327000' },
    { id: 27, companyName: 'مؤسسة مدار الامداد للمواد الغذائية', managerName: 'منيرة سليم نجاء المطيري', phone: '966540534272' },
    { id: 28, companyName: 'شركة مدوف التجارية', managerName: 'بدر جارالله صالح البريدي', phone: '966505141234' },
    { id: 29, companyName: 'مصنع الطاقة الماسة للتمور', managerName: 'عبدالعزيز عبدالرحمن عبدالعزيز التويجري', phone: '966532320077' },
    { id: 30, companyName: 'مصنع صنوان النخيل للتمور', managerName: 'عبدالرحمن عبدالله سليمان الحبلين', phone: '966590184417' },
    { id: 31, companyName: 'مؤسسة مذاق التمور التجارية', managerName: 'ثامر فهد ابراهيم العييري', phone: '966536303600' },
    { id: 32, companyName: 'مصنع ثمار النخيلة للتعبئة والتغليف', managerName: 'عمر محمد سليمان العبيدان', phone: '966508040000' },
    { id: 33, companyName: 'محل تمر و حلا للتمور', managerName: 'ابراهيم بن شايع بن ابراهيم الفوزان', phone: '966505171050' },
    { id: 34, companyName: 'محل حنان عبدالعزيز السعد للتمور', managerName: 'حنان عبدالعزيز عبدالرحمن السعد', phone: '966502585495' },
    { id: 35, companyName: 'مؤسسة عمر محمد الحربي التجارية', managerName: 'عمر محمد سعود الحربي', phone: '966532688965' },
    { id: 36, companyName: 'مؤسسة سواعد اسرتي التجارية', managerName: 'عبدالله عبدالكريم عبدالله القباع', phone: '966567777009' },
    { id: 37, companyName: 'مؤسسة عبدالعزيز الرسيني التجارية', managerName: 'عبدالعزيز عبدالله ناصر الرسيني', phone: '966534440594' },
    { id: 38, companyName: 'مؤسسة جني الذهبيه للتجارة', managerName: 'ابراهيم عبدالرحمن عبدالله الجميل', phone: '966505135192' },
    { id: 39, companyName: 'مؤسسة خط الوسطاء للتمور', managerName: 'نايف عبدالعزيز محمد العجلان', phone: '966544739995' },
    { id: 40, companyName: 'مؤسسة رائدة التحميص للتجارة', managerName: 'محمد عبدالعزيز عبدالله التويجري', phone: '966559006114' },
    { id: 41, companyName: 'مصنع الجمعية التعاونية للتمور', managerName: 'احمد مطلق المرود', phone: '966502111586' },
    { id: 42, companyName: 'محل مشرفة للتمور', managerName: 'صالح عبد الله الهذلول', phone: '966503492221' },
    { id: 43, companyName: 'مصنع تمور القصيم', managerName: 'شركة تمور القصيم', phone: '966505450554' },
    { id: 44, companyName: 'مؤسسة تمور الياسريه التجارية', managerName: 'عبدالله صالح الفالح', phone: '966503734543' },
    { id: 45, companyName: 'موسسه قنوان القصيم للتمور', managerName: 'عبد الرحمن عبد الله العمران', phone: '966565537929' },
    { id: 46, companyName: 'مؤسسة رطب الضيافة للتمور', managerName: 'محمد عبدالرحمن الدخيل', phone: '966554150666' },
    { id: 47, companyName: 'جمعية منتجي التمور بالقصيم', managerName: 'طلال عبيد عبدالله بالعبيد', phone: '966560440044' },
    { id: 48, companyName: 'موسسه نوايع التمور للتمور', managerName: 'يوسف عبدالله ناصر الرسيني', phone: '966504880658' },
    { id: 49, companyName: 'مؤسسة أرض القصيم للتمور', managerName: 'عبدالعزيز ابراهيم السحيمان', phone: '966535327000' },
    { id: 50, companyName: 'شركة مدوف التجارية', managerName: 'بدر جارالله صالح البريدي', phone: '966505141234' },
    { id: 51, companyName: 'مؤسسة مذاق التمور الفاخره التجارية', managerName: 'احمد عبدالله محمد الدويش', phone: '966553758889' },
    { id: 52, companyName: 'مؤسسة عبدالرحمن السحيمان التجارية', managerName: 'عبدالرحمن عبدالعزيز السحيمان', phone: '966563420999' },
    { id: 53, companyName: 'مصنع الطاقة الماسة للتمور', managerName: 'عبدالعزيز عبدالرحمن التويجري', phone: '966532320077' },
    { id: 54, companyName: 'مصنع صنوان النخيل للتمور', managerName: 'عبدالرحمن عبدالله الحبلين', phone: '966590184417' },
    { id: 55, companyName: 'مؤسسة العياف للتمور', managerName: 'عبدالعزيز عبدالرحمن العياف', phone: '966567463666' },
    { id: 56, companyName: 'مؤسسة عاصمة التمور التجارية', managerName: 'احمد محمد صالح الوهيبي', phone: '966504287763' },
    { id: 57, companyName: 'مؤسسة مذاق التمور التجارية', managerName: 'ثامر فهد ابراهيم العييري', phone: '966536303600' },
    { id: 58, companyName: 'مصنع ثمار النخيلة للتعبئة والتغليف', managerName: 'عمر محمد سليمان العبيدان', phone: '966508040000' },
    { id: 59, companyName: 'محل تمر و حلا للتمور', managerName: 'ابراهيم بن شايع الفوزان', phone: '966505171050' },
  ];

  // Filter producers based on search
  const filteredProducers = producers.filter(
    (producer) =>
      producer.companyName.includes(searchQuery) ||
      producer.managerName.includes(searchQuery) ||
      producer.phone.includes(searchQuery)
  );

  // Pagination
  const totalPages = Math.ceil(filteredProducers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducers = filteredProducers.slice(startIndex, startIndex + itemsPerPage);

  const handleCall = (phone: string) => {
    window.open(`tel:+${phone}`, '_self');
  };

  const formatPhone = (phone: string) => {
    return `+${phone.slice(0, 3)} ${phone.slice(3, 5)} ${phone.slice(5, 8)} ${phone.slice(8)}`;
  };

  return (
    <>
      <Helmet>
        <title>{isRTL ? 'منتجي ومصدرين التمور | تمور القصيم' : 'Date Producers & Exporters | Qassim Dates'}</title>
        <meta
          name="description"
          content={isRTL
            ? 'بيان بمنتجي ومصدرين التمور بمنطقة القصيم - دليل شامل للتواصل مع أفضل منتجي التمور'
            : 'Directory of date producers and exporters in Qassim region - comprehensive guide to connect with the best date producers'
          }
        />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Navbar />

        <main className="pt-24 md:pt-28">
          {/* Header */}
          <section className="py-12 md:py-16 bg-gradient-to-b from-muted to-background relative overflow-hidden">
            <div className="absolute inset-0 arabic-pattern opacity-20" />
            <div className="container mx-auto px-4 relative z-10">
              <h1 className="font-arabic text-3xl md:text-5xl font-bold text-foreground mb-4 text-center">
                {isRTL ? 'بيان بمنتجي ومصدرين التمور' : 'Date Producers & Exporters Directory'}
              </h1>
              <p className="text-lg text-muted-foreground text-center max-w-2xl mx-auto mb-2">
                {isRTL
                  ? 'بمنطقة القصيم'
                  : 'In Qassim Region'
                }
              </p>
              <p className="text-sm text-muted-foreground text-center">
                {isRTL
                  ? `إجمالي ${filteredProducers.length} منشأة مسجلة`
                  : `Total of ${filteredProducers.length} registered establishments`
                }
              </p>
            </div>
          </section>

          {/* Search & Table */}
          <section className="py-8 md:py-12">
            <div className="container mx-auto px-4">
              {/* Search */}
              <div className="max-w-md mx-auto mb-8">
                <div className="relative">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder={isRTL ? 'بحث بالاسم أو رقم الهاتف...' : 'Search by name or phone...'}
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="pr-10 text-right"
                    dir="rtl"
                  />
                </div>
              </div>

              {/* Table */}
              <div className="bg-card rounded-2xl shadow-card overflow-hidden border border-border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-secondary hover:bg-secondary">
                      <TableHead className="text-center text-secondary-foreground font-bold w-16">
                        {isRTL ? 'م' : '#'}
                      </TableHead>
                      <TableHead className="text-right text-secondary-foreground font-bold">
                        {isRTL ? 'اسم المنشأة' : 'Company Name'}
                      </TableHead>
                      <TableHead className="text-right text-secondary-foreground font-bold">
                        {isRTL ? 'اسم المسؤول' : 'Manager Name'}
                      </TableHead>
                      <TableHead className="text-center text-secondary-foreground font-bold">
                        {isRTL ? 'رقم التواصل' : 'Contact'}
                      </TableHead>
                      <TableHead className="text-center text-secondary-foreground font-bold w-24">
                        {isRTL ? 'اتصال' : 'Call'}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedProducers.map((producer, index) => (
                      <TableRow
                        key={`${producer.id}-${index}`}
                        className="hover:bg-muted/50 transition-colors"
                      >
                        <TableCell className="text-center font-medium text-foreground">
                          {startIndex + index + 1}
                        </TableCell>
                        <TableCell className="text-right font-arabic font-medium text-foreground">
                          {producer.companyName}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {producer.managerName}
                        </TableCell>
                        <TableCell className="text-center text-muted-foreground font-mono text-sm" dir="ltr">
                          {formatPhone(producer.phone)}
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-primary hover:text-primary hover:bg-primary/10"
                            onClick={() => handleCall(producer.phone)}
                          >
                            <Phone className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    {isRTL ? 'السابق' : 'Previous'}
                  </Button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? 'default' : 'outline'}
                        size="sm"
                        className="w-10"
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </Button>
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    {isRTL ? 'التالي' : 'Next'}
                  </Button>
                </div>
              )}
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default ProducersPage;
