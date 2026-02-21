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
import { Search, Plus, Edit, Trash2, BookOpen, Award, BarChart3, Clock } from 'lucide-react';

const mockCourses = [
  {
    id: 1,
    employeeNumber: 'EMP001',
    employeeName: 'أحمد محمد علي',
    courseName: 'تطوير تطبيقات الويب المتقدمة',
    provider: 'معهد التقنية المتقدمة',
    startDate: '2024-01-15',
    endDate: '2024-02-15',
    duration: '30 ساعة',
    result: 'ممتاز',
    grade: 95,
    certificate: 'نعم'
  },
  {
    id: 2,
    employeeNumber: 'EMP002',
    employeeName: 'فاطمة عبد الله',
    courseName: 'إدارة المشاريع المالية',
    provider: 'الأكاديمية المالية',
    startDate: '2024-02-01',
    endDate: '2024-02-28',
    duration: '40 ساعة',
    result: 'جيد جداً',
    grade: 88,
    certificate: 'نعم'
  }
];

export function CoursesPage() {
  const [courses, setCourses] = useState(mockCourses);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const filteredCourses = courses.filter(course =>
    course.employeeName.includes(searchTerm) ||
    course.courseName.includes(searchTerm) ||
    course.provider.includes(searchTerm)
  );

  const getResultBadge = (result: string) => {
    const variants = {
      'ممتاز': 'bg-green-100 text-green-800',
      'جيد جداً': 'bg-blue-100 text-blue-800',
      'جيد': 'bg-yellow-100 text-yellow-800',
      'مقبول': 'bg-orange-100 text-orange-800',
      'راسب': 'bg-red-100 text-red-800'
    };
    return variants[result] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">إدارة الدورات التدريبية</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 ml-2" />
              إضافة دورة جديدة
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>إضافة دورة تدريبية جديدة</DialogTitle>
              <DialogDescription>
                أدخل بيانات الدورة التدريبية للموظف
              </DialogDescription>
            </DialogHeader>
            <CourseForm onClose={() => setIsAddDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-reverse space-x-4">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="البحث بالموظف، اسم الدورة، أو الجهة المنظمة..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
            <Select>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="فلترة حسب النتيجة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع النتائج</SelectItem>
                <SelectItem value="excellent">ممتاز</SelectItem>
                <SelectItem value="very-good">جيد جداً</SelectItem>
                <SelectItem value="good">جيد</SelectItem>
                <SelectItem value="acceptable">مقبول</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">إجمالي الدورات</p>
                <p className="text-2xl font-semibold">{courses.length}</p>
              </div>
              <BookOpen className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">الدورات المكتملة</p>
                <p className="text-2xl font-semibold text-green-600">{courses.filter(c => c.certificate === 'نعم').length}</p>
              </div>
              <Award className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">متوسط الدرجات</p>
                <p className="text-2xl font-semibold text-blue-600">
                  {Math.round(courses.reduce((sum, c) => sum + c.grade, 0) / courses.length)}%
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">إجمالي الساعات</p>
                <p className="text-2xl font-semibold text-purple-600">
                  {courses.reduce((sum, c) => sum + parseInt(c.duration), 0)} ساعة
                </p>
              </div>
              <Clock className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Courses Table */}
      <Card>
        <CardHeader>
          <CardTitle>سجل الدورات التدريبية</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">رقم الموظف</TableHead>
                <TableHead className="text-right">اسم الموظف</TableHead>
                <TableHead className="text-right">اسم الدورة</TableHead>
                <TableHead className="text-right">الجهة المنظمة</TableHead>
                <TableHead className="text-right">التاريخ</TableHead>
                <TableHead className="text-right">المدة</TableHead>
                <TableHead className="text-right">النتيجة</TableHead>
                <TableHead className="text-right">الدرجة</TableHead>
                <TableHead className="text-right">الشهادة</TableHead>
                <TableHead className="text-right">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCourses.map((course) => (
                <TableRow key={course.id}>
                  <TableCell className="font-medium">{course.employeeNumber}</TableCell>
                  <TableCell>{course.employeeName}</TableCell>
                  <TableCell>{course.courseName}</TableCell>
                  <TableCell>{course.provider}</TableCell>
                  <TableCell>
                    {new Date(course.startDate).toLocaleDateString('ar-SA')} - {' '}
                    {new Date(course.endDate).toLocaleDateString('ar-SA')}
                  </TableCell>
                  <TableCell>{course.duration}</TableCell>
                  <TableCell>
                    <Badge className={getResultBadge(course.result)}>
                      {course.result}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-semibold">{course.grade}%</TableCell>
                  <TableCell>
                    {course.certificate === 'نعم' ? (
                      <Badge className="bg-green-100 text-green-800">متوفرة</Badge>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-800">غير متوفرة</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-reverse space-x-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                        <Trash2 className="w-4 h-4" />
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

function CourseForm({ onClose }: { onClose: () => void }) {
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
          <Label>اسم الدورة</Label>
          <Input placeholder="دورة إدارة المشاريع" />
        </div>
        <div className="space-y-2">
          <Label>الجهة المنظمة</Label>
          <Input placeholder="معهد الإدارة العامة" />
        </div>
        <div className="space-y-2">
          <Label>المدة (بالساعات)</Label>
          <Input type="number" placeholder="30" />
        </div>
        <div className="space-y-2">
          <Label>تاريخ البداية</Label>
          <Input type="date" />
        </div>
        <div className="space-y-2">
          <Label>تاريخ النهاية</Label>
          <Input type="date" />
        </div>
        <div className="space-y-2">
          <Label>النتيجة</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="اختر النتيجة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="excellent">ممتاز</SelectItem>
              <SelectItem value="very-good">جيد جداً</SelectItem>
              <SelectItem value="good">جيد</SelectItem>
              <SelectItem value="acceptable">مقبول</SelectItem>
              <SelectItem value="fail">راسب</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>الدرجة (%)</Label>
          <Input type="number" min="0" max="100" placeholder="85" />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label>ملاحظات</Label>
        <Input placeholder="أي ملاحظات إضافية..." />
      </div>

      <div className="flex justify-end space-x-reverse space-x-4 pt-4 border-t">
        <Button variant="outline" onClick={onClose}>إلغاء</Button>
        <Button className="bg-blue-600 hover:bg-blue-700">حفظ الدورة</Button>
      </div>
    </div>
  );
}