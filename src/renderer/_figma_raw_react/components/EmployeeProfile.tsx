import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Separator } from './ui/separator';
import { ProfessionalTable } from './ProfessionalTable';
import { DualCurrencyDisplay, InlineDualCurrencyDisplay } from './DualCurrencyDisplay';
import { CurrencyToggle } from './CurrencyToggle';
import { 
  ArrowRight, 
  User, 
  BookOpen, 
  Star, 
  Award, 
  TrendingUp, 
  Plane, 
  Clock, 
  DollarSign, 
  Trophy,
  Phone,
  Mail,
  Calendar,
  Building,
  MapPin,
  GraduationCap,
  Target,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

interface EmployeeProfileProps {
  employee: any;
  onBack: () => void;
}

export function EmployeeProfile({ employee, onBack }: EmployeeProfileProps) {
  const [activeTab, setActiveTab] = useState('basic');

  const getStatusBadge = (status: string) => {
    const variants = {
      'نشط': 'bg-green-100 text-green-800 border border-green-200',
      'إجازة': 'bg-yellow-100 text-yellow-800 border border-yellow-200',
      'متقاعد': 'bg-gray-100 text-gray-800 border border-gray-200'
    };
    return variants[status] || 'bg-gray-100 text-gray-800 border border-gray-200';
  };

  const getServiceYears = () => {
    const hireDate = new Date(employee.hireDate);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - hireDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const years = Math.floor(diffDays / 365);
    const months = Math.floor((diffDays % 365) / 30);
    const days = diffDays % 30;

    return { years, months, days, totalDays: diffDays };
  };

  const serviceTime = getServiceYears();

  const totalSalary = employee.salaryDetails ? 
    employee.salaryDetails.basicSalary + 
    employee.salaryDetails.allowances + 
    employee.salaryDetails.housing + 
    employee.salaryDetails.transport + 
    employee.salaryDetails.experience + 
    employee.salaryDetails.overtime : 
    employee.salary;

  const totalDeductions = employee.salaryDetails ? 
    employee.salaryDetails.deductions.insurance + 
    employee.salaryDetails.deductions.loans + 
    employee.salaryDetails.deductions.advances : 
    0;

  const netSalary = totalSalary - totalDeductions;

  const totalLeaveDays = employee.leaves?.reduce((total: number, leave: any) => total + leave.days, 0) || 0;
  const totalAbsenceDays = employee.absences?.reduce((total: number, absence: any) => total + absence.days, 0) || 0;

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-reverse space-x-6">
              <Avatar className="w-20 h-20 border-4 border-white shadow-lg">
                <AvatarImage src={employee.photo} />
                <AvatarFallback className="text-2xl bg-blue-100 text-blue-600">
                  {employee.name.split(' ')[0][0]}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <h1 className="text-3xl font-semibold text-gray-900">{employee.name}</h1>
                <div className="flex items-center space-x-reverse space-x-4 text-gray-600">
                  <span className="font-medium">رقم الموظف: {employee.employeeNumber}</span>
                  <Separator orientation="vertical" className="h-4" />
                  <span>{employee.position}</span>
                  <Separator orientation="vertical" className="h-4" />
                  <span>{employee.department}</span>
                </div>
                <Badge className={getStatusBadge(employee.status)}>
                  {employee.status}
                </Badge>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={onBack}
              className="flex items-center space-x-reverse space-x-2"
            >
              <ArrowRight className="w-4 h-4" />
              <span>العودة لقائمة الموظفين</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-[88px] z-10">
        <div className="max-w-7xl mx-auto px-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="h-12 bg-transparent rounded-none border-0 p-0 space-x-reverse space-x-8">
              <TabsTrigger 
                value="basic" 
                className="flex items-center space-x-reverse space-x-2 h-12 px-4 border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent rounded-none"
              >
                <User className="w-4 h-4" />
                <span>البيانات الأساسية</span>
              </TabsTrigger>
              <TabsTrigger 
                value="courses" 
                className="flex items-center space-x-reverse space-x-2 h-12 px-4 border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent rounded-none"
              >
                <BookOpen className="w-4 h-4" />
                <span>الدورات</span>
              </TabsTrigger>
              <TabsTrigger 
                value="evaluations" 
                className="flex items-center space-x-reverse space-x-2 h-12 px-4 border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent rounded-none"
              >
                <Star className="w-4 h-4" />
                <span>التقييمات</span>
              </TabsTrigger>
              <TabsTrigger 
                value="promotions" 
                className="flex items-center space-x-reverse space-x-2 h-12 px-4 border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent rounded-none"
              >
                <TrendingUp className="w-4 h-4" />
                <span>المكافآت والترقيات</span>
              </TabsTrigger>
              <TabsTrigger 
                value="leaves" 
                className="flex items-center space-x-reverse space-x-2 h-12 px-4 border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent rounded-none"
              >
                <Plane className="w-4 h-4" />
                <span>الإجازات</span>
              </TabsTrigger>
              <TabsTrigger 
                value="absences" 
                className="flex items-center space-x-reverse space-x-2 h-12 px-4 border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent rounded-none"
              >
                <Clock className="w-4 h-4" />
                <span>الغياب</span>
              </TabsTrigger>
              <TabsTrigger 
                value="salary" 
                className="flex items-center space-x-reverse space-x-2 h-12 px-4 border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent rounded-none"
              >
                <DollarSign className="w-4 h-4" />
                <span>الرواتب</span>
              </TabsTrigger>
              <TabsTrigger 
                value="service" 
                className="flex items-center space-x-reverse space-x-2 h-12 px-4 border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent rounded-none"
              >
                <Trophy className="w-4 h-4" />
                <span>سنوات الخدمة</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          {/* Basic Information */}
          <TabsContent value="basic" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-reverse space-x-2">
                    <User className="w-5 h-5 text-blue-600" />
                    <span>المعلومات الشخصية</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">الهوية الوطنية</p>
                      <p className="font-medium">{employee.nationalId}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">تاريخ التعيين</p>
                      <p className="font-medium">{new Date(employee.hireDate).toLocaleDateString('ar-SA')}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">العنوان</p>
                    <p className="font-medium flex items-center space-x-reverse space-x-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span>{employee.address}</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">الدرجة الوظيفية</p>
                    <p className="font-medium">{employee.grade}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-reverse space-x-2">
                    <Phone className="w-5 h-5 text-green-600" />
                    <span>معلومات الاتصال</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">الهاتف</p>
                    <p className="font-medium flex items-center space-x-reverse space-x-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>{employee.phone}</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">البريد الإلكتروني</p>
                    <p className="font-medium flex items-center space-x-reverse space-x-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span>{employee.email}</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">القسم</p>
                    <p className="font-medium flex items-center space-x-reverse space-x-2">
                      <Building className="w-4 h-4 text-gray-400" />
                      <span>{employee.department}</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">المنصب</p>
                    <p className="font-medium">{employee.position}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Courses */}
          <TabsContent value="courses" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-reverse space-x-2">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                  <span>الدورات التدريبية ({employee.courses?.length || 0})</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {employee.courses && employee.courses.length > 0 ? (
                  <ProfessionalTable
                    columns={[
                      { key: 'name', label: 'اسم الدورة', width: '300px' },
                      { key: 'provider', label: 'الجهة المنظمة', width: '200px' },
                      { key: 'date', label: 'التاريخ', width: '150px' },
                      { key: 'result', label: 'النتيجة', width: '120px', align: 'center' },
                      { 
                        key: 'grade', 
                        label: 'الدرجة', 
                        width: '100px',
                        render: (value) => `${value}%`
                      }
                    ]}
                    data={employee.courses}
                  />
                ) : (
                  <div className="text-center py-8">
                    <GraduationCap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">لا توجد دورات تدريبية مسجلة</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Evaluations */}
          <TabsContent value="evaluations" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-reverse space-x-2">
                  <Star className="w-5 h-5 text-yellow-600" />
                  <span>التقييمات السنوية ({employee.evaluations?.length || 0})</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {employee.evaluations && employee.evaluations.length > 0 ? (
                  <div className="space-y-4">
                    {employee.evaluations.map((evaluation: any) => (
                      <Card key={evaluation.id} className="border border-gray-200">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-reverse space-x-4">
                              <div className="flex items-center space-x-reverse space-x-2">
                                <Star className="w-5 h-5 text-yellow-500" />
                                <span className="text-xl font-semibold">{evaluation.score}/5</span>
                              </div>
                              <div>
                                <p className="font-medium">فترة التقييم: {evaluation.period}</p>
                                <p className="text-sm text-gray-600">المقيم: {evaluation.evaluator}</p>
                              </div>
                            </div>
                            <div className="text-left">
                              <p className="text-sm text-gray-500">{new Date(evaluation.date).toLocaleDateString('ar-SA')}</p>
                            </div>
                          </div>
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <p className="text-sm text-gray-700">{evaluation.notes}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">لا توجد تقييمات مسجلة</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Promotions and Rewards */}
          <TabsContent value="promotions" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-reverse space-x-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <span>المكافآت والترقيات ({employee.promotions?.length || 0})</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {employee.promotions && employee.promotions.length > 0 ? (
                  <div className="space-y-4">
                    {employee.promotions.map((promotion: any) => (
                      <Card key={promotion.id} className="border border-gray-200">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-reverse space-x-4">
                              <div className={`p-2 rounded-full ${promotion.type === 'ترقية' ? 'bg-blue-100' : 'bg-green-100'}`}>
                                {promotion.type === 'ترقية' ? (
                                  <TrendingUp className={`w-5 h-5 ${promotion.type === 'ترقية' ? 'text-blue-600' : 'text-green-600'}`} />
                                ) : (
                                  <Award className={`w-5 h-5 ${promotion.type === 'ترقية' ? 'text-blue-600' : 'text-green-600'}`} />
                                )}
                              </div>
                              <div>
                                <p className="font-medium">{promotion.title}</p>
                                <p className="text-sm text-gray-600">{promotion.reason}</p>
                              </div>
                            </div>
                            <div className="text-left">
                              <p className="font-semibold text-green-600">{promotion.amount.toLocaleString('ar-SA')} ريال</p>
                              <p className="text-sm text-gray-500">{new Date(promotion.date).toLocaleDateString('ar-SA')}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Award className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">لا توجد مكافآت أو ترقيات مسجلة</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Leaves */}
          <TabsContent value="leaves" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-reverse space-x-2">
                    <Plane className="w-5 h-5 text-blue-600" />
                    <span>إدارة الإجازات</span>
                  </div>
                  <Badge variant="outline" className="text-lg px-3 py-1">
                    إجمالي: {totalLeaveDays} يوم
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {employee.leaves && employee.leaves.length > 0 ? (
                  <ProfessionalTable
                    columns={[
                      { key: 'type', label: 'نوع الإجازة', width: '200px' },
                      { key: 'startDate', label: 'تاريخ البداية', width: '150px' },
                      { key: 'endDate', label: 'تاريخ النهاية', width: '150px' },
                      { key: 'days', label: 'عدد الأيام', width: '120px' },
                      { key: 'status', label: 'الحالة', width: '120px', align: 'center' }
                    ]}
                    data={employee.leaves}
                  />
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">لا توجد إجازات مسجلة</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Absences */}
          <TabsContent value="absences" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-reverse space-x-2">
                    <Clock className="w-5 h-5 text-red-600" />
                    <span>سجل الغيابات</span>
                  </div>
                  <Badge variant="outline" className="text-lg px-3 py-1">
                    إجمالي: {totalAbsenceDays} يوم
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {employee.absences && employee.absences.length > 0 ? (
                  <ProfessionalTable
                    columns={[
                      { key: 'date', label: 'التاريخ', width: '150px' },
                      { key: 'reason', label: 'السبب', width: '250px' },
                      { key: 'days', label: 'عدد الأيام', width: '120px' },
                      { 
                        key: 'approved', 
                        label: 'معتمد', 
                        width: '100px', 
                        align: 'center',
                        render: (approved) => (
                          <div className="flex justify-center">
                            {approved ? (
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            ) : (
                              <XCircle className="w-5 h-5 text-red-600" />
                            )}
                          </div>
                        )
                      }
                    ]}
                    data={employee.absences}
                  />
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">لا توجد غيابات مسجلة</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Salary */}
          <TabsContent value="salary" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-reverse space-x-2">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    <span>تفاصيل الراتب</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {employee.salaryDetails ? (
                    <>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">الراتب الأساسي</span>
                          <span className="font-medium">${employee.salaryDetails.basicSalary.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">البدلات</span>
                          <span className="font-medium">{employee.salaryDetails.allowances.toLocaleString('ar-SA')} ريال</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">بدل السكن</span>
                          <span className="font-medium">${employee.salaryDetails.housing.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">بدل النقل</span>
                          <span className="font-medium">${employee.salaryDetails.transport.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">بدل الخبرة</span>
                          <span className="font-medium">${employee.salaryDetails.experience.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">العمل الإضافي</span>
                          <span className="font-medium">${employee.salaryDetails.overtime.toLocaleString()}</span>
                        </div>
                      </div>
                      <Separator />
                      <div className="flex justify-between text-lg font-semibold">
                        <span>إجمالي الراتب</span>
                        <span className="text-green-600">${totalSalary.toLocaleString()}</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between text-lg font-semibold">
                      <span>الراتب</span>
                      <span className="text-green-600">${employee.salary.toLocaleString()}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {employee.salaryDetails && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-reverse space-x-2">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                      <span>الخصومات</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">التأمين</span>
                        <span className="font-medium text-red-600">${employee.salaryDetails.deductions.insurance.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">القروض</span>
                        <span className="font-medium text-red-600">${employee.salaryDetails.deductions.loans.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">السلف</span>
                        <span className="font-medium text-red-600">${employee.salaryDetails.deductions.advances.toLocaleString()}</span>
                      </div>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-semibold">
                      <span>إجمالي الخصومات</span>
                      <span className="text-red-600">${totalDeductions.toLocaleString()}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-xl font-bold">
                      <span>صافي الراتب</span>
                      <span className="text-green-600">${netSalary.toLocaleString()}</span>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Service Years */}
          <TabsContent value="service" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-reverse space-x-2">
                  <Trophy className="w-5 h-5 text-gold-600" />
                  <span>سنوات الخدمة</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="border border-blue-200 bg-blue-50">
                    <CardContent className="p-6 text-center">
                      <Trophy className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                      <p className="text-3xl font-bold text-blue-600 mb-2">{serviceTime.years}</p>
                      <p className="text-gray-600">سنة</p>
                    </CardContent>
                  </Card>
                  <Card className="border border-green-200 bg-green-50">
                    <CardContent className="p-6 text-center">
                      <Calendar className="w-12 h-12 text-green-600 mx-auto mb-4" />
                      <p className="text-3xl font-bold text-green-600 mb-2">{serviceTime.months}</p>
                      <p className="text-gray-600">شهر</p>
                    </CardContent>
                  </Card>
                  <Card className="border border-purple-200 bg-purple-50">
                    <CardContent className="p-6 text-center">
                      <Clock className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                      <p className="text-3xl font-bold text-purple-600 mb-2">{serviceTime.days}</p>
                      <p className="text-gray-600">يوم</p>
                    </CardContent>
                  </Card>
                </div>
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">إجمالي مدة الخدمة</span>
                    <span className="text-lg font-semibold">{serviceTime.totalDays.toLocaleString('ar-SA')} يوم</span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-gray-600">تاريخ التعيين</span>
                    <span className="font-medium">{new Date(employee.hireDate).toLocaleDateString('ar-SA')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}