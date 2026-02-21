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
import { Search, Plus, Edit, UserX, AlertTriangle, Calendar, Clock } from 'lucide-react';
import { UniversalForm, FormSection } from './UniversalForm';
import { ValidationRules } from './FormValidation';
import { toast } from "sonner@2.0.3";

const absenceTypes = [
  { id: 'unauthorized', name: 'غياب غير مبرر', color: 'bg-red-100 text-red-800' },
  { id: 'sick', name: 'غياب مرضي', color: 'bg-yellow-100 text-yellow-800' },
  { id: 'emergency', name: 'غياب طارئ', color: 'bg-orange-100 text-orange-800' },
  { id: 'late', name: 'تأخير', color: 'bg-purple-100 text-purple-800' }
];

const mockAbsences = [
  {
    id: 1,
    employeeNumber: 'EMP001',
    employeeName: 'أحمد محمد علي',
    type: 'sick',
    typeName: 'غياب مرضي',
    fromDate: '2024-02-15',
    toDate: '2024-02-16',
    days: 2,
    reason: 'مراجعة طبية',
    status: 'مبرر',
    reportedBy: 'الموظف',
    reportDate: '2024-02-15'
  },
  {
    id: 2,
    employeeNumber: 'EMP002',
    employeeName: 'فاطمة عبد الله',
    type: 'unauthorized',
    typeName: 'غياب غير مبرر',
    fromDate: '2024-02-20',
    toDate: '2024-02-20',
    days: 1,
    reason: 'لم يتم تقديم مبرر',
    status: 'غير مبرر',
    reportedBy: 'المدير المباشر',
    reportDate: '2024-02-21'
  },
  {
    id: 3,
    employeeNumber: 'EMP003',
    employeeName: 'خالد عبد الرحمن',
    type: 'emergency',
    typeName: 'غياب طارئ',
    fromDate: '2024-02-25',
    toDate: '2024-02-25',
    days: 1,
    reason: 'ظرف عائلي طارئ',
    status: 'مبرر',
    reportedBy: 'الموظف',
    reportDate: '2024-02-25'
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

// Form configuration for absences
const absenceFormSections: FormSection[] = [
  {
    id: 'absence_details',
    title: 'تفاصيل الغياب',
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
        name: 'fromDate',
        label: 'من تاريخ',
        type: 'date',
        required: true
      },
      {
        name: 'toDate',
        label: 'إلى تاريخ',
        type: 'date',
        required: true
      },
      {
        name: 'numberOfDays',
        label: 'عدد الأيام',
        type: 'number',
        placeholder: 'سيتم الحساب تلقائياً',
        min: 1
      },
      {
        name: 'reason',
        label: 'السبب',
        type: 'textarea',
        placeholder: 'اذكر سبب الغياب...',
        required: true
      },
      {
        name: 'attachments',
        label: 'المرفقات',
        type: 'attachment'
      }
    ]
  }
];

const absenceValidationRules: ValidationRules = {
  employee: { required: true, message: 'يرجى اختيار الموظف' },
  fromDate: { required: true, message: 'يرجى تحديد تاريخ البداية' },
  toDate: { required: true, message: 'يرجى تحديد تاريخ النهاية' },
  reason: { required: true, message: 'يرجى ذكر سبب الغياب' }
};

export function AbsencePage() {
  const [absences, setAbsences] = useState(mockAbsences);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const filteredAbsences = absences.filter(absence =>
    absence.employeeName.includes(searchTerm) ||
    absence.employeeNumber.includes(searchTerm) ||
    absence.typeName.includes(searchTerm)
  );

  const getStatusBadge = (status: string) => {
    const variants = {
      'مبرر': 'bg-green-100 text-green-800',
      'غير مبرر': 'bg-red-100 text-red-800',
      'قيد المراجعة': 'bg-yellow-100 text-yellow-800'
    };
    return variants[status] || 'bg-gray-100 text-gray-800';
  };

  const getTypeBadge = (typeId: string) => {
    const type = absenceTypes.find(t => t.id === typeId);
    return type?.color || 'bg-gray-100 text-gray-800';
  };

  const calculateDays = (fromDate: string, toDate: string) => {
    if (!fromDate || !toDate) return 1;
    const start = new Date(fromDate);
    const end = new Date(toDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const handleAddAbsence = async (formData: any) => {
    try {
      // Get employee details
      const selectedEmployee = employeeOptions.find(emp => emp.value === formData.employee);
      
      if (!selectedEmployee) {
        throw new Error('Invalid employee');
      }

      // Calculate number of days
      const numberOfDays = calculateDays(formData.fromDate, formData.toDate);

      // Determine absence type based on reason (simplified logic)
      let absenceType = 'unauthorized';
      let absenceTypeName = 'غياب غير مبرر';
      let status = 'قيد المراجعة';

      if (formData.reason.includes('مرض') || formData.reason.includes('طبي')) {
        absenceType = 'sick';
        absenceTypeName = 'غياب مرضي';
        status = 'مبرر';
      } else if (formData.reason.includes('طارئ') || formData.reason.includes('عائلي')) {
        absenceType = 'emergency';
        absenceTypeName = 'غياب طارئ';
        status = 'مبرر';
      }

      // Create new absence record
      const newAbsence = {
        id: Date.now(), // In real app, this would come from backend
        employeeNumber: formData.employee,
        employeeName: selectedEmployee.label.split(' - ')[1],
        type: absenceType,
        typeName: absenceTypeName,
        fromDate: formData.fromDate,
        toDate: formData.toDate,
        days: numberOfDays,
        reason: formData.reason,
        status: status,
        reportedBy: 'مدير الموارد البشرية',
        reportDate: new Date().toISOString().split('T')[0]
      };

      // Add to state (with highlight effect)
      setAbsences(prev => [newAbsence, ...prev]);
      
      // Close dialog
      setIsAddDialogOpen(false);
      
      // Show success message
      toast.success('تم حفظ سجل الغياب بنجاح');
      
      // Brief highlight effect (simulate real-time update)
      setTimeout(() => {
        const row = document.querySelector(`[data-absence-id="${newAbsence.id}"]`);
        if (row) {
          row.classList.add('bg-green-50');
          setTimeout(() => row.classList.remove('bg-green-50'), 1000);
        }
      }, 100);

    } catch (error) {
      console.error('Error saving absence:', error);
      toast.error('حدث خطأ أثناء حفظ سجل الغياب');
    }
  };

  const totalAbsenceDays = absences.reduce((sum, a) => sum + a.days, 0);
  const unauthorizedCount = absences.filter(a => a.status === 'غير مبرر').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">إدارة الغياب</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 ml-2" />
              تسجيل غياب جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>تسجيل غياب جديد</DialogTitle>
              <DialogDescription>
                قم بتسجيل غياب موظف مع تحديد السبب
              </DialogDescription>
            </DialogHeader>
            <UniversalForm
              title=""
              sections={absenceFormSections}
              validationRules={absenceValidationRules}
              onSubmit={handleAddAbsence}
              onCancel={() => setIsAddDialogOpen(false)}
              submitLabel="حفظ سجل الغياب"
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
                <p className="text-sm text-gray-600">إجمالي الغيابات</p>
                <p className="text-2xl font-semibold">{absences.length}</p>
              </div>
              <UserX className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">أيام غياب</p>
                <p className="text-2xl font-semibold text-orange-600">{totalAbsenceDays}</p>
              </div>
              <Calendar className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">غير مبرر</p>
                <p className="text-2xl font-semibold text-red-600">{unauthorizedCount}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">غياب مرضي</p>
                <p className="text-2xl font-semibold text-yellow-600">
                  {absences.filter(a => a.type === 'sick').length}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-reverse space-x-4">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="البحث بالموظف، رقم الموظف، أو نوع الغياب..."
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
                {absenceTypes.map(type => (
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
                <SelectItem value="justified">مبرر</SelectItem>
                <SelectItem value="unjustified">غير مبرر</SelectItem>
                <SelectItem value="pending">قيد المراجعة</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Absences Table */}
      <Card>
        <CardHeader>
          <CardTitle>سجل الغيابات</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">رقم الموظف</TableHead>
                <TableHead className="text-right">اسم الموظف</TableHead>
                <TableHead className="text-right">نوع الغياب</TableHead>
                <TableHead className="text-right">من تاريخ</TableHead>
                <TableHead className="text-right">إلى تاريخ</TableHead>
                <TableHead className="text-right">عدد الأيام</TableHead>
                <TableHead className="text-right">السبب</TableHead>
                <TableHead className="text-right">تاريخ التبليغ</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
                <TableHead className="text-right">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAbsences.map((absence) => (
                <TableRow 
                  key={absence.id}
                  data-absence-id={absence.id}
                  className="transition-colors duration-1000"
                >
                  <TableCell className="font-medium">{absence.employeeNumber}</TableCell>
                  <TableCell>{absence.employeeName}</TableCell>
                  <TableCell>
                    <Badge className={getTypeBadge(absence.type)}>
                      {absence.typeName}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(absence.fromDate).toLocaleDateString('ar-SA')}</TableCell>
                  <TableCell>{new Date(absence.toDate).toLocaleDateString('ar-SA')}</TableCell>
                  <TableCell>
                    <span className="font-semibold text-orange-600">{absence.days}</span>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">{absence.reason}</TableCell>
                  <TableCell>{new Date(absence.reportDate).toLocaleDateString('ar-SA')}</TableCell>
                  <TableCell>
                    <Badge className={getStatusBadge(absence.status)}>
                      {absence.status}
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