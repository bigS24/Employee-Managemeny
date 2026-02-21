import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Calculator, Download, Eye, Plus, Settings } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from './ui/dialog';
import { ProfessionalTable, createActionButtons } from './ProfessionalTable';
import { CurrencyToggle } from './CurrencyToggle';
import { DualCurrencyDisplay } from './DualCurrencyDisplay';
import { useCurrency, formatUSD } from './CurrencyService';

const salaryCategories = [
  { id: 1, name: 'الدرجة الأولى', minSalary: 4110, adminLevel: 1370, qualificationAllowance: 548, experienceAllowance: 82 },
  { id: 2, name: 'الدرجة الثانية', minSalary: 3288, adminLevel: 822, qualificationAllowance: 411, experienceAllowance: 68 },
  { id: 3, name: 'الدرجة الثالثة', minSalary: 2740, adminLevel: 548, qualificationAllowance: 274, experienceAllowance: 55 },
  { id: 4, name: 'الدرجة الرابعة', minSalary: 2192, adminLevel: 411, qualificationAllowance: 219, experienceAllowance: 41 },
];

const mockSalaries = [
  {
    id: 1,
    employeeNumber: 'EMP001',
    employeeName: 'أحمد محمد علي',
    category: 'الدرجة الأولى',
    experienceYears: 5,
    additionalAmount: 274,
    advances: 137,
    loans: 0,
    deductions: 55,
    grossSalary: 6438,
    netSalary: 6246,
    month: '2024-09',
    rateUsed: 36.50,
    effectiveDate: '2024-09-24'
  },
  {
    id: 2,
    employeeNumber: 'EMP002',
    employeeName: 'فاطمة أحمد السالم',
    category: 'الدرجة الثانية',
    experienceYears: 3,
    additionalAmount: 137,
    advances: 82,
    loans: 274,
    deductions: 27,
    grossSalary: 4932,
    netSalary: 4549,
    month: '2024-09',
    rateUsed: 36.50,
    effectiveDate: '2024-09-24'
  }
];

export function SalariesPage() {
  const [salaries, setSalaries] = useState(mockSalaries);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isExchangeRatesOpen, setIsExchangeRatesOpen] = useState(false);
  const { activeRate } = useCurrency();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-semibold text-gray-900">إدارة الرواتب</h1>
          <CurrencyToggle size="sm" />
        </div>
        <div className="flex space-x-reverse space-x-4">
          <Dialog open={isCalculatorOpen} onOpenChange={setIsCalculatorOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <Calculator className="w-4 h-4 ml-2" />
                حاسبة الراتب
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>حاسبة الراتب المتقدمة</DialogTitle>
                <DialogDescription>
                  احسب الراتب الإجمالي والصافي باستخدام معادلة الرواتب المعتمدة (بالدولار الأمريكي)
                </DialogDescription>
              </DialogHeader>
              <SalaryCalculator />
            </DialogContent>
          </Dialog>
          <Button 
            variant="outline"
            onClick={() => setIsExchangeRatesOpen(true)}
          >
            <Settings className="w-4 h-4 ml-2" />
            إدارة أسعار الصرف
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 ml-2" />
            تصدير الرواتب
          </Button>
        </div>
      </div>

      {/* Salary Categories */}
      <Card>
        <CardHeader>
          <CardTitle>تصنيفات الرواتب</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {salaryCategories.map((category) => (
              <div key={category.id} className="p-4 border rounded-lg">
                <h3 className="font-semibold text-lg mb-3">{category.name}</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>الحد الأدنى:</span>
                    <span className="font-medium">{formatUSD(category.minSalary)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>المستوى الإداري:</span>
                    <span className="font-medium">{formatUSD(category.adminLevel)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>بدل المؤهل:</span>
                    <span className="font-medium">{formatUSD(category.qualificationAllowance)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>بدل الخبرة:</span>
                    <span className="font-medium">{formatUSD(category.experienceAllowance)}/سنة</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Monthly Salaries */}
      <Card>
        <CardHeader>
          <CardTitle>رواتب الشهر الحالي</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ProfessionalTable
            columns={[
              { key: 'employeeNumber', label: 'رقم الموظف', width: '120px' },
              { key: 'employeeName', label: 'اسم الموظف', width: '200px' },
              { key: 'category', label: 'التصنيف', width: '150px' },
              { 
                key: 'experienceYears', 
                label: 'سنوات الخبرة', 
                width: '120px',
                render: (value) => `${value} سنة`
              },
              { 
                key: 'grossSalary', 
                label: 'الراتب الإجمالي', 
                width: '200px',
                render: (value, row) => (
                  <DualCurrencyDisplay 
                    amountUSD={value}
                    size="sm"
                    className="text-green-600"
                    rateUsed={row.rateUsed}
                    effectiveDate={row.effectiveDate}
                  />
                )
              },
              { 
                key: 'deductions', 
                label: 'الخصومات', 
                width: '150px',
                render: (_, row) => {
                  const totalDeductions = row.advances + row.loans + row.deductions;
                  return (
                    <DualCurrencyDisplay 
                      amountUSD={totalDeductions}
                      size="sm"
                      className="text-red-600"
                      rateUsed={row.rateUsed}
                      effectiveDate={row.effectiveDate}
                    />
                  );
                }
              },
              { 
                key: 'netSalary', 
                label: 'الراتب الصافي', 
                width: '200px',
                render: (value, row) => (
                  <DualCurrencyDisplay 
                    amountUSD={value}
                    size="sm"
                    className="text-blue-600"
                    rateUsed={row.rateUsed}
                    effectiveDate={row.effectiveDate}
                  />
                )
              },
              { 
                key: 'actions', 
                label: 'الإجراءات', 
                width: '120px', 
                align: 'center',
                render: () => createActionButtons([
                  {
                    icon: <Eye className="w-4 h-4" />,
                    onClick: () => {},
                    title: 'عرض التفاصيل'
                  },
                  {
                    icon: <Download className="w-4 h-4" />,
                    onClick: () => {},
                    title: 'تحميل كشف الراتب'
                  }
                ])
              }
            ]}
            data={salaries}
          />
          
          {/* Rate Used Footer */}
          {salaries.length > 0 && (
            <div className="mt-4 p-3 bg-gray-50 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>آخر تحديث للرواتب:</span>
                <span>سبتمبر 2024</span>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-600 mt-1">
                <span>سعر الصرف المستخدم:</span>
                <span className="font-medium">
                  {salaries[0]?.rateUsed?.toFixed(2) || '36.50'} TRY/USD 
                  (ساري من {salaries[0]?.effectiveDate ? new Date(salaries[0].effectiveDate).toLocaleDateString('ar-SA') : '2024-09-24'})
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Exchange Rates Manager Dialog */}
      <Dialog open={isExchangeRatesOpen} onOpenChange={setIsExchangeRatesOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>إدارة أسعار الصرف USD ⇄ TRY</DialogTitle>
            <DialogDescription>
              إدارة أسعار صرف الدولار الأمريكي مقابل الليرة التركية
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            {/* We'll import this component dynamically */}
            <ExchangeRatesManagerContent />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Mini version of Exchange Rates Manager for the dialog
function ExchangeRatesManagerContent() {
  return (
    <div className="text-center py-8">
      <Settings className="w-12 h-12 mx-auto mb-4 text-gray-400" />
      <p className="text-gray-600">سيتم تطبيق مدير أسعار الصرف هنا</p>
      <p className="text-sm text-gray-500 mt-2">يمكن الوصول إليه من الصفحة الرئيسية أو قائمة الإعدادات</p>
    </div>
  );
}

function SalaryCalculator() {
  const [formData, setFormData] = useState({
    employeeNumber: '',
    category: '',
    experienceYears: 0,
    additionalAmount: 0,
    advances: 0,
    loans: 0,
    deductions: 0
  });
  const [result, setResult] = useState(null);
  const { activeRate } = useCurrency();

  const calculateSalary = () => {
    const category = salaryCategories.find(cat => cat.name === formData.category);
    if (!category) return;

    const gross = category.minSalary + 
                  category.adminLevel + 
                  category.qualificationAllowance + 
                  (category.experienceAllowance * formData.experienceYears) + 
                  formData.additionalAmount;

    const totalDeductions = formData.advances + formData.loans + formData.deductions;
    const net = gross - totalDeductions;

    setResult({
      minSalary: category.minSalary,
      adminLevel: category.adminLevel,
      qualificationAllowance: category.qualificationAllowance,
      experienceAllowance: category.experienceAllowance * formData.experienceYears,
      additionalAmount: formData.additionalAmount,
      grossSalary: gross,
      advances: formData.advances,
      loans: formData.loans,
      deductions: formData.deductions,
      totalDeductions,
      netSalary: net
    });
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveSalary = (salaryResult) => {
    // Simulate saving salary with current exchange rate
    const salaryRecord = {
      ...formData,
      ...salaryResult,
      rateUsed: activeRate?.rate || 36.50,
      effectiveDate: activeRate?.effective_from || new Date().toISOString().split('T')[0],
      month: new Date().toISOString().slice(0, 7), // YYYY-MM format
      savedAt: new Date().toISOString()
    };
    
    console.log('Saving salary record:', salaryRecord);
    
    // Show success message
    import('sonner@2.0.3').then(({ toast }) => {
      toast.success('تم حفظ الراتب بنجاح', {
        description: `راتب ${formData.employeeNumber} - ${formatUSD(salaryResult.netSalary)}`
      });
    });
    
    // Reset form
    setFormData({
      employeeNumber: '',
      category: '',
      experienceYears: 0,
      additionalAmount: 0,
      advances: 0,
      loans: 0,
      deductions: 0
    });
    setResult(null);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle>بيانات الحساب</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>رقم الموظف</Label>
              <Input 
                value={formData.employeeNumber}
                onChange={(e) => handleInputChange('employeeNumber', e.target.value)}
                placeholder="EMP001"
              />
            </div>
            
            <div className="space-y-2">
              <Label>التصنيف</Label>
              <Select onValueChange={(value) => handleInputChange('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر التصنيف" />
                </SelectTrigger>
                <SelectContent>
                  {salaryCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>سنوات الخبرة</Label>
              <Input 
                type="number"
                value={formData.experienceYears}
                onChange={(e) => handleInputChange('experienceYears', parseInt(e.target.value) || 0)}
                placeholder="5"
              />
            </div>
            
            <div className="space-y-2">
              <Label>مبلغ إضافي</Label>
              <Input 
                type="number"
                value={formData.additionalAmount}
                onChange={(e) => handleInputChange('additionalAmount', parseInt(e.target.value) || 0)}
                placeholder="274"
              />
            </div>
            
            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">الخصومات</h4>
              
              <div className="space-y-2">
                <Label>السلف</Label>
                <Input 
                  type="number"
                  value={formData.advances}
                  onChange={(e) => handleInputChange('advances', parseInt(e.target.value) || 0)}
                  placeholder="137"
                />
              </div>
              
              <div className="space-y-2">
                <Label>القروض</Label>
                <Input 
                  type="number"
                  value={formData.loans}
                  onChange={(e) => handleInputChange('loans', parseInt(e.target.value) || 0)}
                  placeholder="0"
                />
              </div>
              
              <div className="space-y-2">
                <Label>خصومات أخرى</Label>
                <Input 
                  type="number"
                  value={formData.deductions}
                  onChange={(e) => handleInputChange('deductions', parseInt(e.target.value) || 0)}
                  placeholder="55"
                />
              </div>
            </div>
            
            <Button onClick={calculateSalary} className="w-full bg-blue-600 hover:bg-blue-700">
              <Calculator className="w-4 h-4 ml-2" />
              احسب الراتب
            </Button>
          </CardContent>
        </Card>

        {/* Result */}
        <Card>
          <CardHeader>
            <CardTitle>نتيجة الحساب</CardTitle>
          </CardHeader>
          <CardContent>
            {result ? (
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-3">تفاصيل الراتب الإجمالي</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>الحد الأدنى:</span>
                      <span>{formatUSD(result.minSalary)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>المستوى الإداري:</span>
                      <span>{formatUSD(result.adminLevel)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>بدل المؤهل:</span>
                      <span>{formatUSD(result.qualificationAllowance)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>بدل الخبرة:</span>
                      <span>{formatUSD(result.experienceAllowance)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>مبلغ إضافي:</span>
                      <span>{formatUSD(result.additionalAmount)}</span>
                    </div>
                    <hr className="my-2" />
                    <div className="flex justify-between font-semibold text-base">
                      <span>الإجمالي:</span>
                      <span className="text-green-600">{formatUSD(result.grossSalary)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-red-50 p-4 rounded-lg">
                  <h4 className="font-medium text-red-900 mb-3">الخصومات</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>السلف:</span>
                      <span>{formatUSD(result.advances)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>القروض:</span>
                      <span>{formatUSD(result.loans)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>خصومات أخرى:</span>
                      <span>{formatUSD(result.deductions)}</span>
                    </div>
                    <hr className="my-2" />
                    <div className="flex justify-between font-semibold text-base">
                      <span>إجمالي الخصومات:</span>
                      <span className="text-red-600">{formatUSD(result.totalDeductions)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-green-900">الراتب الصافي:</span>
                    <span className="text-2xl font-bold text-green-600">{formatUSD(result.netSalary)}</span>
                  </div>
                </div>

                <Button 
                  className="w-full" 
                  variant="outline"
                  onClick={() => handleSaveSalary(result)}
                >
                  <Plus className="w-4 h-4 ml-2" />
                  حفظ في قاعدة البيانات
                </Button>
                
                {activeRate && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-800">
                      سيتم حفظ الراتب بسعر الصرف النشط: {activeRate.rate.toFixed(2)} TRY/USD
                      (ساري من {new Date(activeRate.effective_from).toLocaleDateString('ar-SA')})
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Calculator className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>أدخل البيانات واضغط "احسب الراتب" لعرض النتيجة</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}