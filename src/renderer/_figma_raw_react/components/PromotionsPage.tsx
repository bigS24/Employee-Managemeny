import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Search, Plus, Edit, TrendingUp, Award } from 'lucide-react';
import { UniversalForm, FormSection } from './UniversalForm';
import { ValidationRules } from './FormValidation';
import { toast } from "sonner@2.0.3";

const promotionTypes = [
  { id: 'position', name: 'ترقية منصب', color: 'bg-blue-100 text-blue-800' },
  { id: 'grade', name: 'ترقية درجة', color: 'bg-green-100 text-green-800' },
  { id: 'salary', name: 'زيادة راتب', color: 'bg-purple-100 text-purple-800' }
];

const mockPromotions = [
  {
    id: 1,
    employeeNumber: 'EMP001',
    employeeName: 'أحمد محمد علي',
    type: 'position',
    typeName: 'ترقية منصب',
    fromPosition: 'مطور',
    toPosition: 'مطور أول',
    fromSalary: 12000,
    toSalary: 15000,
    effectiveDate: '2024-01-01',
    approver: 'مدير الموارد البشرية',
    reason: 'أداء متميز وسنوات خبرة',
    status: 'معتمدة'
  },
  {
    id: 2,
    employeeNumber: 'EMP002',
    employeeName: 'فاطمة عبد الله',
    type: 'salary',
    typeName: 'زيادة راتب',
    fromPosition: 'محاسبة',
    toPosition: 'محاسبة',
    fromSalary: 10000,
    toSalary: 12000,
    effectiveDate: '2024-02-01',
    approver: 'مدير المالية',
    reason: 'تقييم أداء ممتاز',
    status: 'قيد المراجعة'
  }
];

// Employee options for the select dropdown
const employeeOptions = [
  { value: 'EMP001', label: 'EMP001 - أحمد محمد علي' },
  { value: 'EMP002', label: 'EMP002 - فاطمة عبد الله' },
  { value: 'EMP003', label: 'EMP003 - خالد عبد الرحمن' },
  { value: 'EMP004', label: 'EMP004 - سارة أحمد' },
  { value: 'EMP005', label: 'EMP005 - محمد سعد' }
];

// Form configuration for promotions
const promotionFormSections: FormSection[] = [
  {
    id: 'promotion_details',
    title: 'تفاصيل الترقية',
    fields: [
      {
        name: 'employee',
        label: 'الموظف',
        type: 'select',
        options: employeeOptions,
        required: true,
        placeholder: 'اختر الموظف'
      },
      {
        name: 'promotionType',
        label: 'نوع الترقية',
        type: 'select',
        options: promotionTypes.map(type => ({ value: type.id, label: type.name })),
        required: true,
        placeholder: 'اختر نوع الترقية'
      },
      {
        name: 'promotionDate',
        label: 'تاريخ الترقية',
        type: 'date',
        required: true
      },
      {
        name: 'reference',
        label: 'المرجع',
        type: 'text',
        placeholder: 'رقم المرجع أو القرار'
      },
      {
        name: 'notes',
        label: 'ملاحظات',
        type: 'textarea',
        placeholder: 'اذكر تفاصيل إضافية...'
      },
      {
        name: 'attachments',
        label: 'المرفقات',
        type: 'attachment'
      }
    ]
  }
];

const promotionValidationRules: ValidationRules = {
  employee: { required: true, message: 'يرجى اختيار الموظف' },
  promotionType: { required: true, message: 'يرجى اختيار نوع الترقية' },
  promotionDate: { required: true, message: 'يرجى تحديد تاريخ الترقية' }
};

export function PromotionsPage() {
  const [promotions, setPromotions] = useState(mockPromotions);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const filteredPromotions = promotions.filter(promotion =>
    promotion.employeeName.includes(searchTerm) ||
    promotion.employeeNumber.includes(searchTerm) ||
    promotion.typeName.includes(searchTerm)
  );

  const getStatusBadge = (status: string) => {
    const variants = {
      'معتمدة': 'bg-green-100 text-green-800',
      'مرفوضة': 'bg-red-100 text-red-800',
      'قيد المراجعة': 'bg-yellow-100 text-yellow-800'
    };
    return variants[status] || 'bg-gray-100 text-gray-800';
  };

  const getTypeBadge = (typeId: string) => {
    const type = promotionTypes.find(t => t.id === typeId);
    return type?.color || 'bg-gray-100 text-gray-800';
  };

  const handleAddPromotion = async (formData: any) => {
    try {
      // Get employee details
      const selectedEmployee = employeeOptions.find(emp => emp.value === formData.employee);
      const selectedType = promotionTypes.find(type => type.id === formData.promotionType);
      
      if (!selectedEmployee || !selectedType) {
        throw new Error('Invalid employee or promotion type');
      }

      // Create new promotion record
      const newPromotion = {
        id: Date.now(), // In real app, this would come from backend
        employeeNumber: formData.employee,
        employeeName: selectedEmployee.label.split(' - ')[1],
        type: formData.promotionType,
        typeName: selectedType.name,
        fromPosition: 'المنصب الحالي', // Would come from employee data
        toPosition: 'المنصب الجديد', // Based on promotion type
        fromSalary: 12000, // Would come from employee data
        toSalary: 15000, // Based on promotion
        effectiveDate: formData.promotionDate,
        approver: 'مدير الموارد البشرية',
        reason: formData.notes || 'ترقية',
        status: 'معتمدة',
        reference: formData.reference || `PROM${Date.now()}`
      };

      // Add to state (with highlight effect)
      setPromotions(prev => [newPromotion, ...prev]);
      
      // Close dialog
      setIsAddDialogOpen(false);
      
      // Show success message
      toast.success('تم حفظ الترقية بنجاح');
      
      // Brief highlight effect (simulate real-time update)
      setTimeout(() => {
        const row = document.querySelector(`[data-promotion-id="${newPromotion.id}"]`);
        if (row) {
          row.classList.add('bg-green-50');
          setTimeout(() => row.classList.remove('bg-green-50'), 1000);
        }
      }, 100);

    } catch (error) {
      console.error('Error saving promotion:', error);
      toast.error('حدث خطأ أثناء حفظ الترقية');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">إدارة الترقيات</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 ml-2" />
              إضافة ترقية جديدة
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>ترقية موظف</DialogTitle>
              <DialogDescription>
                أدخل تفاصيل الترقية الجديدة للموظف
              </DialogDescription>
            </DialogHeader>
            <UniversalForm
              title=""
              sections={promotionFormSections}
              validationRules={promotionValidationRules}
              onSubmit={handleAddPromotion}
              onCancel={() => setIsAddDialogOpen(false)}
              submitLabel="حفظ الترقية"
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">إجمالي الترقيات</p>
                <p className="text-2xl font-semibold">{promotions.length}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        {promotionTypes.map((type) => {
          const count = promotions.filter(p => p.type === type.id).length;
          return (
            <Card key={type.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{type.name}</p>
                    <p className="text-2xl font-semibold">{count}</p>
                  </div>
                  <Award className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-reverse space-x-4">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="البحث بالموظف، رقم الموظف، أو نوع الترقية..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
            <Select>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="فلترة حسب النوع" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأنواع</SelectItem>
                {promotionTypes.map(type => (
                  <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="فلترة حسب الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="approved">معتمدة</SelectItem>
                <SelectItem value="pending">قيد المراجعة</SelectItem>
                <SelectItem value="rejected">مرفوضة</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Promotions Table */}
      <Card>
        <CardHeader>
          <CardTitle>سجل الترقيات</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">رقم الموظف</TableHead>
                <TableHead className="text-right">اسم الموظف</TableHead>
                <TableHead className="text-right">نوع الترقية</TableHead>
                <TableHead className="text-right">من</TableHead>
                <TableHead className="text-right">إلى</TableHead>
                <TableHead className="text-right">الراتب</TableHead>
                <TableHead className="text-right">تاريخ السريان</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
                <TableHead className="text-right">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPromotions.map((promotion) => (
                <TableRow 
                  key={promotion.id}
                  data-promotion-id={promotion.id}
                  className="transition-colors duration-1000"
                >
                  <TableCell className="font-medium">{promotion.employeeNumber}</TableCell>
                  <TableCell>{promotion.employeeName}</TableCell>
                  <TableCell>
                    <Badge className={getTypeBadge(promotion.type)}>
                      {promotion.typeName}
                    </Badge>
                  </TableCell>
                  <TableCell>{promotion.fromPosition}</TableCell>
                  <TableCell>{promotion.toPosition}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="text-red-600">{promotion.fromSalary.toLocaleString()}</div>
                      <div className="text-green-600 font-semibold">{promotion.toSalary.toLocaleString()}</div>
                    </div>
                  </TableCell>
                  <TableCell>{new Date(promotion.effectiveDate).toLocaleDateString('ar-SA')}</TableCell>
                  <TableCell>
                    <Badge className={getStatusBadge(promotion.status)}>
                      {promotion.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-reverse space-x-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}