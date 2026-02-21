import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Search, Plus, Edit, Calendar, Clock, CheckCircle, XCircle } from 'lucide-react';
import { ProfessionalTable, createActionButtons } from './ProfessionalTable';
import { UniversalForm, FormSection } from './UniversalForm';
import { ValidationRules } from './FormValidation';
import { toast } from "sonner@2.0.3";

const leaveTypes = [
  { id: 'annual', name: 'إجازة سنوية', maxDays: 30, color: 'bg-blue-100 text-blue-800' },
  { id: 'emergency', name: 'إجازة طارئة', maxDays: 7, color: 'bg-red-100 text-red-800' },
  { id: 'sick', name: 'إجازة مرضية', maxDays: 15, color: 'bg-yellow-100 text-yellow-800' },
  { id: 'hourly', name: 'إجازة ساعية', maxDays: 0, color: 'bg-purple-100 text-purple-800' }
];

const mockLeaves = [
  {
    id: 1,
    employeeNumber: 'EMP001',
    employeeName: 'أحمد محمد علي',
    type: 'annual',
    typeName: 'إجازة سنوية',
    startDate: '2024-03-01',
    endDate: '2024-03-07',
    days: 7,
    hours: 0,
    reason: 'إجازة عائلية',
    status: 'معتمدة',
    approver: 'مدير الموارد البشرية',
    requestDate: '2024-02-15'
  },
  {
    id: 2,
    employeeNumber: 'EMP002',
    employeeName: 'فاطمة عبد الله',
    type: 'sick',
    typeName: 'إجازة مرضية',
    startDate: '2024-02-20',
    endDate: '2024-02-22',
    days: 3,
    hours: 0,
    reason: 'مراجعة طبية',
    status: 'قيد المراجعة',
    approver: '',
    requestDate: '2024-02-19'
  },
  {
    id: 3,
    employeeNumber: 'EMP003',
    employeeName: 'خالد عبد الرحمن',
    type: 'hourly',
    typeName: 'إجازة ساعية',
    startDate: '2024-02-25',
    endDate: '2024-02-25',
    days: 0,
    hours: 4,
    reason: 'موعد طبي',
    status: 'معتمدة',
    approver: 'المدير المباشر',
    requestDate: '2024-02-24'
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

// Form configuration for leaves
const leaveFormSections: FormSection[] = [
  {
    id: 'leave_details',
    title: 'تفاصيل الإجازة',
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
        name: 'leaveType',
        label: 'نوع الإجازة',
        type: 'select',
        options: leaveTypes.map(type => ({ value: type.id, label: type.name })),
        required: true,
        placeholder: 'اختر نوع الإجازة'
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
        name: 'duration',
        label: 'المدة (أيام)',
        type: 'number',
        placeholder: 'سيتم الحساب تلقائياً',
        min: 0
      },
      {
        name: 'notes',
        label: 'ملاحظات',
        type: 'textarea',
        placeholder: 'اذكر سبب الإجازة...'
      },
      {
        name: 'attachments',
        label: 'المرفقات',
        type: 'attachment'
      }
    ]
  }
];

const leaveValidationRules: ValidationRules = {
  employee: { required: true, message: 'يرجى اختيار الموظف' },
  leaveType: { required: true, message: 'يرجى اختيار نوع الإجازة' },
  fromDate: { required: true, message: 'يرجى تحديد تاريخ البداية' },
  toDate: { required: true, message: 'يرجى تحديد تاريخ النهاية' }
};

export function LeavePage() {
  const [leaves, setLeaves] = useState(mockLeaves);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const filteredLeaves = leaves.filter(leave =>
    leave.employeeName.includes(searchTerm) ||
    leave.employeeNumber.includes(searchTerm) ||
    leave.typeName.includes(searchTerm)
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
    const type = leaveTypes.find(t => t.id === typeId);
    return type?.color || 'bg-gray-100 text-gray-800';
  };

  const calculateDuration = (fromDate: string, toDate: string) => {
    if (!fromDate || !toDate) return 0;
    const start = new Date(fromDate);
    const end = new Date(toDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const handleAddLeave = async (formData: any) => {
    try {
      // Get employee details
      const selectedEmployee = employeeOptions.find(emp => emp.value === formData.employee);
      const selectedType = leaveTypes.find(type => type.id === formData.leaveType);
      
      if (!selectedEmployee || !selectedType) {
        throw new Error('Invalid employee or leave type');
      }

      // Calculate duration
      const duration = calculateDuration(formData.fromDate, formData.toDate);

      // Create new leave record
      const newLeave = {
        id: Date.now(), // In real app, this would come from backend
        employeeNumber: formData.employee,
        employeeName: selectedEmployee.label.split(' - ')[1],
        type: formData.leaveType,
        typeName: selectedType.name,
        startDate: formData.fromDate,
        endDate: formData.toDate,
        days: formData.leaveType === 'hourly' ? 0 : duration,
        hours: formData.leaveType === 'hourly' ? (formData.duration || 8) : 0,
        reason: formData.notes || 'إجازة',
        status: 'معتمدة',
        approver: 'مدير الموارد البشرية',
        requestDate: new Date().toISOString().split('T')[0]
      };

      // Add to state (with highlight effect)
      setLeaves(prev => [newLeave, ...prev]);
      
      // Close dialog
      setIsAddDialogOpen(false);
      
      // Show success message
      toast.success('تم حفظ طلب الإجازة بنجاح');
      
      // Brief highlight effect (simulate real-time update)
      setTimeout(() => {
        const row = document.querySelector(`[data-leave-id="${newLeave.id}"]`);
        if (row) {
          row.classList.add('bg-green-50');
          setTimeout(() => row.classList.remove('bg-green-50'), 1000);
        }
      }, 100);

    } catch (error) {
      console.error('Error saving leave:', error);
      toast.error('حدث خطأ أثناء حفظ طلب الإجازة');
    }
  };

  const totalDaysUsed = leaves
    .filter(l => l.status === 'معتمدة')
    .reduce((sum, l) => sum + l.days, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">إدارة الإجازات</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 ml-2" />
              طلب إجازة جديدة
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>طلب إجازة جديدة</DialogTitle>
              <DialogDescription>
                قم بتعبئة تفاصيل طلب الإجازة
              </DialogDescription>
            </DialogHeader>
            <UniversalForm
              title=""
              sections={leaveFormSections}
              validationRules={leaveValidationRules}
              onSubmit={handleAddLeave}
              onCancel={() => setIsAddDialogOpen(false)}
              submitLabel="حفظ طلب الإجازة"
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
                <p className="text-sm text-gray-600">إجمالي الطلبات</p>
                <p className="text-2xl font-semibold">{leaves.length}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">أيام مستخدمة</p>
                <p className="text-2xl font-semibold text-orange-600">{totalDaysUsed}</p>
              </div>
              <Clock className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        {leaveTypes.slice(0, 2).map((type) => {
          const count = leaves.filter(l => l.type === type.id).length;
          return (
            <Card key={type.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{type.name}</p>
                    <p className="text-2xl font-semibold">{count}</p>
                  </div>
                  <Calendar className="w-8 h-8 text-green-500" />
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
                placeholder="البحث بالموظف، رقم الموظف، أو نوع الإجازة..."
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
                {leaveTypes.map(type => (
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

      {/* Leaves Table */}
      <Card>
        <CardHeader>
          <CardTitle>سجل الإجازات</CardTitle>
        </CardHeader>
        <CardContent>
          <ProfessionalTable
            columns={[
              { key: 'employeeNumber', label: 'رقم الموظف', width: '120px' },
              { key: 'employeeName', label: 'اسم الموظف', width: '200px' },
              { key: 'leaveType', label: 'نوع الإجازة', width: '150px' },
              { key: 'startDate', label: 'من تاريخ', width: '120px' },
              { key: 'endDate', label: 'إلى تاريخ', width: '120px' },
              { key: 'duration', label: 'المدة', width: '100px' },
              { key: 'reason', label: 'السبب', width: '200px' },
              { key: 'requestDate', label: 'تاريخ الطلب', width: '120px' },
              { key: 'status', label: 'الحالة', width: '120px' },
              { key: 'actions', label: 'الإجراءات', width: '100px', align: 'center' }
            ]}
            data={filteredLeaves.map(leave => ({
              id: leave.id,
              'data-leave-id': leave.id,
              employeeNumber: leave.employeeNumber,
              employeeName: leave.employeeName,
              leaveType: (
                <Badge className={getTypeBadge(leave.type)}>
                  {leave.typeName}
                </Badge>
              ),
              startDate: leave.startDate,
              endDate: leave.endDate,
              duration: leave.days > 0 ? `${leave.days} أيام` : `${leave.hours} ساعات`,
              reason: leave.reason,
              requestDate: leave.requestDate,
              status: (
                <Badge className={getStatusBadge(leave.status)}>
                  {leave.status}
                </Badge>
              ),
              actions: createActionButtons([
                {
                  icon: <Edit className="w-4 h-4" />,
                  onClick: () => console.log('Edit', leave.id),
                  title: 'تعديل'
                }
              ])
            }))}
            className="[&_tr]:transition-colors [&_tr]:duration-1000"
          />
        </CardContent>
      </Card>
    </div>
  );
}