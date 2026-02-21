import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from './ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Search, Plus, Edit, Trash2, Eye, Download, Calendar, BookOpen, User, Award, Target, TrendingUp } from 'lucide-react';
import { ProfessionalTable, createActionButtons } from './ProfessionalTable';
import { UniversalForm, FormSection } from './UniversalForm';
import { ValidationRules, commonRules } from './FormValidation';
import { toast } from "sonner@2.0.3";

const mockCourses = [
  {
    id: 1,
    employeeName: 'أحمد محمد علي',
    employeeNumber: 'EMP001',
    courseName: 'React المتقدم',
    provider: 'معهد التقنية',
    startDate: '2023-06-01',
    endDate: '2023-06-15',
    result: 'ممتاز',
    grade: 95,
    status: 'مكتمل',
    certificate: 'شهادة تقنية.pdf',
    cost: 2500,
    category: 'تقنية',
    description: 'دورة متقدمة في React وأحدث التقنيات',
    location: 'أونلاين',
    instructor: 'د. محمد أحمد'
  },
  {
    id: 2,
    employeeName: 'فاطمة عبد الله',
    employeeNumber: 'EMP002',
    courseName: 'المحاسبة المتقدمة',
    provider: 'معهد المحاسبين',
    startDate: '2023-04-15',
    endDate: '2023-04-20',
    result: 'ممتاز',
    grade: 94,
    status: 'مكتمل',
    certificate: 'شهادة محاسبة.pdf',
    cost: 3000,
    category: 'مالية',
    description: 'دورة في المحاسبة المتقدمة والتحليل المالي',
    location: 'الرياض',
    instructor: 'أ. سارة الخالد'
  },
  {
    id: 3,
    employeeName: 'خالد عبد الرحمن',
    employeeNumber: 'EMP003',
    courseName: 'إدارة المشاريع الاحترافية',
    provider: 'معهد الإدارة',
    startDate: '2023-05-20',
    endDate: '2023-05-25',
    result: 'ممتاز',
    grade: 96,
    status: 'مكتمل',
    certificate: 'شهادة إدارة.pdf',
    cost: 4000,
    category: 'إدارة',
    description: 'دورة احترافية في إدارة المشاريع حسب معايير PMI',
    location: 'جدة',
    instructor: 'د. عبدالله المطيري'
  },
  {
    id: 4,
    employeeName: 'سارة أحمد',
    employeeNumber: 'EMP004',
    courseName: 'الأمن السيبراني',
    provider: 'أكاديمية التقنية',
    startDate: '2023-07-01',
    endDate: '2023-07-10',
    result: 'في التقدم',
    grade: null,
    status: 'جاري',
    certificate: null,
    cost: 3500,
    category: 'تقنية',
    description: 'دورة شاملة في أساسيات الأمن السيبراني',
    location: 'الدمام',
    instructor: 'م. أحمد الزهراني'
  }
];

export function CoursesPage() {
  const [courses, setCourses] = useState(mockCourses);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deleteCourseId, setDeleteCourseId] = useState(null);

  const filteredCourses = courses.filter(course =>
    course.employeeName.includes(searchTerm) || 
    course.employeeNumber.includes(searchTerm) ||
    course.courseName.includes(searchTerm) ||
    course.provider.includes(searchTerm)
  );

  const getStatusBadge = (status: string) => {
    const variants = {
      'مكتمل': 'bg-green-100 text-green-800',
      'جاري': 'bg-blue-100 text-blue-800',
      'ملغي': 'bg-red-100 text-red-800',
      'مؤجل': 'bg-yellow-100 text-yellow-800'
    };
    return variants[status] || 'bg-gray-100 text-gray-800';
  };

  const getResultBadge = (result: string) => {
    const variants = {
      'ممتاز': 'bg-green-100 text-green-800',
      'جيد جداً': 'bg-blue-100 text-blue-800',
      'جيد': 'bg-yellow-100 text-yellow-800',
      'مقبول': 'bg-orange-100 text-orange-800',
      'راسب': 'bg-red-100 text-red-800',
      'في التقدم': 'bg-gray-100 text-gray-800'
    };
    return variants[result] || 'bg-gray-100 text-gray-800';
  };

  const handleViewCourse = (course: any) => {
    setSelectedCourse(course);
    setIsViewDialogOpen(true);
  };

  const handleEditCourse = (course: any) => {
    setSelectedCourse(course);
    setIsEditDialogOpen(true);
  };

  const handleDeleteCourse = (courseId: number) => {
    setDeleteCourseId(courseId);
  };

  const confirmDelete = () => {
    if (deleteCourseId) {
      setCourses(courses.filter(course => course.id !== deleteCourseId));
      setDeleteCourseId(null);
      toast.success('تم حذف الدورة بنجاح');
    }
  };

  const handleAddCourse = (courseData: any) => {
    const newCourse = {
      ...courseData,
      id: Math.max(...courses.map(c => c.id)) + 1
    };
    setCourses([...courses, newCourse]);
    setIsAddDialogOpen(false);
    toast.success('تم إضافة الدورة بنجاح');
  };

  const handleUpdateCourse = (courseData: any) => {
    setCourses(courses.map(course => 
      course.id === selectedCourse?.id ? { ...courseData, id: selectedCourse.id } : course
    ));
    setIsEditDialogOpen(false);
    setSelectedCourse(null);
    toast.success('تم تحديث الدورة بنجاح');
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
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>إضافة دورة تدريبية جديدة</DialogTitle>
              <DialogDescription>
                قم بملء البيانات المطلوبة لإضافة دورة تدريبية جديدة للموظف
              </DialogDescription>
            </DialogHeader>
            <CourseForm onSave={handleAddCourse} onClose={() => setIsAddDialogOpen(false)} />
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
                placeholder="البحث بالموظف، الدورة، أو مقدم التدريب..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
            <Select>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="فلترة حسب الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="completed">مكتمل</SelectItem>
                <SelectItem value="ongoing">جاري</SelectItem>
                <SelectItem value="cancelled">ملغي</SelectItem>
                <SelectItem value="postponed">مؤجل</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Download className="w-4 h-4 ml-2" />
              تصدير
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Courses Table */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة الدورات التدريبية ({filteredCourses.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ProfessionalTable
            columns={[
              { 
                key: 'employeeName', 
                label: 'اسم الموظف', 
                width: '180px',
                render: (value, course) => (
                  <div>
                    <p className="font-medium">{value}</p>
                    <p className="text-sm text-gray-500">{course.employeeNumber}</p>
                  </div>
                )
              },
              { key: 'courseName', label: 'اسم الدورة', width: '200px' },
              { key: 'provider', label: 'مقدم التدريب', width: '150px' },
              { 
                key: 'duration', 
                label: 'المدة', 
                width: '120px',
                render: (_, course) => `${course.startDate} - ${course.endDate}`
              },
              { 
                key: 'result', 
                label: 'النتيجة', 
                width: '120px', 
                align: 'center',
                render: (value) => value ? (
                  <Badge className={getResultBadge(value)}>
                    {value}
                  </Badge>
                ) : '-'
              },
              { 
                key: 'grade', 
                label: 'الدرجة', 
                width: '80px', 
                align: 'center',
                render: (value) => value ? `${value}%` : '-'
              },
              { 
                key: 'status', 
                label: 'الحالة', 
                width: '100px', 
                align: 'center',
                render: (value) => (
                  <Badge className={getStatusBadge(value)}>
                    {value}
                  </Badge>
                )
              },
              { 
                key: 'actions', 
                label: 'الإجراءات', 
                width: '120px', 
                align: 'center',
                render: (_, course) => {
                  const actions = [
                    {
                      icon: <Eye className="w-4 h-4" />,
                      onClick: () => handleViewCourse(course),
                      title: 'عرض تفاصيل الدورة'
                    },
                    {
                      icon: <Edit className="w-4 h-4" />,
                      onClick: () => handleEditCourse(course),
                      title: 'تعديل الدورة'
                    },
                    {
                      icon: <Trash2 className="w-4 h-4" />,
                      onClick: () => handleDeleteCourse(course.id),
                      title: 'حذف الدورة',
                      className: 'text-red-600 hover:text-red-700'
                    }
                  ];
                  
                  return createActionButtons(actions);
                }
              }
            ]}
            data={filteredCourses}
          />
        </CardContent>
      </Card>

      {/* View Course Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>تفاصيل الدورة التدريبية</DialogTitle>
            <DialogDescription>
              عرض تفاصيل شاملة عن الدورة التدريبية والنتائج المحققة
            </DialogDescription>
          </DialogHeader>
          {selectedCourse && <CourseDetails course={selectedCourse} />}
        </DialogContent>
      </Dialog>

      {/* Edit Course Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>تعديل الدورة التدريبية</DialogTitle>
            <DialogDescription>
              تعديل بيانات الدورة التدريبية والمرفقات المتعلقة بها
            </DialogDescription>
          </DialogHeader>
          {selectedCourse && (
            <CourseForm 
              initialData={selectedCourse}
              onSave={handleUpdateCourse}
              onClose={() => setIsEditDialogOpen(false)} 
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteCourseId} onOpenChange={() => setDeleteCourseId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من حذف هذه الدورة؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteCourseId(null)}>
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

function CourseForm({ initialData, onSave, onClose }: { initialData?: any; onSave: (data: any) => void; onClose: () => void }) {
  const sections: FormSection[] = [
    {
      id: 'basic',
      title: 'بيانات الدورة',
      icon: <BookOpen className="w-4 h-4" />,
      fields: [
        {
          name: 'employeeName',
          label: 'اسم الموظف',
          type: 'select',
          placeholder: 'اختر الموظف',
          required: true,
          options: [
            { value: 'أحمد محمد علي - EMP001', label: 'أحمد محمد علي - EMP001' },
            { value: 'فاطمة عبد الله - EMP002', label: 'فاطمة عبد الله - EMP002' },
            { value: 'خالد عبد الرحمن - EMP003', label: 'خالد عبد الرحمن - EMP003' },
            { value: 'سارة أحمد - EMP004', label: 'سارة أحمد - EMP004' }
          ]
        },
        {
          name: 'courseName',
          label: 'اسم الدورة',
          type: 'text',
          placeholder: 'React المتقدم',
          required: true
        },
        {
          name: 'provider',
          label: 'مقدم التدريب',
          type: 'text',
          placeholder: 'معهد التقنية',
          required: true
        },
        {
          name: 'instructor',
          label: 'اسم المدرب',
          type: 'text',
          placeholder: 'د. محمد أحمد'
        },
        {
          name: 'category',
          label: 'فئة الدورة',
          type: 'select',
          placeholder: 'اختر الفئة',
          options: [
            { value: 'تقنية', label: 'تقنية' },
            { value: 'مالية', label: 'مالية' },
            { value: 'إدارة', label: 'إدارة' },
            { value: 'موارد بشرية', label: 'موارد بشرية' },
            { value: 'تسويق', label: 'تسويق' },
            { value: 'أخرى', label: 'أخرى' }
          ]
        },
        {
          name: 'location',
          label: 'موقع التدريب',
          type: 'text',
          placeholder: 'الرياض / أونلاين'
        }
      ]
    },
    {
      id: 'schedule',
      title: 'ال��واعيد والتكلفة',
      icon: <Calendar className="w-4 h-4" />,
      fields: [
        {
          name: 'startDate',
          label: 'تاريخ البداية',
          type: 'date',
          required: true
        },
        {
          name: 'endDate',
          label: 'تاريخ النهاية',
          type: 'date',
          required: true
        },
        {
          name: 'cost',
          label: 'التكلفة (ريال)',
          type: 'number',
          placeholder: '2500',
          min: 0
        },
        {
          name: 'status',
          label: 'حالة الدورة',
          type: 'select',
          options: [
            { value: 'مخطط', label: 'مخطط' },
            { value: 'جاري', label: 'جاري' },
            { value: 'مكتمل', label: 'مكتمل' },
            { value: 'ملغي', label: 'ملغي' },
            { value: 'مؤجل', label: 'مؤجل' }
          ]
        },
        {
          name: 'description',
          label: 'وصف الدورة',
          type: 'textarea',
          placeholder: 'وصف مختصر عن محتوى الدورة...'
        }
      ]
    },
    {
      id: 'results',
      title: 'النتائج',
      icon: <Award className="w-4 h-4" />,
      fields: [
        {
          name: 'result',
          label: 'النتيجة',
          type: 'select',
          options: [
            { value: 'ممتاز', label: 'ممتاز' },
            { value: 'جيد جداً', label: 'جيد جداً' },
            { value: 'جيد', label: 'جيد' },
            { value: 'مقبول', label: 'مقبول' },
            { value: 'راسب', label: 'راسب' },
            { value: 'في التقدم', label: 'في التقدم' }
          ]
        },
        {
          name: 'grade',
          label: 'الدرجة (%)',
          type: 'number',
          min: 0,
          max: 100
        }
      ]
    },
    {
      id: 'attachments',
      title: 'المرفقات',
      icon: <Target className="w-4 h-4" />,
      fields: [
        {
          name: 'certificate',
          label: 'شهادة الدورة',
          type: 'attachment'
        },
        {
          name: 'materials',
          label: 'مواد التدريب',
          type: 'attachment'
        },
        {
          name: 'evaluation',
          label: 'تقييم الدورة',
          type: 'attachment'
        }
      ]
    }
  ];

  const validationRules: ValidationRules = {
    employeeName: commonRules.required,
    courseName: commonRules.required,
    provider: commonRules.required,
    startDate: commonRules.required,
    endDate: commonRules.required,
    cost: { min: 0 },
    grade: { min: 0, max: 100 }
  };

  const defaultData = {
    employeeName: '',
    courseName: '',
    provider: '',
    instructor: '',
    category: '',
    location: '',
    startDate: '',
    endDate: '',
    cost: 0,
    status: 'مخطط',
    description: '',
    result: 'في التقدم',
    grade: null,
    ...initialData
  };

  return (
    <UniversalForm
      title={initialData ? "تعديل الدورة التدريبية" : "إضافة دورة تدريبية جديدة"}
      sections={sections}
      validationRules={validationRules}
      initialData={defaultData}
      onSubmit={onSave}
      onCancel={onClose}
      submitLabel={initialData ? "حفظ التغييرات" : "إضافة الدورة"}
    />
  );
}

function CourseDetails({ course }: { course: any }) {
  const getResultBadge = (result: string) => {
    const variants = {
      'ممتاز': 'bg-green-100 text-green-800',
      'جيد جداً': 'bg-blue-100 text-blue-800',
      'جيد': 'bg-yellow-100 text-yellow-800',
      'مقبول': 'bg-orange-100 text-orange-800',
      'راسب': 'bg-red-100 text-red-800',
      'في التقدم': 'bg-gray-100 text-gray-800'
    };
    return variants[result] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-600">اسم الموظف</label>
            <p className="font-medium">{course.employeeName}</p>
            <p className="text-sm text-gray-500">{course.employeeNumber}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600">اسم الدورة</label>
            <p className="font-medium">{course.courseName}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600">مقدم التدريب</label>
            <p className="font-medium">{course.provider}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600">المدرب</label>
            <p className="font-medium">{course.instructor}</p>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-600">المدة</label>
            <p className="font-medium">{course.startDate} - {course.endDate}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600">النتيجة</label>
            <Badge className={getResultBadge(course.result)}>
              {course.result || 'في التقدم'}
            </Badge>
          </div>
          <div>
            <label className="text-sm text-gray-600">الدرجة</label>
            <p className="font-medium">{course.grade ? `${course.grade}%` : '-'}</p>
          </div>
          <div>
            <label className="text-sm text-gray-600">التكلفة</label>
            <p className="font-medium">{course.cost?.toLocaleString()} ريال</p>
          </div>
        </div>
      </div>
      
      {course.description && (
        <div>
          <label className="text-sm text-gray-600">وصف الدورة</label>
          <p className="mt-1">{course.description}</p>
        </div>
      )}
      
      {course.certificate && (
        <div className="p-4 bg-gray-50 rounded-lg">
          <label className="text-sm text-gray-600">الشهادة</label>
          <div className="flex items-center space-x-reverse space-x-2 mt-2">
            <Award className="w-5 h-5 text-yellow-600" />
            <span className="font-medium">{course.certificate}</span>
            <Button variant="ghost" size="sm">
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}