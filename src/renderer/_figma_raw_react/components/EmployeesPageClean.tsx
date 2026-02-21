// This file is no longer needed - content moved to EmployeesPage.tsx
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from './ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { Sheet, SheetContent } from './ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Search, Plus, Edit, Trash2, Eye, Download, Phone, Mail, Calendar, User, Building, BookOpen, Star, Award, Plane, Clock, DollarSign, Trophy, FileText, MapPin, GraduationCap, Target, TrendingUp, X } from 'lucide-react';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { EmployeeDetailsDrawer } from './EmployeeDetailsDrawer';
import { toast } from "sonner@2.0.3";

const mockEmployees = [
  {
    id: 1,
    employeeNumber: 'EMP001',
    name: 'أحمد محمد علي',
    position: 'مطور أول',
    department: 'تقنية المعلومات',
    hireDate: '2020-01-15',
    phone: '0501234567',
    email: 'ahmed@company.com',
    status: 'نشط',
    photo: null,
    salary: 15000,
    grade: 'الدرجة الخامسة',
    nationalId: '1234567890',
    address: 'الرياض، المملكة العربية السعودية',
    courses: [
      { id: 1, name: 'React المتقدم', provider: 'معهد التقنية', date: '2023-06-15', result: 'ممتاز', grade: 95 },
      { id: 2, name: 'إدارة المشاريع', provider: 'جامعة الملك سعود', date: '2023-03-10', result: 'جيد جداً', grade: 88 },
      { id: 3, name: 'الأمن السيبراني', provider: 'أكاديمية التقنية', date: '2022-11-20', result: 'ممتاز', grade: 92 }
    ],
    evaluations: [
      { id: 1, evaluator: 'محمد الأحمد', period: '2023', score: 4.5, date: '2023-12-15', notes: 'أداء متميز' },
      { id: 2, evaluator: 'سارة الخالد', period: '2022', score: 4.2, date: '2022-12-15', notes: 'أداء جيد جداً' },
      { id: 3, evaluator: 'عبد الله السعد', period: '2021', score: 4.0, date: '2021-12-15', notes: 'أداء مرضي' }
    ],
    promotions: [
      { id: 1, type: 'ترقية', title: 'ترقية إلى مطور أول', date: '2023-01-15', amount: 2000, reason: 'تميز في الأداء' },
      { id: 2, type: 'مكافأة', title: 'مكافأة إنجاز المشروع', date: '2022-08-10', amount: 5000, reason: 'إنجاز مشروع بنجاح' }
    ],
    leaves: [
      { id: 1, type: 'إجازة سنوية', days: 15, startDate: '2023-07-01', endDate: '2023-07-15', status: 'مكتملة' },
      { id: 2, type: 'إجازة مرضية', days: 3, startDate: '2023-05-10', endDate: '2023-05-12', status: 'مكتملة' },
      { id: 3, type: 'إجازة سنوية', days: 7, startDate: '2023-12-25', endDate: '2023-12-31', status: 'معتمدة' }
    ],
    absences: [
      { id: 1, date: '2023-09-15', reason: 'ظروف طارئة', days: 1, approved: true },
      { id: 2, date: '2023-08-22', reason: 'مراجعة طبية', days: 0.5, approved: true }
    ],
    salaryDetails: {
      basicSalary: 12000,
      allowances: 2000,
      housing: 1000,
      transport: 500,
      experience: 800,
      overtime: 300,
      deductions: {
        insurance: 500,
        loans: 800,
        advances: 200
      }
    }
  },
  {
    id: 2,
    employeeNumber: 'EMP002',
    name: 'فاطمة عبد الله',
    position: 'محاسبة',
    department: 'المالية',
    hireDate: '2019-03-20',
    phone: '0509876543',
    email: 'fatima@company.com',
    status: 'نشط',
    photo: null,
    salary: 12000,
    grade: 'الدرجة الرابعة',
    nationalId: '0987654321',
    address: 'جدة، المملكة العربية السعودية',
    courses: [
      { id: 1, name: 'المحاسبة المتقدمة', provider: 'معهد المحاسبين', date: '2023-04-20', result: 'ممتاز', grade: 94 },
      { id: 2, name: 'التحليل المالي', provider: 'جامعة الملك عبدالعزيز', date: '2022-09-15', result: 'جيد جداً', grade: 87 }
    ],
    evaluations: [
      { id: 1, evaluator: 'أحمد الزهراني', period: '2023', score: 4.3, date: '2023-12-15', notes: 'دقة في العمل' },
      { id: 2, evaluator: 'نورا الشمري', period: '2022', score: 4.1, date: '2022-12-15', notes: 'التزام ممتاز' }
    ],
    promotions: [
      { id: 1, type: 'ترقية', title: 'ترقية إلى محاسبة أولى', date: '2022-03-20', amount: 1500, reason: 'خبرة وكفاءة' }
    ],
    leaves: [
      { id: 1, type: 'إجازة أمومة', days: 90, startDate: '2023-02-01', endDate: '2023-05-01', status: 'مكتملة' },
      { id: 2, type: 'إجازة سنوية', days: 10, startDate: '2023-09-01', endDate: '2023-09-10', status: 'مكتملة' }
    ],
    absences: [
      { id: 1, date: '2023-06-10', reason: 'ظروف عائلية', days: 1, approved: true }
    ],
    salaryDetails: {
      basicSalary: 10000,
      allowances: 1500,
      housing: 800,
      transport: 400,
      experience: 600,
      overtime: 0,
      deductions: {
        insurance: 400,
        loans: 0,
        advances: 150
      }
    }
  },
  {
    id: 3,
    employeeNumber: 'EMP003',
    name: 'خالد عبد الرحمن',
    position: 'مدير مشروع',
    department: 'العمليات',
    hireDate: '2018-07-10',
    phone: '0512345678',
    email: 'khalid@company.com',
    status: 'إجازة',
    photo: null,
    salary: 18000,
    grade: 'الدرجة السادسة',
    nationalId: '1122334455',
    address: 'الدمام، المملكة العربية السعودية',
    courses: [
      { id: 1, name: 'إدارة المشاريع الاحترافية', provider: 'معهد الإدارة', date: '2023-05-25', result: 'ممتاز', grade: 96 },
      { id: 2, name: 'القيادة والإدارة', provider: 'أكاديمية القيادة', date: '2022-12-10', result: 'ممتاز', grade: 91 },
      { id: 3, name: 'التخطيط الاستراتيجي', provider: 'جامعة الملك فهد', date: '2022-06-15', result: 'جيد جداً', grade: 89 }
    ],
    evaluations: [
      { id: 1, evaluator: 'عبدالرحمن القحطاني', period: '2023', score: 4.7, date: '2023-12-15', notes: 'قيادة متميزة' },
      { id: 2, evaluator: 'مريم الدوسري', period: '2022', score: 4.5, date: '2022-12-15', notes: 'إنجازات ممتازة' },
      { id: 3, evaluator: 'سعد المطيري', period: '2021', score: 4.3, date: '2021-12-15', notes: 'أداء قوي' }
    ],
    promotions: [
      { id: 1, type: 'ترقية', title: 'ترقية إلى مدير مشروع', date: '2021-07-10', amount: 3000, reason: 'خبرة وكفاءة إدارية' },
      { id: 2, type: 'مكافأة', title: 'مكافأة التميز السنوي', date: '2023-01-01', amount: 8000, reason: 'تميز في الأداء' },
      { id: 3, type: 'مكافأة', title: 'مكافأة إنجاز المشروع الكبير', date: '2022-11-15', amount: 6000, reason: 'إنجاز مشروع استراتيجي' }
    ],
    leaves: [
      { id: 1, type: 'إجازة سنوية', days: 21, startDate: '2023-08-01', endDate: '2023-08-21', status: 'مكتملة' },
      { id: 2, type: 'إجازة مرضية', days: 5, startDate: '2023-04-10', endDate: '2023-04-14', status: 'مكتملة' },
      { id: 3, type: 'إجازة سنوية', days: 14, startDate: '2024-01-15', endDate: '2024-01-28', status: 'معتمدة' }
    ],
    absences: [
      { id: 1, date: '2023-10-05', reason: 'ظروف طارئة', days: 1, approved: true },
      { id: 2, date: '2023-09-20', reason: 'مراجعة طبية', days: 0.5, approved: true },
      { id: 3, date: '2023-07-12', reason: 'ظروف عائلية', days: 1, approved: false }
    ],
    salaryDetails: {
      basicSalary: 15000,
      allowances: 2500,
      housing: 1200,
      transport: 600,
      experience: 1200,
      overtime: 400,
      deductions: {
        insurance: 600,
        loans: 1000,
        advances: 300
      }
    }
  }
];

export function EmployeesPage() {
  const [employees, setEmployees] = useState(mockEmployees);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deleteEmployeeId, setDeleteEmployeeId] = useState(null);

  const filteredEmployees = employees.filter(emp =>
    emp.name.includes(searchTerm) || 
    emp.employeeNumber.includes(searchTerm) ||
    emp.department.includes(searchTerm)
  );

  const getStatusBadge = (status: string) => {
    const variants = {
      'نشط': 'bg-green-100 text-green-800',
      'إجازة': 'bg-yellow-100 text-yellow-800',
      'متقاعد': 'bg-gray-100 text-gray-800'
    };
    return variants[status] || 'bg-gray-100 text-gray-800';
  };

  const handleViewEmployee = (employee: any) => {
    setSelectedEmployee(employee);
    setIsViewDialogOpen(true);
  };

  const handleEditEmployee = (employee: any) => {
    setSelectedEmployee(employee);
    setIsEditDialogOpen(true);
  };

  const handleDeleteEmployee = (employeeId: number) => {
    setDeleteEmployeeId(employeeId);
  };

  const confirmDelete = () => {
    if (deleteEmployeeId) {
      setEmployees(employees.filter(emp => emp.id !== deleteEmployeeId));
      setDeleteEmployeeId(null);
      toast.success('تم حذف الموظف بنجاح');
    }
  };

  const handleUpdateEmployee = (updatedEmployee: any) => {
    setEmployees(employees.map(emp => 
      emp.id === updatedEmployee.id ? updatedEmployee : emp
    ));
    setIsEditDialogOpen(false);
    setSelectedEmployee(null);
    toast.success('تم تحديث بيانات الموظف بنجاح');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">إدارة الموظفين</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 ml-2" />
              إضافة موظف جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>إضافة موظف جديد</DialogTitle>
              <DialogDescription>
                أدخل بيانات الموظف الجديد في النموذج أدناه
              </DialogDescription>
            </DialogHeader>
            <EmployeeForm onClose={() => setIsAddDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-reverse space-x-4">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="البحث بالاسم، رقم الموظف، أو القسم..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
            <Select>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="فلترة حسب القسم" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأقسام</SelectItem>
                <SelectItem value="it">تقنية المعلومات</SelectItem>
                <SelectItem value="finance">المالية</SelectItem>
                <SelectItem value="operations">العمليات</SelectItem>
                <SelectItem value="hr">الموارد البشرية</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="w-4 h-4 ml-2" />
              تصدير
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Employees Table */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة الموظفين ({filteredEmployees.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">الصورة</TableHead>
                <TableHead className="text-right">رقم الموظف</TableHead>
                <TableHead className="text-right">الاسم</TableHead>
                <TableHead className="text-right">المنصب</TableHead>
                <TableHead className="text-right">القسم</TableHead>
                <TableHead className="text-right">تاريخ التعيين</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
                <TableHead className="text-right">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell>
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={employee.photo} />
                      <AvatarFallback>{employee.name.split(' ')[0][0]}</AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="font-medium">{employee.employeeNumber}</TableCell>
                  <TableCell>{employee.name}</TableCell>
                  <TableCell>{employee.position}</TableCell>
                  <TableCell>{employee.department}</TableCell>
                  <TableCell>{new Date(employee.hireDate).toLocaleDateString('ar-SA')}</TableCell>
                  <TableCell>
                    <Badge className={getStatusBadge(employee.status)}>
                      {employee.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-reverse space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleViewEmployee(employee)}
                        title="عرض تفاصيل الموظف"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleEditEmployee(employee)}
                        title="تعديل بيانات الموظف"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-600 hover:text-red-700" 
                        onClick={() => handleDeleteEmployee(employee.id)}
                        title="حذف الموظف"
                      >
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

      {/* View Employee Drawer */}
      <Sheet open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <SheetContent 
          side="right" 
          className="w-[70vw] sm:w-[100vw] max-w-none p-0 overflow-hidden"
        >
          {selectedEmployee && (
            <EmployeeDetailsDrawer 
              employee={selectedEmployee} 
              onClose={() => setIsViewDialogOpen(false)} 
            />
          )}
        </SheetContent>
      </Sheet>

      {/* Edit Employee Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>تعديل بيانات الموظف</DialogTitle>
            <DialogDescription>
              قم بتعديل البيانات في النموذج أدناه
            </DialogDescription>
          </DialogHeader>
          {selectedEmployee && (
            <EmployeeEditForm 
              employee={selectedEmployee} 
              onSave={handleUpdateEmployee}
              onClose={() => setIsEditDialogOpen(false)} 
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteEmployeeId} onOpenChange={() => setDeleteEmployeeId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف هذا الموظف؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteEmployeeId(null)}>
              إلغاء
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function EmployeeForm({ onClose }: { onClose: () => void }) {
  return (
    <Tabs defaultValue="basic" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="basic">البيانات الأساسية</TabsTrigger>
        <TabsTrigger value="salary">الراتب</TabsTrigger>
        <TabsTrigger value="courses">الدورات</TabsTrigger>
        <TabsTrigger value="documents">المرفقات</TabsTrigger>
      </TabsList>

      <TabsContent value="basic" className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="employeeNumber">رقم الموظف</Label>
            <Input id="employeeNumber" placeholder="EMP001" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">الاسم الكامل</Label>
            <Input id="name" placeholder="أحمد محمد علي" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="position">المنصب</Label>
            <Input id="position" placeholder="مطور أول" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="department">القسم</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="اختر القسم" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="it">تقنية المعلومات</SelectItem>
                <SelectItem value="finance">المالية</SelectItem>
                <SelectItem value="operations">العمليات</SelectItem>
                <SelectItem value="hr">الموارد البشرية</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="salary" className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="basicSalary">الراتب الأساسي</Label>
            <Input id="basicSalary" type="number" placeholder="15000" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="allowances">البدلات</Label>
            <Input id="allowances" type="number" placeholder="2000" />
          </div>
        </div>
      </TabsContent>

      <TabsContent value="courses" className="space-y-4">
        <div className="text-center py-8">
          <p className="text-gray-500">سيتم إضافة الدورات بعد إنشاء الموظف</p>
        </div>
      </TabsContent>

      <TabsContent value="documents" className="space-y-4">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">اسحب وأفلت الملفات هنا أو</p>
          <Button variant="outline">اختيار الملفات</Button>
        </div>
      </TabsContent>

      <div className="flex justify-end space-x-reverse space-x-4 pt-4 border-t">
        <Button variant="outline" onClick={onClose}>إلغاء</Button>
        <Button className="bg-blue-600 hover:bg-blue-700">حفظ</Button>
      </div>
    </Tabs>
  );
}

function EmployeeEditForm({ employee, onSave, onClose }: { employee: any; onSave: (employee: any) => void; onClose: () => void }) {
  const [formData, setFormData] = useState({
    ...employee
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    onSave(formData);
  };

  // Helper function for status badge (needed in this component)
  const getStatusBadge = (status: string) => {
    const variants = {
      'نشط': 'bg-green-100 text-green-800',
      'إجازة': 'bg-yellow-100 text-yellow-800',
      'متقاعد': 'bg-gray-100 text-gray-800'
    };
    return variants[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Tabs defaultValue="basic" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="basic">البيانات الأساسية</TabsTrigger>
        <TabsTrigger value="salary">الراتب</TabsTrigger>
        <TabsTrigger value="courses">الدورات</TabsTrigger>
        <TabsTrigger value="documents">المرفقات</TabsTrigger>
      </TabsList>

      <TabsContent value="basic" className="space-y-4">
        <div className="flex items-center space-x-reverse space-x-4 p-4 bg-gray-50 rounded-lg mb-6">
          <Avatar className="w-16 h-16">
            <AvatarImage src={employee.photo} />
            <AvatarFallback className="text-lg">{employee.name.split(' ')[0][0]}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-xl font-medium">{employee.name}</h3>
            <p className="text-gray-600">{employee.position}</p>
            <Badge className={getStatusBadge(employee.status)}>
              {employee.status}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="employeeNumber">رقم الموظف</Label>
            <Input 
              id="employeeNumber" 
              value={formData.employeeNumber}
              onChange={(e) => handleInputChange('employeeNumber', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">الاسم الكامل</Label>
            <Input 
              id="name" 
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="position">المنصب</Label>
            <Input 
              id="position" 
              value={formData.position}
              onChange={(e) => handleInputChange('position', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="department">القسم</Label>
            <Input 
              id="department" 
              value={formData.department}
              onChange={(e) => handleInputChange('department', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">الهاتف</Label>
            <Input 
              id="phone" 
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">البريد الإلكتروني</Label>
            <Input 
              id="email" 
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
            />
          </div>
        </div>
      </TabsContent>

      <TabsContent value="salary" className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="salary">الراتب</Label>
            <Input 
              id="salary" 
              type="number" 
              value={formData.salary}
              onChange={(e) => handleInputChange('salary', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">الحالة</Label>
            <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="نشط">نشط</SelectItem>
                <SelectItem value="إجازة">إجازة</SelectItem>
                <SelectItem value="متقاعد">متقاعد</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="courses" className="space-y-4">
        <div className="text-center py-8">
          <p className="text-gray-500">إدارة الدورات التدريبية</p>
        </div>
      </TabsContent>

      <TabsContent value="documents" className="space-y-4">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">اسحب وأفلت الملفات هنا أو</p>
          <Button variant="outline">اختيار الملفات</Button>
        </div>
      </TabsContent>

      <div className="flex justify-end space-x-reverse space-x-4 pt-4 border-t">
        <Button variant="outline" onClick={onClose}>إلغاء</Button>
        <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">حفظ التغييرات</Button>
      </div>
    </Tabs>
  );
}