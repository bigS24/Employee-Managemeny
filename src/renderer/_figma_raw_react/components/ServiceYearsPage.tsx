import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Search, Plus, Edit, Clock, Award, Calendar } from 'lucide-react';

const serviceCategories = [
  { id: 'new', name: 'موظف جديد', min: 0, max: 1, color: 'bg-blue-100 text-blue-800' },
  { id: 'junior', name: 'موظف', min: 1, max: 5, color: 'bg-green-100 text-green-800' },
  { id: 'senior', name: 'موظف أقدم', min: 5, max: 10, color: 'bg-yellow-100 text-yellow-800' },
  { id: 'veteran', name: 'موظف مخضرم', min: 10, max: 20, color: 'bg-orange-100 text-orange-800' },
  { id: 'expert', name: 'خبير', min: 20, max: 100, color: 'bg-purple-100 text-purple-800' }
];

const mockServiceRecords = [
  {
    id: 1,
    employeeNumber: 'EMP001',
    employeeName: 'أحمد محمد علي',
    startDate: '2020-01-15',
    endDate: null,
    currentPosition: 'مطور أول',
    years: 4,
    months: 2,
    days: 10,
    totalDays: 1526,
    category: 'junior',
    status: 'نشط'
  },
  {
    id: 2,
    employeeNumber: 'EMP002',
    employeeName: 'فاطمة عبد الله',
    startDate: '2019-03-20',
    endDate: null,
    currentPosition: 'محاسبة',
    years: 4,
    months: 11,
    days: 5,
    totalDays: 1791,
    category: 'junior',
    status: 'نشط'
  },
  {
    id: 3,
    employeeNumber: 'EMP003',
    employeeName: 'خالد عبد الرحمن',
    startDate: '2018-07-10',
    endDate: '2023-07-10',
    currentPosition: 'مدير مشروع سابق',
    years: 5,
    months: 0,
    days: 0,
    totalDays: 1826,
    category: 'senior',
    status: 'متقاعد'
  }
];

export function ServiceYearsPage() {
  const [serviceRecords, setServiceRecords] = useState(mockServiceRecords);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const filteredRecords = serviceRecords.filter(record =>
    record.employeeName.includes(searchTerm) ||
    record.employeeNumber.includes(searchTerm) ||
    record.currentPosition.includes(searchTerm)
  );

  const getServiceCategory = (years: number) => {
    return serviceCategories.find(cat => years >= cat.min && years < cat.max) || serviceCategories[0];
  };

  const getCategoryBadge = (years: number) => {
    const category = getServiceCategory(years);
    return category.color;
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      'نشط': 'bg-green-100 text-green-800',
      'متقاعد': 'bg-gray-100 text-gray-800',
      'مستقيل': 'bg-red-100 text-red-800'
    };
    return variants[status] || 'bg-gray-100 text-gray-800';
  };

  const calculateService = (startDate: string, endDate?: string | null) => {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    
    const diffTime = end.getTime() - start.getTime();
    const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    const years = Math.floor(totalDays / 365);
    const months = Math.floor((totalDays % 365) / 30);
    const days = totalDays % 30;
    
    return { years, months, days, totalDays };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">سنوات الخدمة</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 ml-2" />
              إضافة سجل خدمة
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>إضافة سجل سنوات خدمة</DialogTitle>
              <DialogDescription>
                أدخل تواريخ الخدمة لحساب سنوات الخدمة تلقائياً
              </DialogDescription>
            </DialogHeader>
            <ServiceForm onClose={() => setIsAddDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Service Categories */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {serviceCategories.map((category) => {
          const count = serviceRecords.filter(r => {
            const categoryMatch = getServiceCategory(r.years);
            return categoryMatch.id === category.id;
          }).length;
          
          return (
            <Card key={category.id}>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mb-2 ${category.color}`}>
                    {category.name}
                  </div>
                  <p className="text-xs text-gray-600 mb-2">
                    {category.min}-{category.max === 100 ? '+' : category.max} سنة
                  </p>
                  <p className="text-2xl font-bold">{count}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">متوسط سنوات الخدمة</p>
                <p className="text-2xl font-semibold text-blue-600">
                  {(serviceRecords.reduce((sum, r) => sum + r.years, 0) / serviceRecords.length).toFixed(1)} سنة
                </p>
              </div>
              <Clock className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">الموظفون النشطون</p>
                <p className="text-2xl font-semibold text-green-600">
                  {serviceRecords.filter(r => r.status === 'نشط').length}
                </p>
              </div>
              <Award className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">إجمالي أيام الخدمة</p>
                <p className="text-2xl font-semibold text-purple-600">
                  {serviceRecords.reduce((sum, r) => sum + r.totalDays, 0).toLocaleString()}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-purple-500" />
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
                placeholder="البحث بالموظف، رقم الموظف، أو المنصب..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
            <Select>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="فلترة حسب الفئة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الفئات</SelectItem>
                {serviceCategories.map(category => (
                  <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                <SelectItem value="active">نشط</SelectItem>
                <SelectItem value="retired">متقاعد</SelectItem>
                <SelectItem value="resigned">مستقيل</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Service Records Table */}
      <Card>
        <CardHeader>
          <CardTitle>سجل سنوات الخدمة</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">رقم الموظف</TableHead>
                <TableHead className="text-right">اسم الموظف</TableHead>
                <TableHead className="text-right">المنصب</TableHead>
                <TableHead className="text-right">تاريخ البداية</TableHead>
                <TableHead className="text-right">تاريخ النهاية</TableHead>
                <TableHead className="text-right">سنوات الخدمة</TableHead>
                <TableHead className="text-right">الفئة</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
                <TableHead className="text-right">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.map((record) => {
                const category = getServiceCategory(record.years);
                return (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">{record.employeeNumber}</TableCell>
                    <TableCell>{record.employeeName}</TableCell>
                    <TableCell>{record.currentPosition}</TableCell>
                    <TableCell>{new Date(record.startDate).toLocaleDateString('ar-SA')}</TableCell>
                    <TableCell>
                      {record.endDate ? new Date(record.endDate).toLocaleDateString('ar-SA') : 'مستمر'}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-semibold">
                          {record.years} سنة، {record.months} شهر، {record.days} يوم
                        </div>
                        <div className="text-gray-500">
                          ({record.totalDays.toLocaleString()} يوم إجمالي)
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getCategoryBadge(record.years)}>
                        {category.name}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusBadge(record.status)}>
                        {record.status}
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
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function ServiceForm({ onClose }: { onClose: () => void }) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isActive, setIsActive] = useState(true);

  const calculateService = () => {
    if (!startDate) return null;
    
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    
    const diffTime = end.getTime() - start.getTime();
    const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    const years = Math.floor(totalDays / 365);
    const months = Math.floor((totalDays % 365) / 30);
    const days = totalDays % 30;
    
    return { years, months, days, totalDays };
  };

  const serviceCalculation = calculateService();

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>اختيار الموظف</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="اختر الموظف" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="EMP001">EMP001 - أحمد محمد علي</SelectItem>
              <SelectItem value="EMP002">EMP002 - فاطمة عبد الله</SelectItem>
              <SelectItem value="EMP003">EMP003 - خالد عبد الرحمن</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>المنصب الحالي</Label>
          <Input placeholder="مطور أول" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>تاريخ بداية الخدمة</Label>
          <Input 
            type="date" 
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>تاريخ نهاية الخدمة (اختياري)</Label>
          <Input 
            type="date" 
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            disabled={isActive}
          />
        </div>
      </div>

      <div className="flex items-center space-x-reverse space-x-2">
        <input
          type="checkbox"
          id="isActive"
          checked={isActive}
          onChange={(e) => {
            setIsActive(e.target.checked);
            if (e.target.checked) {
              setEndDate('');
            }
          }}
          className="rounded"
        />
        <Label htmlFor="isActive">موظف نشط (لا يزال يعمل)</Label>
      </div>

      <div className="space-y-2">
        <Label>حالة الموظف</Label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="اختر الحالة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">نشط</SelectItem>
            <SelectItem value="retired">متقاعد</SelectItem>
            <SelectItem value="resigned">مستقيل</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {serviceCalculation && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-3">حساب سنوات الخدمة</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">سنوات الخدمة:</p>
              <p className="text-lg font-semibold text-blue-600">
                {serviceCalculation.years} سنة، {serviceCalculation.months} شهر، {serviceCalculation.days} يوم
              </p>
            </div>
            <div>
              <p className="text-gray-600">إجمالي الأيام:</p>
              <p className="text-lg font-semibold text-blue-600">
                {serviceCalculation.totalDays.toLocaleString()} يوم
              </p>
            </div>
          </div>
          <div className="mt-3">
            <p className="text-gray-600">الفئة:</p>
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mt-1 ${getCategoryBadge(serviceCalculation.years)}`}>
              {getServiceCategory(serviceCalculation.years).name}
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-end space-x-reverse space-x-4 pt-4 border-t">
        <Button variant="outline" onClick={onClose}>إلغاء</Button>
        <Button className="bg-blue-600 hover:bg-blue-700">حفظ السجل</Button>
      </div>
    </div>
  );
}

function getServiceCategory(years: number) {
  return serviceCategories.find(cat => years >= cat.min && years < cat.max) || serviceCategories[0];
}

function getCategoryBadge(years: number) {
  const category = getServiceCategory(years);
  return category.color;
}