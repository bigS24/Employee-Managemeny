import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Calendar, TrendingUp, Archive, CheckCircle, AlertCircle } from 'lucide-react';
import { ProfessionalTable, createActionButtons } from './ProfessionalTable';
import { currencyService, ExchangeRate, useCurrency } from './CurrencyService';
import { toast } from 'sonner@2.0.3';

export function ExchangeRatesManager() {
  const [rates, setRates] = useState<ExchangeRate[]>([]);
  const [activeRate, setActiveRate] = useState<ExchangeRate | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { refreshActiveRate } = useCurrency();
  
  // Form state
  const [formData, setFormData] = useState({
    rate: '',
    effectiveFrom: '',
    note: ''
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setRates(currencyService.getAllRates());
    setActiveRate(currencyService.getActiveRate());
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.rate || parseFloat(formData.rate) <= 0) {
      errors.rate = 'يجب إدخال سعر صرف صحيح أكبر من الصفر';
    }
    
    if (!formData.effectiveFrom) {
      errors.effectiveFrom = 'يجب تحديد تاريخ بداية السريان';
    } else {
      const selectedDate = new Date(formData.effectiveFrom);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        errors.effectiveFrom = 'تاريخ بداية السريان يجب أن يكون اليوم أو في المستقبل';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveRate = () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      currencyService.setActiveRate(
        parseFloat(formData.rate),
        formData.effectiveFrom,
        formData.note || undefined
      );
      
      loadData();
      refreshActiveRate();
      
      // Reset form
      setFormData({ rate: '', effectiveFrom: '', note: '' });
      setFormErrors({});
      
      toast.success('تم حفظ سعر الصرف الجديد بنجاح');
    } catch (error) {
      toast.error('حدث خطأ في حفظ سعر الصرف');
    } finally {
      setIsLoading(false);
    }
  };

  const handleActivateRate = (rateId: number) => {
    const rateToActivate = rates.find(r => r.id === rateId);
    if (!rateToActivate) return;
    
    try {
      currencyService.setActiveRate(
        rateToActivate.rate,
        rateToActivate.effective_from,
        rateToActivate.note
      );
      
      loadData();
      refreshActiveRate();
      
      toast.success('تم تفعيل سعر الصرف بنجاح');
    } catch (error) {
      toast.error('حدث خطأ في تفعيل سعر الصرف');
    }
  };

  const handleArchiveRate = (rateId: number) => {
    try {
      currencyService.archiveRate(rateId);
      loadData();
      refreshActiveRate();
      
      toast.success('تم أرشفة سعر الصرف');
    } catch (error) {
      toast.error('حدث خطأ في أرشفة سعر الصرف');
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">إدارة أسعار الصرف</h1>
        {activeRate && (
          <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
            <TrendingUp className="w-4 h-4 ml-1" />
            السعر النشط: {activeRate.rate.toFixed(2)} TRY/USD
          </Badge>
        )}
      </div>

      {/* Active Rate Info */}
      {activeRate && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-green-800">
              <CheckCircle className="w-5 h-5" />
              سعر الصرف النشط
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-600">السعر:</span>
                <span className="font-semibold text-green-800 mr-2">
                  {activeRate.rate.toFixed(2)} ليرة تركية / دولار أمريكي
                </span>
              </div>
              <div>
                <span className="text-gray-600">ساري من:</span>
                <span className="font-medium mr-2">
                  {new Date(activeRate.effective_from).toLocaleDateString('ar-SA')}
                </span>
              </div>
              <div>
                <span className="text-gray-600">أُنشئ بواسطة:</span>
                <span className="font-medium mr-2">{activeRate.created_by || 'غير محدد'}</span>
              </div>
            </div>
            {activeRate.note && (
              <div className="mt-3 p-3 bg-white rounded-lg border border-green-200">
                <span className="text-gray-600 text-sm">ملاحظات:</span>
                <p className="text-sm text-gray-800 mt-1">{activeRate.note}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Rate Editor */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            إضافة سعر صرف جديد
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label>سعر الدولار إلى الليرة (USD → TRY) *</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={formData.rate}
                onChange={(e) => handleInputChange('rate', e.target.value)}
                placeholder="36.50"
                className={formErrors.rate ? 'border-red-500' : ''}
              />
              {formErrors.rate && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {formErrors.rate}
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label>تاريخ بداية السريان *</Label>
              <Input
                type="date"
                value={formData.effectiveFrom}
                onChange={(e) => handleInputChange('effectiveFrom', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className={formErrors.effectiveFrom ? 'border-red-500' : ''}
              />
              {formErrors.effectiveFrom && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {formErrors.effectiveFrom}
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label>ملاحظات (اختياري)</Label>
              <Textarea
                value={formData.note}
                onChange={(e) => handleInputChange('note', e.target.value)}
                placeholder="سبب التحديث أو ملاحظات إضافية..."
                className="h-24"
                maxLength={500}
              />
              <p className="text-xs text-gray-500">
                {formData.note.length}/500 حرف
              </p>
            </div>
          </div>
          
          <div className="flex justify-end gap-4 mt-6">
            <Button
              onClick={() => {
                setFormData({ rate: '', effectiveFrom: '', note: '' });
                setFormErrors({});
              }}
              variant="outline"
              disabled={isLoading}
            >
              إعادة تعيين
            </Button>
            <Button
              onClick={handleSaveRate}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? 'جاري الحفظ...' : 'حفظ السعر'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Info Panel */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-blue-900 mb-2">معلومات مهمة حول أسعار الصرف</h3>
              <div className="text-sm text-blue-800 space-y-1">
                <p>• جميع الرواتب محفوظة بالدولار الأمريكي كعملة أساسية</p>
                <p>• عند حفظ راتب جديد، يتم حفظ سعر الصرف المستخدم مع السجل</p>
                <p>• يمكن عرض الرواتب بالليرة التركية باستخدام مفتاح التبديل</p>
                <p>• السجلات المحفوظة سابقاً تستخدم سعر الصرف المحفوظ معها</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rates History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Archive className="w-5 h-5" />
            تاريخ أسعار الصرف
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ProfessionalTable
            columns={[
              { 
                key: 'rate', 
                label: 'السعر (TRY/USD)', 
                width: '150px',
                render: (value) => (
                  <span className="font-semibold text-blue-600">
                    {value.toFixed(2)}
                  </span>
                )
              },
              { 
                key: 'effective_from', 
                label: 'ساري من تاريخ', 
                width: '130px',
                render: (value) => new Date(value).toLocaleDateString('ar-SA')
              },
              { 
                key: 'created_at', 
                label: 'تاريخ الإنشاء', 
                width: '130px',
                render: (value) => new Date(value).toLocaleDateString('ar-SA')
              },
              { 
                key: 'created_by', 
                label: 'أُنشئ بواسطة', 
                width: '120px',
                render: (value) => value || 'غير محدد'
              },
              { 
                key: 'note', 
                label: 'ملاحظات', 
                width: '200px',
                render: (value) => (
                  <span className="text-sm text-gray-600">
                    {value ? (value.length > 50 ? value.substring(0, 50) + '...' : value) : '-'}
                  </span>
                )
              },
              { 
                key: 'is_active', 
                label: 'الحالة', 
                width: '100px',
                render: (value) => (
                  <Badge variant={value ? 'default' : 'secondary'}>
                    {value ? 'نشط' : 'أرشيف'}
                  </Badge>
                )
              },
              { 
                key: 'actions', 
                label: 'الإجراءات', 
                width: '120px', 
                align: 'center',
                render: (_, row) => createActionButtons([
                  ...(!row.is_active ? [{
                    icon: <CheckCircle className="w-4 h-4" />,
                    onClick: () => handleActivateRate(row.id),
                    title: 'تعيين كنشط',
                    variant: 'success' as const
                  }] : []),
                  ...(row.is_active ? [{
                    icon: <Archive className="w-4 h-4" />,
                    onClick: () => handleArchiveRate(row.id),
                    title: 'أرشفة',
                    variant: 'warning' as const
                  }] : [])
                ])
              }
            ]}
            data={rates}
            emptyMessage="لا توجد أسعار صرف محفوظة"
          />
        </CardContent>
      </Card>
    </div>
  );
}