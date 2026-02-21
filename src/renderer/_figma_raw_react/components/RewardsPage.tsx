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
import { Search, Plus, Edit, Gift, Award, DollarSign } from 'lucide-react';
import { UniversalForm, FormSection } from './UniversalForm';
import { ValidationRules } from './FormValidation';
import { toast } from "sonner@2.0.3";

const rewardTypes = [
  { id: 'monetary', name: 'مكافأة مالية', color: 'bg-green-100 text-green-800', icon: DollarSign },
  { id: 'certificate', name: 'شهادة تقدير', color: 'bg-blue-100 text-blue-800', icon: Award },
  { id: 'gift', name: 'هدية عينية', color: 'bg-purple-100 text-purple-800', icon: Gift }
];

const mockRewards = [
  {
    id: 1,
    employeeNumber: 'EMP001',
    employeeName: 'أحمد محمد علي',
    type: 'monetary',
    typeName: 'مكافأة مالية',
    amount: 5000,
    reason: 'إنجاز مشروع هام في الوقت المحدد',
    date: '2024-01-15',
    approver: 'مدير تقنية المعلومات',
    status: 'معتمدة',
    reference: 'REW001'
  },
  {
    id: 2,
    employeeNumber: 'EMP002',
    employeeName: 'فاطمة عبد الله',
    type: 'certificate',
    typeName: 'شهادة تقدير',
    amount: 0,
    reason: 'موظفة الشهر - خدمة عملاء متميزة',
    date: '2024-01-30',
    approver: 'مدير الموارد البشرية',
    status: 'معتمدة',
    reference: 'REW002'
  },
  {
    id: 3,
    employeeNumber: 'EMP003',
    employeeName: 'خالد عبد الرحمن',
    type: 'gift',
    typeName: 'هدية عينية',
    amount: 1500,
    reason: 'إكمال 5 سنوات خدمة',
    date: '2024-02-10',
    approver: 'مدير العمليات',
    status: 'قيد المراجعة',
    reference: 'REW003'
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

// Form configuration for rewards
const rewardFormSections: FormSection[] = [
  {
    id: 'reward_details',
    title: 'تفاصيل المكافأة',
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
        name: 'rewardType',
        label: 'نوع المكافأة',
        type: 'select',
        options: rewardTypes.map(type => ({ value: type.id, label: type.name })),
        required: true,
        placeholder: 'اختر نوع المكافأة'
      },
      {
        name: 'rewardDate',
        label: 'تاريخ المكافأة',
        type: 'date',
        required: true
      },
      {
        name: 'amount',
        label: 'المبلغ (ريال)',
        type: 'number',
        placeholder: '5000',
        min: 0
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
        placeholder: 'اذكر سبب منح المكافأة...'
      },
      {
        name: 'attachments',
        label: 'المرفقات',
        type: 'attachment'
      }
    ]
  }
];

const rewardValidationRules: ValidationRules = {
  employee: { required: true, message: 'يرجى اختيار الموظف' },
  rewardType: { required: true, message: 'يرجى اختيار نوع المكافأة' },
  rewardDate: { required: true, message: 'يرجى تحديد تاريخ المكافأة' }
};

export function RewardsPage() {
  const [rewards, setRewards] = useState(mockRewards);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const filteredRewards = rewards.filter(reward =>
    reward.employeeName.includes(searchTerm) ||
    reward.employeeNumber.includes(searchTerm) ||
    reward.typeName.includes(searchTerm)
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
    const type = rewardTypes.find(t => t.id === typeId);
    return type?.color || 'bg-gray-100 text-gray-800';
  };

  const totalRewardValue = rewards
    .filter(r => r.status === 'معتمدة')
    .reduce((sum, r) => sum + r.amount, 0);

  const handleAddReward = async (formData: any) => {
    try {
      // Get employee details
      const selectedEmployee = employeeOptions.find(emp => emp.value === formData.employee);
      const selectedType = rewardTypes.find(type => type.id === formData.rewardType);
      
      if (!selectedEmployee || !selectedType) {
        throw new Error('Invalid employee or reward type');
      }

      // Create new reward record
      const newReward = {
        id: Date.now(), // In real app, this would come from backend
        employeeNumber: formData.employee,
        employeeName: selectedEmployee.label.split(' - ')[1],
        type: formData.rewardType,
        typeName: selectedType.name,
        amount: formData.amount || 0,
        reason: formData.notes || 'مكافأة',
        date: formData.rewardDate,
        approver: 'مدير الموارد البشرية',
        status: 'معتمدة',
        reference: formData.reference || `REW${Date.now()}`
      };

      // Add to state (with highlight effect)
      setRewards(prev => [newReward, ...prev]);
      
      // Close dialog
      setIsAddDialogOpen(false);
      
      // Show success message
      toast.success('تم حفظ المكافأة بنجاح');
      
      // Brief highlight effect (simulate real-time update)
      setTimeout(() => {
        const row = document.querySelector(`[data-reward-id="${newReward.id}"]`);
        if (row) {
          row.classList.add('bg-green-50');
          setTimeout(() => row.classList.remove('bg-green-50'), 1000);
        }
      }, 100);

    } catch (error) {
      console.error('Error saving reward:', error);
      toast.error('حدث خطأ أثناء حفظ المكافأة');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">إدارة المكافآت</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 ml-2" />
              إضافة مكافأة جديدة
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>منح مكافأة للموظف</DialogTitle>
              <DialogDescription>
                حدد نوع المكافأة وقيمتها وسبب منحها
              </DialogDescription>
            </DialogHeader>
            <UniversalForm
              title=""
              sections={rewardFormSections}
              validationRules={rewardValidationRules}
              onSubmit={handleAddReward}
              onCancel={() => setIsAddDialogOpen(false)}
              submitLabel="حفظ المكافأة"
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
                <p className="text-sm text-gray-600">إجمالي المكافآت</p>
                <p className="text-2xl font-semibold">{rewards.length}</p>
              </div>
              <Award className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">القيمة الإجمالية</p>
                <p className="text-2xl font-semibold text-green-600">{totalRewardValue.toLocaleString()} ريال</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        {rewardTypes.slice(0, 2).map((type) => {
          const count = rewards.filter(r => r.type === type.id).length;
          const Icon = type.icon;
          return (
            <Card key={type.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{type.name}</p>
                    <p className="text-2xl font-semibold">{count}</p>
                  </div>
                  <Icon className="w-8 h-8 text-blue-500" />
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
                placeholder="البحث بالموظف، رقم الموظف، أو نوع المكافأة..."
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
                {rewardTypes.map(type => (
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

      {/* Rewards Table */}
      <Card>
        <CardHeader>
          <CardTitle>سجل المكافآت</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">المرجع</TableHead>
                <TableHead className="text-right">رقم الموظف</TableHead>
                <TableHead className="text-right">اسم الموظف</TableHead>
                <TableHead className="text-right">نوع المكافأة</TableHead>
                <TableHead className="text-right">القيمة</TableHead>
                <TableHead className="text-right">السبب</TableHead>
                <TableHead className="text-right">التاريخ</TableHead>
                <TableHead className="text-right">المعتمد</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
                <TableHead className="text-right">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRewards.map((reward) => (
                <TableRow 
                  key={reward.id}
                  data-reward-id={reward.id}
                  className="transition-colors duration-1000"
                >
                  <TableCell className="font-medium">{reward.reference}</TableCell>
                  <TableCell className="font-medium">{reward.employeeNumber}</TableCell>
                  <TableCell>{reward.employeeName}</TableCell>
                  <TableCell>
                    <Badge className={getTypeBadge(reward.type)}>
                      {reward.typeName}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {reward.amount > 0 ? (
                      <span className="text-green-600 font-semibold">
                        {reward.amount.toLocaleString()} ريال
                      </span>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </TableCell>
                  <TableCell className="max-w-xs truncate">{reward.reason}</TableCell>
                  <TableCell>{new Date(reward.date).toLocaleDateString('ar-SA')}</TableCell>
                  <TableCell>{reward.approver}</TableCell>
                  <TableCell>
                    <Badge className={getStatusBadge(reward.status)}>
                      {reward.status}
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