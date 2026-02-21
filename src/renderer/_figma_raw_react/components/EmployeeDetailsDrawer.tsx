import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { BookOpen, Star, Trophy, Plane, Clock, DollarSign, Calendar, User, FileText, MapPin, GraduationCap, Target, TrendingUp, X } from 'lucide-react';

export function EmployeeDetailsDrawer({ employee, onClose }: { employee: any; onClose: () => void }) {
  // Helper function for status badge
  const getStatusBadge = (status: string) => {
    const variants = {
      'نشط': 'bg-green-100 text-green-800',
      'إجازة': 'bg-yellow-100 text-yellow-800',
      'متقاعد': 'bg-gray-100 text-gray-800'
    };
    return variants[status] || 'bg-gray-100 text-gray-800';
  };

  // Calculate service years
  const calculateServiceYears = (hireDate: string) => {
    const hire = new Date(hireDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - hire.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const years = Math.floor(diffDays / 365);
    const months = Math.floor((diffDays % 365) / 30);
    const days = (diffDays % 365) % 30;
    return { years, months, days, totalDays: diffDays };
  };

  const serviceYears = calculateServiceYears(employee.hireDate);

  // Calculate net salary
  const calculateNetSalary = () => {
    const { basicSalary, allowances, housing, transport, experience, overtime } = employee.salaryDetails;
    const { insurance, loans, advances } = employee.salaryDetails.deductions;
    const gross = basicSalary + allowances + housing + transport + experience + overtime;
    const totalDeductions = insurance + loans + advances;
    return { gross, totalDeductions, net: gross - totalDeductions };
  };

  const salaryCalc = employee.salaryDetails ? calculateNetSalary() : null;

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header Section */}
      <div className="relative p-6 bg-gradient-to-r from-slate-50 to-gray-100 border-b border-gray-200">
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 hover:bg-gray-200"
        >
          <X className="w-5 h-5" />
        </Button>
        
        <div className="flex items-center space-x-reverse space-x-6 ml-12">
          <Avatar className="w-20 h-20 border-4 border-white shadow-lg">
            <AvatarImage src={employee.photo} />
            <AvatarFallback className="text-xl bg-blue-100 text-blue-600">
              {employee.name.split(' ')[0][0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h1 className="text-2xl font-medium text-gray-900 mb-2">{employee.name}</h1>
            <div className="flex items-center space-x-reverse space-x-4 mb-3 text-sm text-gray-600">
              <span>رقم الموظف: {employee.employeeNumber}</span>
              <span>•</span>
              <span>{employee.position}</span>
              <span>•</span>
              <span>{employee.department}</span>
            </div>
            <Badge className={`${getStatusBadge(employee.status)} border-0 px-3 py-1`}>
              {employee.status}
            </Badge>
          </div>
        </div>
      </div>

      {/* Sticky Tabs Navigation */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        <Tabs defaultValue="basic" className="h-full flex flex-col">
          <div className="px-6">
            <TabsList className="h-16 bg-transparent justify-start w-full overflow-x-auto">
              <TabsTrigger value="basic" className="flex items-center space-x-reverse space-x-2 px-4 py-3 whitespace-nowrap">
                <User className="w-4 h-4" />
                <span>البيانات الأساسية</span>
              </TabsTrigger>
              <TabsTrigger value="courses" className="flex items-center space-x-reverse space-x-2 px-4 py-3 whitespace-nowrap">
                <BookOpen className="w-4 h-4" />
                <span>الدورات</span>
              </TabsTrigger>
              <TabsTrigger value="evaluations" className="flex items-center space-x-reverse space-x-2 px-4 py-3 whitespace-nowrap">
                <Star className="w-4 h-4" />
                <span>التقييمات</span>
              </TabsTrigger>
              <TabsTrigger value="promotions" className="flex items-center space-x-reverse space-x-2 px-4 py-3 whitespace-nowrap">
                <Trophy className="w-4 h-4" />
                <span>المكافآت</span>
              </TabsTrigger>
              <TabsTrigger value="leaves" className="flex items-center space-x-reverse space-x-2 px-4 py-3 whitespace-nowrap">
                <Plane className="w-4 h-4" />
                <span>الإجازات</span>
              </TabsTrigger>
              <TabsTrigger value="absences" className="flex items-center space-x-reverse space-x-2 px-4 py-3 whitespace-nowrap">
                <Clock className="w-4 h-4" />
                <span>الغياب</span>
              </TabsTrigger>
              <TabsTrigger value="salary" className="flex items-center space-x-reverse space-x-2 px-4 py-3 whitespace-nowrap">
                <DollarSign className="w-4 h-4" />
                <span>الرواتب</span>
              </TabsTrigger>
              <TabsTrigger value="service" className="flex items-center space-x-reverse space-x-2 px-4 py-3 whitespace-nowrap">
                <Calendar className="w-4 h-4" />
                <span>سنوات الخدمة</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto">
            {/* البيانات الأساسية */}
            <TabsContent value="basic" className="p-6 m-0 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-reverse space-x-2">
                    <User className="w-5 h-5 text-blue-600" />
                    <span>المعلومات الشخصية</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="p-4 border border-gray-100 rounded-lg">
                        <p className="text-sm text-gray-500 mb-1">رقم التوظيف</p>
                        <p className="font-medium">{employee.employeeNumber}</p>
                      </div>
                      <div className="p-4 border border-gray-100 rounded-lg">
                        <p className="text-sm text-gray-500 mb-1">الهوية الوطنية</p>
                        <p className="font-medium">{employee.nationalId}</p>
                      </div>
                      <div className="p-4 border border-gray-100 rounded-lg">
                        <p className="text-sm text-gray-500 mb-1">الدرجة</p>
                        <p className="font-medium">{employee.grade}</p>
                      </div>
                      <div className="p-4 border border-gray-100 rounded-lg">
                        <p className="text-sm text-gray-500 mb-1">الهاتف</p>
                        <p className="font-medium">{employee.phone}</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="p-4 border border-gray-100 rounded-lg">
                        <p className="text-sm text-gray-500 mb-1">البريد الإلكتروني</p>
                        <p className="font-medium">{employee.email}</p>
                      </div>
                      <div className="p-4 border border-gray-100 rounded-lg">
                        <p className="text-sm text-gray-500 mb-1">تاريخ التعيين</p>
                        <p className="font-medium">{new Date(employee.hireDate).toLocaleDateString('ar-SA')}</p>
                      </div>
                      <div className="p-4 border border-gray-100 rounded-lg">
                        <p className="text-sm text-gray-500 mb-1">العنوان</p>
                        <p className="font-medium">{employee.address}</p>
                      </div>
                      <div className="p-4 border-2 border-dashed border-gray-200 rounded-lg text-center">
                        <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">المرفقات</p>
                        <p className="text-xs text-gray-400">لا توجد مرفقات</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* الدورات */}
            <TabsContent value="courses" className="p-6 m-0 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-reverse space-x-2">
                    <BookOpen className="w-5 h-5 text-green-600" />
                    <span>سجل الدورات التدريبية</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead className="text-right">اسم الدورة</TableHead>
                          <TableHead className="text-right">الجهة المنظمة</TableHead>
                          <TableHead className="text-right">التاريخ</TableHead>
                          <TableHead className="text-right">النتيجة</TableHead>
                          <TableHead className="text-right">الدرجة</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {employee.courses?.map((course: any) => (
                          <TableRow key={course.id}>
                            <TableCell className="font-medium">{course.name}</TableCell>
                            <TableCell>{course.provider}</TableCell>
                            <TableCell>{new Date(course.date).toLocaleDateString('ar-SA')}</TableCell>
                            <TableCell>
                              <Badge className="bg-green-100 text-green-800">{course.result}</Badge>
                            </TableCell>
                            <TableCell>
                              <span className="font-medium text-green-600">{course.grade}%</span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* التقييمات */}
            <TabsContent value="evaluations" className="p-6 m-0 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-reverse space-x-2">
                    <Star className="w-5 h-5 text-yellow-600" />
                    <span>سجل التقييمات</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {employee.evaluations?.map((evaluation: any) => (
                      <div key={evaluation.id} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h4 className="font-medium">تقييم عام {evaluation.period}</h4>
                            <p className="text-sm text-gray-600">المقيم: {evaluation.evaluator}</p>
                          </div>
                          <div className="text-left">
                            <div className="flex items-center space-x-1">
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i} 
                                  className={`w-5 h-5 ${i < Math.floor(evaluation.score) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                                />
                              ))}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{evaluation.score}/5</p>
                          </div>
                        </div>
                        <p className="text-gray-700 mb-2">{evaluation.notes}</p>
                        <p className="text-sm text-gray-500">{new Date(evaluation.date).toLocaleDateString('ar-SA')}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* الترقيات والمكافآت */}
            <TabsContent value="promotions" className="p-6 m-0 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-reverse space-x-2">
                    <Trophy className="w-5 h-5 text-purple-600" />
                    <span>سجل الترقيات والمكافآت</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {employee.promotions?.map((item: any, index: number) => (
                      <div key={item.id} className="flex items-start space-x-reverse space-x-4">
                        <div className="flex flex-col items-center pt-2">
                          <div className={`w-4 h-4 rounded-full ${item.type === 'ترقية' ? 'bg-blue-600' : 'bg-green-600'}`}></div>
                          {index < employee.promotions.length - 1 && <div className="w-0.5 h-20 bg-gray-200 mt-3"></div>}
                        </div>
                        <div className="flex-1 p-4 border border-gray-200 rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <Badge className={item.type === 'ترقية' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}>
                              {item.type}
                            </Badge>
                            <span className="text-sm text-gray-500">{new Date(item.date).toLocaleDateString('ar-SA')}</span>
                          </div>
                          <h4 className="font-medium mb-2">{item.title}</h4>
                          <p className="text-sm text-gray-600 mb-3">{item.reason}</p>
                          <p className="font-medium text-green-600">{item.amount.toLocaleString('ar-SA')} ريال</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* الإجازات */}
            <TabsContent value="leaves" className="p-6 m-0 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-reverse space-x-2">
                    <Plane className="w-5 h-5 text-blue-600" />
                    <span>سجل الإجازات</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead className="text-right">نوع الإجازة</TableHead>
                          <TableHead className="text-right">عدد الأيام</TableHead>
                          <TableHead className="text-right">من</TableHead>
                          <TableHead className="text-right">إلى</TableHead>
                          <TableHead className="text-right">الحالة</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {employee.leaves?.map((leave: any) => (
                          <TableRow key={leave.id}>
                            <TableCell className="font-medium">{leave.type}</TableCell>
                            <TableCell>{leave.days}</TableCell>
                            <TableCell>{new Date(leave.startDate).toLocaleDateString('ar-SA')}</TableCell>
                            <TableCell>{new Date(leave.endDate).toLocaleDateString('ar-SA')}</TableCell>
                            <TableCell>
                              <Badge className={leave.status === 'مكتملة' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                                {leave.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* الغياب */}
            <TabsContent value="absences" className="p-6 m-0 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-reverse space-x-2">
                    <Clock className="w-5 h-5 text-red-600" />
                    <span>سجل الغيابات</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50">
                          <TableHead className="text-right">التاريخ</TableHead>
                          <TableHead className="text-right">السبب</TableHead>
                          <TableHead className="text-right">عدد الأيام</TableHead>
                          <TableHead className="text-right">معتمد</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {employee.absences?.map((absence: any) => (
                          <TableRow key={absence.id}>
                            <TableCell>{new Date(absence.date).toLocaleDateString('ar-SA')}</TableCell>
                            <TableCell>{absence.reason}</TableCell>
                            <TableCell>{absence.days}</TableCell>
                            <TableCell>
                              <Badge className={absence.approved ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                                {absence.approved ? 'نعم' : 'لا'}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* الرواتب */}
            <TabsContent value="salary" className="p-6 m-0 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-reverse space-x-2">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    <span>تفاصيل الراتب</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {salaryCalc && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* الراتب الأساسي والبدلات */}
                      <Card className="border-green-200">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base text-green-700">الراتب والبدلات</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-600">الراتب الأساسي</span>
                            <span className="font-medium">{employee.salaryDetails.basicSalary.toLocaleString('ar-SA')}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-600">البدلات</span>
                            <span className="font-medium">{employee.salaryDetails.allowances.toLocaleString('ar-SA')}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-600">بدل السكن</span>
                            <span className="font-medium">{employee.salaryDetails.housing.toLocaleString('ar-SA')}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-600">بدل النقل</span>
                            <span className="font-medium">{employee.salaryDetails.transport.toLocaleString('ar-SA')}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-600">بدل الخبرة</span>
                            <span className="font-medium">{employee.salaryDetails.experience.toLocaleString('ar-SA')}</span>
                          </div>
                          <div className="flex justify-between py-2">
                            <span className="text-gray-600">العمل الإضافي</span>
                            <span className="font-medium">{employee.salaryDetails.overtime.toLocaleString('ar-SA')}</span>
                          </div>
                        </CardContent>
                      </Card>

                      {/* الخصومات */}
                      <Card className="border-red-200">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base text-red-700">الخصومات</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-600">التأمين</span>
                            <span className="font-medium text-red-600">-{employee.salaryDetails.deductions.insurance.toLocaleString('ar-SA')}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-600">القروض</span>
                            <span className="font-medium text-red-600">-{employee.salaryDetails.deductions.loans.toLocaleString('ar-SA')}</span>
                          </div>
                          <div className="flex justify-between py-2">
                            <span className="text-gray-600">السلف</span>
                            <span className="font-medium text-red-600">-{employee.salaryDetails.deductions.advances.toLocaleString('ar-SA')}</span>
                          </div>
                        </CardContent>
                      </Card>

                      {/* الملخص */}
                      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base text-blue-700">ملخص الراتب</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex justify-between py-2 border-b border-blue-200">
                            <span className="text-gray-600">إجمالي الراتب</span>
                            <span className="font-medium">{salaryCalc.gross.toLocaleString('ar-SA')}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-blue-200">
                            <span className="text-gray-600">إجمالي الخصومات</span>
                            <span className="font-medium text-red-600">-{salaryCalc.totalDeductions.toLocaleString('ar-SA')}</span>
                          </div>
                          <div className="p-4 bg-green-100 rounded-lg">
                            <div className="flex justify-between items-center">
                              <span className="font-medium text-green-800">الراتب الصافي</span>
                              <span className="font-bold text-green-800 text-xl">{salaryCalc.net.toLocaleString('ar-SA')} ريال</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* سنوات الخدمة */}
            <TabsContent value="service" className="p-6 m-0 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-reverse space-x-2">
                    <Calendar className="w-5 h-5 text-indigo-600" />
                    <span>سنوات الخدمة</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
                      <CardContent className="p-8">
                        <div className="text-center">
                          <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Calendar className="w-10 h-10 text-indigo-600" />
                          </div>
                          <h4 className="text-xl font-medium mb-3">إجمالي سنوات الخدمة</h4>
                          <div className="text-4xl font-bold text-indigo-600 mb-2">
                            {serviceYears.years} سنة
                          </div>
                          <p className="text-gray-600">
                            {serviceYears.months} شهر و {serviceYears.days} يوم
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <div className="space-y-4">
                      <Card className="border-gray-200">
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-reverse space-x-3">
                            <Calendar className="w-5 h-5 text-gray-500" />
                            <div>
                              <p className="text-sm text-gray-500 mb-1">تاريخ التعيين</p>
                              <p className="font-medium">{new Date(employee.hireDate).toLocaleDateString('ar-SA')}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="border-gray-200">
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-reverse space-x-3">
                            <Target className="w-5 h-5 text-gray-500" />
                            <div>
                              <p className="text-sm text-gray-500 mb-1">إجمالي الأيام</p>
                              <p className="font-medium">{serviceYears.totalDays.toLocaleString('ar-SA')} يوم</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card className="border-gray-200">
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-reverse space-x-3">
                            <TrendingUp className="w-5 h-5 text-gray-500" />
                            <div>
                              <p className="text-sm text-gray-500 mb-1">المرحلة الوظيفية</p>
                              <p className="font-medium">
                                {serviceYears.years < 2 ? 'موظف جديد' : 
                                 serviceYears.years < 5 ? 'موظف متوسط الخبرة' : 
                                 serviceYears.years < 10 ? 'موظف خبير' : 'موظف كبير'}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}